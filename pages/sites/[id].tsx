import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import Breadcrumb from '@/components/Breadcrumb';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Navigation,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  FileText,
  Wrench,
} from 'lucide-react';

interface Asset {
  id: string;
  asset_type: string;
  model?: string | null;
  serial_number?: string | null;
}

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduled_at: string;
  due_date?: string;
}

interface SiteDetails {
  id: string;
  name: string;
  address: string;
  gps_lat?: number | null;
  gps_lng?: number | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  client?: {
    id: string;
    name: string;
    contact_email?: string;
    contact_phone?: string;
  };
  assets: Asset[];
  jobs: Job[];
}

export default function SiteDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { apiFetch, activeRole } = useRoleSwitch();
  const [site, setSite] = useState<SiteDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSite();
    }
  }, [id]);

  const fetchSite = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/sites/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch site');
      }
      const data = await response.json();
      if (!data.site) {
        throw new Error('Site not found');
      }
      setSite(data.site);
    } catch (error) {
      console.error('Error fetching site:', error);
      alert(error instanceof Error ? error.message : 'Failed to load site');
      router.push('/sites');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (site?.gps_lat && site?.gps_lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${site.gps_lat},${site.gps_lng}`,
        '_blank'
      );
    } else if (site?.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`,
        '_blank'
      );
    }
  };

  const handleCall = () => {
    if (site?.client?.contact_phone) {
      window.location.href = `tel:${site.client.contact_phone}`;
    }
  };

  const handleEmail = () => {
    if (site?.client?.contact_email) {
      window.location.href = `mailto:${site.client.contact_email}`;
    }
  };

  const deleteSite = async () => {
    if (!confirm(`Are you sure you want to delete ${site?.name}?`)) return;

    try {
      const response = await apiFetch(`/api/sites/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/sites');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete site');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Error deleting site');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          color: '#3b82f6',
          bg: '#eff6ff',
          icon: Calendar,
          label: 'Scheduled',
        };
      case 'in_progress':
        return {
          color: '#f59e0b',
          bg: '#fffbeb',
          icon: Play,
          label: 'In Progress',
        };
      case 'completed':
        return {
          color: '#10b981',
          bg: '#f0fdf4',
          icon: CheckCircle2,
          label: 'Completed',
        };
      case 'cancelled':
        return {
          color: '#ef4444',
          bg: '#fef2f2',
          icon: XCircle,
          label: 'Cancelled',
        };
      default:
        return {
          color: '#6b7280',
          bg: '#f9fafb',
          icon: AlertCircle,
          label: status,
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: '#ef4444', label: 'Urgent' };
      case 'high':
        return { color: '#f59e0b', label: 'High' };
      case 'medium':
        return { color: '#3b82f6', label: 'Medium' };
      case 'low':
        return { color: '#10b981', label: 'Low' };
      default:
        return { color: '#6b7280', label: priority };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #ffe8d6',
              borderTopColor: '#EF7722',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </ProtectedRoute>
    );
  }

  if (!site) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            background:
              'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Site not found
          </p>
          <button
            onClick={() => router.push('/sites')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px',
              boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
            }}
          >
            Back to Sites
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <style jsx>{`
        .detail-container {
          padding-bottom: 80px;
        }
        .main-content-area {
          padding: 0;
        }
        .mobile-header {
          display: block;
        }
        .desktop-header {
          display: none;
        }
        @media (min-width: 768px) {
          .detail-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content-area {
            padding: 0;
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
        className="detail-container"
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="sites" />

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Desktop Breadcrumb */}
        <div
          className="desktop-header"
          style={{
            position: 'sticky',
            top: '64px',
            zIndex: 19,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Breadcrumb
            items={[{ label: 'Sites', href: '/sites' }, { label: site.name }]}
          />
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <button
              onClick={() => router.push('/sites')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ←
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {site.name}
              </h1>
              {site.client && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    margin: '0.25rem 0 0 0',
                    opacity: 0.9,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {site.client.name}
                </p>
              )}
            </div>
            <MapPin size={24} color="white" />
          </div>
        </header>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
          }}
        >
          {activeRole !== 'technician' && (
            <button
              onClick={() => router.push(`/sites/${id}/edit`)}
              style={{
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                minHeight: '72px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <Edit size={20} color="#1f2937" />
              <span>Edit</span>
            </button>
          )}
          {site.client?.contact_phone && (
            <button
              onClick={handleCall}
              style={{
                padding: '0.75rem',
                backgroundColor: '#f0fdf4',
                color: '#10b981',
                border: '1px solid #86efac',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                minHeight: '72px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dcfce7';
                e.currentTarget.style.borderColor = '#4ade80';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
                e.currentTarget.style.borderColor = '#86efac';
              }}
            >
              <Phone size={20} color="#10b981" />
              <span>Call</span>
            </button>
          )}
          {site.client?.contact_email && (
            <button
              onClick={handleEmail}
              style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                minHeight: '72px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dbeafe';
                e.currentTarget.style.borderColor = '#60a5fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#93c5fd';
              }}
            >
              <Mail size={20} color="#2563eb" />
              <span>Email</span>
            </button>
          )}
          {(site.gps_lat || site.address) && (
            <button
              onClick={handleNavigate}
              style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                minHeight: '72px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dbeafe';
                e.currentTarget.style.borderColor = '#60a5fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#93c5fd';
              }}
            >
              <Navigation size={20} color="#2563eb" />
              <span>Navigate</span>
            </button>
          )}
        </div>

        {/* Main Content */}
        <main className="main-content-area" style={{ padding: '1rem' }}>
          {/* Site Info Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background:
                    'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(239,119,34,0.2)',
                }}
              >
                <MapPin size={28} color="#EF7722" />
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0,
                    color: '#1f2937',
                  }}
                >
                  {site.name}
                </h2>
                {site.client && (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <Building2 size={14} color="#6b7280" />
                    {site.client.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Information */}
          {site.client && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                marginBottom: '0.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: 0,
                  }}
                >
                  Client
                </h3>
                <button
                  onClick={() => router.push(`/clients/${site.client!.id}`)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'transparent',
                    color: '#EF7722',
                    border: '1px solid #EF7722',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {site.client.name}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {site.client.contact_email && (
                    <a
                      href={`mailto:${site.client.contact_email}`}
                      style={{
                        fontSize: '0.875rem',
                        color: '#2563eb',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Mail size={16} color="#2563eb" />
                      {site.client.contact_email}
                    </a>
                  )}
                  {site.client.contact_phone && (
                    <a
                      href={`tel:${site.client.contact_phone}`}
                      style={{
                        fontSize: '0.875rem',
                        color: '#2563eb',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Phone size={16} color="#2563eb" />
                      {site.client.contact_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Information */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Location
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {site.address && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} color="#f59e0b" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Address
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        color: '#1f2937',
                        lineHeight: '1.5',
                      }}
                    >
                      {site.address}
                    </div>
                  </div>
                </div>
              )}
              {site.gps_lat && site.gps_lng && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Navigation size={20} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                      }}
                    >
                      GPS Coordinates
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        fontFamily: 'monospace',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {site.gps_lat.toFixed(6)}, {site.gps_lng.toFixed(6)}
                    </div>
                    <button
                      onClick={handleNavigate}
                      style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #93c5fd',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        minHeight: '40px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dbeafe';
                        e.currentTarget.style.borderColor = '#60a5fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.borderColor = '#93c5fd';
                      }}
                    >
                      <Navigation size={16} />
                      Open in Maps
                    </button>
                  </div>
                </div>
              )}
              {site.metadata?.notes && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} color="#6b7280" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Notes
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        color: '#1f2937',
                        fontStyle: 'italic',
                        lineHeight: '1.6',
                      }}
                    >
                      {site.metadata.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assets */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}
              >
                Assets ({site.assets.length})
              </h3>
              {activeRole !== 'technician' && (
                <button
                  onClick={() => router.push(`/assets/new?site_id=${id}`)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background:
                      'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    minHeight: '32px',
                    boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                  }}
                >
                  <Plus size={14} />
                  Add Asset
                </button>
              )}
            </div>
            {site.assets.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {site.assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#fff5ed',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid rgba(239,119,34,0.2)',
                        }}
                      >
                        <Wrench size={20} color="#EF7722" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '0.375rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {asset.asset_type.replace('_', ' ')}
                          {asset.model && ` - ${asset.model}`}
                        </div>
                        {asset.serial_number && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              fontFamily: 'monospace',
                            }}
                          >
                            S/N: {asset.serial_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <Wrench
                  size={32}
                  color="#d1d5db"
                  style={{ margin: '0 auto 0.5rem' }}
                />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>No assets yet</p>
                {activeRole !== 'technician' && (
                  <button
                    onClick={() => router.push(`/assets/new?site_id=${id}`)}
                    style={{
                      marginTop: '1rem',
                      padding: '0.625rem 1rem',
                      background:
                        'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                    }}
                  >
                    Add First Asset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Recent Jobs ({site.jobs.length})
            </h3>
            {site.jobs.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {site.jobs.map((job) => {
                  const statusConfig = getStatusConfig(job.status);
                  const priorityConfig = getPriorityConfig(job.priority);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <button
                      key={job.id}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            flex: 1,
                          }}
                        >
                          {job.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.375rem 0.625rem',
                            backgroundColor: priorityConfig.color + '15',
                            borderRadius: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: priorityConfig.color,
                              textTransform: 'uppercase',
                            }}
                          >
                            {priorityConfig.label}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.375rem 0.625rem',
                            backgroundColor: statusConfig.bg,
                            borderRadius: '6px',
                          }}
                        >
                          <StatusIcon size={14} color={statusConfig.color} />
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: statusConfig.color,
                              textTransform: 'capitalize',
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                          }}
                        >
                          <Calendar size={14} />
                          {formatDate(job.scheduled_at)}
                        </div>
                        {job.due_date && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              fontSize: '0.75rem',
                              color: '#6b7280',
                            }}
                          >
                            <Clock size={14} />
                            Due: {formatDate(job.due_date)}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <Calendar
                  size={32}
                  color="#d1d5db"
                  style={{ margin: '0 auto 0.5rem' }}
                />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>No jobs yet</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {activeRole !== 'technician' && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <button
                  onClick={() => router.push(`/sites/${id}/edit`)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#EF7722',
                    border: '2px solid #EF7722',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff5ed';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={deleteSite}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </main>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
