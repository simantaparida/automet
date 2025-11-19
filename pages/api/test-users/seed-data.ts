import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { withOnboardedAuth } from '@/lib/auth-middleware';

/**
 * POST /api/test-users/seed-data
 * Create dummy data (clients, sites, assets, jobs, inventory) for the authenticated user's organization
 * 
 * ⚠️ This should only be used in development/testing environments!
 * This endpoint uses the authenticated user's organization, so data will be visible to that user.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Test data seeding is not allowed in production',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate the request to get the user's organization
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return; // Response already sent by middleware
  }

  const { user } = authResult;
  const orgId = user.org_id; // Use the authenticated user's organization

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Supabase Admin client not available. Check SUPABASE_SERVICE_ROLE_KEY in environment variables.',
    });
  }

  try {
    // Verify the organization exists
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, slug')
      .eq('id', orgId)
      .maybeSingle();

    if (orgError || !org) {
      return res.status(404).json({
        error: 'Organization not found',
        message: `Organization with ID ${orgId} not found. Please ensure you're logged in with a valid account.`,
      });
    }

    // Get test users for job assignments
    const { data: testUsers } = await supabaseAdmin
      .from('users')
      .select('id, role, email')
      .eq('org_id', orgId);

    const technicianId = testUsers?.find((u) => u.role === 'technician')?.id || null;

    const results = {
      clients: { created: 0, errors: [] as string[] },
      sites: { created: 0, errors: [] as string[] },
      assets: { created: 0, errors: [] as string[] },
      jobs: { created: 0, errors: [] as string[] },
      inventory: { created: 0, errors: [] as string[] },
    };

    // 1. Create Clients
    const clients = [
      {
        org_id: orgId,
        name: 'ABC Manufacturing Ltd',
        contact_email: 'contact@abcmfg.com',
        contact_phone: '+91-22-12345678',
        address: 'Plot 45, Industrial Area, Andheri East, Mumbai, Maharashtra 400069',
      },
      {
        org_id: orgId,
        name: 'XYZ Corporate Tower',
        contact_email: 'facilities@xyzcorp.in',
        contact_phone: '+91-80-87654321',
        address: 'MG Road, Bangalore, Karnataka 560001',
      },
      {
        org_id: orgId,
        name: 'Patel Hospital',
        contact_email: 'admin@patelhospital.org',
        contact_phone: '+91-79-11223344',
        address: 'SG Highway, Ahmedabad, Gujarat 380015',
      },
      {
        org_id: orgId,
        name: 'Tech Park Services',
        contact_email: 'maintenance@techpark.co.in',
        contact_phone: '+91-44-99887766',
        address: 'IT Park, Chennai, Tamil Nadu 600089',
      },
      {
        org_id: orgId,
        name: 'Delhi Mall Complex',
        contact_email: 'operations@delhimall.com',
        contact_phone: '+91-11-55443322',
        address: 'Connaught Place, New Delhi, Delhi 110001',
      },
    ];

    const clientIds: string[] = [];
    for (const client of clients) {
      try {
        const { data, error } = await supabaseAdmin
          .from('clients')
          .insert(client)
          .select('id')
          .single();

        if (error) {
          results.clients.errors.push(`${client.name}: ${error.message}`);
        } else if (data) {
          clientIds.push(data.id);
          results.clients.created++;
        }
      } catch (err: any) {
        results.clients.errors.push(`${client.name}: ${err.message || 'Unknown error'}`);
      }
    }

    // 2. Create Sites
    const sites = [
      { clientIndex: 0, name: 'Factory Building A', address: 'Plot 45, Industrial Area, Andheri East, Mumbai 400069' },
      { clientIndex: 0, name: 'Factory Building B', address: 'Plot 46, Industrial Area, Andheri East, Mumbai 400069' },
      { clientIndex: 0, name: 'Administrative Block', address: 'Plot 45, Industrial Area, Andheri East, Mumbai 400069' },
      { clientIndex: 1, name: 'Office Tower - Floors 1-5', address: 'MG Road, Bangalore 560001' },
      { clientIndex: 1, name: 'Office Tower - Floors 6-10', address: 'MG Road, Bangalore 560001' },
      { clientIndex: 2, name: 'Main Hospital Building', address: 'SG Highway, Ahmedabad 380015' },
      { clientIndex: 2, name: 'OPD Block', address: 'SG Highway, Ahmedabad 380015' },
      { clientIndex: 2, name: 'Emergency Wing', address: 'SG Highway, Ahmedabad 380015' },
      { clientIndex: 3, name: 'Tech Park Building 1', address: 'IT Park, Chennai 600089' },
      { clientIndex: 3, name: 'Tech Park Building 2', address: 'IT Park, Chennai 600089' },
      { clientIndex: 4, name: 'Main Mall Building', address: 'Connaught Place, New Delhi 110001' },
      { clientIndex: 4, name: 'Parking Complex', address: 'Connaught Place, New Delhi 110001' },
    ];

    const siteIds: string[] = [];
    for (const site of sites) {
      if (!clientIds[site.clientIndex]) continue;
      try {
        const { data, error } = await supabaseAdmin
          .from('sites')
          .insert({
            org_id: orgId,
            client_id: clientIds[site.clientIndex]!,
            name: site.name,
            address: site.address!,
          })
          .select('id')
          .single();

        if (error) {
          results.sites.errors.push(`${site.name}: ${error.message}`);
        } else if (data) {
          siteIds.push(data.id);
          results.sites.created++;
        }
      } catch (err: any) {
        results.sites.errors.push(`${site.name}: ${err.message || 'Unknown error'}`);
      }
    }

    // 3. Create Assets
    const assets = [
      { siteIndex: 0, asset_type: 'fire_extinguisher', model: 'ABC CO2-5KG', serial_number: 'FE2023-001' },
      { siteIndex: 0, asset_type: 'fire_extinguisher', model: 'ABC CO2-5KG', serial_number: 'FE2023-002' },
      { siteIndex: 0, asset_type: 'hvac', model: 'Daikin VRV-IV', serial_number: 'HVAC-2022-A1' },
      { siteIndex: 1, asset_type: 'fire_extinguisher', model: 'DCP-9KG', serial_number: 'FE2023-003' },
      { siteIndex: 1, asset_type: 'generator', model: 'Cummins 250KVA', serial_number: 'GEN-2021-B1' },
      { siteIndex: 3, asset_type: 'hvac', model: 'Carrier 30RB', serial_number: 'HVAC-2020-T1' },
      { siteIndex: 4, asset_type: 'hvac', model: 'Carrier 30RB', serial_number: 'HVAC-2020-T2' },
      { siteIndex: 5, asset_type: 'fire_extinguisher', model: 'CO2-4.5KG', serial_number: 'FE2023-H1' },
      { siteIndex: 5, asset_type: 'ups', model: 'APC Smart-UPS 10KVA', serial_number: 'UPS-2022-H1' },
      { siteIndex: 6, asset_type: 'generator', model: 'Kirloskar 500KVA', serial_number: 'GEN-2021-H1' },
      { siteIndex: 7, asset_type: 'fire_extinguisher', model: 'ABC CO2-5KG', serial_number: 'FE2023-H2' },
      { siteIndex: 8, asset_type: 'hvac', model: 'LG Multi-V', serial_number: 'HVAC-2023-TP1' },
      { siteIndex: 9, asset_type: 'ups', model: 'APC Smart-UPS 5KVA', serial_number: 'UPS-2023-TP1' },
      { siteIndex: 10, asset_type: 'hvac', model: 'Daikin VRV-IV', serial_number: 'HVAC-2021-M1' },
      { siteIndex: 11, asset_type: 'fire_extinguisher', model: 'DCP-9KG', serial_number: 'FE2023-P1' },
    ];

    const assetIds: string[] = [];
    for (const asset of assets) {
      if (!siteIds[asset.siteIndex]) continue;
      try {
        const { data, error } = await supabaseAdmin
          .from('assets')
          .insert({
            org_id: orgId,
            site_id: siteIds[asset.siteIndex]!,
            asset_type: asset.asset_type!,
            model: asset.model!,
            serial_number: asset.serial_number!,
          } as any)
          .select('id')
          .single();

        if (error) {
          results.assets.errors.push(`${asset.model}: ${error.message}`);
        } else if (data) {
          assetIds.push(data.id);
          results.assets.created++;
        }
      } catch (err: any) {
        results.assets.errors.push(`${asset.model}: ${err.message || 'Unknown error'}`);
      }
    }

    // 4. Create Jobs
    const now = new Date();
    const jobs = [
      {
        clientIndex: 0,
        siteIndex: 0,
        assetIndex: 0,
        title: 'Fire Extinguisher Annual Inspection - FE2023-001',
        description: 'Check pressure gauge, seal integrity, refill if needed',
        priority: 'high' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: true,
      },
      {
        clientIndex: 0,
        siteIndex: 0,
        assetIndex: 2,
        title: 'HVAC Quarterly Maintenance',
        description: 'Filter cleaning, refrigerant check, thermostat calibration',
        priority: 'medium' as const,
        status: 'in_progress' as const,
        scheduled_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: true,
      },
      {
        clientIndex: 1,
        siteIndex: 3,
        assetIndex: 5,
        title: 'HVAC Emergency Repair',
        description: 'Compressor failure - emergency replacement required',
        priority: 'urgent' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: false,
      },
      {
        clientIndex: 0,
        siteIndex: 1,
        assetIndex: 4,
        title: 'Generator Load Test',
        description: 'Quarterly load test and oil change',
        priority: 'high' as const,
        status: 'scheduled' as const,
        scheduled_at: now.toISOString(),
        assignTechnician: true,
      },
      {
        clientIndex: 2,
        siteIndex: 7,
        assetIndex: 9,
        title: 'Emergency Generator Inspection',
        description: 'Pre-monsoon check and battery replacement',
        priority: 'urgent' as const,
        status: 'scheduled' as const,
        scheduled_at: now.toISOString(),
        assignTechnician: false,
      },
      {
        clientIndex: 0,
        siteIndex: 0,
        assetIndex: 1,
        title: 'Fire Extinguisher Refill',
        description: 'Refill CO2 extinguisher',
        priority: 'medium' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: true,
      },
      {
        clientIndex: 1,
        siteIndex: 4,
        assetIndex: 6,
        title: 'HVAC Filter Replacement',
        description: 'Replace air filters',
        priority: 'low' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: false,
      },
      {
        clientIndex: 2,
        siteIndex: 5,
        assetIndex: 8,
        title: 'UPS Battery Check',
        description: 'Test battery backup duration',
        priority: 'medium' as const,
        status: 'completed' as const,
        scheduled_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: true,
      },
      {
        clientIndex: 0,
        siteIndex: 2,
        assetIndex: null,
        title: 'General Building Inspection',
        description: 'Monthly safety walkthrough',
        priority: 'low' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: false,
      },
      {
        clientIndex: 3,
        siteIndex: 8,
        assetIndex: 11,
        title: 'HVAC Installation Check',
        description: 'Verify new HVAC unit installation',
        priority: 'high' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: true,
      },
      {
        clientIndex: 4,
        siteIndex: 10,
        assetIndex: 14,
        title: 'Mall HVAC Maintenance',
        description: 'Monthly HVAC maintenance for mall complex',
        priority: 'medium' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: false,
      },
      {
        clientIndex: 4,
        siteIndex: 11,
        assetIndex: 15,
        title: 'Parking Fire Safety Audit',
        description: 'Quarterly fire safety equipment audit',
        priority: 'high' as const,
        status: 'scheduled' as const,
        scheduled_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        assignTechnician: true,
      },
    ];

    const jobIds: string[] = [];
    for (const job of jobs) {
      if (!clientIds[job.clientIndex] || !siteIds[job.siteIndex]) continue;
      try {
        const { data, error } = await supabaseAdmin
          .from('jobs')
          .insert({
            org_id: orgId,
            client_id: clientIds[job.clientIndex]!,
            site_id: siteIds[job.siteIndex]!,
            asset_id: job.assetIndex !== null && assetIds[job.assetIndex] ? assetIds[job.assetIndex] : null,
            title: job.title!,
            description: job.description!,
            priority: job.priority as any,
            status: job.status as any,
            scheduled_at: job.scheduled_at!,
            completed_at: job.completed_at || null,
          } as any)
          .select('id')
          .single();

        if (error) {
          results.jobs.errors.push(`${job.title}: ${error.message}`);
        } else if (data) {
          jobIds.push(data.id);
          results.jobs.created++;

          // Assign job to technician if requested and technician exists
          if (job.assignTechnician && technicianId) {
            await supabaseAdmin
              .from('job_assignments')
              .insert({
                job_id: data.id,
                user_id: technicianId!,
              } as any)
              .select();
          }
        }
      } catch (err: any) {
        results.jobs.errors.push(`${job.title}: ${err.message || 'Unknown error'}`);
      }
    }

    // 5. Create Inventory Items
    // Note: Using actual database schema fields: name, unit, quantity (not item_name, unit_of_measure, quantity_available)
    // Also: category and unit_cost don't exist in the schema
    const inventoryItems = [
      {
        org_id: orgId,
        name: 'Fire Extinguisher Refill - CO2 (5kg)',
        sku: 'FE-CO2-5KG',
        unit: 'kg',
        quantity: 50,
        reorder_level: 10,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'Fire Extinguisher Refill - DCP (9kg)',
        sku: 'FE-DCP-9KG',
        unit: 'kg',
        quantity: 35,
        reorder_level: 10,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'HVAC Air Filter (20x25x5)',
        sku: 'HVAC-FILTER-20X25',
        unit: 'piece',
        quantity: 25,
        reorder_level: 5,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'Generator Engine Oil (15W40) 5L',
        sku: 'GEN-OIL-15W40',
        unit: 'liter',
        quantity: 40,
        reorder_level: 10,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'UPS Battery 12V 100Ah',
        sku: 'UPS-BATT-12V100',
        unit: 'piece',
        quantity: 8,
        reorder_level: 2,
        is_serialized: true, // Serialized item
      },
      {
        org_id: orgId,
        name: 'Safety Gloves (Pair)',
        sku: 'SAFETY-GLOVES',
        unit: 'pair',
        quantity: 50,
        reorder_level: 10,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'Safety Goggles',
        sku: 'SAFETY-GOGGLES',
        unit: 'piece',
        quantity: 20,
        reorder_level: 5,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'Multimeter (Digital)',
        sku: 'TOOL-MULTIMETER',
        unit: 'piece',
        quantity: 5,
        reorder_level: 1,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'Refrigerant R410A (1kg)',
        sku: 'HVAC-REF-R410A',
        unit: 'kg',
        quantity: 15,
        reorder_level: 5,
        is_serialized: false,
      },
      {
        org_id: orgId,
        name: 'Generator Battery 12V 200Ah',
        sku: 'GEN-BATT-12V200',
        unit: 'piece',
        quantity: 6,
        reorder_level: 2,
        is_serialized: true, // Serialized item
      },
    ];

    for (const item of inventoryItems) {
      try {
        const { data, error } = await supabaseAdmin
          .from('inventory_items')
          .insert({
            org_id: item.org_id,
            item_name: item.name,
            category: 'General',
            sku: item.sku,
            unit_of_measure: item.unit,
            quantity_available: item.quantity,
            reorder_level: item.reorder_level,
          } as any)
          .select('id')
          .single();

        if (error) {
          results.inventory.errors.push(`${item.name}: ${error.message}`);
        } else if (data) {
          results.inventory.created++;
        }
      } catch (err: any) {
        results.inventory.errors.push(`${item.name}: ${err.message || 'Unknown error'}`);
      }
    }

    const totalCreated =
      results.clients.created +
      results.sites.created +
      results.assets.created +
      results.jobs.created +
      results.inventory.created;

    const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0);

    return res.status(200).json({
      success: true,
      message: `Created ${totalCreated} items. ${totalErrors} error(s).`,
      organizationId: orgId,
      organizationName: org.name,
      organizationSlug: org.slug,
      userEmail: user.email,
      results,
      summary: {
        clients: results.clients.created,
        sites: results.sites.created,
        assets: results.assets.created,
        jobs: results.jobs.created,
        inventory: results.inventory.created,
        total: totalCreated,
      },
    });
  } catch (error: any) {
    console.error('Error seeding test data:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to seed test data',
    });
  }
}

