-- Rollback: Drop inventory tables
-- Created: 2025-11-01

BEGIN;

DROP TABLE IF EXISTS inventory_audit_log CASCADE;
DROP TABLE IF EXISTS inventory_issuances CASCADE;
DROP TABLE IF EXISTS inventory_instances CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;

COMMIT;
