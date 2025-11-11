-- Migration: Create newsletter_subscribers table
-- Created: 2025-11-07
-- Description: Store email addresses for blog newsletter distribution

BEGIN;

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  source TEXT NOT NULL DEFAULT 'blog' CHECK (char_length(source) <= 100),
  variant TEXT CHECK (char_length(variant) <= 50),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Add comments
COMMENT ON TABLE newsletter_subscribers IS 'Email addresses subscribed to blog newsletter';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email address (unique, validated)';
COMMENT ON COLUMN newsletter_subscribers.status IS 'pending = awaiting confirmation, active = confirmed, unsubscribed = opted out';
COMMENT ON COLUMN newsletter_subscribers.source IS 'Where did they subscribe from (e.g., blog, inline, end-of-article)';
COMMENT ON COLUMN newsletter_subscribers.variant IS 'Which signup variant was used';

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow anyone to INSERT (subscribe)
CREATE POLICY newsletter_public_insert ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role can SELECT/UPDATE/DELETE (admin operations)
CREATE POLICY newsletter_service_role_all ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON newsletter_subscribers TO service_role;
GRANT INSERT ON newsletter_subscribers TO anon, authenticated;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

