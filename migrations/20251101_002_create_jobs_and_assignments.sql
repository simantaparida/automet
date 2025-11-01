-- Migration: Create jobs and assignments tables
-- Created: 2025-11-01
-- Description: Job management, assignments, media, and check-in/out tracking

BEGIN;

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 5000),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT jobs_completed_after_scheduled CHECK (
    completed_at IS NULL OR scheduled_at IS NULL OR completed_at >= scheduled_at
  )
);

CREATE INDEX idx_jobs_org_id ON jobs(org_id);
CREATE INDEX idx_jobs_client_id ON jobs(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_jobs_site_id ON jobs(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX idx_jobs_asset_id ON jobs(asset_id) WHERE asset_id IS NOT NULL;
CREATE INDEX idx_jobs_status ON jobs(org_id, status);
CREATE INDEX idx_jobs_priority ON jobs(org_id, priority);
CREATE INDEX idx_jobs_scheduled_at ON jobs(org_id, scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_jobs_created_at ON jobs(org_id, created_at DESC);

COMMENT ON TABLE jobs IS 'Work orders/tasks assigned to technicians';
COMMENT ON COLUMN jobs.status IS 'Lifecycle: scheduled → in_progress → completed/cancelled';
COMMENT ON COLUMN jobs.scheduled_at IS 'When the job is planned to start';
COMMENT ON COLUMN jobs.completed_at IS 'When the job was marked as done';

-- ============================================================================
-- JOB_ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT CHECK (char_length(notes) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT job_assignments_times_order CHECK (
    (started_at IS NULL OR started_at >= assigned_at) AND
    (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
  ),
  CONSTRAINT job_assignments_unique_user_per_job UNIQUE (job_id, user_id)
);

CREATE INDEX idx_job_assignments_job_id ON job_assignments(job_id);
CREATE INDEX idx_job_assignments_user_id ON job_assignments(user_id);
CREATE INDEX idx_job_assignments_primary ON job_assignments(job_id, is_primary) WHERE is_primary = TRUE;

COMMENT ON TABLE job_assignments IS 'Assignment history - tracks who was assigned to which job and when';
COMMENT ON COLUMN job_assignments.is_primary IS 'TRUE for the main assignee (only one primary per job recommended)';
COMMENT ON COLUMN job_assignments.started_at IS 'When technician started work (check-in time)';
COMMENT ON COLUMN job_assignments.completed_at IS 'When technician finished work';

-- ============================================================================
-- JOB_MEDIA TABLE
-- ============================================================================
CREATE TABLE job_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'document')),
  file_size_bytes BIGINT CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760), -- 10MB max
  gps_lat NUMERIC(10, 7) CHECK (gps_lat >= -90 AND gps_lat <= 90),
  gps_lng NUMERIC(10, 7) CHECK (gps_lng >= -180 AND gps_lng <= 180),
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_media_job_id ON job_media(job_id);
CREATE INDEX idx_job_media_uploaded_by ON job_media(uploaded_by) WHERE uploaded_by IS NOT NULL;
CREATE INDEX idx_job_media_type ON job_media(job_id, media_type);
CREATE INDEX idx_job_media_captured_at ON job_media(job_id, captured_at DESC);

COMMENT ON TABLE job_media IS 'Photos, videos, and documents uploaded for job proof';
COMMENT ON COLUMN job_media.storage_path IS 'Path in Supabase Storage bucket (job-media/)';
COMMENT ON COLUMN job_media.gps_lat IS 'GPS latitude where photo was taken (optional)';
COMMENT ON COLUMN job_media.captured_at IS 'When the media was captured (may differ from upload time)';

-- ============================================================================
-- JOB_CHECK_EVENTS TABLE
-- ============================================================================
CREATE TABLE job_check_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('check_in', 'check_out')),
  gps_lat NUMERIC(10, 7) CHECK (gps_lat >= -90 AND gps_lat <= 90),
  gps_lng NUMERIC(10, 7) CHECK (gps_lng >= -180 AND gps_lng <= 180),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_check_events_job_id ON job_check_events(job_id, timestamp DESC);
CREATE INDEX idx_job_check_events_user_id ON job_check_events(user_id, timestamp DESC);
CREATE INDEX idx_job_check_events_type ON job_check_events(job_id, event_type);

COMMENT ON TABLE job_check_events IS 'Check-in/check-out events with GPS for attendance tracking';
COMMENT ON COLUMN job_check_events.event_type IS 'check_in = arrived at site, check_out = left site';
COMMENT ON COLUMN job_check_events.timestamp IS 'When the check-in/out occurred';

COMMIT;
