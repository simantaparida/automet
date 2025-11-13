-- Debug: Check if trigger exists and is working
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if trigger exists
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 2. Check if function exists
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'handle_new_user_signup';

-- 3. Check users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check constraints on users table
SELECT
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'users';

-- 5. Test the trigger function manually
-- This will show you what error occurs
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test@example.com';
BEGIN
  -- Try to manually call the trigger logic
  BEGIN
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
      test_user_id,
      test_email,
      false,
      'Test User',
      NULL,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'SUCCESS: Manual insert worked! User ID: %', test_user_id;

    -- Clean up test data
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'Test user deleted';

  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
    RAISE NOTICE 'DETAIL: %', SQLSTATE;
  END;
END $$;
