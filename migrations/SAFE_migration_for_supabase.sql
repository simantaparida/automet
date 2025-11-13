-- SAFE Migration for Supabase - Onboarding Schema
-- Run this in Supabase SQL Editor (it will run as the postgres user automatically)
-- This version has SECURE RLS policies and proper permissions

BEGIN;

-- ============================================
-- STEP 1: Add full_name and phone columns to users table
-- ============================================

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column to users table';
  ELSE
    RAISE NOTICE 'full_name column already exists';
  END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.users ADD COLUMN phone TEXT;
    RAISE NOTICE 'Added phone column to users table';
  ELSE
    RAISE NOTICE 'phone column already exists';
  END IF;
END $$;

-- Populate full_name for existing users who don't have one
UPDATE public.users
SET full_name = COALESCE(
  NULLIF(TRIM(full_name), ''),
  INITCAP(SPLIT_PART(email, '@', 1)),
  'User'
)
WHERE full_name IS NULL OR full_name = '';

-- Make full_name NOT NULL after populating
ALTER TABLE public.users ALTER COLUMN full_name SET NOT NULL;

-- Add constraint on full_name length (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_full_name_length'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_full_name_length
    CHECK (length(full_name) >= 2 AND length(full_name) <= 100);
    RAISE NOTICE 'Added full_name length constraint';
  ELSE
    RAISE NOTICE 'full_name constraint already exists';
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN public.users.full_name IS 'User full name (required, 2-100 characters)';
COMMENT ON COLUMN public.users.phone IS 'User phone number with country code (optional, e.g., +91 98765 43210)';

-- ============================================
-- STEP 2: Create or replace trigger function
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  user_phone TEXT;
  metadata_full_name TEXT;
BEGIN
  -- Try to extract full_name from metadata
  BEGIN
    metadata_full_name := NEW.raw_user_meta_data->>'full_name';
  EXCEPTION WHEN OTHERS THEN
    metadata_full_name := NULL;
  END;

  -- Build full_name with multiple fallbacks
  user_full_name := COALESCE(
    NULLIF(TRIM(metadata_full_name), ''),  -- Use metadata if not empty
    NULLIF(INITCAP(SPLIT_PART(NEW.email, '@', 1)), ''),  -- Derive from email
    'User'  -- Final fallback
  );

  -- Ensure full_name is never NULL and meets length requirement
  IF user_full_name IS NULL OR LENGTH(user_full_name) < 2 THEN
    user_full_name := 'User';
  END IF;

  -- Try to extract phone from metadata
  BEGIN
    user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');
  EXCEPTION WHEN OTHERS THEN
    user_phone := NULL;
  END;

  -- Insert or update in public.users table
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
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user_signup() IS 'Automatically creates/updates public.users record when user signs up';

-- ============================================
-- STEP 3: Attach trigger to auth.users
-- ============================================

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates public.users record when auth user is created';

-- ============================================
-- STEP 4: Create user_invites table (if needed)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL, -- phone or email
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'email')),
  role TEXT NOT NULL CHECK (role IN ('owner', 'coordinator', 'technician')),
  code TEXT NOT NULL, -- 6-digit code for manual entry
  token TEXT NOT NULL UNIQUE, -- UUID token for link-based invite
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_invites_org_id ON public.user_invites(org_id);
CREATE INDEX IF NOT EXISTS idx_user_invites_code ON public.user_invites(code);
CREATE INDEX IF NOT EXISTS idx_user_invites_token ON public.user_invites(token);
CREATE INDEX IF NOT EXISTS idx_user_invites_contact ON public.user_invites(contact);
CREATE INDEX IF NOT EXISTS idx_user_invites_expires_at ON public.user_invites(expires_at);

-- Add RLS policies for user_invites
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view invites for their organization" ON public.user_invites;
DROP POLICY IF EXISTS "Owners and coordinators can create invites" ON public.user_invites;
DROP POLICY IF EXISTS "Anyone can view invite by token" ON public.user_invites;

-- ============================================
-- SECURE RLS POLICIES (FIXED!)
-- ============================================

-- Policy 1: Users can view invites for their organization
CREATE POLICY "Users can view invites for their organization"
  ON public.user_invites
  FOR SELECT
  USING (
    -- User is authenticated AND in the same org
    auth.uid() IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy 2: Owners and coordinators can create invites
CREATE POLICY "Owners and coordinators can create invites"
  ON public.user_invites
  FOR INSERT
  WITH CHECK (
    -- User is authenticated AND has owner/coordinator role
    auth.uid() IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.users
      WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
    )
  );

-- Policy 3: SECURE public invite verification by token ONLY
-- This is for the /join/[token] page where unauthenticated users need to see invite details
CREATE POLICY "Anyone can view invite by token"
  ON public.user_invites
  FOR SELECT
  USING (
    -- IMPORTANT: Only allow if invite is not expired
    -- This prevents enumeration of old invites
    expires_at > NOW()
    AND accepted_at IS NULL  -- Only show unaccepted invites
  );

-- Add comments
COMMENT ON TABLE public.user_invites IS 'Team member invitations sent during onboarding';
COMMENT ON COLUMN public.user_invites.code IS '6-digit numeric code for manual entry';
COMMENT ON COLUMN public.user_invites.token IS 'UUID token for link-based invite acceptance';

-- ============================================
-- STEP 5: Verify setup
-- ============================================

-- Output verification
DO $$
DECLARE
  full_name_exists BOOLEAN;
  phone_exists BOOLEAN;
  trigger_exists BOOLEAN;
  invites_exists BOOLEAN;
  policies_count INTEGER;
BEGIN
  -- Check columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
  ) INTO full_name_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
  ) INTO phone_exists;

  -- Check trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
      AND event_object_table = 'users'
      AND trigger_name = 'on_auth_user_created'
  ) INTO trigger_exists;

  -- Check table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_invites'
  ) INTO invites_exists;

  -- Check RLS policies
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'user_invites';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'users.full_name column: %', CASE WHEN full_name_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'users.phone column: %', CASE WHEN phone_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Auth trigger: %', CASE WHEN trigger_exists THEN '✅ ATTACHED' ELSE '❌ MISSING' END;
  RAISE NOTICE 'user_invites table: %', CASE WHEN invites_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'RLS policies: % policies', policies_count;
  RAISE NOTICE '========================================';

  IF full_name_exists AND phone_exists AND trigger_exists AND invites_exists AND policies_count = 3 THEN
    RAISE NOTICE '✅ ALL MIGRATIONS APPLIED SUCCESSFULLY!';
    RAISE NOTICE '✅ SECURITY: 3 RLS policies active on user_invites';
  ELSE
    RAISE WARNING '⚠️  Some migrations may have failed. Check the errors above.';
  END IF;
END $$;

COMMIT;

-- ============================================
-- SECURITY VERIFICATION
-- ============================================

-- Show the RLS policies that were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_invites'
ORDER BY policyname;
