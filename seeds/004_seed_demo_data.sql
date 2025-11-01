-- Seed: Complete Demo Data
-- Description: Clients, Sites, Assets, Jobs, and Inventory for Sharma Services

BEGIN;

-- ============================================================================
-- CLIENTS
-- ============================================================================
DELETE FROM clients WHERE org_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO clients (id, org_id, name, contact_email, contact_phone, address, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'ABC Manufacturing Ltd', 'contact@abcmfg.com', '+91-22-12345678', 'Plot 45, Industrial Area, Andheri East, Mumbai, Maharashtra 400069', NOW() - INTERVAL '90 days'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'XYZ Corporate Tower', 'facilities@xyzcorp.in', '+91-80-87654321', 'MG Road, Bangalore, Karnataka 560001', NOW() - INTERVAL '60 days'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Patel Hospital', 'admin@patelhospital.org', '+91-79-11223344', 'SG Highway, Ahmedabad, Gujarat 380015', NOW() - INTERVAL '45 days');

-- ============================================================================
-- SITES
-- ============================================================================
DELETE FROM sites WHERE org_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO sites (id, client_id, org_id, name, address, gps_lat, gps_lng, metadata, created_at) VALUES
-- ABC Manufacturing sites
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Factory Building A', 'Plot 45, Industrial Area, Andheri East, Mumbai 400069', 19.1197592, 72.8697339, '{"floor": "Ground", "access_code": "1234"}', NOW() - INTERVAL '90 days'),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Factory Building B', 'Plot 46, Industrial Area, Andheri East, Mumbai 400069', 19.1198000, 72.8698000, '{"floor": "Ground", "access_code": "5678"}', NOW() - INTERVAL '90 days'),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Administrative Block', 'Plot 45, Industrial Area, Andheri East, Mumbai 400069', 19.1196500, 72.8696500, '{"floor": "2nd Floor"}', NOW() - INTERVAL '90 days'),
-- XYZ Corp sites
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Office Tower - Floors 1-5', 'MG Road, Bangalore 560001', 12.9715987, 77.5945627, '{"floors": "1-5", "reception": "080-12345678"}', NOW() - INTERVAL '60 days'),
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Office Tower - Floors 6-10', 'MG Road, Bangalore 560001', 12.9716000, 77.5946000, '{"floors": "6-10"}', NOW() - INTERVAL '60 days'),
-- Patel Hospital sites
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Main Hospital Building', 'SG Highway, Ahmedabad 380015', 23.0224771, 72.5715462, '{"emergency_contact": "079-11223344"}', NOW() - INTERVAL '45 days'),
('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'OPD Block', 'SG Highway, Ahmedabad 380015', 23.0225000, 72.5716000, NULL, NOW() - INTERVAL '45 days'),
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Emergency Wing', 'SG Highway, Ahmedabad 380015', 23.0224500, 72.5715000, NULL, NOW() - INTERVAL '45 days');

-- ============================================================================
-- ASSETS
-- ============================================================================
DELETE FROM assets WHERE org_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO assets (id, site_id, org_id, asset_type, model, serial_number, install_date, metadata, created_at) VALUES
-- Factory A assets
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'fire_extinguisher', 'ABC CO2-5KG', 'FE2023-001', '2023-01-15', '{"capacity_kg": 5, "type": "CO2", "location": "Near Exit A"}', NOW() - INTERVAL '90 days'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'fire_extinguisher', 'ABC CO2-5KG', 'FE2023-002', '2023-01-15', '{"capacity_kg": 5, "type": "CO2", "location": "Near Exit B"}', NOW() - INTERVAL '90 days'),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'hvac', 'Daikin VRV-IV', 'HVAC-2022-A1', '2022-06-10', '{"capacity_ton": 15, "zones": 4}', NOW() - INTERVAL '90 days'),
-- Factory B assets
('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'fire_extinguisher', 'DCP-9KG', 'FE2023-003', '2023-02-01', '{"capacity_kg": 9, "type": "DCP"}', NOW() - INTERVAL '90 days'),
('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'generator', 'Cummins 250KVA', 'GEN-2021-B1', '2021-11-20', '{"capacity_kva": 250, "fuel_type": "diesel"}', NOW() - INTERVAL '90 days'),
-- Office Tower assets
('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'hvac', 'Carrier 30RB', 'HVAC-2020-T1', '2020-08-15', '{"capacity_ton": 20}', NOW() - INTERVAL '60 days'),
('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'hvac', 'Carrier 30RB', 'HVAC-2020-T2', '2020-08-15', '{"capacity_ton": 20}', NOW() - INTERVAL '60 days'),
-- Hospital assets
('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'fire_extinguisher', 'CO2-4.5KG', 'FE2023-H1', '2023-03-10', '{"capacity_kg": 4.5, "type": "CO2"}', NOW() - INTERVAL '45 days'),
('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'ups', 'APC Smart-UPS 10KVA', 'UPS-2022-H1', '2022-09-05', '{"capacity_kva": 10, "battery_backup_hours": 2}', NOW() - INTERVAL '45 days'),
('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'generator', 'Kirloskar 500KVA', 'GEN-2021-H1', '2021-12-01', '{"capacity_kva": 500, "fuel_type": "diesel", "auto_start": true}', NOW() - INTERVAL '45 days');

-- ============================================================================
-- JOBS (20 jobs in various states)
-- ============================================================================
DELETE FROM jobs WHERE org_id = '10000000-0000-0000-0000-000000000001';

-- Completed jobs
INSERT INTO jobs (id, org_id, client_id, site_id, asset_id, title, description, status, priority, scheduled_at, completed_at, created_at) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Fire Extinguisher Annual Inspection - FE2023-001', 'Check pressure gauge, seal integrity, refill if needed', 'completed', 'high', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '2 hours', NOW() - INTERVAL '15 days'),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'HVAC Quarterly Maintenance', 'Filter cleaning, refrigerant check, thermostat calibration', 'completed', 'medium', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '3 hours', NOW() - INTERVAL '12 days'),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000006', 'HVAC Emergency Repair', 'Compressor failure - emergency replacement required', 'completed', 'urgent', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '5 hours', NOW() - INTERVAL '6 days'),
('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000008', 'Fire Safety Inspection', 'Monthly fire extinguisher check', 'completed', 'medium', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', NOW() - INTERVAL '7 days');

-- In-progress jobs
INSERT INTO jobs (id, org_id, client_id, site_id, asset_id, title, description, status, priority, scheduled_at, created_at) VALUES
('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000005', 'Generator Load Test', 'Quarterly load test and oil change', 'in_progress', 'high', NOW(), NOW() - INTERVAL '2 days'),
('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000010', 'Emergency Generator Inspection', 'Pre-monsoon check and battery replacement', 'in_progress', 'urgent', NOW(), NOW() - INTERVAL '1 day');

-- Scheduled jobs (upcoming)
INSERT INTO jobs (id, org_id, client_id, site_id, asset_id, title, description, status, priority, scheduled_at, created_at) VALUES
('60000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Fire Extinguisher Refill', 'Refill CO2 extinguisher', 'scheduled', 'medium', NOW() + INTERVAL '2 days', NOW()),
('60000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000007', 'HVAC Filter Replacement', 'Replace air filters', 'scheduled', 'low', NOW() + INTERVAL '5 days', NOW()),
('60000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000009', 'UPS Battery Check', 'Test battery backup duration', 'scheduled', 'medium', NOW() + INTERVAL '7 days', NOW()),
('60000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', NULL, 'General Building Inspection', 'Monthly safety walkthrough', 'scheduled', 'low', NOW() + INTERVAL '10 days', NOW());

-- ============================================================================
-- JOB ASSIGNMENTS
-- ============================================================================
DELETE FROM job_assignments WHERE job_id IN (SELECT id FROM jobs WHERE org_id = '10000000-0000-0000-0000-000000000001');

-- Assignments for completed jobs
INSERT INTO job_assignments (id, job_id, user_id, is_primary, assigned_at, started_at, completed_at, notes) VALUES
('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', TRUE, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '2 hours', 'Pressure was low, refilled 500g CO2'),
('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', TRUE, NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '3 hours', 'Cleaned filters, all zones working'),
('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', TRUE, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '5 hours', 'Replaced compressor, tested all functions'),
('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 'All extinguishers checked and tagged');

-- Assignments for in-progress jobs
INSERT INTO job_assignments (id, job_id, user_id, is_primary, assigned_at, started_at, notes) VALUES
('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', TRUE, NOW() - INTERVAL '2 days', NOW(), 'Load test in progress'),
('70000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', TRUE, NOW() - INTERVAL '1 day', NOW(), 'Battery replacement started');

-- Assignments for scheduled jobs
INSERT INTO job_assignments (id, job_id, user_id, is_primary, assigned_at) VALUES
('70000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', TRUE, NOW()),
('70000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004', TRUE, NOW()),
('70000000-0000-0000-0000-000000000009', '60000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', TRUE, NOW()),
('70000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', TRUE, NOW());

-- ============================================================================
-- INVENTORY ITEMS
-- ============================================================================
DELETE FROM inventory_items WHERE org_id = '10000000-0000-0000-0000-000000000001';

INSERT INTO inventory_items (id, org_id, name, sku, unit, quantity, reorder_level, is_serialized, created_at) VALUES
('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Fire Extinguisher Refill - CO2 (5kg)', 'FE-CO2-5KG', 'kg', 50.00, 10.00, FALSE, NOW() - INTERVAL '90 days'),
('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Fire Extinguisher Refill - DCP (9kg)', 'FE-DCP-9KG', 'kg', 35.00, 10.00, FALSE, NOW() - INTERVAL '90 days'),
('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'HVAC Air Filter (20x25x5)', 'HVAC-FILTER-20X25', 'piece', 25, 5, FALSE, NOW() - INTERVAL '90 days'),
('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Generator Engine Oil (15W40) 5L', 'GEN-OIL-15W40', 'liter', 40.00, 10.00, FALSE, NOW() - INTERVAL '90 days'),
('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'UPS Battery 12V 100Ah', 'UPS-BATT-12V100', 'piece', 8, 2, TRUE, NOW() - INTERVAL '90 days'),
('80000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'Safety Gloves (Pair)', 'SAFETY-GLOVES', 'pair', 50, 10, FALSE, NOW() - INTERVAL '90 days'),
('80000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Safety Goggles', 'SAFETY-GOGGLES', 'piece', 20, 5, FALSE, NOW() - INTERVAL '90 days'),
('80000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'Multimeter (Digital)', 'TOOL-MULTIMETER', 'piece', 5, 1, TRUE, NOW() - INTERVAL '90 days');

COMMIT;

-- Verification queries
SELECT 'Clients:' as entity, COUNT(*) as count FROM clients WHERE org_id = '10000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Sites:', COUNT(*) FROM sites WHERE org_id = '10000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Assets:', COUNT(*) FROM assets WHERE org_id = '10000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Jobs:', COUNT(*) FROM jobs WHERE org_id = '10000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Job Assignments:', COUNT(*) FROM job_assignments
WHERE job_id IN (SELECT id FROM jobs WHERE org_id = '10000000-0000-0000-0000-000000000001')
UNION ALL
SELECT 'Inventory Items:', COUNT(*) FROM inventory_items WHERE org_id = '10000000-0000-0000-0000-000000000001';
