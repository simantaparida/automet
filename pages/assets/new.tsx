import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import {
  ArrowLeft,
  Package,
  Building2,
  MapPin,
  FileText,
  Save,
  Calendar,
  Shield,
  Hash,
} from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
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
      setFormData((prev) => ({ ...prev, site_id }));
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
        setFormData((prev) => ({ ...prev, site_id: '' }));
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
        setFormData((prev) => ({
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
    setError(null);

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
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create asset');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      setError('Error creating asset. Please try again.');
    } finally {
      setSaving(false);
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

  return (
    <ProtectedRoute>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .asset-form-container {
          padding-bottom: 80px;
        }
        .main-content {
          padding: 1rem;
        }
        .mobile-header {
          display: block;
        }
        @media (min-width: 768px) {
          .asset-form-container {
            margin-left: 260px;
            padding-bottom: 0;
          }
          .main-content {
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
          }
          .mobile-header {
            display: none;
          }
        }
      `}</style>

      <div
        className="asset-form-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="more" />

        {/* Mobile Header */}
        <header
          className="mobile-header"
          style={{
            background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
            color: 'white',
            padding: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            boxShadow: '0 2px 10px rgba(239,119,34,0.2)',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <button
              onClick={() => router.back()}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
              New Asset
            </h1>
          </div>
        </header>

        {/* Form */}
        <main className="main-content">
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            {/* Header Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(239,119,34,0.2)',
                }}
              >
                <Package size={24} color="#EF7722" />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  Create New Asset
                </h1>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0',
                  }}
                >
                  Add a new asset to track at a site
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Client */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Building2 size={16} color="#6b7280" />
                  Client *
                </label>
                <select
                  name="client_id"
                  required
                  value={formData.client_id}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EF7722';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Site */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <MapPin size={16} color="#6b7280" />
                  Site *
                </label>
                <select
                  name="site_id"
                  required
                  value={formData.site_id}
                  onChange={handleChange}
                  disabled={!formData.client_id}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    backgroundColor: !formData.client_id ? '#f9fafb' : 'white',
                    cursor: formData.client_id ? 'pointer' : 'not-allowed',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                    opacity: formData.client_id ? 1 : 0.6,
                  }}
                  onFocus={(e) => {
                    if (formData.client_id) {
                      e.target.style.borderColor = '#EF7722';
                      e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">
                    {formData.client_id ? 'Select a site...' : 'Select a client first'}
                  </option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Type */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Package size={16} color="#6b7280" />
                  Asset Type *
                </label>
                <input
                  type="text"
                  name="asset_type"
                  required
                  value={formData.asset_type}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EF7722';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="e.g., AC Unit, Elevator, Generator"
                />
              </div>

              {/* Model */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Package size={16} color="#6b7280" />
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EF7722';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="e.g., Carrier 38MGRQ18M3"
                />
              </div>

              {/* Serial Number */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Hash size={16} color="#6b7280" />
                  Serial Number (Optional)
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EF7722';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="S/N or ID"
                />
              </div>

              {/* Purchase Date & Warranty Expiry */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                {/* Purchase Date */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    <Calendar size={16} color="#6b7280" />
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      minHeight: '48px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#EF7722';
                      e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Warranty Expiry */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    <Shield size={16} color="#6b7280" />
                    Warranty Expiry
                  </label>
                  <input
                    type="date"
                    name="warranty_expiry"
                    value={formData.warranty_expiry}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      minHeight: '48px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#EF7722';
                      e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <FileText size={16} color="#6b7280" />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EF7722';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Additional information about the asset..."
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: saving
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.2s',
                    boxShadow: saving
                      ? 'none'
                      : '0 2px 8px rgba(239,119,34,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Create Asset</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#EF7722';
                    e.currentTarget.style.color = '#EF7722';
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(239,119,34,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </main>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
