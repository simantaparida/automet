-- Rollback: Drop contact_messages table
-- Created: 2025-11-07

BEGIN;

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
DROP TABLE IF EXISTS contact_messages CASCADE;

COMMIT;

