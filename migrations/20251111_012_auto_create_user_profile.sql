-- Migration: Auto-create user profile on auth.users insert
-- Created: 2025-11-11
-- Description: Create a trigger that automatically creates a public.users record
--              when a new user signs up in auth.users (via Supabase Auth)
--              This eliminates the chicken-and-egg problem with RLS policies

BEGIN;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into public.users table
  -- We only set id and email initially
  -- org_id and role will be set during onboarding
  INSERT INTO public.users (id, email, email_confirmed)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO NOTHING;  -- Ignore if already exists

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
-- This fires AFTER a new user is created via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();

COMMENT ON FUNCTION handle_new_user_signup() IS 'Automatically creates a public.users record when user signs up';

COMMIT;
