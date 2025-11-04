-- Rollback: Remove RLS policies from preorders table
-- Created: 2025-11-04

BEGIN;

-- Drop policies
DROP POLICY IF EXISTS "Users can view preorders by email" ON preorders;
DROP POLICY IF EXISTS "Anyone can insert into preorders" ON preorders;

-- Optionally disable RLS (uncomment if needed)
-- ALTER TABLE preorders DISABLE ROW LEVEL SECURITY;

COMMIT;

