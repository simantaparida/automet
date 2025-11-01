-- Rollback: Drop payments and subscriptions tables
-- Created: 2025-11-01

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS usage_counters_updated_at ON usage_counters;
DROP TRIGGER IF EXISTS org_subscriptions_updated_at ON org_subscriptions;
DROP TRIGGER IF EXISTS billing_customers_updated_at ON billing_customers;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS usage_counters CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS org_subscriptions CASCADE;
DROP TABLE IF EXISTS billing_customers CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

COMMIT;
