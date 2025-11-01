-- Rollback: Drop triggers and functions
-- Created: 2025-11-01

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS jobs_usage_counter ON jobs;
DROP TRIGGER IF EXISTS jobs_status_validation ON jobs;
DROP TRIGGER IF EXISTS inventory_issuances_audit ON inventory_issuances;
DROP TRIGGER IF EXISTS inventory_instances_updated_at ON inventory_instances;
DROP TRIGGER IF EXISTS inventory_items_updated_at ON inventory_items;
DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS assets_updated_at ON assets;
DROP TRIGGER IF EXISTS sites_updated_at ON sites;
DROP TRIGGER IF EXISTS clients_updated_at ON clients;
DROP TRIGGER IF EXISTS users_updated_at ON users;
DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;

-- Drop functions
DROP FUNCTION IF EXISTS increment_usage_counter();
DROP FUNCTION IF EXISTS validate_job_status_transition();
DROP FUNCTION IF EXISTS log_inventory_issuance();
DROP FUNCTION IF EXISTS update_updated_at_column();

COMMIT;
