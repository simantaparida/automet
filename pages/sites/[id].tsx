import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface Asset {
  id: string;
  asset_type: string;
  model: string;
  serial_number: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduled_at: string;
}

interface SiteDetails {
  id: string;
  name: string;
  address: string;
  gps_lat: number | null;
  gps_lng: number | null;
  notes: string | null;
  created_at: string;
  client: {
    id: string;
    name: string;
    contact_email: string;
    contact_phone: string;
  };
  assets: Asset[];
  jobs: Job[];
}

export default function SiteDetailPage() {
  const router = useRouter();
  const { id } = router.query;
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
      const response = await fetch(`/api/sites/${id}`);
      const data = await response.json();
      setSite(data.site);
    } catch (error) {
      console.error('Error fetching site:', error);
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

  const deleteSite = async () => {
    if (!confirm(`Are you sure you want to delete ${site?.name}?`)) return;

    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/sites');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete site');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Error deleting site');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
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
            backgroundColor: '#f5f5f5',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#2563eb',
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
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Site not found
          </p>
          <button
            onClick={() => router.push('/sites')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              minHeight: '44px',
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
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          paddingBottom: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
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
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
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
              }}
            >
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                {site.name}
              </h1>
              <p
                style={{
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0',
                  opacity: 0.9,
                }}
              >
                {site.client.name}
              </p>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => router.push(`/sites/${id}/edit`)}
            style={{
              padding: '0.75rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '44px',
            }}
          >
            <span>✏️</span> Edit
          </button>
          <button
            onClick={handleNavigate}
            style={{
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '44px',
            }}
          >
            <span>🗺️</span> Navigate
          </button>
        </div>

        <main style={{ padding: '1rem' }}>
          {/* Client Information */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '0.75rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Client
            </h3>
            <button
              onClick={() => router.push(`/clients/${site.client.id}`)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {site.client.name}
              </div>
              {site.client.contact_phone && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem',
                  }}
                >
                  📞 {site.client.contact_phone}
                </div>
              )}
            </button>
          </div>

          {/* Location Information */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '0.75rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Location
            </h3>
            {site.address && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  Address
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  {site.address}
                </div>
              </div>
            )}
            {site.gps_lat && site.gps_lng && (
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  GPS Coordinates
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  {site.gps_lat.toFixed(6)}, {site.gps_lng.toFixed(6)}
                </div>
              </div>
            )}
            {site.notes && (
              <div style={{ marginTop: '0.75rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  Notes
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#1f2937',
                    fontStyle: 'italic',
                  }}
                >
                  {site.notes}
                </div>
              </div>
            )}
          </div>

          {/* Assets */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '0.75rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Assets ({site.assets.length})
            </h3>
            {site.assets.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {site.assets.map((asset) => (
                  <div
                    key={asset.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {asset.asset_type} - {asset.model}
                    </div>
                    {asset.serial_number && (
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        S/N: {asset.serial_number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                No assets yet
              </p>
            )}
          </div>

          {/* Recent Jobs */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '0.75rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Recent Jobs ({site.jobs.length})
            </h3>
            {site.jobs.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {site.jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#1f2937',
                        }}
                      >
                        {job.title}
                      </div>
                      <span style={{ fontSize: '0.875rem' }}>
                        {getPriorityIcon(job.priority)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: `${getStatusColor(job.status)}20`,
                          color: getStatusColor(job.status),
                          borderRadius: '4px',
                          fontWeight: '500',
                        }}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        {new Date(job.scheduled_at).toLocaleDateString(
                          'en-IN',
                          { day: 'numeric', month: 'short' }
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                No jobs yet
              </p>
            )}
          </div>

          {/* Delete Button */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <button
              onClick={deleteSite}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'white',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              🗑️ Delete Site
            </button>
          </div>
        </main>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
