-- Rollback: Drop core tables
-- Created: 2025-11-01
-- WARNING: This will delete all data in these tables!

BEGIN;

-- Drop tables in reverse order (respecting foreign key dependencies)
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Note: We don't drop the uuid-ossp extension as it may be used by other schemas

COMMIT;
