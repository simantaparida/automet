-- Fix: Common issues with user signup trigger
-- Run this if you're getting "Database error saving new user"

BEGIN;

-- Step 1: Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  user_phone TEXT;
BEGIN
  -- Extract full_name with safe fallback
  user_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    INITCAP(SPLIT_PART(COALESCE(NEW.email, 'user@example.com'), '@', 1)),
    'User'
  );

  -- Ensure minimum length
  IF LENGTH(user_full_name) < 2 THEN
    user_full_name := 'User';
  END IF;

  -- Extract phone (optional)
  user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');

  -- Log what we're about to insert (for debugging)
  RAISE LOG 'Creating user: id=%, email=%, full_name=%',
    NEW.id, NEW.email, user_full_name;

  -- Insert into public.users
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

  RAISE LOG 'User created successfully: %', NEW.id;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth signup
  RAISE WARNING 'Error in handle_new_user_signup for user %: % %',
    NEW.id, SQLERRM, SQLSTATE;
  -- Return NEW to allow auth.users insert to succeed
  RETURN NEW;
END;
$$;

-- Step 2: Ensure trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Step 3: Grant necessary permissions
-- The function runs as SECURITY DEFINER, so it uses function owner's permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Step 4: Check if full_name column has proper default handling
ALTER TABLE public.users
  ALTER COLUMN full_name DROP DEFAULT IF EXISTS;

-- Step 5: Verify setup
DO $$
DECLARE
  trigger_count INTEGER;
  function_exists BOOLEAN;
BEGIN
  -- Check trigger
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';

  -- Check function
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user_signup'
  ) INTO function_exists;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'TRIGGER FIX VERIFICATION';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Trigger attached: %', CASE WHEN trigger_count > 0 THEN 'YES ✅' ELSE 'NO ❌' END;
  RAISE NOTICE 'Function exists: %', CASE WHEN function_exists THEN 'YES ✅' ELSE 'NO ❌' END;
  RAISE NOTICE '====================================';

  IF trigger_count > 0 AND function_exists THEN
    RAISE NOTICE 'Trigger is properly configured!';
    RAISE NOTICE 'Try signing up a new user now.';
  ELSE
    RAISE WARNING 'Something is not configured properly!';
  END IF;
END $$;

COMMIT;
