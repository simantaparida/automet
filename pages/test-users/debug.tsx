import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';

export default function DebugTestUsersPage() {
  const { user } = useAuth();
  const { actualRole, activeRole, apiFetch } = useRoleSwitch();
  const [userProfile, setUserProfile] = useState<any>(null);

  const [clientsCount, setClientsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  useEffect(() => {
    fetchDebugInfo();
  }, [apiFetch]); // Add apiFetch to dependencies

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch user profile
      const profileResponse = await apiFetch('/api/user/profile');
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setUserProfile(profile);
      } else {
        const errorData = await profileResponse.json();
        setError(`Failed to fetch profile: ${errorData.error || 'Unknown error'}`);
      }

      // Fetch clients count using apiFetch
      try {
        const clientsResponse = await apiFetch('/api/clients');
        if (clientsResponse.ok) {
          const clients = await clientsResponse.json();
          setClientsCount(Array.isArray(clients) ? clients.length : 0);
        } else {
          try {
            const errorData = await clientsResponse.json();
            console.error('Failed to fetch clients:', errorData);
            setError(`Failed to fetch clients: ${errorData.error || errorData.message || 'Unknown error'}`);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            setError(`Failed to fetch clients: HTTP ${clientsResponse.status}`);
          }
          setClientsCount(0);
        }
      } catch (fetchError) {
        console.error('Error fetching clients:', fetchError);
        setError(`Error fetching clients: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        setClientsCount(0);
      }
    } catch (error) {
      console.error('Error fetching debug info:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setClientsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosticsLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/test-users/diagnose');
      if (response.ok) {
        const data = await response.json();
        setDiagnostics(data);
      } else {
        const errorData = await response.json();
        setError(`Failed to run diagnostics: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setDiagnosticsLoading(false);
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
            Debug Test Users
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
                marginBottom: '1rem',
              }}
            >
              Debug Information
            </h1>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Auth User Info */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Auth User (from AuthContext)
                  </h2>
                  <pre style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'auto' }}>
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>

                {/* User Profile */}
                {userProfile && (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      User Profile (from /api/user/profile)
                    </h2>
                    <pre style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'auto' }}>
                      {JSON.stringify(userProfile, null, 2)}
                    </pre>
                    {userProfile.org_id && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#111827' }}>
                        <strong>Organization ID:</strong> {userProfile.org_id}
                      </p>
                    )}
                    {userProfile.role && (
                      <p style={{ fontSize: '0.875rem', color: '#111827' }}>
                        <strong>Role:</strong> {userProfile.role}
                      </p>
                    )}
                  </div>
                )}


                {/* Role Switch Info */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Role Switch Info
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#111827' }}>
                    <strong>Actual Role:</strong> {actualRole || 'Not set'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#111827' }}>
                    <strong>Active Role:</strong> {activeRole || 'Not set'}
                  </p>
                </div>

                {/* Clients Count */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: clientsCount !== null && clientsCount > 0 ? '#d1fae5' : clientsCount === 0 ? '#fee2e2' : '#f9fafb',
                    borderRadius: '8px',
                    border: `1px solid ${clientsCount !== null && clientsCount > 0 ? '#10b981' : clientsCount === 0 ? '#ef4444' : '#e5e7eb'}`,
                  }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Data Visibility
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#111827' }}>
                    <strong>Clients Count:</strong> {clientsCount !== null ? clientsCount : 'Loading...'}
                  </p>
                  {clientsCount === 0 && !loading && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem' }}>
                        ⚠️ No clients found in your organization.
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem' }}>
                        <strong>Solution:</strong> Go to <a href="/test-users/seed-data" style={{ color: '#3b82f6', textDecoration: 'underline' }}>/test-users/seed-data</a> and click "Seed Test Data" to create data for your organization.
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                        Your Organization ID: <code style={{ backgroundColor: '#fee2e2', padding: '0.125rem 0.25rem', borderRadius: '4px' }}>{userProfile?.org_id || 'Unknown'}</code>
                      </p>
                    </div>
                  )}
                  {error && (
                    <p style={{ fontSize: '0.875rem', color: '#991b1b', marginTop: '0.5rem' }}>
                      Error: {error}
                    </p>
                  )}
                </div>

                {/* Diagnostics */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    marginTop: '1rem',
                  }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                    Advanced Diagnostics
                  </h2>
                  <button
                    onClick={runDiagnostics}
                    disabled={diagnosticsLoading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: diagnosticsLoading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: diagnosticsLoading ? 'not-allowed' : 'pointer',
                      marginBottom: '1rem',
                    }}
                  >
                    {diagnosticsLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
                  </button>

                  {diagnostics && (
                    <div style={{ marginTop: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                        Summary
                      </h3>
                      <div
                        style={{
                          padding: '0.75rem',
                          backgroundColor: diagnostics.summary?.hasDataInDatabase && diagnostics.summary?.hasDataViaRLS
                            ? '#d1fae5'
                            : diagnostics.summary?.hasDataInDatabase && !diagnostics.summary?.hasDataViaRLS
                              ? '#fef3c7'
                              : '#fee2e2',
                          borderRadius: '6px',
                          marginBottom: '1rem',
                        }}
                      >
                        <p style={{ fontSize: '0.875rem', color: '#111827', margin: '0 0 0.5rem 0' }}>
                          <strong>Recommendation:</strong> {diagnostics.summary?.recommendation}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0 }}>
                          Data in DB: {diagnostics.summary?.hasDataInDatabase ? 'Yes' : 'No'} |
                          Data via RLS: {diagnostics.summary?.hasDataViaRLS ? 'Yes' : 'No'} |
                          RLS Error: {diagnostics.summary?.hasRLSError ? 'Yes' : 'No'}
                        </p>
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                        Data in Database (Admin)
                      </h3>
                      <pre
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}
                      >
                        {JSON.stringify(diagnostics.checks?.dataInDatabase, null, 2)}
                      </pre>

                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1rem', color: '#111827' }}>
                        Session Info
                      </h3>
                      <pre
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: '150px',
                        }}
                      >
                        {JSON.stringify(diagnostics.checks?.session, null, 2)}
                      </pre>

                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1rem', color: '#111827' }}>
                        User Profile
                      </h3>
                      <pre
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: '150px',
                        }}
                      >
                        {JSON.stringify(diagnostics.checks?.userProfile, null, 2)}
                      </pre>

                      {diagnostics.checks?.rlsTest && (
                        <>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1rem', color: '#111827' }}>
                            RLS Test
                          </h3>
                          <pre
                            style={{
                              padding: '0.75rem',
                              backgroundColor: diagnostics.checks.rlsTest.orgIdMatches ? '#d1fae5' : '#fee2e2',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              maxHeight: '150px',
                            }}
                          >
                            {JSON.stringify(diagnostics.checks.rlsTest, null, 2)}
                          </pre>
                        </>
                      )}

                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '1rem', color: '#111827' }}>
                        Data via RLS (Authenticated)
                      </h3>
                      <pre
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: '300px',
                        }}
                      >
                        {JSON.stringify(diagnostics.checks?.dataViaRLS, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    marginTop: '1rem',
                  }}
                >
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>
                    Instructions
                  </h2>
                  <ol style={{ fontSize: '0.875rem', color: '#1e40af', paddingLeft: '1.5rem' }}>
                    <li>Make sure you're logged in with a test user (owner@automet.test, coordinator@automet.test, or technician@automet.test)</li>
                    <li>Verify that the Organization ID matches the test organization</li>
                    <li>Click "Run Diagnostics" to see detailed information about data visibility</li>
                    <li>If data exists in DB but not via RLS, check RLS policies and session</li>
                    <li>If no data exists, go to /test-users/seed-data and create data</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

