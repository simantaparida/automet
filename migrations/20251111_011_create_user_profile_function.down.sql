-- Rollback: Remove create_user_profile function
-- Created: 2025-11-11

BEGIN;

-- Drop the function
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, UUID, TEXT, TEXT);

COMMIT;
