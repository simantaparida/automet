-- Seed: Subscription Plans
-- Description: Free and Pro subscription tiers

BEGIN;

-- Delete existing plans (for idempotent seeding)
DELETE FROM subscription_plans;

-- Free Plan
INSERT INTO subscription_plans (
  id,
  name,
  price_monthly_inr,
  price_annual_inr,
  max_users,
  max_jobs_per_month,
  features,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Free Plan',
  0,
  0,
  5,
  50,
  '["basic_jobs", "basic_inventory", "mobile_app"]'::jsonb,
  TRUE
);

-- Pro Plan (Monthly)
INSERT INTO subscription_plans (
  id,
  name,
  price_monthly_inr,
  price_annual_inr,
  max_users,
  max_jobs_per_month,
  features,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Pro Plan',
  99900, -- ₹999 in paise
  999900, -- ₹9,999 in paise (annual - 2 months free)
  NULL, -- unlimited users
  NULL, -- unlimited jobs
  '["unlimited_jobs", "offline_mode", "pdf_reports", "advanced_inventory", "api_access", "priority_support"]'::jsonb,
  TRUE
);

COMMIT;

-- Verify
SELECT name, price_monthly_inr/100 as price_inr, max_users, max_jobs_per_month
FROM subscription_plans
ORDER BY price_monthly_inr;
