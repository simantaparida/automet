-- Fix RLS infinite recursion on users table using SECURITY DEFINER function
-- This allows users to see other users in their org without triggering infinite recursion

BEGIN;

-- 1. Create a secure function to get the current user's org_id
-- This runs with SECURITY DEFINER to bypass RLS when querying the users table
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT org_id FROM users WHERE id = auth.uid();
$$;

-- 2. Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view users in their org" ON users;
DROP POLICY IF EXISTS "Owners can manage users in their org" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- 3. Re-create policies using the secure function

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: Users can view other users in their organization
-- Uses get_auth_org_id() to avoid recursion
CREATE POLICY "Users can view users in their org"
  ON users FOR SELECT
  USING (
    org_id = get_auth_org_id()
  );

-- Policy: Owners can manage users in their organization
CREATE POLICY "Owners can manage users in their org"
  ON users FOR ALL
  USING (
    -- Check if current user is owner AND target user is in same org
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner' 
    AND 
    org_id = get_auth_org_id()
  );

COMMIT;
