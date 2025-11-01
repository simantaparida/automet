-- Seed: Demo Organization
-- Description: Create "Sharma Services" demo vendor company

BEGIN;

-- Delete existing demo org (for idempotent seeding)
DELETE FROM organizations WHERE slug = 'sharma-services';

-- Insert demo organization
INSERT INTO organizations (
  id,
  name,
  slug,
  settings,
  created_at
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Sharma Services',
  'sharma-services',
  '{
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "business_hours": {
      "monday": {"start": "09:00", "end": "18:00"},
      "tuesday": {"start": "09:00", "end": "18:00"},
      "wednesday": {"start": "09:00", "end": "18:00"},
      "thursday": {"start": "09:00", "end": "18:00"},
      "friday": {"start": "09:00", "end": "18:00"},
      "saturday": {"start": "09:00", "end": "13:00"},
      "sunday": "closed"
    },
    "notification_preferences": {
      "email_on_job_assigned": true,
      "email_on_job_completed": true
    }
  }'::jsonb,
  NOW() - INTERVAL '3 months'
);

COMMIT;

-- Verify
SELECT id, name, slug, created_at FROM organizations WHERE slug = 'sharma-services';
