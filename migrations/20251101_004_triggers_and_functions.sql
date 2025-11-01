-- Migration: Create triggers and functions
-- Created: 2025-11-01
-- Description: Automated timestamps, inventory audit logging, and business logic

BEGIN;

-- ============================================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates updated_at timestamp on row modification';

-- ============================================================================
-- TRIGGER: Apply updated_at to all relevant tables
-- ============================================================================
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER inventory_instances_updated_at BEFORE UPDATE ON inventory_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Log inventory issuance to audit log
-- ============================================================================
CREATE OR REPLACE FUNCTION log_inventory_issuance()
RETURNS TRIGGER AS $$
DECLARE
  v_item inventory_items%ROWTYPE;
  v_new_balance NUMERIC(10, 2);
BEGIN
  -- Get item details
  SELECT * INTO v_item FROM inventory_items WHERE id = NEW.item_id;

  IF TG_OP = 'INSERT' THEN
    -- Issuance created
    IF NEW.instance_id IS NOT NULL THEN
      -- Serialized item issued
      INSERT INTO inventory_audit_log (
        item_id,
        instance_id,
        action,
        quantity_delta,
        balance_after,
        changed_by,
        metadata
      ) VALUES (
        NEW.item_id,
        NEW.instance_id,
        'issue',
        NULL, -- No quantity delta for serialized
        NULL,
        COALESCE(NEW.issued_to_user, (SELECT id FROM users WHERE org_id = v_item.org_id LIMIT 1)),
        jsonb_build_object(
          'issuance_id', NEW.id,
          'issued_to_user', NEW.issued_to_user,
          'issued_to_site', NEW.issued_to_site
        )
      );

      -- Update instance status
      UPDATE inventory_instances
      SET status = 'issued',
          site_id = NEW.issued_to_site,
          assigned_to = NEW.issued_to_user
      WHERE id = NEW.instance_id;

    ELSE
      -- Quantity-based item issued
      -- Decrement inventory
      UPDATE inventory_items
      SET quantity = quantity - NEW.quantity
      WHERE id = NEW.item_id
      RETURNING quantity INTO v_new_balance;

      -- Log to audit
      INSERT INTO inventory_audit_log (
        item_id,
        action,
        quantity_delta,
        balance_after,
        changed_by,
        metadata
      ) VALUES (
        NEW.item_id,
        'issue',
        -NEW.quantity,
        v_new_balance,
        COALESCE(NEW.issued_to_user, (SELECT id FROM users WHERE org_id = v_item.org_id LIMIT 1)),
        jsonb_build_object(
          'issuance_id', NEW.id,
          'issued_to_user', NEW.issued_to_user,
          'issued_to_site', NEW.issued_to_site
        )
      );
    END IF;

  ELSIF TG_OP = 'UPDATE' AND OLD.returned_at IS NULL AND NEW.returned_at IS NOT NULL THEN
    -- Item returned
    IF NEW.instance_id IS NOT NULL THEN
      -- Serialized item returned
      INSERT INTO inventory_audit_log (
        item_id,
        instance_id,
        action,
        quantity_delta,
        balance_after,
        changed_by,
        metadata
      ) VALUES (
        NEW.item_id,
        NEW.instance_id,
        'return',
        NULL,
        NULL,
        (SELECT id FROM users WHERE org_id = v_item.org_id LIMIT 1),
        jsonb_build_object('issuance_id', NEW.id)
      );

      -- Update instance status
      UPDATE inventory_instances
      SET status = 'available',
          site_id = NULL,
          assigned_to = NULL
      WHERE id = NEW.instance_id;

    ELSE
      -- Quantity-based item returned
      UPDATE inventory_items
      SET quantity = quantity + COALESCE(NEW.returned_quantity, NEW.quantity)
      WHERE id = NEW.item_id
      RETURNING quantity INTO v_new_balance;

      INSERT INTO inventory_audit_log (
        item_id,
        action,
        quantity_delta,
        balance_after,
        changed_by,
        metadata
      ) VALUES (
        NEW.item_id,
        'return',
        COALESCE(NEW.returned_quantity, NEW.quantity),
        v_new_balance,
        (SELECT id FROM users WHERE org_id = v_item.org_id LIMIT 1),
        jsonb_build_object('issuance_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_inventory_issuance IS 'Automatically logs inventory movements and updates stock levels';

-- ============================================================================
-- TRIGGER: Apply inventory audit logging
-- ============================================================================
CREATE TRIGGER inventory_issuances_audit
  AFTER INSERT OR UPDATE ON inventory_issuances
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_issuance();

-- ============================================================================
-- FUNCTION: Validate job status transitions
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_job_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent invalid status transitions
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    RAISE EXCEPTION 'Cannot change status of completed job from % to %', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    RAISE EXCEPTION 'Cannot change status of cancelled job from % to %', OLD.status, NEW.status;
  END IF;

  -- Auto-set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;

  -- Clear completed_at if status changes from completed (edge case)
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_job_status_transition IS 'Enforces business rules for job status changes';

-- ============================================================================
-- TRIGGER: Apply job status validation
-- ============================================================================
CREATE TRIGGER jobs_status_validation
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION validate_job_status_transition();

-- ============================================================================
-- FUNCTION: Increment usage counters
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_usage_counter()
RETURNS TRIGGER AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- Calculate current billing period (monthly, 1st to end of month)
  v_period_start = DATE_TRUNC('month', CURRENT_DATE);
  v_period_end = (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- Increment job counter for this org's current period
  INSERT INTO usage_counters (org_id, period_start, period_end, jobs_created_count)
  VALUES (NEW.org_id, v_period_start, v_period_end, 1)
  ON CONFLICT (org_id, period_start)
  DO UPDATE SET
    jobs_created_count = usage_counters.jobs_created_count + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_usage_counter IS 'Tracks usage for subscription limit enforcement';

-- ============================================================================
-- TRIGGER: Track job creation for usage limits
-- ============================================================================
CREATE TRIGGER jobs_usage_counter
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION increment_usage_counter();

COMMIT;
