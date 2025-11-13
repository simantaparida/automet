-- Migration: Remove DEFAULT from full_name column
-- Date: 2025-11-12
-- Description: Since the trigger always provides a value, we don't need the DEFAULT

BEGIN;

-- Remove the default value from full_name column
ALTER TABLE users
ALTER COLUMN full_name DROP DEFAULT;

COMMIT;
