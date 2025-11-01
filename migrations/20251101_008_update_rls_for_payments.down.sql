-- Rollback: Drop RLS policies for payments and subscriptions
-- Created: 2025-11-01

BEGIN;

-- Disable RLS
ALTER TABLE usage_counters DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE org_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE billing_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Owners and coordinators can view usage counters" ON usage_counters;
DROP POLICY IF EXISTS "Owners can view their org payments" ON payments;
DROP POLICY IF EXISTS "Owners can view their org subscriptions" ON org_subscriptions;
DROP POLICY IF EXISTS "Owners can manage their org billing info" ON billing_customers;
DROP POLICY IF EXISTS "Owners can view their org billing info" ON billing_customers;
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;

COMMIT;
