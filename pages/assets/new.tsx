import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface Client {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
  client_id: string;
}

export default function NewAssetPage() {
  const router = useRouter();
  const { site_id } = router.query;
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    site_id: '',
    asset_type: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (site_id && typeof site_id === 'string') {
      setFormData(prev => ({ ...prev, site_id }));
      // Fetch the site to get client_id
      fetchSiteInfo(site_id);
    }
  }, [site_id]);

  useEffect(() => {
    if (formData.client_id) {
      fetchSites(formData.client_id);
    } else {
      setSites([]);
      if (!site_id) {
        setFormData(prev => ({ ...prev, site_id: '' }));
      }
    }
  }, [formData.client_id]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchSites = async (clientId: string) => {
    try {
      const response = await fetch(`/api/sites?client_id=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setSites(data);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchSiteInfo = async (siteId: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}`);
      if (response.ok) {
        const data = await response.json();
        const site = data.site;
        setFormData(prev => ({
          ...prev,
          client_id: site.client.id,
          site_id: siteId,
        }));
      }
    } catch (error) {
      console.error('Error fetching site info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: formData.site_id,
          asset_type: formData.asset_type,
          model: formData.model,
          serial_number: formData.serial_number || null,
          purchase_date: formData.purchase_date || null,
          warranty_expiry: formData.warranty_expiry || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        const asset = await response.json();
        router.push(`/assets/${asset.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create asset');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Error creating asset');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: '80px',
      }}>
        {/* Sticky Header */}
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => router.back()}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              ←
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              New Asset
            </h1>
          </div>
        </header>

        {/* Form */}
        <main style={{ padding: '1rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Client */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Client *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Site */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Site *
              </label>
              <select
                required
                value={formData.site_id}
                onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                disabled={!formData.client_id}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  backgroundColor: !formData.client_id ? '#f9fafb' : 'white',
                }}
              >
                <option value="">Select a site...</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            {/* Asset Type */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Asset Type *
              </label>
              <input
                type="text"
                required
                value={formData.asset_type}
                onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g., AC Unit, Elevator, Generator"
              />
            </div>

            {/* Model */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Model *
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g., Carrier 38MGRQ18M3"
              />
            </div>

            {/* Serial Number */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Serial Number (Optional)
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
                placeholder="S/N or ID"
              />
            </div>

            {/* Purchase Date */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Purchase Date (Optional)
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Warranty Expiry */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Warranty Expiry (Optional)
              </label>
              <input
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151',
              }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                placeholder="Additional information about the asset..."
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: saving ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  minHeight: '48px',
                }}
              >
                {saving ? 'Creating...' : 'Create Asset'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minHeight: '48px',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
