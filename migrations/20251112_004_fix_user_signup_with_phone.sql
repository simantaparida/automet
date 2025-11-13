-- Migration: Fix handle_new_user_signup trigger to include phone
-- Date: 2025-11-12
-- Description: Update trigger to properly handle full_name and phone from metadata

BEGIN;

-- Update function to handle new user signup with full_name and phone
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  user_phone TEXT;
BEGIN
  -- Extract full_name from metadata with fallback
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    INITCAP(SPLIT_PART(NEW.email, '@', 1)),
    'User'
  );

  -- Ensure full_name meets length requirement (>= 2 characters)
  IF LENGTH(user_full_name) < 2 THEN
    user_full_name := 'User';
  END IF;

  -- Extract phone from metadata (optional)
  user_phone := NEW.raw_user_meta_data->>'phone';

  -- Insert into public.users table
  INSERT INTO public.users (id, email, email_confirmed, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    user_full_name,
    user_phone
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_user_signup() IS 'Automatically creates a public.users record when user signs up (includes full_name and phone)';

COMMIT;
