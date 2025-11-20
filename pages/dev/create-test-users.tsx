import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface TestUser {
  email: string;
  password: string;
  role: string;
  name: string;
}

interface CreateResult {
  user: TestUser;
  success: boolean;
  error?: string;
  authId?: string;
}

export default function CreateTestUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CreateResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const testUsers: TestUser[] = [
    {
      email: 'owner@automet.test',
      password: 'TestOwner123!',
      role: 'owner',
      name: 'Test Owner',
    },
    {
      email: 'coordinator@automet.test',
      password: 'TestCoordinator123!',
      role: 'coordinator',
      name: 'Test Coordinator',
    },
    {
      email: 'technician@automet.test',
      password: 'TestTechnician123!',
      role: 'technician',
      name: 'Test Technician',
    },
  ];

  const createTestUsers = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/test-users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create test users');
      }

      // Map the API response to our results format
      const userResults: CreateResult[] = testUsers.map((user) => {
        const apiResult = data.results?.find((r: any) => r.email === user.email);
        return {
          user,
          success: apiResult?.success || false,
          error: apiResult?.error,
          authId: apiResult?.authUserId,
        };
      });

      setResults(userResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <Head>
        <title>Create Test Users - Automet Dev Tools</title>
      </Head>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827' }}>
            Create Test Users
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            This will create test user accounts in Supabase Auth and the database.
          </p>
        </div>

        {/* Warning Banner */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <p style={{ fontWeight: '600', color: '#92400e', margin: '0 0 0.5rem 0' }}>
                Development Only
              </p>
              <p style={{ fontSize: '0.875rem', color: '#78350f', margin: 0 }}>
                This endpoint only works in development mode. It will create 3 test accounts with a shared "Test Organization".
              </p>
            </div>
          </div>
        </div>

        {/* Test Users Info */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
              Test Accounts to Create
            </h2>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {showPasswords ? '🙈 Hide' : '👁️ Show'} Passwords
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {testUsers.map((user, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: '600', color: '#6b7280' }}>Name:</span>
                  <span style={{ color: '#111827' }}>{user.name}</span>

                  <span style={{ fontWeight: '600', color: '#6b7280' }}>Email:</span>
                  <span style={{ color: '#111827', fontFamily: 'monospace' }}>{user.email}</span>

                  <span style={{ fontWeight: '600', color: '#6b7280' }}>Password:</span>
                  <span style={{ color: '#111827', fontFamily: 'monospace' }}>
                    {showPasswords ? user.password : '••••••••••••'}
                  </span>

                  <span style={{ fontWeight: '600', color: '#6b7280' }}>Role:</span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      width: 'fit-content',
                      textTransform: 'capitalize',
                      ...(user.role === 'owner'
                        ? { backgroundColor: '#ddd6fe', color: '#5b21b6' }
                        : user.role === 'coordinator'
                          ? { backgroundColor: '#dbeafe', color: '#1e40af' }
                          : { backgroundColor: '#d1fae5', color: '#065f46' }),
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
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
            padding: '1rem 1.5rem',
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
          {loading ? '⏳ Creating Test Users...' : '🚀 Create Test Users'}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Results
            </h2>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`,
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                        {result.user.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                        {result.user.email}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: result.success ? '#d1fae5' : '#fee2e2',
                        color: result.success ? '#065f46' : '#991b1b',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      {result.success ? '✓ Created' : '✗ Failed'}
                    </span>
                  </div>

                  {result.authId && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace', marginTop: '0.5rem' }}>
                      Auth ID: {result.authId}
                    </div>
                  )}

                  {result.error && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: '#fee2e2',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        color: '#991b1b',
                      }}
                    >
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Success Next Steps */}
            {results.every((r) => r.success) && (
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: '#065f46', margin: '0 0 1rem 0', fontSize: '1.125rem' }}>
                      Test Users Created Successfully!
                    </p>
                    <div style={{ color: '#047857', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>Now you can:</p>
                      <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        <li>Log out of your current session</li>
                        <li>Log in with any of the test accounts (e.g., owner@automet.test / TestOwner123!)</li>
                        <li>Visit <a href="/dev/seed-data" style={{ color: '#059669', fontWeight: '600', textDecoration: 'underline' }}>/dev/seed-data</a> to create test data</li>
                        <li>View your dashboard with populated data!</li>
                      </ol>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <a
                        href="/auth/login"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        Go to Login →
                      </a>
                      <a
                        href="/dev/check-auth"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'white',
                          color: '#065f46',
                          border: '1px solid #10b981',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        Check Auth Status
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
