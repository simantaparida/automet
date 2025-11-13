-- Diagnostic Script: Check Onboarding Schema Status
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if users table has full_name and phone columns
SELECT
  'users_table_columns' as check_name,
  json_agg(
    json_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable,
      'column_default', column_default
    )
  ) as result
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('full_name', 'phone', 'org_id', 'role');

-- 2. Check if handle_new_user_signup trigger function exists
SELECT
  'trigger_function' as check_name,
  json_build_object(
    'function_exists', COUNT(*) > 0,
    'function_definition', (
      SELECT pg_get_functiondef(p.oid)
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.proname = 'handle_new_user_signup'
        AND n.nspname = 'public'
      LIMIT 1
    )
  ) as result
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user_signup'
  AND n.nspname = 'public';

-- 3. Check if trigger is attached to auth.users
SELECT
  'trigger_attached' as check_name,
  json_agg(
    json_build_object(
      'trigger_name', trigger_name,
      'event_manipulation', event_manipulation,
      'action_timing', action_timing
    )
  ) as result
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND action_statement LIKE '%handle_new_user_signup%';

-- 4. Check if user_invites table exists
SELECT
  'user_invites_table' as check_name,
  json_build_object(
    'table_exists', COUNT(*) > 0,
    'columns', json_agg(
      json_build_object(
        'column_name', column_name,
        'data_type', data_type
      )
    )
  ) as result
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_invites';

-- 5. Check constraint on full_name
SELECT
  'full_name_constraint' as check_name,
  json_agg(
    json_build_object(
      'constraint_name', constraint_name,
      'check_clause', check_clause
    )
  ) as result
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
  AND constraint_name LIKE '%full_name%';

-- 6. Sample existing users (to see if they have full_name populated)
SELECT
  'existing_users_sample' as check_name,
  json_agg(
    json_build_object(
      'id', id,
      'email', email,
      'full_name', full_name,
      'phone', phone,
      'org_id', org_id,
      'role', role,
      'created_at', created_at
    )
  ) as result
FROM public.users
LIMIT 5;

-- 7. Check RLS policies on users table
SELECT
  'users_rls_policies' as check_name,
  json_agg(
    json_build_object(
      'policy_name', policyname,
      'command', cmd,
      'qual', qual
    )
  ) as result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users';
