-- Rollback: Fix RLS policy to allow user self-registration
-- Created: 2025-11-11

BEGIN;

-- Remove the policies we added
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

COMMIT;
