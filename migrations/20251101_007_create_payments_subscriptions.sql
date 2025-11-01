-- Migration: Create payments and subscriptions tables
-- Created: 2025-11-01
-- Description: Razorpay integration, subscription management, and usage tracking

BEGIN;

-- ============================================================================
-- SUBSCRIPTION_PLANS TABLE
-- ============================================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  price_monthly_inr INTEGER NOT NULL CHECK (price_monthly_inr >= 0),
  price_annual_inr INTEGER CHECK (price_annual_inr >= 0),
  max_users INTEGER CHECK (max_users > 0),
  max_jobs_per_month INTEGER CHECK (max_jobs_per_month > 0),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE subscription_plans IS 'Available subscription tiers (Free, Pro, Enterprise)';
COMMENT ON COLUMN subscription_plans.price_monthly_inr IS 'Monthly price in Indian Rupees (paise for Razorpay)';
COMMENT ON COLUMN subscription_plans.max_users IS 'Maximum active users allowed';
COMMENT ON COLUMN subscription_plans.max_jobs_per_month IS 'Maximum jobs per billing period';
COMMENT ON COLUMN subscription_plans.features IS 'Array of feature flags: ["offline_mode", "pdf_reports", "api_access"]';

-- ============================================================================
-- BILLING_CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE billing_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  razorpay_customer_id TEXT UNIQUE,
  billing_email TEXT NOT NULL CHECK (billing_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  gstin TEXT CHECK (char_length(gstin) = 15), -- Indian GST Identification Number
  billing_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_customers_org_id ON billing_customers(org_id);
CREATE INDEX idx_billing_customers_razorpay_id ON billing_customers(razorpay_customer_id) WHERE razorpay_customer_id IS NOT NULL;

COMMENT ON TABLE billing_customers IS 'Billing information for organizations (Razorpay customer records)';
COMMENT ON COLUMN billing_customers.razorpay_customer_id IS 'Razorpay customer ID (cust_xxxxx)';
COMMENT ON COLUMN billing_customers.gstin IS '15-digit GST number for Indian businesses';

-- ============================================================================
-- ORG_SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE org_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  razorpay_subscription_id TEXT UNIQUE,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT org_subscriptions_period_order CHECK (current_period_end > current_period_start)
);

CREATE INDEX idx_org_subscriptions_org_id ON org_subscriptions(org_id);
CREATE INDEX idx_org_subscriptions_status ON org_subscriptions(org_id, status);
CREATE INDEX idx_org_subscriptions_period ON org_subscriptions(current_period_start, current_period_end);
CREATE INDEX idx_org_subscriptions_razorpay_id ON org_subscriptions(razorpay_subscription_id) WHERE razorpay_subscription_id IS NOT NULL;

COMMENT ON TABLE org_subscriptions IS 'Active and historical subscriptions for organizations';
COMMENT ON COLUMN org_subscriptions.status IS 'active = paying, past_due = payment failed, cancelled = ended, trialing = free trial';
COMMENT ON COLUMN org_subscriptions.razorpay_subscription_id IS 'Razorpay subscription ID (sub_xxxxx)';

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES org_subscriptions(id) ON DELETE SET NULL,
  amount_inr INTEGER NOT NULL CHECK (amount_inr > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_org_id ON payments(org_id, created_at DESC);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

COMMENT ON TABLE payments IS 'Payment transaction records';
COMMENT ON COLUMN payments.amount_inr IS 'Amount in paise (₹999 = 99900 paise)';
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID (pay_xxxxx)';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay order ID (order_xxxxx)';
COMMENT ON COLUMN payments.receipt_url IS 'URL to downloadable receipt/invoice';

-- ============================================================================
-- USAGE_COUNTERS TABLE
-- ============================================================================
CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  active_users_count INTEGER DEFAULT 0 CHECK (active_users_count >= 0),
  jobs_created_count INTEGER DEFAULT 0 CHECK (jobs_created_count >= 0),
  storage_bytes_used BIGINT DEFAULT 0 CHECK (storage_bytes_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT usage_counters_unique_org_period UNIQUE (org_id, period_start),
  CONSTRAINT usage_counters_period_order CHECK (period_end >= period_start)
);

CREATE INDEX idx_usage_counters_org_period ON usage_counters(org_id, period_start DESC);
CREATE INDEX idx_usage_counters_current_period ON usage_counters(org_id)
  WHERE period_start <= CURRENT_DATE AND period_end >= CURRENT_DATE;

COMMENT ON TABLE usage_counters IS 'Track usage for subscription limit enforcement';
COMMENT ON COLUMN usage_counters.period_start IS 'Start of billing period (typically 1st of month)';
COMMENT ON COLUMN usage_counters.period_end IS 'End of billing period (typically last day of month)';
COMMENT ON COLUMN usage_counters.active_users_count IS 'Number of users who performed actions this period';
COMMENT ON COLUMN usage_counters.jobs_created_count IS 'Total jobs created this period';

-- Add updated_at trigger to new tables
CREATE TRIGGER billing_customers_updated_at BEFORE UPDATE ON billing_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER org_subscriptions_updated_at BEFORE UPDATE ON org_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER usage_counters_updated_at BEFORE UPDATE ON usage_counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
