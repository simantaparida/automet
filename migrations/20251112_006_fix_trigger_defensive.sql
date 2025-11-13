-- Migration: Make trigger more defensive to handle NULL metadata
-- Date: 2025-11-12
-- Description: Ensure trigger NEVER fails due to NULL values

BEGIN;

CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  user_phone TEXT;
  metadata_full_name TEXT;
BEGIN
  -- Try to extract full_name from metadata
  BEGIN
    metadata_full_name := NEW.raw_user_meta_data->>'full_name';
  EXCEPTION WHEN OTHERS THEN
    metadata_full_name := NULL;
  END;

  -- Build full_name with multiple fallbacks
  user_full_name := COALESCE(
    NULLIF(TRIM(metadata_full_name), ''),  -- Use metadata if not empty
    NULLIF(INITCAP(SPLIT_PART(NEW.email, '@', 1)), ''),  -- Derive from email
    'User'  -- Final fallback
  );

  -- Ensure full_name is never NULL and meets length requirement
  IF user_full_name IS NULL OR LENGTH(user_full_name) < 2 THEN
    user_full_name := 'User';
  END IF;

  -- Try to extract phone from metadata
  BEGIN
    user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');
  EXCEPTION WHEN OTHERS THEN
    user_phone := NULL;
  END;

  -- Insert into public.users table
  -- Use explicit column list to avoid any column mismatch
  INSERT INTO public.users (
    id,
    email,
    email_confirmed,
    full_name,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'unknown@example.com'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    user_full_name,  -- This is guaranteed to be non-NULL and length >= 2
    user_phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_confirmed = EXCLUDED.email_confirmed,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_user_signup() IS 'Automatically creates/updates public.users record when user signs up (defensive version)';

COMMIT;
