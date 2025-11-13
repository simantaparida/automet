-- Fix RLS infinite recursion on users table
-- This script removes all existing policies and creates clean, non-circular ones

BEGIN;

-- Step 1: Drop ALL existing policies on users table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 2: Create clean, non-circular policies

-- Policy 1: Service role and postgres bypass (for triggers and admin operations)
CREATE POLICY "service_role_bypass"
    ON public.users
    AS PERMISSIVE
    FOR ALL
    TO service_role, postgres
    USING (true)
    WITH CHECK (true);

-- Policy 2: Users can read their own profile
CREATE POLICY "users_read_own"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "users_update_own"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Users can insert their own profile (for signup)
CREATE POLICY "users_insert_own"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 3: Verify the setup
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users';

    RAISE NOTICE '====================================';
    RAISE NOTICE 'RLS POLICY FIX COMPLETE';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Total policies: %', policy_count;
    RAISE NOTICE 'Expected: 4 policies';

    IF policy_count = 4 THEN
        RAISE NOTICE '✅ Correct number of policies!';
    ELSE
        RAISE WARNING '⚠️  Expected 4 policies, found %', policy_count;
    END IF;
END $$;

COMMIT;

-- Step 4: Show final policies
SELECT
    policyname,
    cmd,
    roles::text[],
    CASE
        WHEN qual IS NOT NULL THEN SUBSTRING(qual::text, 1, 100)
        ELSE '(none)'
    END as using_condition,
    CASE
        WHEN with_check IS NOT NULL THEN SUBSTRING(with_check::text, 1, 100)
        ELSE '(none)'
    END as check_condition
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;
