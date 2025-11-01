-- Migration: Create Row Level Security (RLS) policies
-- Created: 2025-11-01
-- Description: Enforce org isolation and role-based access control

BEGIN;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_check_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================================
-- USERS POLICIES
-- ============================================================================
CREATE POLICY "Users can view users in their org"
  ON users FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Owners can manage users in their org"
  ON users FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================
CREATE POLICY "Users can view clients in their org"
  ON clients FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and coordinators can manage clients"
  ON clients FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND email_confirmed = TRUE
      AND role IN ('owner', 'coordinator')
    )
  );

-- ============================================================================
-- SITES POLICIES
-- ============================================================================
CREATE POLICY "Users can view sites in their org"
  ON sites FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and coordinators can manage sites"
  ON sites FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND email_confirmed = TRUE
      AND role IN ('owner', 'coordinator')
    )
  );

-- ============================================================================
-- ASSETS POLICIES
-- ============================================================================
CREATE POLICY "Users can view assets in their org"
  ON assets FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and coordinators can manage assets"
  ON assets FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND email_confirmed = TRUE
      AND role IN ('owner', 'coordinator')
    )
  );

-- ============================================================================
-- JOBS POLICIES
-- ============================================================================
CREATE POLICY "Users can view jobs in their org"
  ON jobs FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and coordinators can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND email_confirmed = TRUE
      AND role IN ('owner', 'coordinator')
    )
  );

CREATE POLICY "Owners and coordinators can update jobs"
  ON jobs FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coordinator')
    )
  );

CREATE POLICY "Technicians can update assigned jobs"
  ON jobs FOR UPDATE
  USING (
    id IN (
      SELECT job_id FROM job_assignments
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Technicians can only update status and some fields
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and coordinators can delete jobs"
  ON jobs FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coordinator')
    )
  );

-- ============================================================================
-- JOB_ASSIGNMENTS POLICIES
-- ============================================================================
CREATE POLICY "Users can view job assignments in their org"
  ON job_assignments FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Owners and coordinators can manage job assignments"
  ON job_assignments FOR ALL
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid()
        AND email_confirmed = TRUE
        AND role IN ('owner', 'coordinator')
      )
    )
  );

CREATE POLICY "Technicians can update their own assignments"
  ON job_assignments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- JOB_MEDIA POLICIES
-- ============================================================================
CREATE POLICY "Users can view job media in their org"
  ON job_media FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Assigned users can upload job media"
  ON job_media FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT job_id FROM job_assignments
      WHERE user_id = auth.uid()
    )
    OR
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
      )
    )
  );

CREATE POLICY "Owners and coordinators can delete job media"
  ON job_media FOR DELETE
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
      )
    )
  );

-- ============================================================================
-- JOB_CHECK_EVENTS POLICIES
-- ============================================================================
CREATE POLICY "Users can view check events in their org"
  ON job_check_events FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create their own check events"
  ON job_check_events FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND job_id IN (
      SELECT id FROM jobs
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

-- ============================================================================
-- INVENTORY_ITEMS POLICIES
-- ============================================================================
CREATE POLICY "Users can view inventory in their org"
  ON inventory_items FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Owners and coordinators can manage inventory"
  ON inventory_items FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
      AND email_confirmed = TRUE
      AND role IN ('owner', 'coordinator')
    )
  );

-- ============================================================================
-- INVENTORY_INSTANCES POLICIES
-- ============================================================================
CREATE POLICY "Users can view inventory instances in their org"
  ON inventory_instances FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM inventory_items
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Owners and coordinators can manage inventory instances"
  ON inventory_instances FOR ALL
  USING (
    item_id IN (
      SELECT id FROM inventory_items
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid()
        AND email_confirmed = TRUE
        AND role IN ('owner', 'coordinator')
      )
    )
  );

-- ============================================================================
-- INVENTORY_ISSUANCES POLICIES
-- ============================================================================
CREATE POLICY "Users can view issuances in their org"
  ON inventory_issuances FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM inventory_items
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Owners and coordinators can create issuances"
  ON inventory_issuances FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM inventory_items
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid()
        AND email_confirmed = TRUE
        AND role IN ('owner', 'coordinator')
      )
    )
  );

CREATE POLICY "Owners and coordinators can update issuances"
  ON inventory_issuances FOR UPDATE
  USING (
    item_id IN (
      SELECT id FROM inventory_items
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'coordinator')
      )
    )
  );

-- ============================================================================
-- INVENTORY_AUDIT_LOG POLICIES
-- ============================================================================
CREATE POLICY "Users can view audit log in their org"
  ON inventory_audit_log FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM inventory_items
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

-- Audit log is append-only (no UPDATE/DELETE policies)

COMMIT;
