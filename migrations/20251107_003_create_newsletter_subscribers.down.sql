-- Rollback: Drop newsletter_subscribers table
-- Created: 2025-11-07

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;

-- Drop policies
DROP POLICY IF EXISTS newsletter_public_insert ON newsletter_subscribers;
DROP POLICY IF EXISTS newsletter_service_role_all ON newsletter_subscribers;

-- Drop table
DROP TABLE IF EXISTS newsletter_subscribers;

COMMIT;

