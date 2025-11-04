-- Migration: Create preorders table for landing page pre-order system
-- Created: 2025-11-03
-- Description: Store pre-order signups with email confirmation and payment tracking

BEGIN;

-- ============================================================================
-- PREORDERS TABLE
-- ============================================================================
CREATE TABLE preorders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact Information
  org_name TEXT NOT NULL CHECK (char_length(org_name) >= 2 AND char_length(org_name) <= 200),
  contact_name TEXT NOT NULL CHECK (char_length(contact_name) >= 2 AND char_length(contact_name) <= 100),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT CHECK (char_length(phone) <= 20),

  -- Business Details
  tech_count INTEGER CHECK (tech_count > 0),
  city TEXT,
  plan_interest TEXT CHECK (plan_interest IN ('free', 'pro', 'enterprise')),

  -- Payment Tracking
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT, -- Razorpay payment ID
  amount_paid DECIMAL(10,2) DEFAULT 0,

  -- Email Confirmation
  email_confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,

  -- Metadata
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_preorders_email ON preorders(email);
CREATE INDEX idx_preorders_confirmation_token ON preorders(confirmation_token) WHERE confirmation_token IS NOT NULL;
CREATE INDEX idx_preorders_email_confirmed ON preorders(email_confirmed);
CREATE INDEX idx_preorders_payment_status ON preorders(payment_status);
CREATE INDEX idx_preorders_created_at ON preorders(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE preorders IS 'Pre-order signups from landing page with payment and confirmation tracking';
COMMENT ON COLUMN preorders.org_name IS 'Organization/company name';
COMMENT ON COLUMN preorders.contact_name IS 'Primary contact person name';
COMMENT ON COLUMN preorders.email IS 'Contact email - must be unique';
COMMENT ON COLUMN preorders.tech_count IS 'Number of technicians/field workers';
COMMENT ON COLUMN preorders.plan_interest IS 'Which plan user is interested in';
COMMENT ON COLUMN preorders.payment_status IS 'Payment tracking: pending (no payment), paid (₹499 received), refunded';
COMMENT ON COLUMN preorders.payment_id IS 'Razorpay payment ID for reconciliation';
COMMENT ON COLUMN preorders.amount_paid IS 'Amount paid in INR (typically ₹499 for early access)';
COMMENT ON COLUMN preorders.email_confirmed IS 'Whether user has clicked email confirmation link';
COMMENT ON COLUMN preorders.confirmation_token IS 'Unique token for email confirmation link';
COMMENT ON COLUMN preorders.token_expires_at IS 'Confirmation token expiry (7 days)';

COMMIT;
