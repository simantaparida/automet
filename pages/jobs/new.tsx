import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import {
  ArrowLeft,
  ClipboardList,
  Building2,
  MapPin,
  Package,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Save,
  Circle,
  AlertTriangle,
  CheckCircle2,
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
      if (response.ok) {
        const data = await response.json();
        // API returns array directly
        setClients(Array.isArray(data) ? data : []);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchSites = async (clientId: string) => {
    try {
      const response = await fetch(`/api/sites?client_id=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        // API returns array directly
        setSites(Array.isArray(data) ? data : []);
      } else {
        setSites([]);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    }
  };

  const fetchAssets = async (siteId: string) => {
    try {
      const response = await fetch(`/api/assets?site_id=${siteId}`);
      if (response.ok) {
        const data = await response.json();
        // API might return { assets: [...] } or array directly
        const assetsList = Array.isArray(data) ? data : data?.assets || [];
        setAssets(Array.isArray(assetsList) ? assetsList : []);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets([]);
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
      setError('Error creating job. Please try again.');
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

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'low':
        return { icon: Circle, color: '#10b981', bg: '#d1fae5', label: 'Low' };
      case 'medium':
        return {
          icon: AlertCircle,
          color: '#f59e0b',
          bg: '#fef3c7',
          label: 'Medium',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          color: '#ef4444',
          bg: '#fee2e2',
          label: 'High',
        };
      case 'urgent':
        return {
          icon: CheckCircle2,
          color: '#dc2626',
          bg: '#fecaca',
          label: 'Urgent',
        };
      default:
        return {
          icon: Circle,
          color: '#6b7280',
          bg: '#f3f4f6',
          label: 'Low',
        };
    }
  };

  return (
    <ProtectedRoute>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .job-form-container {
          padding-bottom: 80px;
        }
        .main-content {
          padding: 1rem;
        }
        .mobile-header {
          display: block;
        }
        .desktop-header {
          display: none;
        }
        @media (min-width: 768px) {
          .job-form-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content {
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
          }
          .mobile-header {
            display: none;
          }
          .desktop-header {
            display: block;
          }
        }
      `}</style>

      <div
        className="job-form-container"
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="jobs" />

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

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
              onClick={() => router.push('/jobs')}
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
              Create New Job
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
                  background:
                    'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(239,119,34,0.2)',
                }}
              >
                <ClipboardList size={24} color="#EF7722" />
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
                  Create New Job
                </h1>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0',
                  }}
                >
                  Schedule a new field service job
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
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Job Title */}
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
                  <ClipboardList size={16} color="#6b7280" />
                  Job Title <span style={{ color: '#ef4444' }}>*</span>
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

              {/* Description */}
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
                  <FileText size={16} color="#6b7280" />
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
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
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
                  Client <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    minHeight: '48px',
                    boxSizing: 'border-box',
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
                  <option value="">Select a client</option>
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
                  Site <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="site_id"
                  value={formData.site_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.client_id}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: formData.client_id ? 'white' : '#f9fafb',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    cursor: formData.client_id ? 'pointer' : 'not-allowed',
                    opacity: formData.client_id ? 1 : 0.6,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    if (formData.client_id) {
                      e.target.style.borderColor = '#EF7722';
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(239,119,34,0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
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
                  Asset (Optional)
                </label>
                <select
                  name="asset_id"
                  value={formData.asset_id}
                  onChange={handleChange}
                  disabled={!formData.site_id}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: formData.site_id ? 'white' : '#f9fafb',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    cursor: formData.site_id ? 'pointer' : 'not-allowed',
                    opacity: formData.site_id ? 1 : 0.6,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    if (formData.site_id) {
                      e.target.style.borderColor = '#EF7722';
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(239,119,34,0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
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
                  <AlertCircle size={16} color="#6b7280" />
                  Priority <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                  }}
                >
                  {[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ].map((priority) => {
                    const config = getPriorityConfig(priority.value);
                    const PriorityIcon = config.icon;
                    const isSelected = formData.priority === priority.value;

                    return (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, priority: priority.value })
                        }
                        style={{
                          padding: '0.75rem',
                          backgroundColor: isSelected ? config.bg : 'white',
                          color: isSelected ? config.color : '#6b7280',
                          border: isSelected
                            ? `2px solid ${config.color}`
                            : '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? '600' : '500',
                          cursor: 'pointer',
                          minHeight: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = config.color;
                            e.currentTarget.style.backgroundColor = `${config.bg}80`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <PriorityIcon size={16} />
                        {priority.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Date & Time */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Schedule Date */}
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
                    Date <span style={{ color: '#ef4444' }}>*</span>
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
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(239,119,34,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Schedule Time */}
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
                    <Clock size={16} color="#6b7280" />
                    Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    required
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
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(239,119,34,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
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
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: loading
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.2s',
                    boxShadow: loading
                      ? 'none'
                      : '0 2px 8px rgba(239,119,34,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(239,119,34,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(239,119,34,0.25)';
                    }
                  }}
                >
                  {loading ? (
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
                      <span>Create Job</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/jobs')}
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
                    e.currentTarget.style.boxShadow =
                      '0 0 0 1px rgba(239,119,34,0.2)';
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

        <BottomNav activeTab="jobs" />
      </div>
    </ProtectedRoute>
  );
}
