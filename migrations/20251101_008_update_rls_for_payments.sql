-- Migration: Add RLS policies for payments and subscriptions
-- Created: 2025-11-01
-- Description: Secure billing data - owner-only access

BEGIN;

-- Enable RLS on billing tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SUBSCRIPTION_PLANS POLICIES (public read)
-- ============================================================================
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = TRUE);

-- Only service role can modify plans (handled server-side)

-- ============================================================================
-- BILLING_CUSTOMERS POLICIES (owner-only)
-- ============================================================================
CREATE POLICY "Owners can view their org billing info"
  ON billing_customers FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can manage their org billing info"
  ON billing_customers FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND email_confirmed = TRUE
      AND role = 'owner'
    )
  );

-- ============================================================================
-- ORG_SUBSCRIPTIONS POLICIES (owner-only read)
-- ============================================================================
CREATE POLICY "Owners can view their org subscriptions"
  ON org_subscriptions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Subscriptions are managed server-side via webhooks (service role bypass)

-- ============================================================================
-- PAYMENTS POLICIES (owner-only read)
-- ============================================================================
CREATE POLICY "Owners can view their org payments"
  ON payments FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Payments are created server-side via webhooks (service role bypass)

-- ============================================================================
-- USAGE_COUNTERS POLICIES (owner and coordinator read)
-- ============================================================================
CREATE POLICY "Owners and coordinators can view usage counters"
  ON usage_counters FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coordinator')
    )
  );

-- Usage counters are updated server-side (triggers and service role)

COMMIT;
