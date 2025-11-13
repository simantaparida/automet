import { useRouter } from 'next/router';
import { Home, Briefcase, Users, MapPin, Wrench, Package, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab?: 'home' | 'jobs' | 'clients' | 'sites' | 'assets' | 'inventory' | 'profile';
}

export default function Sidebar({ activeTab = 'home' }: SidebarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isActive = (tab: string) => activeTab === tab;

  const handleSignOut = async () => {
    await signOut();
    router.push('/onboarding/welcome');
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
    { id: 'sites', label: 'Sites', icon: MapPin, path: '/sites' },
    { id: 'assets', label: 'Assets', icon: Wrench, path: '/assets' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <>
      <style jsx>{`
        @media (max-width: 767px) {
          .sidebar {
            display: none !important;
          }
        }
      `}</style>

      <aside
        className="sidebar"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '260px',
          background: 'linear-gradient(180deg, #ffffff 0%, #fff8f1 100%)',
          borderRight: '1px solid rgba(239,119,34,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo/Brand Section */}
        <div
          style={{
            padding: '1.5rem 1rem',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
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
                background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'white',
              }}
            >
              A
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0,
                }}
              >
                Automet
              </h1>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: 0,
                }}
              >
                Field Service
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.25rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: active
                    ? 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)'
                    : 'transparent',
                  color: active ? 'white' : '#4b5563',
                  fontSize: '0.9375rem',
                  fontWeight: active ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(239,119,34,0.1)';
                    e.currentTarget.style.color = '#EF7722';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4b5563';
                  }
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid rgba(239,119,34,0.1)',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239,119,34,0.05)',
              borderRadius: '8px',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    color: '#6b7280',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email || ''}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem',
              border: '1px solid rgba(239,119,34,0.3)',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#EF7722',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#EF7722';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#EF7722';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#EF7722';
              e.currentTarget.style.borderColor = 'rgba(239,119,34,0.3)';
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
