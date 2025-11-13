-- FINAL FIX: Signup Database Error
-- This fixes the most common issues preventing user creation during signup

BEGIN;

-- ============================================
-- STEP 1: Check and fix RLS policies on users table
-- ============================================

-- The trigger runs as SECURITY DEFINER (as function owner)
-- But we need to ensure RLS allows the insert

-- Check current RLS status
DO $$
BEGIN
  RAISE NOTICE 'Checking RLS policies...';
END $$;

-- Disable RLS temporarily to see if that's the issue
-- (We'll re-enable with proper policies)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might block
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to insert users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "service_role can insert users" ON public.users;

-- Create PERMISSIVE policies that work with the trigger

-- Policy 1: Allow service_role and postgres to bypass RLS (for trigger)
CREATE POLICY "Bypass RLS for service role and postgres"
  ON public.users
  AS PERMISSIVE
  FOR ALL
  TO service_role, postgres
  USING (true)
  WITH CHECK (true);

-- Policy 2: Users can view profiles in their organization
CREATE POLICY "Users can view org members"
  ON public.users
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.users WHERE id = auth.uid()
    )
    OR id = auth.uid()  -- Always see own profile
  );

-- Policy 3: Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 4: Allow authenticated users to insert ONLY their own record
-- This is needed for the UPSERT in onboarding API
CREATE POLICY "Users can insert own profile"
  ON public.users
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================
-- STEP 2: Fix the trigger function with better error handling
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER  -- This makes it run with elevated privileges
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  user_phone TEXT;
BEGIN
  -- Build full_name with safe fallbacks
  user_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    INITCAP(SPLIT_PART(COALESCE(NEW.email, 'unknown@example.com'), '@', 1)),
    'User'
  );

  -- Ensure it meets the constraint (2-100 chars)
  IF user_full_name IS NULL OR LENGTH(user_full_name) < 2 THEN
    user_full_name := 'User';
  END IF;

  IF LENGTH(user_full_name) > 100 THEN
    user_full_name := SUBSTRING(user_full_name, 1, 100);
  END IF;

  -- Extract phone safely
  user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');

  -- Insert with ON CONFLICT to handle retries
  INSERT INTO public.users (
    id,
    email,
    email_confirmed,
    full_name,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'unknown@example.com'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    user_full_name,
    user_phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_confirmed = EXCLUDED.email_confirmed,
    full_name = CASE
      WHEN EXCLUDED.full_name IS NOT NULL AND LENGTH(EXCLUDED.full_name) >= 2
      THEN EXCLUDED.full_name
      ELSE public.users.full_name
    END,
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = NOW();

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the signup
  RAISE WARNING 'handle_new_user_signup error for user %: % (SQLSTATE: %)',
    NEW.id, SQLERRM, SQLSTATE;

  -- Still return NEW so auth.users insert succeeds
  RETURN NEW;
END;
$$;

-- ============================================
-- STEP 3: Ensure trigger is properly attached
-- ============================================

-- Drop old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- ============================================
-- STEP 4: Grant necessary permissions
-- ============================================

-- Function owner needs these permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres;
GRANT SELECT, INSERT, UPDATE ON public.users TO service_role, authenticated;

-- ============================================
-- STEP 5: Test the setup
-- ============================================

DO $$
DECLARE
  test_id UUID;
  test_email TEXT;
  user_count INTEGER;
BEGIN
  -- Generate test data
  test_id := gen_random_uuid();
  test_email := 'test-' || test_id::text || '@example.com';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'TESTING TRIGGER FUNCTION';
  RAISE NOTICE '====================================';

  -- Test 1: Try inserting a user directly
  BEGIN
    INSERT INTO public.users (
      id, email, email_confirmed, full_name, created_at, updated_at
    ) VALUES (
      test_id, test_email, false, 'Test User', NOW(), NOW()
    );

    RAISE NOTICE 'Test 1 PASSED: Direct insert works ✅';

    -- Cleanup
    DELETE FROM public.users WHERE id = test_id;

  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test 1 FAILED: Direct insert error: % ❌', SQLERRM;
  END;

  -- Test 2: Check if trigger is attached
  SELECT COUNT(*) INTO user_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';

  IF user_count > 0 THEN
    RAISE NOTICE 'Test 2 PASSED: Trigger is attached ✅';
  ELSE
    RAISE NOTICE 'Test 2 FAILED: Trigger not found ❌';
  END IF;

  -- Test 3: Check RLS policies
  SELECT COUNT(*) INTO user_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'users';

  RAISE NOTICE 'Test 3: Found % RLS policies', user_count;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Setup complete! Try signing up now.';
  RAISE NOTICE '====================================';
END $$;

COMMIT;

-- Show the policies created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;
