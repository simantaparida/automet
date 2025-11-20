import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';



export default function SeedTestDataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    organizationId?: string;
    organizationName?: string;
    organizationSlug?: string;
    userEmail?: string;
    results?: Record<string, { created: number; errors: string[] }>;
    summary?: {
      clients: number;
      sites: number;
      assets: number;
      jobs: number;
      inventory: number;
      total: number;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { apiFetch } = useRoleSwitch();

  const seedData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use apiFetch to include authentication headers (including X-Active-Role if needed)
      const response = await apiFetch('/api/test-users/seed-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to seed test data');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <style jsx>{`
        .page-container {
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
          .page-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content {
            padding: 2rem;
            max-width: 900px;
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
        className="page-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="home" />

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
            Seed Test Data
          </h1>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.5rem',
              }}
            >
              Seed Test Data
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1rem' }}>
              This page will create dummy data for <strong>your current organization</strong>. It will create:
              <br />• 5 Clients
              <br />• 12 Sites
              <br />• 15 Assets
              <br />• 12 Jobs (with various statuses and priorities, some assigned to technician)
              <br />• 10 Inventory Items
              <br />
              <br />
              <strong style={{ color: '#EF7722' }}>⚠️ Important:</strong>
              <br />• Data will be created for the organization you're currently logged into.
              <br />• You must be logged in to use this feature.
              <br />• After seeding, refresh the pages to see the data.
            </p>

            {/* Error Message */}
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
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={seedData}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
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
              {loading ? 'Seeding Data...' : 'Seed Test Data'}
            </button>

            {/* Results */}
            {result && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  backgroundColor: result.success ? '#d1fae5' : '#fee2e2',
                  border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: result.success ? '#065f46' : '#991b1b',
                    marginBottom: '1rem',
                  }}
                >
                  {result.success ? '✅ Success!' : '❌ Errors Occurred'}
                </h2>
                <p
                  style={{
                    color: result.success ? '#065f46' : '#991b1b',
                    marginBottom: '1rem',
                  }}
                >
                  {result.message}
                </p>

                {result.summary && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Summary:
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Clients</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF7722' }}>
                          {result.summary.clients}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sites</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF7722' }}>
                          {result.summary.sites}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Assets</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF7722' }}>
                          {result.summary.assets}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Jobs</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF7722' }}>
                          {result.summary.jobs}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Inventory</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF7722' }}>
                          {result.summary.inventory}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF7722' }}>
                          {result.summary.total}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.results && (
                  <div style={{ marginTop: '1rem' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: result.success ? '#065f46' : '#991b1b',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Details:
                    </h3>
                    {Object.entries(result.results).map(([entity, data]) => (
                      <div
                        key={entity}
                        style={{
                          padding: '1rem',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          marginBottom: '0.75rem',
                          border:
                            data.errors.length === 0
                              ? '1px solid #10b981'
                              : '1px solid #ef4444',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                              {entity}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              {data.created} created
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: data.errors.length === 0 ? '#d1fae5' : '#fee2e2',
                              color: data.errors.length === 0 ? '#065f46' : '#991b1b',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {data.errors.length === 0 ? '✓ Success' : `✗ ${data.errors.length} error(s)`}
                          </span>
                        </div>
                        {data.errors.length > 0 && (
                          <div
                            style={{
                              marginTop: '0.5rem',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid #e5e7eb',
                            }}
                          >
                            <ul
                              style={{
                                margin: 0,
                                paddingLeft: '1.5rem',
                                fontSize: '0.875rem',
                                color: '#991b1b',
                              }}
                            >
                              {data.errors.map((err, errIndex) => (
                                <li key={errIndex}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.success && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      backgroundColor: '#dbeafe',
                      border: '1px solid #3b82f6',
                      borderRadius: '6px',
                    }}
                  >
                    <p style={{ color: '#1e40af', margin: 0, fontWeight: '600' }}>
                      ✓ Test data created successfully!
                    </p>
                    {result.organizationName && (
                      <p style={{ marginTop: '0.5rem', color: '#1e40af', fontSize: '0.875rem' }}>
                        <strong>Organization:</strong> {result.organizationName} ({result.organizationSlug || result.organizationId})
                        <br />
                        <strong>User:</strong> {result.userEmail || 'Unknown'}
                      </p>
                    )}
                    <p style={{ marginTop: '0.75rem', color: '#1e40af', fontSize: '0.875rem' }}>
                      <strong>Next Steps:</strong>
                      <br />• Refresh the pages to see the newly created data
                      <br />• If you don't see the data, check that you're logged in with the correct account
                    </p>
                    <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', color: '#1e40af' }}>
                      <li>
                        <a href="/jobs" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                          View Jobs
                        </a>{' '}
                        - See jobs with different statuses (some assigned to technician)
                      </li>
                      <li>
                        <a href="/clients" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                          View Clients
                        </a>{' '}
                        - See all test clients
                      </li>
                      <li>
                        <a href="/sites" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                          View Sites
                        </a>{' '}
                        - Browse test sites
                      </li>
                      <li>
                        <a href="/assets" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                          View Assets
                        </a>{' '}
                        - See all test assets
                      </li>
                      <li>
                        <a href="/inventory" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                          View Inventory
                        </a>{' '}
                        - Check inventory items
                      </li>
                      <li>
                        <a href="/test-users/debug" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                          Debug Page
                        </a>{' '}
                        - Check your current user and organization
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

