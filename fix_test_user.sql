-- Fix missing org_id for owner@automet.test
-- User ID: 59d98f0b-0799-45c5-b586-1dc32857f4fc

BEGIN;

-- Create an organization for this user
INSERT INTO organizations (
  id,
  name,
  slug,
  created_at,
  updated_at
) VALUES (
  '59d98f0b-0799-0000-0000-000000000001', -- Org ID based on user ID
  'Test Organization',
  'test-organization',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add user to the users table with org_id and role
INSERT INTO users (
  id,
  email,
  full_name,
  org_id,
  role,
  email_confirmed,
  created_at,
  updated_at
) VALUES (
  '59d98f0b-0799-45c5-b586-1dc32857f4fc',
  'owner@automet.test',
  'Test Owner',
  '59d98f0b-0799-0000-0000-000000000001',
  'owner',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  org_id = EXCLUDED.org_id,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email_confirmed = EXCLUDED.email_confirmed;

COMMIT;

-- Verify the user was added correctly
SELECT id, email, full_name, org_id, role, email_confirmed
FROM users
WHERE id = '59d98f0b-0799-45c5-b586-1dc32857f4fc';
