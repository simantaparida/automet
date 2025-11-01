-- Seed: Demo Users
-- Description: Create owner, coordinator, and technicians
-- NOTE: This creates entries in the public.users table only.
-- Actual Supabase auth.users entries must be created via Supabase Auth API or dashboard.

BEGIN;

-- Delete existing demo users (for idempotent seeding)
DELETE FROM users WHERE org_id = '10000000-0000-0000-0000-000000000001';

-- Owner (admin@automet.dev)
INSERT INTO users (
  id,
  email,
  email_confirmed,
  google_provider_id,
  org_id,
  role,
  profile_photo_url,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000001',
  'admin@automet.dev',
  TRUE,
  NULL,
  '10000000-0000-0000-0000-000000000001',
  'owner',
  NULL,
  NOW() - INTERVAL '3 months'
);

-- Coordinator (manager@automet.dev)
INSERT INTO users (
  id,
  email,
  email_confirmed,
  google_provider_id,
  org_id,
  role,
  profile_photo_url,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  'manager@automet.dev',
  TRUE,
  NULL,
  '10000000-0000-0000-0000-000000000001',
  'coordinator',
  NULL,
  NOW() - INTERVAL '2 months'
);

-- Technician 1 (tech1@automet.dev)
INSERT INTO users (
  id,
  email,
  email_confirmed,
  google_provider_id,
  org_id,
  role,
  profile_photo_url,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000003',
  'tech1@automet.dev',
  TRUE,
  NULL,
  '10000000-0000-0000-0000-000000000001',
  'technician',
  NULL,
  NOW() - INTERVAL '2 months'
);

-- Technician 2 (tech2@automet.dev)
INSERT INTO users (
  id,
  email,
  email_confirmed,
  google_provider_id,
  org_id,
  role,
  profile_photo_url,
  created_at
) VALUES (
  '20000000-0000-0000-0000-000000000004',
  'tech2@automet.dev',
  TRUE,
  NULL,
  '10000000-0000-0000-0000-000000000001',
  'technician',
  NULL,
  NOW() - INTERVAL '1 month'
);

COMMIT;

-- Verify
SELECT email, role, email_confirmed, created_at
FROM users
WHERE org_id = '10000000-0000-0000-0000-000000000001'
ORDER BY created_at;

-- NOTE: To actually log in as these users, you need to:
-- 1. Create corresponding auth.users entries via Supabase Dashboard
-- 2. Use the same UUIDs as the id field above
-- 3. Set passwords or enable Google OAuth
