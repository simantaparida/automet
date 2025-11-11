-- Rollback migration for preorders table updates
-- Created: 2025-11-04

BEGIN;

-- Revert plan_interest constraint
ALTER TABLE preorders
  DROP CONSTRAINT IF EXISTS preorders_plan_interest_check;

ALTER TABLE preorders
  ADD CONSTRAINT preorders_plan_interest_check 
  CHECK (plan_interest IN ('free', 'pro', 'enterprise'));

-- Revert org_name and contact_name constraints
ALTER TABLE preorders
  DROP CONSTRAINT IF EXISTS preorders_org_name_check,
  DROP CONSTRAINT IF EXISTS preorders_contact_name_check;

ALTER TABLE preorders
  ADD CONSTRAINT preorders_org_name_check 
  CHECK (char_length(org_name) >= 2 AND char_length(org_name) <= 200);

ALTER TABLE preorders
  ADD CONSTRAINT preorders_contact_name_check 
  CHECK (char_length(contact_name) >= 2 AND char_length(contact_name) <= 100);

-- Make org_name and contact_name NOT NULL again
ALTER TABLE preorders
  ALTER COLUMN org_name SET NOT NULL,
  ALTER COLUMN contact_name SET NOT NULL;

COMMIT;

