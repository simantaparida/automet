-- Migration: Update preorders table for simplified waitlist signup
-- Created: 2025-11-04
-- Description: Make org_name and contact_name nullable, update plan_interest constraint

BEGIN;

-- Make org_name and contact_name nullable (they're optional in the form)
ALTER TABLE preorders
  ALTER COLUMN org_name DROP NOT NULL,
  ALTER COLUMN contact_name DROP NOT NULL;

-- Drop the old plan_interest constraint
ALTER TABLE preorders
  DROP CONSTRAINT IF EXISTS preorders_plan_interest_check;

-- Add new plan_interest constraint with all plan types
ALTER TABLE preorders
  ADD CONSTRAINT preorders_plan_interest_check 
  CHECK (plan_interest IS NULL OR plan_interest IN ('free', 'starter', 'growth', 'business', 'enterprise'));

-- Update the CHECK constraints for org_name and contact_name to allow NULL
ALTER TABLE preorders
  DROP CONSTRAINT IF EXISTS preorders_org_name_check,
  DROP CONSTRAINT IF EXISTS preorders_contact_name_check;

ALTER TABLE preorders
  ADD CONSTRAINT preorders_org_name_check 
  CHECK (org_name IS NULL OR (char_length(org_name) >= 2 AND char_length(org_name) <= 200));

ALTER TABLE preorders
  ADD CONSTRAINT preorders_contact_name_check 
  CHECK (contact_name IS NULL OR (char_length(contact_name) >= 2 AND char_length(contact_name) <= 100));

COMMIT;

