-- Rollback: Drop jobs and assignments tables
-- Created: 2025-11-01

BEGIN;

DROP TABLE IF EXISTS job_check_events CASCADE;
DROP TABLE IF EXISTS job_media CASCADE;
DROP TABLE IF EXISTS job_assignments CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

COMMIT;
