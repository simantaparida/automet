-- Rollback Migration: Drop user_invites table
-- Created: 2025-11-12
-- Description: Removes user_invites table and related objects

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS update_user_invites_updated_at ON user_invites;

-- Drop indexes (will be dropped automatically with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_user_invites_org_id;
DROP INDEX IF EXISTS idx_user_invites_invite_code;
DROP INDEX IF EXISTS idx_user_invites_invite_token;
DROP INDEX IF EXISTS idx_user_invites_status;
DROP INDEX IF EXISTS idx_user_invites_expires_at;
DROP INDEX IF EXISTS idx_user_invites_contact;

-- Drop table (CASCADE will drop all dependent objects)
DROP TABLE IF EXISTS user_invites CASCADE;

COMMIT;
