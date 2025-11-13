-- Migration: Create user_invites table
-- Created: 2025-11-12
-- Description: Team member invitation system with SMS/email invite codes

BEGIN;

-- Create user_invites table
CREATE TABLE user_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Invitee details
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
  contact TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'email')),
  role TEXT NOT NULL CHECK (role IN ('technician', 'coordinator')),

  -- Invite credentials
  invite_code TEXT UNIQUE NOT NULL CHECK (invite_code ~ '^[0-9]{6}$'),
  invite_token TEXT UNIQUE NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),

  -- Timestamps
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_invites_org_id ON user_invites(org_id);
CREATE INDEX idx_user_invites_invite_code ON user_invites(invite_code)
  WHERE status = 'pending';
CREATE INDEX idx_user_invites_invite_token ON user_invites(invite_token)
  WHERE status = 'pending';
CREATE INDEX idx_user_invites_status ON user_invites(org_id, status);
CREATE INDEX idx_user_invites_expires_at ON user_invites(expires_at)
  WHERE status = 'pending';
CREATE INDEX idx_user_invites_contact ON user_invites(contact)
  WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invites in their org
CREATE POLICY "Users can view invites in their org"
  ON user_invites FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Owners and coordinators can create invites
CREATE POLICY "Owners and coordinators can create invites"
  ON user_invites FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
        AND email_confirmed = true
    )
  );

-- Policy: Owners and coordinators can update invites (resend, cancel)
CREATE POLICY "Owners and coordinators can update invites"
  ON user_invites FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
    )
  );

-- Policy: Owners and coordinators can delete invites
CREATE POLICY "Owners and coordinators can delete invites"
  ON user_invites FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
    )
  );

-- Trigger: Auto-update updated_at timestamp
CREATE TRIGGER update_user_invites_updated_at
  BEFORE UPDATE ON user_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE user_invites IS 'Team member invitations with SMS/email codes and 7-day expiry';
COMMENT ON COLUMN user_invites.invite_code IS '6-digit numeric code for manual entry via mobile app';
COMMENT ON COLUMN user_invites.invite_token IS 'UUID token for one-click invite link acceptance';
COMMENT ON COLUMN user_invites.expires_at IS 'Invite automatically expires after 7 days';
COMMENT ON COLUMN user_invites.contact IS 'Phone number (+91...) or email address';
COMMENT ON COLUMN user_invites.contact_type IS 'Determines whether to send SMS or email';

COMMIT;
