-- Migration: Grant table permissions to authenticated role
-- Created: 2025-11-01
-- Description: Grant necessary table-level permissions to authenticated role
--              This is required for RLS policies to work - RLS can only be evaluated
--              if the role has table-level permissions

BEGIN;

-- Grant SELECT, INSERT, UPDATE permissions to authenticated role on all tables
-- RLS policies will then control which rows can be accessed

-- Clients
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;

-- Sites
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;

-- Assets
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;

-- Jobs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;

-- Job Assignments
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_assignments TO authenticated;

-- Job Media
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_media TO authenticated;

-- Job Check Events
GRANT SELECT, INSERT, UPDATE ON public.job_check_events TO authenticated;

-- Inventory Items
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;

-- Inventory Instances
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_instances TO authenticated;

-- Inventory Issuances
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_issuances TO authenticated;

-- Inventory Audit Log
GRANT SELECT, INSERT, UPDATE ON public.inventory_audit_log TO authenticated;

-- Organizations (read-only for authenticated users)
GRANT SELECT ON public.organizations TO authenticated;

COMMIT;

