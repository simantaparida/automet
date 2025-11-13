import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [orgName] = useState('Sharma Services');
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push('/onboarding/welcome');
    } catch (error) {
      console.error('Sign out error:', error);
      setLoading(false);
    }
  };

  const getUserRole = () => {
    if (!user) return 'User';
    // You can extend this based on user metadata
    return user.email?.includes('owner')
      ? 'Owner'
      : user.email?.includes('coordinator')
        ? 'Coordinator'
        : user.email?.includes('tech')
          ? 'Technician'
          : 'User';
  };

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          paddingBottom: '80px',
        }}
      >
        {/* Sticky Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              Profile
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '1rem' }}>
          {/* User Info Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '1rem',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: 'white',
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || '👤'}
              </div>
            </div>

            {/* User Details */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#1f2937',
                }}
              >
                {user?.email?.split('@')[0] || 'User'}
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {user?.email}
              </p>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginTop: '0.5rem',
                }}
              >
                {getUserRole()}
              </div>
            </div>

            {/* Organization Info */}
            <div
              style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🏢</span>
                <div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: 0,
                    }}
                  >
                    Organization
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: 0,
                    }}
                  >
                    {orgName}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>📱</span>
                <div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: 0,
                    }}
                  >
                    App Version
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: 0,
                    }}
                  >
                    1.0.0 (MVP)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '1rem',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => router.push('/settings')}
              disabled
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'white',
                border: 'none',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'not-allowed',
                opacity: 0.5,
                minHeight: '56px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>⚙️</span>
                <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  Settings
                </span>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                (Coming Soon)
              </span>
            </button>

            <button
              onClick={() => router.push('/help')}
              disabled
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'white',
                border: 'none',
                cursor: 'not-allowed',
                opacity: 0.5,
                minHeight: '56px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>❓</span>
                <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  Help & Support
                </span>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                (Coming Soon)
              </span>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading ? '#9ca3af' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              minHeight: '56px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {loading ? 'Signing Out...' : '🚪 Sign Out'}
          </button>

          {/* Info */}
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: '#1e40af',
                margin: 0,
                textAlign: 'center',
              }}
            >
              Automet Field Service Management
            </p>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab="profile" />
      </div>
    </ProtectedRoute>
  );
}
