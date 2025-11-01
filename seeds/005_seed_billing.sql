-- Seed: Billing and Subscription Data
-- Description: Attach demo org to Pro plan with subscription

BEGIN;

-- ============================================================================
-- BILLING CUSTOMER
-- ============================================================================
DELETE FROM billing_customers WHERE org_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO billing_customers (
  id,
  org_id,
  razorpay_customer_id,
  billing_email,
  gstin,
  billing_address,
  created_at
) VALUES (
  '90000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  NULL, -- Will be populated when Razorpay customer is created
  'admin@automet.dev',
  NULL, -- Optional GST number
  'Plot 12, Sector 18, Gurugram, Haryana 122015',
  NOW() - INTERVAL '3 months'
);

-- ============================================================================
-- ORG SUBSCRIPTION (Active Pro Plan)
-- ============================================================================
DELETE FROM org_subscriptions WHERE org_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO org_subscriptions (
  id,
  org_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  razorpay_subscription_id,
  created_at
) VALUES (
  '91000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002', -- Pro Plan
  'active',
  DATE_TRUNC('month', CURRENT_DATE),
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::TIMESTAMPTZ,
  NULL, -- Will be populated when Razorpay subscription is created
  NOW() - INTERVAL '3 months'
);

-- ============================================================================
-- USAGE COUNTERS (Current Period)
-- ============================================================================
DELETE FROM usage_counters WHERE org_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO usage_counters (
  id,
  org_id,
  period_start,
  period_end,
  active_users_count,
  jobs_created_count,
  storage_bytes_used,
  created_at
) VALUES (
  '92000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
  4, -- All 4 users active
  10, -- 10 jobs created this month
  0, -- Storage tracking to be implemented
  DATE_TRUNC('month', CURRENT_DATE)
);

COMMIT;

-- Verification
SELECT
  o.name as organization,
  sp.name as plan,
  os.status,
  os.current_period_start,
  os.current_period_end,
  uc.jobs_created_count,
  sp.max_jobs_per_month,
  CASE
    WHEN sp.max_jobs_per_month IS NULL THEN 'Unlimited'
    WHEN uc.jobs_created_count < sp.max_jobs_per_month THEN 'Within Limit'
    ELSE 'Exceeded'
  END as usage_status
FROM organizations o
JOIN org_subscriptions os ON os.org_id = o.id
JOIN subscription_plans sp ON sp.id = os.plan_id
LEFT JOIN usage_counters uc ON uc.org_id = o.id
  AND uc.period_start <= CURRENT_DATE
  AND uc.period_end >= CURRENT_DATE
WHERE o.id = '10000000-0000-0000-0000-000000000001';
