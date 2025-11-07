-- Migration: Create contact_messages table
-- Created: 2025-11-07
-- Description: Store contact form submissions for admin review

BEGIN;

-- ============================================================================
-- HELPER FUNCTION: update_updated_at_column (create if not exists)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONTACT_MESSAGES TABLE
-- ============================================================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  topic TEXT NOT NULL CHECK (topic IN ('pricing', 'features', 'technical', 'demo', 'partnership', 'other')),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 5000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_contact_messages_status ON contact_messages(status, created_at DESC);
CREATE INDEX idx_contact_messages_topic ON contact_messages(topic, created_at DESC);
CREATE INDEX idx_contact_messages_assigned ON contact_messages(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE contact_messages IS 'Contact form submissions from website visitors';
COMMENT ON COLUMN contact_messages.topic IS 'Category of inquiry: pricing, features, technical, demo, partnership, other';
COMMENT ON COLUMN contact_messages.status IS 'new = unread, in_progress = being handled, resolved = completed, archived = old/spam';
COMMENT ON COLUMN contact_messages.assigned_to IS 'Support team member handling this message';

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public INSERT (for contact form submission)
CREATE POLICY contact_messages_public_insert ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Service role can do everything (bypasses RLS anyway, but explicit is better)
CREATE POLICY contact_messages_service_role_all ON contact_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can read all (for future admin auth via Supabase Auth)
CREATE POLICY contact_messages_authenticated_read ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS (Critical for service_role access)
-- ============================================================================

-- Grant all permissions to service_role (for admin API access)
GRANT ALL ON public.contact_messages TO service_role;

-- Grant permissions to authenticated users (for future admin auth)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;

-- Grant INSERT permission to anonymous users (for contact form)
GRANT INSERT ON public.contact_messages TO anon;

COMMIT;

