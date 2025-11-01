-- Rollback: Drop RLS policies
-- Created: 2025-11-01

BEGIN;

-- Disable RLS on all tables
ALTER TABLE inventory_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_issuances DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_instances DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_check_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Drop all policies (CASCADE will drop policies automatically when RLS is disabled,
-- but we list them explicitly for clarity)
DROP POLICY IF EXISTS "Users can view audit log in their org" ON inventory_audit_log;
DROP POLICY IF EXISTS "Owners and coordinators can update issuances" ON inventory_issuances;
DROP POLICY IF EXISTS "Owners and coordinators can create issuances" ON inventory_issuances;
DROP POLICY IF EXISTS "Users can view issuances in their org" ON inventory_issuances;
DROP POLICY IF EXISTS "Owners and coordinators can manage inventory instances" ON inventory_instances;
DROP POLICY IF EXISTS "Users can view inventory instances in their org" ON inventory_instances;
DROP POLICY IF EXISTS "Owners and coordinators can manage inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can view inventory in their org" ON inventory_items;
DROP POLICY IF EXISTS "Users can create their own check events" ON job_check_events;
DROP POLICY IF EXISTS "Users can view check events in their org" ON job_check_events;
DROP POLICY IF EXISTS "Owners and coordinators can delete job media" ON job_media;
DROP POLICY IF EXISTS "Assigned users can upload job media" ON job_media;
DROP POLICY IF EXISTS "Users can view job media in their org" ON job_media;
DROP POLICY IF EXISTS "Technicians can update their own assignments" ON job_assignments;
DROP POLICY IF EXISTS "Owners and coordinators can manage job assignments" ON job_assignments;
DROP POLICY IF EXISTS "Users can view job assignments in their org" ON job_assignments;
DROP POLICY IF EXISTS "Owners and coordinators can delete jobs" ON jobs;
DROP POLICY IF EXISTS "Technicians can update assigned jobs" ON jobs;
DROP POLICY IF EXISTS "Owners and coordinators can update jobs" ON jobs;
DROP POLICY IF EXISTS "Owners and coordinators can create jobs" ON jobs;
DROP POLICY IF EXISTS "Users can view jobs in their org" ON jobs;
DROP POLICY IF EXISTS "Owners and coordinators can manage assets" ON assets;
DROP POLICY IF EXISTS "Users can view assets in their org" ON assets;
DROP POLICY IF EXISTS "Owners and coordinators can manage sites" ON sites;
DROP POLICY IF EXISTS "Users can view sites in their org" ON sites;
DROP POLICY IF EXISTS "Owners and coordinators can manage clients" ON clients;
DROP POLICY IF EXISTS "Users can view clients in their org" ON clients;
DROP POLICY IF EXISTS "Owners can manage users in their org" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in their org" ON users;
DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;

COMMIT;
