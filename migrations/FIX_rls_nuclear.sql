-- FINAL RLS FIX (The Nuclear Option)
-- This script guarantees a clean slate by:
-- 1. Dropping helper functions with CASCADE
-- 2. Manually cleaning up any other lingering policies
-- 3. Re-creating functions (SECURITY DEFINER) and policies correctly to avoid recursion

BEGIN;

-- 1. Drop functions with CASCADE
DROP FUNCTION IF EXISTS get_auth_org_id() CASCADE;
DROP FUNCTION IF EXISTS get_auth_role() CASCADE;

-- 2. Clean up ANY remaining policies on USERS table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- 3. Clean up ANY remaining policies on JOBS table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'jobs' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.jobs';
    END LOOP;
END $$;

-- 4. Clean up ANY remaining policies on CLIENTS table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'clients' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.clients';
    END LOOP;
END $$;

-- 5. Clean up ANY remaining policies on SITES table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'sites' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.sites';
    END LOOP;
END $$;

-- 6. Re-create helper functions (SECURITY DEFINER to bypass RLS)

-- Function to get current user's org_id
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
STABLE
AS $$
  SELECT org_id FROM users WHERE id = auth.uid();
$$;

-- Function to get current user's role (Prevents recursion in policies)
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
STABLE
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- 7. Re-create USERS policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view users in their org"
  ON users FOR SELECT
  USING (org_id = get_auth_org_id());

-- Use get_auth_role() instead of subquery to avoid recursion
CREATE POLICY "Owners can manage users in their org"
  ON users FOR ALL
  USING (
    get_auth_role() = 'owner' 
    AND 
    org_id = get_auth_org_id()
  );

-- 8. Re-create JOBS policies
CREATE POLICY "Users can view jobs in their org"
  ON jobs FOR SELECT
  USING (org_id = get_auth_org_id());

CREATE POLICY "Users can manage jobs in their org"
  ON jobs FOR ALL
  USING (org_id = get_auth_org_id());

-- 9. Re-create CLIENTS policies
CREATE POLICY "Users can view clients in their org"
  ON clients FOR SELECT
  USING (org_id = get_auth_org_id());

CREATE POLICY "Users can manage clients in their org"
  ON clients FOR ALL
  USING (org_id = get_auth_org_id());

-- 10. Re-create SITES policies
CREATE POLICY "Users can view sites in their org"
  ON sites FOR SELECT
  USING (org_id = get_auth_org_id());

CREATE POLICY "Users can manage sites in their org"
  ON sites FOR ALL
  USING (org_id = get_auth_org_id());

COMMIT;
