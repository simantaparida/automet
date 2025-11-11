import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduled_at: string;
}

interface AssetDetails {
  id: string;
  asset_type: string;
  model: string;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  notes: string | null;
  created_at: string;
  site: {
    id: string;
    name: string;
    address: string;
    client: {
      id: string;
      name: string;
      contact_email: string;
      contact_phone: string;
    };
  };
  jobs: Job[];
}

export default function AssetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
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
      const response = await fetch(`/api/assets/${id}`);
      const data = await response.json();
      setAsset(data.asset);
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async () => {
    if (!confirm(`Are you sure you want to delete this asset?`)) return;

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/assets');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error deleting asset');
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
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Asset not found
          </p>
          <button
            onClick={() => router.push('/assets')}
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
            Back to Assets
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
              }}
            >
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                {asset.asset_type} - {asset.model}
              </h1>
              {asset.serial_number && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    margin: '0.25rem 0 0 0',
                    opacity: 0.9,
                  }}
                >
                  S/N: {asset.serial_number}
                </p>
              )}
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
            onClick={() => router.push(`/assets/${id}/edit`)}
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
            onClick={() => router.push(`/sites/${asset.site.id}`)}
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
            <span>📍</span> View Site
          </button>
        </div>

        <main style={{ padding: '1rem' }}>
          {/* Asset Information */}
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
              Asset Information
            </h3>
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
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  Type
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  {asset.asset_type}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  Model
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  {asset.model}
                </div>
              </div>
              {asset.purchase_date && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Purchase Date
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                    {new Date(asset.purchase_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              )}
              {asset.warranty_expiry && (
                <div>
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
                      fontSize: '0.875rem',
                      color: isWarrantyExpired(asset.warranty_expiry)
                        ? '#ef4444'
                        : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {isWarrantyExpired(asset.warranty_expiry)
                      ? '⚠️ Expired'
                      : '✓ Valid'}{' '}
                    -{' '}
                    {new Date(asset.warranty_expiry).toLocaleDateString(
                      'en-IN',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </div>
                </div>
              )}
              {asset.notes && (
                <div>
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
                    {asset.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
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
            <button
              onClick={() => router.push(`/sites/${asset.site.id}`)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: '44px',
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
                {asset.site.name}
              </div>
              {asset.site.address && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem',
                  }}
                >
                  📍 {asset.site.address}
                </div>
              )}
            </button>
            <button
              onClick={() => router.push(`/clients/${asset.site.client.id}`)}
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
                {asset.site.client.name}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                Client
              </div>
            </button>
          </div>

          {/* Related Jobs */}
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
              Related Jobs ({asset.jobs.length})
            </h3>
            {asset.jobs.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {asset.jobs.map((job) => (
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
              onClick={deleteAsset}
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
              🗑️ Delete Asset
            </button>
          </div>
        </main>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
