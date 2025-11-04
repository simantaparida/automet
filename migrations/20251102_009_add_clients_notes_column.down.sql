-- Rollback: Remove notes column from clients table
-- Created: 2025-11-02

BEGIN;

-- Remove notes column from clients table
ALTER TABLE clients
DROP COLUMN IF EXISTS notes;

COMMIT;
