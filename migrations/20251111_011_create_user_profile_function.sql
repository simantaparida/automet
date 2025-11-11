-- Migration: Create function to insert user profile during onboarding
-- Created: 2025-11-11
-- Description: Create a SECURITY DEFINER function that bypasses RLS to insert user profiles
--              This is needed during onboarding when the user doesn't have a profile yet

BEGIN;

-- Create function to insert user profile
-- SECURITY DEFINER means it runs with the privileges of the function owner (postgres)
-- This bypasses RLS policies
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_org_id UUID,
  user_role TEXT DEFAULT 'owner',
  user_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  org_id UUID,
  role TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO users (id, email, org_id, role, phone)
  VALUES (user_id, user_email, user_org_id, user_role, user_phone)
  RETURNING users.id, users.email, users.org_id, users.role, users.phone, users.created_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;

COMMIT;
