-- Rollback: Revert preorders RLS policy changes
-- Created: 2025-11-04

BEGIN;

-- Drop the new policies
DROP POLICY IF EXISTS "Anyone can insert into preorders" ON preorders;
DROP POLICY IF EXISTS "Anyone can read preorders" ON preorders;

-- Restore original policies
CREATE POLICY "Anyone can insert into preorders"
  ON preorders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view preorders by email"
  ON preorders FOR SELECT
  TO anon, authenticated
  USING (true);

COMMIT;

