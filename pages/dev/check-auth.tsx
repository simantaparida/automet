import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DatabaseCounts {
  clients: number;
  sites: number;
  assets: number;
  jobs: number;
  inventory: number;
  users: number;
}

interface UserProfile {
  id: string;
  email: string;
  org_id: string | null;
  role: string | null;
  full_name: string | null;
  created_at: string;
}

export default function CheckAuthPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [counts, setCounts] = useState<DatabaseCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id, email, org_id, role, full_name, created_at')
        .eq('id', user.id)
        .maybeSingle<UserProfile>();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch database counts
      if (profileData?.org_id) {
        const [clientsRes, sitesRes, assetsRes, jobsRes, inventoryRes, usersRes] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('org_id', profileData.org_id),
          supabase.from('sites').select('id', { count: 'exact', head: true }).eq('org_id', profileData.org_id),
          supabase.from('assets').select('id', { count: 'exact', head: true }).eq('org_id', profileData.org_id),
          supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('org_id', profileData.org_id),
          supabase.from('inventory_items').select('id', { count: 'exact', head: true }).eq('org_id', profileData.org_id),
          supabase.from('users').select('id', { count: 'exact', head: true }).eq('org_id', profileData.org_id),
        ]);

        setCounts({
          clients: clientsRes.count || 0,
          sites: sitesRes.count || 0,
          assets: assetsRes.count || 0,
          jobs: jobsRes.count || 0,
          inventory: inventoryRes.count || 0,
          users: usersRes.count || 0,
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #fde7d3',
              borderTopColor: '#EF7722',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading authentication status...</p>
        </div>
      </div>
    );
  }

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
        <title>Auth Status Check - Automet Dev Tools</title>
      </Head>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

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
            Authentication Status
          </h1>
          <p style={{ color: '#6b7280' }}>Check your current authentication state and database status</p>
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
              marginBottom: '1.5rem',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Not Logged In */}
        {!user && (
          <div
            style={{
              padding: '2rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
              Not Logged In
            </h2>
            <p style={{ color: '#78350f', marginBottom: '1.5rem' }}>
              You need to log in to view your authentication status
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a
                href="/auth/login"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#EF7722',
                  color: 'white',
                  borderRadius: '6px',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                Go to Login
              </a>
              <a
                href="/dev/create-test-users"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#EF7722',
                  border: '1px solid #EF7722',
                  borderRadius: '6px',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                Create Test Users
              </a>
            </div>
          </div>
        )}

        {/* Logged In - Show Details */}
        {user && (
          <>
            {/* Session Info */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Logged In
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#6b7280' }}>User ID:</span>
                  <span style={{ color: '#111827', fontFamily: 'monospace', fontSize: '0.75rem' }}>{user.id}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#6b7280' }}>Email:</span>
                  <span style={{ color: '#111827' }}>{user.email}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#6b7280' }}>Session Active:</span>
                  <span style={{ color: session ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                    {session ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            {profile && (
              <div
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  User Profile
                </h2>

                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#6b7280' }}>Full Name:</span>
                    <span style={{ color: '#111827' }}>{profile.full_name || '(not set)'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#6b7280' }}>Organization ID:</span>
                    <span style={{ color: profile.org_id ? '#111827' : '#ef4444', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {profile.org_id || '⚠️ NOT SET (onboarding incomplete)'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#6b7280' }}>Role:</span>
                    {profile.role ? (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          width: 'fit-content',
                          textTransform: 'capitalize',
                          ...(profile.role === 'owner'
                            ? { backgroundColor: '#ddd6fe', color: '#5b21b6' }
                            : profile.role === 'coordinator'
                              ? { backgroundColor: '#dbeafe', color: '#1e40af' }
                              : { backgroundColor: '#d1fae5', color: '#065f46' }),
                        }}
                      >
                        {profile.role}
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444' }}>⚠️ NOT SET (onboarding incomplete)</span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#6b7280' }}>Created At:</span>
                    <span style={{ color: '#111827' }}>{new Date(profile.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {!profile.org_id && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px',
                    }}
                  >
                    <p style={{ color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                      <strong>⚠️ Onboarding Incomplete:</strong> You need to complete onboarding to access dashboard features. Please create or join an organization.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Database Counts */}
            {counts && profile?.org_id && (
              <div
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Database Records
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {Object.entries(counts).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        padding: '1rem',
                        backgroundColor: value > 0 ? '#f0fdf4' : '#f9fafb',
                        border: `1px solid ${value > 0 ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: value > 0 ? '#10b981' : '#9ca3af', marginBottom: '0.25rem' }}>
                        {value}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                        {key}
                      </div>
                    </div>
                  ))}
                </div>

                {Object.values(counts).every((v) => v === 0) && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ color: '#92400e', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                      <strong>No data found!</strong> Your organization has no records yet.
                    </p>
                    <a
                      href="/dev/seed-data"
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#EF7722',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'inline-block',
                      }}
                    >
                      Create Test Data →
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Quick Actions
              </h2>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <a
                  href="/dashboard"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#EF7722',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center',
                  }}
                >
                  Go to Dashboard
                </a>
                <a
                  href="/dev/seed-data"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'white',
                    color: '#EF7722',
                    border: '1px solid #EF7722',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center',
                  }}
                >
                  Seed Test Data
                </a>
                <button
                  onClick={() => loadData()}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
