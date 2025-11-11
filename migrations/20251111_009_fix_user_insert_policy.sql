-- Migration: Fix RLS policy to allow user self-registration
-- Created: 2025-11-11
-- Description: Allow authenticated users to insert their own record during onboarding

BEGIN;

-- Add policy to allow users to create their own profile
-- This is needed during onboarding when user signs up
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Also add policy to allow organization creation by authenticated users
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (true); -- Any authenticated user can create an org

COMMIT;
