-- Comprehensive RLS Fix (Corrected Order)
-- 1. Drops dependent policies FIRST
-- 2. Fixes the helper function
-- 3. Re-creates policies

BEGIN;

-- 1. Drop ALL policies that might depend on the function FIRST
DROP POLICY IF EXISTS "Users can view users in their org" ON users;
DROP POLICY IF EXISTS "Owners can manage users in their org" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

DROP POLICY IF EXISTS "Users can view jobs in their org" ON jobs;
DROP POLICY IF EXISTS "Users can view clients in their org" ON clients;
DROP POLICY IF EXISTS "Users can view sites in their org" ON sites;

-- 2. NOW we can safely drop and re-create the function
DROP FUNCTION IF EXISTS get_auth_org_id();

-- 3. Re-create the function with correct search path including extensions
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
STABLE
AS $$
  SELECT org_id FROM users WHERE id = auth.uid();
$$;

-- 4. Re-create USERS table policies
-- Allow users to view their own profile (Base case)
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow users to view other users in their org
CREATE POLICY "Users can view users in their org"
  ON users FOR SELECT
  USING (
    org_id = get_auth_org_id()
  );

-- Allow owners to manage users
CREATE POLICY "Owners can manage users in their org"
  ON users FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner' 
    AND 
    org_id = get_auth_org_id()
  );

-- 5. Re-create JOBS table policies
CREATE POLICY "Users can view jobs in their org"
  ON jobs FOR SELECT
  USING (
    org_id = get_auth_org_id()
  );

-- 6. Re-create CLIENTS table policies
CREATE POLICY "Users can view clients in their org"
  ON clients FOR SELECT
  USING (
    org_id = get_auth_org_id()
  );

-- 7. Re-create SITES table policies
CREATE POLICY "Users can view sites in their org"
  ON sites FOR SELECT
  USING (
    org_id = get_auth_org_id()
  );

COMMIT;
