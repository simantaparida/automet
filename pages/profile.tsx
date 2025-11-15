import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import {
  User,
  Building2,
  Smartphone,
  Settings,
  HelpCircle,
  LogOut,
  Mail,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingOrg, setFetchingOrg] = useState(true);

  useEffect(() => {
    fetchOrganizationName();
  }, []);

  const fetchOrganizationName = async () => {
    try {
      // Try to fetch organization name from API
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrgName(data.name || 'My Organization');
      } else {
        setOrgName('My Organization');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setOrgName('My Organization');
    } finally {
      setFetchingOrg(false);
    }
  };

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

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return { bg: '#fef3c7', color: '#d97706', border: '#fbbf24' };
      case 'coordinator':
        return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' };
      case 'technician':
        return { bg: '#d1fae5', color: '#065f46', border: '#10b981' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  const roleStyle = getRoleColor(getUserRole());

  return (
    <ProtectedRoute>
      <style jsx>{`
        .profile-container {
          padding-bottom: 80px;
        }
        .main-content {
          padding: 1rem;
        }
        .mobile-header {
          display: block;
        }
        @media (min-width: 768px) {
          .profile-container {
            margin-left: 260px;
            padding-bottom: 0;
          }
          .main-content {
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
          }
          .mobile-header {
            display: none;
          }
        }
      `}</style>

      <div
        className="profile-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="profile" />

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
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0,
            }}
          >
            Profile
          </h1>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* User Info Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
              marginBottom: '1.5rem',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(239,119,34,0.3)',
                  border: '4px solid white',
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || (
                  <User size={48} color="white" />
                )}
              </div>
            </div>

            {/* User Details */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: '#111827',
                }}
              >
                {user?.email?.split('@')[0] || 'User'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <Mail size={16} color="#6b7280" />
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  {user?.email}
                </p>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: roleStyle.bg,
                  color: roleStyle.color,
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: `2px solid ${roleStyle.border}40`,
                }}
              >
                <Shield size={14} />
                <span>{getUserRole()}</span>
              </div>
            </div>

            {/* Organization Info */}
            <div
              style={{
                borderTop: '1px solid #f3f4f6',
                paddingTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
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
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <Building2 size={20} color="#EF7722" />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      margin: 0,
                      fontWeight: '500',
                    }}
                  >
                    Organization
                  </p>
                  <p
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0.25rem 0 0 0',
                    }}
                  >
                    {fetchingOrg ? 'Loading...' : orgName}
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
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <Smartphone size={20} color="#EF7722" />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      margin: 0,
                      fontWeight: '500',
                    }}
                  >
                    App Version
                  </p>
                  <p
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0.25rem 0 0 0',
                    }}
                  >
                    2.0.0 (MVP)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
              marginBottom: '1.5rem',
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
                padding: '1rem 1.25rem',
                backgroundColor: 'white',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'not-allowed',
                opacity: 0.6,
                minHeight: '64px',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <Settings size={18} color="#EF7722" />
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Settings
                </span>
              </div>
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                Coming Soon
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
                padding: '1rem 1.25rem',
                backgroundColor: 'white',
                border: 'none',
                cursor: 'not-allowed',
                opacity: 0.6,
                minHeight: '64px',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <HelpCircle size={18} color="#EF7722" />
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Help & Support
                </span>
              </div>
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                Coming Soon
              </span>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              minHeight: '56px',
              boxShadow: loading
                ? 'none'
                : '0 2px 8px rgba(239,68,68,0.25)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.25)';
              }
            }}
          >
            <LogOut size={20} />
            <span>{loading ? 'Signing Out...' : 'Sign Out'}</span>
          </button>

          {/* Info */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(239,119,34,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: '#EF7722',
                margin: 0,
                textAlign: 'center',
                fontWeight: '600',
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
