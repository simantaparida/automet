-- Migration: Fix user insert policy with explicit auth check
-- Created: 2025-11-11
-- Description: Update RLS policy to properly allow authenticated users to insert their profile

BEGIN;

-- Drop the existing policy and recreate with better auth handling
DROP POLICY IF EXISTS "Users can create their own profile" ON users;

-- Recreate with explicit authenticated() check
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  TO authenticated  -- Only for authenticated users
  WITH CHECK (
    auth.uid() IS NOT NULL AND  -- User must be authenticated
    id = auth.uid()              -- Can only insert their own record
  );

COMMIT;
