import { useEffect, useState } from 'react';
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

interface Asset {
  id: string;
  asset_type: string;
  model: string;
  serial_number: string;
  site_id: string;
}

export default function NewJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    site_id: '',
    asset_id: '',
    priority: 'medium',
    scheduled_date: '',
    scheduled_time: '',
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.client_id) {
      fetchSites(formData.client_id);
    } else {
      setSites([]);
      setFormData((prev) => ({ ...prev, site_id: '', asset_id: '' }));
    }
  }, [formData.client_id]);

  useEffect(() => {
    if (formData.site_id) {
      fetchAssets(formData.site_id);
    } else {
      setAssets([]);
      setFormData((prev) => ({ ...prev, asset_id: '' }));
    }
  }, [formData.site_id]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchSites = async (clientId: string) => {
    try {
      const response = await fetch(`/api/sites?client_id=${clientId}`);
      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchAssets = async (siteId: string) => {
    try {
      const response = await fetch(`/api/assets?site_id=${siteId}`);
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine date and time
      const scheduledAt = new Date(
        `${formData.scheduled_date}T${formData.scheduled_time}`
      ).toISOString();

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          client_id: formData.client_id,
          site_id: formData.site_id,
          asset_id: formData.asset_id || null,
          priority: formData.priority,
          scheduled_at: scheduledAt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/jobs/${data.job.id}`);
      } else {
        setError(data.error || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          paddingBottom: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Mobile Header */}
        <header
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/jobs')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              ←
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              Create New Job
            </h1>
          </div>
        </header>

        {/* Form */}
        <main style={{ padding: '1rem' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Job Title */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., HVAC Maintenance"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Job details..."
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Client */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Client *
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  minHeight: '48px',
                }}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Site */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Site *
              </label>
              <select
                name="site_id"
                value={formData.site_id}
                onChange={handleChange}
                required
                disabled={!formData.client_id}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: formData.client_id ? 'white' : '#f3f4f6',
                  minHeight: '48px',
                  opacity: formData.client_id ? 1 : 0.6,
                }}
              >
                <option value="">
                  {formData.client_id
                    ? 'Select a site'
                    : 'Select a client first'}
                </option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset (Optional) */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Asset (Optional)
              </label>
              <select
                name="asset_id"
                value={formData.asset_id}
                onChange={handleChange}
                disabled={!formData.site_id}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: formData.site_id ? 'white' : '#f3f4f6',
                  minHeight: '48px',
                  opacity: formData.site_id ? 1 : 0.6,
                }}
              >
                <option value="">
                  {formData.site_id
                    ? 'No specific asset'
                    : 'Select a site first'}
                </option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_type.replace('_', ' ')} - {asset.model} (
                    {asset.serial_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Priority *
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                }}
              >
                {[
                  { value: 'low', label: '🟢 Low', color: '#6b7280' },
                  { value: 'medium', label: '🟡 Medium', color: '#3b82f6' },
                  { value: 'high', label: '🟠 High', color: '#f59e0b' },
                  { value: 'urgent', label: '🔴 Urgent', color: '#ef4444' },
                ].map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, priority: priority.value })
                    }
                    style={{
                      padding: '0.875rem',
                      backgroundColor:
                        formData.priority === priority.value
                          ? `${priority.color}15`
                          : 'white',
                      color:
                        formData.priority === priority.value
                          ? priority.color
                          : '#6b7280',
                      border:
                        formData.priority === priority.value
                          ? `2px solid ${priority.color}`
                          : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight:
                        formData.priority === priority.value ? '600' : '500',
                      cursor: 'pointer',
                      minHeight: '48px',
                    }}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Date */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Schedule Date *
              </label>
              <input
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                min={minDate}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                }}
              />
            </div>

            {/* Schedule Time */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Schedule Time *
              </label>
              <input
                type="time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                }}
              />
            </div>

            {/* Submit Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '1rem',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  minHeight: '52px',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Creating Job...' : '✅ Create Job'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/jobs')}
                disabled={loading}
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  minHeight: '52px',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>

        <BottomNav activeTab="jobs" />
      </div>
    </ProtectedRoute>
  );
}
