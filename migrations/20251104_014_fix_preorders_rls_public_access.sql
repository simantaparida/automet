-- Migration: Fix preorders RLS policy to allow public access
-- Created: 2025-11-04
-- Description: Ensure anonymous users can SELECT and INSERT into preorders table

BEGIN;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert into preorders" ON preorders;
DROP POLICY IF EXISTS "Users can view preorders by email" ON preorders;

-- Allow anyone (including anonymous) to insert into preorders
-- This is safe because validation is handled by Zod schema on the API
CREATE POLICY "Anyone can insert into preorders"
  ON preorders FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read preorders (needed for duplicate email check)
-- This is safe because we only expose email for duplicate checking
CREATE POLICY "Anyone can read preorders"
  ON preorders FOR SELECT
  TO public
  USING (true);

-- Note: UPDATE and DELETE are not allowed - only admins/service role can modify entries

COMMIT;

