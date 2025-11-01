-- Migration: Create inventory tables
-- Created: 2025-11-01
-- Description: Inventory management with optional serial number tracking

BEGIN;

-- ============================================================================
-- INVENTORY_ITEMS TABLE
-- ============================================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
  sku TEXT CHECK (char_length(sku) <= 100),
  unit TEXT DEFAULT 'piece' CHECK (char_length(unit) <= 20),
  quantity NUMERIC(10, 2) DEFAULT 0 CHECK (quantity >= 0),
  reorder_level NUMERIC(10, 2) DEFAULT 0 CHECK (reorder_level >= 0),
  is_serialized BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT inventory_items_unique_sku_per_org UNIQUE (org_id, sku)
);

CREATE INDEX idx_inventory_items_org_id ON inventory_items(org_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(org_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_inventory_items_low_stock ON inventory_items(org_id) WHERE quantity <= reorder_level;
CREATE INDEX idx_inventory_items_serialized ON inventory_items(org_id) WHERE is_serialized = TRUE;

COMMENT ON TABLE inventory_items IS 'Inventory tracked at organization level (consumables, tools, parts)';
COMMENT ON COLUMN inventory_items.sku IS 'Stock Keeping Unit - unique identifier within org';
COMMENT ON COLUMN inventory_items.unit IS 'Unit of measurement: piece, kg, liter, box, etc.';
COMMENT ON COLUMN inventory_items.quantity IS 'Current stock quantity (for non-serialized items)';
COMMENT ON COLUMN inventory_items.reorder_level IS 'Alert when quantity falls below this threshold';
COMMENT ON COLUMN inventory_items.is_serialized IS 'TRUE = track individual instances with serial numbers';

-- ============================================================================
-- INVENTORY_INSTANCES TABLE (opt-in for serialized items)
-- ============================================================================
CREATE TABLE inventory_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL CHECK (char_length(serial_number) >= 1 AND char_length(serial_number) <= 200),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'issued', 'maintenance', 'retired')),
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT inventory_instances_unique_serial UNIQUE (item_id, serial_number)
);

CREATE INDEX idx_inventory_instances_item_id ON inventory_instances(item_id);
CREATE INDEX idx_inventory_instances_status ON inventory_instances(item_id, status);
CREATE INDEX idx_inventory_instances_site_id ON inventory_instances(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX idx_inventory_instances_assigned_to ON inventory_instances(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_inventory_instances_serial ON inventory_instances(item_id, serial_number);

COMMENT ON TABLE inventory_instances IS 'Individual serial-numbered instances (opt-in feature for high-value items)';
COMMENT ON COLUMN inventory_instances.serial_number IS 'Unique serial/asset number per item';
COMMENT ON COLUMN inventory_instances.status IS 'Lifecycle: available → issued → (maintenance) → retired';
COMMENT ON COLUMN inventory_instances.site_id IS 'Currently deployed at this site';
COMMENT ON COLUMN inventory_instances.assigned_to IS 'Currently assigned to this technician';

-- ============================================================================
-- INVENTORY_ISSUANCES TABLE
-- ============================================================================
CREATE TABLE inventory_issuances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES inventory_instances(id) ON DELETE SET NULL,
  issued_to_user UUID REFERENCES users(id) ON DELETE SET NULL,
  issued_to_site UUID REFERENCES sites(id) ON DELETE SET NULL,
  quantity NUMERIC(10, 2) CHECK (quantity > 0),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  returned_quantity NUMERIC(10, 2) CHECK (returned_quantity >= 0 AND returned_quantity <= quantity),
  notes TEXT CHECK (char_length(notes) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT inventory_issuances_target_check CHECK (
    issued_to_user IS NOT NULL OR issued_to_site IS NOT NULL
  ),
  CONSTRAINT inventory_issuances_quantity_or_instance CHECK (
    (instance_id IS NOT NULL AND quantity IS NULL) OR
    (instance_id IS NULL AND quantity IS NOT NULL)
  ),
  CONSTRAINT inventory_issuances_return_after_issue CHECK (
    returned_at IS NULL OR returned_at >= issued_at
  )
);

CREATE INDEX idx_inventory_issuances_item_id ON inventory_issuances(item_id);
CREATE INDEX idx_inventory_issuances_instance_id ON inventory_issuances(instance_id) WHERE instance_id IS NOT NULL;
CREATE INDEX idx_inventory_issuances_issued_to_user ON inventory_issuances(issued_to_user) WHERE issued_to_user IS NOT NULL;
CREATE INDEX idx_inventory_issuances_issued_to_site ON inventory_issuances(issued_to_site) WHERE issued_to_site IS NOT NULL;
CREATE INDEX idx_inventory_issuances_unreturned ON inventory_issuances(item_id) WHERE returned_at IS NULL;

COMMENT ON TABLE inventory_issuances IS 'Record of inventory issued to technicians or sites';
COMMENT ON COLUMN inventory_issuances.instance_id IS 'For serialized items - links to specific instance';
COMMENT ON COLUMN inventory_issuances.quantity IS 'For quantity-based items - amount issued';
COMMENT ON COLUMN inventory_issuances.issued_to_user IS 'Issued to technician for field work';
COMMENT ON COLUMN inventory_issuances.issued_to_site IS 'Issued to site for installation/consumption';
COMMENT ON COLUMN inventory_issuances.returned_quantity IS 'Partial returns supported';

-- ============================================================================
-- INVENTORY_AUDIT_LOG TABLE
-- ============================================================================
CREATE TABLE inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES inventory_instances(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('issue', 'return', 'restock', 'adjustment', 'retired')),
  quantity_delta NUMERIC(10, 2),
  balance_after NUMERIC(10, 2),
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_inventory_audit_log_item_id ON inventory_audit_log(item_id, timestamp DESC);
CREATE INDEX idx_inventory_audit_log_instance_id ON inventory_audit_log(instance_id, timestamp DESC) WHERE instance_id IS NOT NULL;
CREATE INDEX idx_inventory_audit_log_changed_by ON inventory_audit_log(changed_by, timestamp DESC) WHERE changed_by IS NOT NULL;
CREATE INDEX idx_inventory_audit_log_action ON inventory_audit_log(item_id, action);

COMMENT ON TABLE inventory_audit_log IS 'Audit trail for all inventory movements';
COMMENT ON COLUMN inventory_audit_log.action IS 'Type of inventory change';
COMMENT ON COLUMN inventory_audit_log.quantity_delta IS 'Change in quantity (+10, -5, etc.)';
COMMENT ON COLUMN inventory_audit_log.balance_after IS 'Quantity after this action';
COMMENT ON COLUMN inventory_audit_log.metadata IS 'Additional context (issuance_id, reason, etc.)';

COMMIT;
