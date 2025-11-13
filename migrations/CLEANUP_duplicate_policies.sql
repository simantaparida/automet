-- Clean up duplicate RLS policies on users table
-- Run this after FINAL_FIX_signup_issue.sql

BEGIN;

-- Drop the duplicate/old policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;

-- Verify we have the right policies now
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'users';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'RLS POLICY CLEANUP';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total policies: %', policy_count;
  RAISE NOTICE 'Expected: 4 policies';
  RAISE NOTICE '====================================';

  IF policy_count = 4 THEN
    RAISE NOTICE '✅ Correct number of policies!';
  ELSE
    RAISE WARNING '⚠️  Expected 4 policies, found %', policy_count;
  END IF;
END $$;

COMMIT;

-- Show final policies
SELECT
  policyname,
  roles,
  cmd,
  SUBSTRING(qual::text, 1, 50) as condition
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;
