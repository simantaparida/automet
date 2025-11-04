import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface Site {
  id: string;
  name: string;
  address: string;
  gps_lat: number | null;
  gps_lng: number | null;
}

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduled_at: string;
}

interface ClientDetails {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  notes: string | null;
  created_at: string;
  sites: Site[];
  jobs: Job[];
}

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${id}`);
      const data = await response.json();
      setClient(data.client);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (client?.contact_phone) {
      window.location.href = `tel:${client.contact_phone}`;
    }
  };

  const handleEmail = () => {
    if (client?.contact_email) {
      window.location.href = `mailto:${client.contact_email}`;
    }
  };

  const handleNavigate = () => {
    if (client?.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`, '_blank');
    }
  };

  const deleteClient = async () => {
    if (!confirm(`Are you sure you want to delete ${client?.name}?`)) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/clients');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </ProtectedRoute>
    );
  }

  if (!client) {
    return (
      <ProtectedRoute>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem'
        }}>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Client not found</p>
          <button
            onClick={() => router.push('/clients')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              minHeight: '44px'
            }}
          >
            Back to Clients
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        paddingBottom: '80px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => router.push('/clients')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                minWidth: '44px',
                minHeight: '44px'
              }}
            >
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                {client.name}
              </h1>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => router.push(`/clients/${id}/edit`)}
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
              minHeight: '44px'
            }}
          >
            <span>✏️</span> Edit
          </button>
          {client.contact_phone && (
            <button
              onClick={handleCall}
              style={{
                padding: '0.75rem',
                backgroundColor: '#10b981',
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
                minHeight: '44px'
              }}
            >
              <span>📞</span> Call
            </button>
          )}
          {client.contact_email && (
            <button
              onClick={handleEmail}
              style={{
                padding: '0.75rem',
                backgroundColor: '#8b5cf6',
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
                minHeight: '44px'
              }}
            >
              <span>✉️</span> Email
            </button>
          )}
        </div>

        <main style={{ padding: '1rem' }}>
          {/* Contact Information */}
          <div style={{ backgroundColor: 'white', padding: '1rem', marginBottom: '0.75rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Contact Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {client.contact_email && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Email</div>
                  <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>{client.contact_email}</div>
                </div>
              )}
              {client.contact_phone && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Phone</div>
                  <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>{client.contact_phone}</div>
                </div>
              )}
              {client.address && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Address</div>
                  <div style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '0.5rem' }}>{client.address}</div>
                  <button
                    onClick={handleNavigate}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      minHeight: '36px',
                    }}
                  >
                    🗺️ Navigate
                  </button>
                </div>
              )}
              {client.notes && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Notes</div>
                  <div style={{ fontSize: '0.875rem', color: '#1f2937', fontStyle: 'italic' }}>{client.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Sites */}
          <div style={{ backgroundColor: 'white', padding: '1rem', marginBottom: '0.75rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Sites ({client.sites.length})
              </h3>
              <button
                onClick={() => router.push(`/sites/new?client_id=${id}`)}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minHeight: '32px',
                }}
              >
                + Add Site
              </button>
            </div>
            {client.sites.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {client.sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => router.push(`/sites/${site.id}`)}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      {site.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      📍 {site.address}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>No sites yet</p>
            )}
          </div>

          {/* Recent Jobs */}
          <div style={{ backgroundColor: 'white', padding: '1rem', marginBottom: '0.75rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Recent Jobs ({client.jobs.length})
            </h3>
            {client.jobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {client.jobs.map((job) => (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                        {job.title}
                      </div>
                      <span style={{ fontSize: '0.875rem' }}>{getPriorityIcon(job.priority)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: `${getStatusColor(job.status)}20`,
                        color: getStatusColor(job.status),
                        borderRadius: '4px',
                        fontWeight: '500',
                      }}>
                        {job.status.replace('_', ' ')}
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        {new Date(job.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>No jobs yet</p>
            )}
          </div>

          {/* Delete Button */}
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <button
              onClick={deleteClient}
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
                minHeight: '44px'
              }}
            >
              🗑️ Delete Client
            </button>
          </div>
        </main>

        <BottomNav activeTab="clients" />
      </div>
    </ProtectedRoute>
  );
}
