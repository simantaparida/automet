-- Migration: Add notes column to clients table
-- Created: 2025-11-02
-- Description: Add optional notes field to store additional client information

BEGIN;

-- Add notes column to clients table
ALTER TABLE clients
ADD COLUMN notes TEXT;

COMMENT ON COLUMN clients.notes IS 'Additional information or special instructions about the client';

COMMIT;
