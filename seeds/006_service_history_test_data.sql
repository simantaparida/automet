-- ============================================================================
-- SEED 006: Service History Test Data
-- ============================================================================
-- Purpose: Add test data for service history by simulating completed assignments
-- Created: 2025-11-18
-- ============================================================================

-- Update some existing job assignments to have check-in and check-out data
-- This will populate the Service History section

-- Find the first job assignment and update it with completed status
DO $$
DECLARE
  v_assignment_id UUID;
  v_job_id UUID;
BEGIN
  -- Get the first assignment
  SELECT id, job_id INTO v_assignment_id, v_job_id
  FROM job_assignments
  WHERE started_at IS NULL
  LIMIT 1;

  IF v_assignment_id IS NOT NULL THEN
    -- Update the assignment with check-in and check-out data
    UPDATE job_assignments
    SET
      started_at = NOW() - INTERVAL '5 hours',
      completed_at = NOW() - INTERVAL '2 hours',
      notes = 'Completed routine maintenance. All systems checked and operational. Replaced air filter and cleaned condenser coils.'
    WHERE id = v_assignment_id;

    RAISE NOTICE 'Updated assignment % with service history data', v_assignment_id;
  END IF;
END $$;

-- Add another completed assignment for a different job
DO $$
DECLARE
  v_assignment_id UUID;
  v_job_id UUID;
BEGIN
  -- Get the second assignment
  SELECT id, job_id INTO v_assignment_id, v_job_id
  FROM job_assignments
  WHERE started_at IS NULL
  LIMIT 1 OFFSET 1;

  IF v_assignment_id IS NOT NULL THEN
    -- Update the assignment with check-in and check-out data
    UPDATE job_assignments
    SET
      started_at = NOW() - INTERVAL '2 days 3 hours',
      completed_at = NOW() - INTERVAL '2 days 1 hour',
      notes = 'Emergency repair completed. Replaced faulty compressor and recharged refrigerant. System tested and verified.'
    WHERE id = v_assignment_id;

    RAISE NOTICE 'Updated assignment % with service history data', v_assignment_id;
  END IF;
END $$;

-- Add a third in-progress assignment (checked in but not checked out)
DO $$
DECLARE
  v_assignment_id UUID;
  v_job_id UUID;
BEGIN
  -- Get the third assignment
  SELECT id, job_id INTO v_assignment_id, v_job_id
  FROM job_assignments
  WHERE started_at IS NULL
  LIMIT 1 OFFSET 2;

  IF v_assignment_id IS NOT NULL THEN
    -- Update the assignment with check-in data only (still in progress)
    UPDATE job_assignments
    SET
      started_at = NOW() - INTERVAL '1 hour 30 minutes',
      notes = NULL
    WHERE id = v_assignment_id;

    RAISE NOTICE 'Updated assignment % with in-progress service history data', v_assignment_id;
  END IF;
END $$;

-- Verification query
SELECT
  ja.id AS assignment_id,
  j.title AS job_title,
  u.email AS technician_email,
  u.full_name AS technician_name,
  ja.started_at,
  ja.completed_at,
  ja.notes,
  CASE
    WHEN ja.completed_at IS NOT NULL THEN 'Completed'
    WHEN ja.started_at IS NOT NULL THEN 'In Progress'
    ELSE 'Not Started'
  END AS status
FROM job_assignments ja
JOIN jobs j ON ja.job_id = j.id
JOIN users u ON ja.user_id = u.id
WHERE ja.started_at IS NOT NULL
ORDER BY ja.started_at DESC;
