import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';

interface SeedResult {
  entity: string;
  count: number;
  errors: string[];
}

export default function SeedDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const seedData = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    const seedResults: SeedResult[] = [];

    try {
      // Define dummy data
      const clients = [
        {
          name: 'ABC Manufacturing Ltd',
          contact_email: 'contact@abcmfg.com',
          contact_phone: '+91-22-12345678',
          address: 'Plot 45, Industrial Area, Andheri East, Mumbai, Maharashtra 400069',
        },
        {
          name: 'XYZ Corporate Tower',
          contact_email: 'facilities@xyzcorp.in',
          contact_phone: '+91-80-87654321',
          address: 'MG Road, Bangalore, Karnataka 560001',
        },
        {
          name: 'Patel Hospital',
          contact_email: 'admin@patelhospital.org',
          contact_phone: '+91-79-11223344',
          address: 'SG Highway, Ahmedabad, Gujarat 380015',
        },
      ];

      const clientIds: string[] = [];
      let clientErrors: string[] = [];

      // Create clients
      for (const client of clients) {
        try {
          const response = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client),
          });
          if (response.ok) {
            const data = await response.json();
            clientIds.push(data.id);
          } else {
            const errorData = await response.json();
            clientErrors.push(`${client.name}: ${errorData.error || 'Failed'}`);
          }
        } catch (err) {
          clientErrors.push(`${client.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      seedResults.push({
        entity: 'Clients',
        count: clientIds.length,
        errors: clientErrors,
      });

      // Create sites for each client
      const sites = [
        { clientIndex: 0, name: 'Factory Building A', address: 'Plot 45, Industrial Area, Andheri East, Mumbai 400069' },
        { clientIndex: 0, name: 'Factory Building B', address: 'Plot 46, Industrial Area, Andheri East, Mumbai 400069' },
        { clientIndex: 0, name: 'Administrative Block', address: 'Plot 45, Industrial Area, Andheri East, Mumbai 400069' },
        { clientIndex: 1, name: 'Office Tower - Floors 1-5', address: 'MG Road, Bangalore 560001' },
        { clientIndex: 1, name: 'Office Tower - Floors 6-10', address: 'MG Road, Bangalore 560001' },
        { clientIndex: 2, name: 'Main Hospital Building', address: 'SG Highway, Ahmedabad 380015' },
        { clientIndex: 2, name: 'OPD Block', address: 'SG Highway, Ahmedabad 380015' },
        { clientIndex: 2, name: 'Emergency Wing', address: 'SG Highway, Ahmedabad 380015' },
      ];

      const siteIds: string[] = [];
      let siteErrors: string[] = [];

      for (const site of sites) {
        if (!clientIds[site.clientIndex]) continue;
        try {
          const response = await fetch('/api/sites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: clientIds[site.clientIndex],
              name: site.name,
              address: site.address,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            siteIds.push(data.id);
          } else {
            const errorData = await response.json();
            siteErrors.push(`${site.name}: ${errorData.error || 'Failed'}`);
          }
        } catch (err) {
          siteErrors.push(`${site.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      seedResults.push({
        entity: 'Sites',
        count: siteIds.length,
        errors: siteErrors,
      });

      // Create assets for each site
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
        { siteIndex: 7, asset_type: 'generator', model: 'Kirloskar 500KVA', serial_number: 'GEN-2021-H1' },
      ];

      const assetIds: string[] = [];
      let assetErrors: string[] = [];

      for (const asset of assets) {
        if (!siteIds[asset.siteIndex]) continue;
        try {
          const response = await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              site_id: siteIds[asset.siteIndex],
              asset_type: asset.asset_type,
              model: asset.model,
              serial_number: asset.serial_number,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            assetIds.push(data.id);
          } else {
            const errorData = await response.json();
            assetErrors.push(`${asset.model}: ${errorData.error || 'Failed'}`);
          }
        } catch (err) {
          assetErrors.push(`${asset.model}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      seedResults.push({
        entity: 'Assets',
        count: assetIds.length,
        errors: assetErrors,
      });

        // Create jobs with various priorities and dates
        const now = new Date();
        const jobs = [
          {
            clientIndex: 0,
            siteIndex: 0,
            assetIndex: 0,
            title: 'Fire Extinguisher Annual Inspection - FE2023-001',
            description: 'Check pressure gauge, seal integrity, refill if needed',
            priority: 'high',
            scheduled_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            clientIndex: 0,
            siteIndex: 0,
            assetIndex: 2,
            title: 'HVAC Quarterly Maintenance',
            description: 'Filter cleaning, refrigerant check, thermostat calibration',
            priority: 'medium',
            scheduled_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            clientIndex: 1,
            siteIndex: 3,
            assetIndex: 5,
            title: 'HVAC Emergency Repair',
            description: 'Compressor failure - emergency replacement required',
            priority: 'urgent',
            scheduled_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            clientIndex: 0,
            siteIndex: 1,
            assetIndex: 4,
            title: 'Generator Load Test',
            description: 'Quarterly load test and oil change',
            priority: 'high',
            scheduled_at: now.toISOString(),
          },
          {
            clientIndex: 2,
            siteIndex: 7,
            assetIndex: 9,
            title: 'Emergency Generator Inspection',
            description: 'Pre-monsoon check and battery replacement',
            priority: 'urgent',
            scheduled_at: now.toISOString(),
          },
          {
            clientIndex: 0,
            siteIndex: 0,
            assetIndex: 1,
            title: 'Fire Extinguisher Refill',
            description: 'Refill CO2 extinguisher',
            priority: 'medium',
            scheduled_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            clientIndex: 1,
            siteIndex: 4,
            assetIndex: 6,
            title: 'HVAC Filter Replacement',
            description: 'Replace air filters',
            priority: 'low',
            scheduled_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            clientIndex: 2,
            siteIndex: 5,
            assetIndex: 8,
            title: 'UPS Battery Check',
            description: 'Test battery backup duration',
            priority: 'medium',
            scheduled_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            clientIndex: 0,
            siteIndex: 2,
            assetIndex: null,
            title: 'General Building Inspection',
            description: 'Monthly safety walkthrough',
            priority: 'low',
            scheduled_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

      const jobIds: string[] = [];
      let jobErrors: string[] = [];

      for (const job of jobs) {
        if (!clientIds[job.clientIndex] || !siteIds[job.siteIndex]) continue;
        try {
            const response = await fetch('/api/jobs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_id: clientIds[job.clientIndex],
                site_id: siteIds[job.siteIndex],
                asset_id: job.assetIndex !== null && assetIds[job.assetIndex] ? assetIds[job.assetIndex] : null,
                title: job.title,
                description: job.description,
                priority: job.priority,
                scheduled_at: job.scheduled_at,
              }),
            });
            if (response.ok) {
              const data = await response.json();
              jobIds.push(data.job?.id || data.id);
            } else {
              const errorData = await response.json();
              jobErrors.push(`${job.title}: ${errorData.error || 'Failed'}`);
            }
        } catch (err) {
          jobErrors.push(`${job.title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      seedResults.push({
        entity: 'Jobs',
        count: jobIds.length,
        errors: jobErrors,
      });

      // Create inventory items
      const inventoryItems = [
        { item_name: 'Fire Extinguisher Refill - CO2 (5kg)', category: 'Fire Safety', sku: 'FE-CO2-5KG', unit_of_measure: 'kg', quantity_available: 50, reorder_level: 10, unit_cost: 150 },
        { item_name: 'Fire Extinguisher Refill - DCP (9kg)', category: 'Fire Safety', sku: 'FE-DCP-9KG', unit_of_measure: 'kg', quantity_available: 35, reorder_level: 10, unit_cost: 200 },
        { item_name: 'HVAC Air Filter (20x25x5)', category: 'HVAC', sku: 'HVAC-FILTER-20X25', unit_of_measure: 'piece', quantity_available: 25, reorder_level: 5, unit_cost: 500 },
        { item_name: 'Generator Engine Oil (15W40) 5L', category: 'Generator', sku: 'GEN-OIL-15W40', unit_of_measure: 'liter', quantity_available: 40, reorder_level: 10, unit_cost: 800 },
        { item_name: 'UPS Battery 12V 100Ah', category: 'UPS', sku: 'UPS-BATT-12V100', unit_of_measure: 'piece', quantity_available: 8, reorder_level: 2, unit_cost: 3500 },
        { item_name: 'Safety Gloves (Pair)', category: 'Safety Equipment', sku: 'SAFETY-GLOVES', unit_of_measure: 'pair', quantity_available: 50, reorder_level: 10, unit_cost: 100 },
        { item_name: 'Safety Goggles', category: 'Safety Equipment', sku: 'SAFETY-GOGGLES', unit_of_measure: 'piece', quantity_available: 20, reorder_level: 5, unit_cost: 250 },
        { item_name: 'Multimeter (Digital)', category: 'Tools', sku: 'TOOL-MULTIMETER', unit_of_measure: 'piece', quantity_available: 5, reorder_level: 1, unit_cost: 1500 },
      ];

      const inventoryIds: string[] = [];
      let inventoryErrors: string[] = [];

      for (const item of inventoryItems) {
        try {
          const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
          if (response.ok) {
            const data = await response.json();
            inventoryIds.push(data.id);
          } else {
            const errorData = await response.json();
            inventoryErrors.push(`${item.item_name}: ${errorData.error || 'Failed'}`);
          }
        } catch (err) {
          inventoryErrors.push(`${item.item_name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      seedResults.push({
        entity: 'Inventory Items',
        count: inventoryIds.length,
        errors: inventoryErrors,
      });

      setResults(seedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>
            Seed Dummy Data
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            This page will create dummy data for testing. It will create:
            <br />• 3 Clients
            <br />• 8 Sites
            <br />• 10 Assets
            <br />• 9 Jobs (with various priorities - you can change statuses manually)
            <br />• 8 Inventory Items
          </p>

          {error && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#991b1b',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={seedData}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#9ca3af' : '#EF7722',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '2rem',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ff8833';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#EF7722';
              }
            }}
          >
            {loading ? 'Seeding...' : 'Seed Data'}
          </button>

          {results.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
                Results
              </h2>
              {results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{result.entity}</span>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: result.count > 0 ? '#d1fae5' : '#fee2e2',
                        color: result.count > 0 ? '#065f46' : '#991b1b',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}
                    >
                      {result.count} created
                    </span>
                  </div>
                  {result.errors.length > 0 && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: '600' }}>Errors:</span>
                      <ul style={{ marginTop: '0.25rem', paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#991b1b' }}>
                        {result.errors.map((err, errIndex) => (
                          <li key={errIndex}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px' }}>
                <p style={{ color: '#1e40af', margin: 0, fontWeight: '600' }}>
                  ✓ Data seeding complete! You can now navigate to:
                </p>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#1e40af' }}>
                  <li><a href="/jobs" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Jobs</a> - See jobs with different statuses</li>
                  <li><a href="/clients" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Clients</a> - View all clients</li>
                  <li><a href="/sites" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Sites</a> - Browse sites</li>
                  <li><a href="/assets" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Assets</a> - View assets</li>
                  <li><a href="/inventory" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Inventory</a> - Check inventory items</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

