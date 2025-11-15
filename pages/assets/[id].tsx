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
  Wrench,
  MapPin,
  Building2,
  Phone,
  Mail,
  Navigation,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  FileText,
  Package,
  ShieldCheck,
  ShieldX,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduled_at: string;
  due_date?: string;
}

interface AssetDetails {
  id: string;
  asset_type: string;
  model?: string | null;
  serial_number?: string | null;
  install_date?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  site?: {
    id: string;
    name: string;
    address?: string;
    client?: {
      id: string;
      name: string;
      contact_email?: string;
      contact_phone?: string;
    };
  };
  jobs: Job[];
}

export default function AssetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { apiFetch, activeRole } = useRoleSwitch();
  const [asset, setAsset] = useState<AssetDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/assets/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch asset');
      }
      const data = await response.json();
      if (!data.asset) {
        throw new Error('Asset not found');
      }
      setAsset(data.asset);
    } catch (error) {
      console.error('Error fetching asset:', error);
      alert(error instanceof Error ? error.message : 'Failed to load asset');
      router.push('/assets');
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async () => {
    if (!confirm(`Are you sure you want to delete this asset?`)) return;

    try {
      const response = await apiFetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/assets');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error deleting asset');
    }
  };

  const handleCall = () => {
    if (asset?.site?.client?.contact_phone) {
      window.location.href = `tel:${asset.site.client.contact_phone}`;
    }
  };

  const handleEmail = () => {
    if (asset?.site?.client?.contact_email) {
      window.location.href = `mailto:${asset.site.client.contact_email}`;
    }
  };

  const handleNavigate = () => {
    if (asset?.site?.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(asset.site.address)}`,
        '_blank'
      );
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: '#3b82f6', bg: '#eff6ff', icon: CalendarIcon, label: 'Scheduled' };
      case 'in_progress':
        return { color: '#f59e0b', bg: '#fffbeb', icon: Play, label: 'In Progress' };
      case 'completed':
        return { color: '#10b981', bg: '#f0fdf4', icon: CheckCircle2, label: 'Completed' };
      case 'cancelled':
        return { color: '#ef4444', bg: '#fef2f2', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: '#6b7280', bg: '#f9fafb', icon: AlertCircle, label: status };
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

  const isWarrantyExpired = (warrantyDate: string | null) => {
    if (!warrantyDate) return false;
    return new Date(warrantyDate) < new Date();
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
            background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
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

  if (!asset) {
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
            background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Asset not found
          </p>
          <button
            onClick={() => router.push('/assets')}
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
            Back to Assets
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const warrantyExpiry = asset.metadata?.warranty_expiry;
  const warrantyExpired = warrantyExpiry ? isWarrantyExpired(warrantyExpiry) : false;

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
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="assets" />

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
            items={[
              { label: 'Assets', href: '/assets' },
              { label: asset.model ? `${asset.asset_type} - ${asset.model}` : asset.asset_type },
            ]}
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
              onClick={() => router.push('/assets')}
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
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {asset.model ? `${asset.asset_type} - ${asset.model}` : asset.asset_type}
              </h1>
              {asset.serial_number && (
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
                  S/N: {asset.serial_number}
                </p>
              )}
            </div>
            <Wrench size={24} color="white" />
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
              onClick={() => router.push(`/assets/${id}/edit`)}
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
          {asset.site && (
            <button
              onClick={() => router.push(`/sites/${asset.site!.id}`)}
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
              <MapPin size={20} color="#2563eb" />
              <span>View Site</span>
            </button>
          )}
          {asset.site?.client?.contact_phone && (
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
          {asset.site?.client?.contact_email && (
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
          {asset.site?.address && (
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
          {/* Asset Info Card */}
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
                  background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(239,119,34,0.2)',
                }}
              >
                <Wrench size={28} color="#EF7722" />
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0,
                    color: '#1f2937',
                    textTransform: 'capitalize',
                  }}
                >
                  {asset.asset_type.replace('_', ' ')}
                </h2>
                {asset.model && (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '0.25rem',
                    }}
                  >
                    {asset.model}
                  </div>
                )}
                {asset.serial_number && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      marginTop: '0.25rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    S/N: {asset.serial_number}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Asset Details */}
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
              Asset Details
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {asset.install_date && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={20} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Install Date
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#1f2937',
                      }}
                    >
                      {formatDate(asset.install_date)}
                    </div>
                  </div>
                </div>
              )}
              {warrantyExpiry && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: warrantyExpired ? '#fef2f2' : '#f0fdf4',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {warrantyExpired ? (
                      <ShieldX size={20} color="#ef4444" />
                    ) : (
                      <ShieldCheck size={20} color="#10b981" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Warranty Expiry
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: warrantyExpired ? '#ef4444' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {warrantyExpired ? (
                        <>
                          <XCircle size={16} />
                          Expired
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Valid
                        </>
                      )}
                      <span style={{ color: '#1f2937' }}>-</span>
                      <span style={{ color: '#1f2937' }}>
                        {formatDate(warrantyExpiry)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {asset.metadata?.notes && (
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
                      {asset.metadata.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {asset.site && (
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
                  Location
                </h3>
                <button
                  onClick={() => router.push(`/sites/${asset.site!.id}`)}
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
                  View Site
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <button
                  onClick={() => router.push(`/sites/${asset.site!.id}`)}
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
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
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
                      <MapPin size={20} color="#EF7722" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '0.375rem',
                        }}
                      >
                        {asset.site.name}
                      </div>
                      {asset.site.address && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.375rem',
                          }}
                        >
                          <MapPin size={14} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{asset.site.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                {asset.site.client && (
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
                        backgroundColor: '#eff6ff',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Building2 size={20} color="#2563eb" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Client
                      </div>
                      <button
                        onClick={() => router.push(`/clients/${asset.site!.client!.id}`)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          textAlign: 'left',
                          cursor: 'pointer',
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
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '0.375rem',
                          }}
                        >
                          {asset.site.client.name}
                        </div>
                        {asset.site.client.contact_phone && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                            }}
                          >
                            <Phone size={14} color="#6b7280" />
                            {asset.site.client.contact_phone}
                          </div>
                        )}
                        {asset.site.client.contact_email && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              marginTop: '0.25rem',
                            }}
                          >
                            <Mail size={14} color="#6b7280" />
                            {asset.site.client.contact_email}
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Jobs */}
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
              Related Jobs ({asset.jobs.length})
            </h3>
            {asset.jobs.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {asset.jobs.map((job) => {
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
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
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
                <Package size={32} color="#d1d5db" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  No jobs yet
                </p>
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
                  onClick={() => router.push(`/assets/${id}/edit`)}
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
                  onClick={deleteAsset}
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
