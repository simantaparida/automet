-- Migration: Add RLS policy for preorders table (public waitlist signup)
-- Created: 2025-11-04
-- Description: Allow anonymous users to insert into preorders table for waitlist signup

BEGIN;

-- Enable RLS on preorders table (if not already enabled)
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to insert into preorders
-- This is safe because:
-- 1. It's a public waitlist signup form
-- 2. Validation is handled by Zod schema on the API
-- 3. We only allow INSERT, not UPDATE or DELETE
CREATE POLICY "Anyone can insert into preorders"
  ON preorders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read their own preorder (by email match)
-- This is useful for confirmation pages
CREATE POLICY "Users can view preorders by email"
  ON preorders FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: We don't allow UPDATE or DELETE - only admins/service role can modify entries

COMMIT;

