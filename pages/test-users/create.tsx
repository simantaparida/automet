import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';

interface CreateResult {
  email: string;
  role: string;
  password?: string;
  status: 'success' | 'error';
  userId?: string;
  error?: string;
}

export default function CreateTestUsersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    organizationId?: string;
    users?: CreateResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestUsers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Failed to create test users'
        );
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
          background:
            'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
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
            Create Test Users
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
              Create Test Login Profiles
            </h1>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '2rem',
                fontSize: '1rem',
              }}
            >
              This page will create test users for Owner, Coordinator, and
              Technician roles with predefined passwords.{' '}
              <strong>Only available in development mode.</strong>
            </p>

            {/* Test Users Info */}
            <div
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                }}
              >
                Test Users to be Created:
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      👑 Owner
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      owner@automet.test
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      color: '#EF7722',
                    }}
                  >
                    TestOwner123!
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      👔 Coordinator
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      coordinator@automet.test
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      color: '#EF7722',
                    }}
                  >
                    TestCoordinator123!
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      🔧 Technician
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      technician@automet.test
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      color: '#EF7722',
                    }}
                  >
                    TestTechnician123!
                  </div>
                </div>
              </div>
            </div>

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
              onClick={createTestUsers}
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
              {loading ? 'Creating Users...' : 'Create Test Users'}
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

                {result.users && result.users.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: result.success ? '#065f46' : '#991b1b',
                        marginBottom: '0.75rem',
                      }}
                    >
                      User Details:
                    </h3>
                    {result.users.map((user, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '1rem',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          marginBottom: '0.75rem',
                          border:
                            user.status === 'success'
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
                            <div
                              style={{ fontWeight: '600', color: '#111827' }}
                            >
                              {user.email} ({user.role})
                            </div>
                            {user.status === 'success' && user.password && (
                              <div
                                style={{
                                  fontSize: '0.875rem',
                                  color: '#6b7280',
                                  marginTop: '0.25rem',
                                }}
                              >
                                Password:{' '}
                                <code style={{ color: '#EF7722' }}>
                                  {user.password}
                                </code>
                              </div>
                            )}
                            {user.status === 'error' && (
                              <div
                                style={{
                                  fontSize: '0.875rem',
                                  color: '#991b1b',
                                  marginTop: '0.25rem',
                                }}
                              >
                                Error: {user.error}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor:
                                user.status === 'success'
                                  ? '#d1fae5'
                                  : '#fee2e2',
                              color:
                                user.status === 'success'
                                  ? '#065f46'
                                  : '#991b1b',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {user.status === 'success'
                              ? '✓ Created'
                              : '✗ Failed'}
                          </span>
                        </div>
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
                    <p
                      style={{ color: '#1e40af', margin: 0, fontWeight: '600' }}
                    >
                      ✓ Test users created successfully! You can now:
                    </p>
                    <ul
                      style={{
                        marginTop: '0.5rem',
                        paddingLeft: '1.5rem',
                        color: '#1e40af',
                      }}
                    >
                      <li>
                        Go to{' '}
                        <a
                          href="/onboarding/welcome"
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'underline',
                          }}
                        >
                          Login Page
                        </a>{' '}
                        and sign in with any of the test credentials above
                      </li>
                      <li>
                        Test the role switch feature by logging in as Owner or
                        Coordinator
                      </li>
                      <li>Verify permissions by logging in as Technician</li>
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
