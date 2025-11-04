-- Rollback: Remove preorders table
-- Created: 2025-11-03

BEGIN;

-- Drop indexes
DROP INDEX IF EXISTS idx_preorders_created_at;
DROP INDEX IF EXISTS idx_preorders_payment_status;
DROP INDEX IF EXISTS idx_preorders_email_confirmed;
DROP INDEX IF EXISTS idx_preorders_confirmation_token;
DROP INDEX IF EXISTS idx_preorders_email;

-- Drop table
DROP TABLE IF EXISTS preorders;

COMMIT;
