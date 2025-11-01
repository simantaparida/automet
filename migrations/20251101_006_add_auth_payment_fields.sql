-- Migration: Add auth and payment fields
-- Created: 2025-11-01
-- Description: Extend users table for OAuth and add indexes for auth lookups
-- Note: Most auth fields already added in migration 001, this adds any missing ones

BEGIN;

-- Add indexes for fast auth lookups (if not already present)
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id);

-- Ensure we have proper constraints
ALTER TABLE users
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN role SET NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN users.google_provider_id IS 'Google OAuth sub claim for account linking';
COMMENT ON COLUMN users.email_confirmed IS 'Must be TRUE to create jobs, manage billing, or perform critical actions';

COMMIT;
