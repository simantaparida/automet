-- Rollback: Remove auth field enhancements
-- Created: 2025-11-01
-- Note: Cannot truly rollback constraint additions without breaking data integrity

BEGIN;

-- Remove index (keeping others from migration 001)
DROP INDEX IF EXISTS idx_users_auth_id;

-- Note: We don't drop NOT NULL constraints as they were part of original schema

COMMIT;
