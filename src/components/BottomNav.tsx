import { useState } from 'react';
import { useRouter } from 'next/router';
import { Home, Briefcase, MoreHorizontal, Users, User, MapPin, Wrench, Package, X } from 'lucide-react';

interface BottomNavProps {
  activeTab?: 'home' | 'jobs' | 'more' | 'clients' | 'profile' | 'team';
}

export default function BottomNav({ activeTab = 'home' }: BottomNavProps) {
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (tab: string) => activeTab === tab;

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const navigateTo = (path: string) => {
    setShowMoreMenu(false);
    router.push(path);
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @media (min-width: 768px) {
          .bottom-nav {
            display: none !important;
          }
          .bottom-nav-overlay {
            display: none !important;
          }
          .bottom-nav-menu {
            display: none !important;
          }
        }
      `}</style>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div
          className="bottom-nav-overlay"
          onClick={() => setShowMoreMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 19,
          }}
        />
      )}

      {/* More Menu Slide-Up */}
      {showMoreMenu && (
        <div
          className="bottom-nav-menu"
          style={{
            position: 'fixed',
            bottom: '72px',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
            zIndex: 20,
            animation: 'slideUp 0.2s ease-out',
          }}
        >

          {/* Menu Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid rgba(239,119,34,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#EF7722',
                margin: 0,
              }}
            >
              More Options
            </h3>
            <button
              onClick={() => setShowMoreMenu(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '0.5rem 0' }}>
            {/* Sites */}
            <button
              onClick={() => navigateTo('/sites')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                backgroundColor: 'white',
                border: 'none',
                cursor: 'pointer',
                minHeight: '56px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff5ed')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff5ed',
                  borderRadius: '8px',
                  color: '#EF7722',
                }}
              >
                <MapPin size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1f2937',
                  }}
                >
                  Sites
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                  }}
                >
                  Manage client sites
                </div>
              </div>
            </button>

            {/* Assets */}
            <button
              onClick={() => navigateTo('/assets')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                backgroundColor: 'white',
                border: 'none',
                cursor: 'pointer',
                minHeight: '56px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff5ed')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff5ed',
                  borderRadius: '8px',
                  color: '#EF7722',
                }}
              >
                <Wrench size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1f2937',
                  }}
                >
                  Assets
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                  }}
                >
                  Track equipment & assets
                </div>
              </div>
            </button>

            {/* Inventory */}
            <button
              onClick={() => navigateTo('/inventory')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                backgroundColor: 'white',
                border: 'none',
                cursor: 'pointer',
                minHeight: '56px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff5ed')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff5ed',
                  borderRadius: '8px',
                  color: '#EF7722',
                }}
              >
                <Package size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1f2937',
                  }}
                >
                  Inventory
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                  }}
                >
                  Manage stock & supplies
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid rgba(239,119,34,0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.5rem 0',
          zIndex: 10,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {/* Home */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            minHeight: '56px',
          }}
        >
          <Home size={24} color={isActive('home') ? '#EF7722' : '#6b7280'} strokeWidth={isActive('home') ? 2.5 : 2} />
          <span
            style={{
              fontSize: '0.6875rem',
              color: isActive('home') ? '#EF7722' : '#6b7280',
              fontWeight: isActive('home') ? '600' : '500',
            }}
          >
            Home
          </span>
        </button>

        {/* Jobs */}
        <button
          onClick={() => router.push('/jobs')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            minHeight: '56px',
          }}
        >
          <Briefcase size={24} color={isActive('jobs') ? '#EF7722' : '#6b7280'} strokeWidth={isActive('jobs') ? 2.5 : 2} />
          <span
            style={{
              fontSize: '0.6875rem',
              color: isActive('jobs') ? '#EF7722' : '#6b7280',
              fontWeight: isActive('jobs') ? '600' : '500',
            }}
          >
            Jobs
          </span>
        </button>

        {/* More */}
        <button
          onClick={handleMoreClick}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            minHeight: '56px',
          }}
        >
          <MoreHorizontal size={24} color={isActive('more') ? '#EF7722' : '#6b7280'} strokeWidth={isActive('more') ? 2.5 : 2} />
          <span
            style={{
              fontSize: '0.6875rem',
              color: isActive('more') ? '#EF7722' : '#6b7280',
              fontWeight: isActive('more') ? '600' : '500',
            }}
          >
            More
          </span>
        </button>

        {/* Clients */}
        <button
          onClick={() => router.push('/clients')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            minHeight: '56px',
          }}
        >
          <Users size={24} color={isActive('clients') ? '#EF7722' : '#6b7280'} strokeWidth={isActive('clients') ? 2.5 : 2} />
          <span
            style={{
              fontSize: '0.6875rem',
              color: isActive('clients') ? '#EF7722' : '#6b7280',
              fontWeight: isActive('clients') ? '600' : '500',
            }}
          >
            Clients
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => router.push('/profile')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            minHeight: '56px',
          }}
        >
          <User size={24} color={isActive('profile') ? '#EF7722' : '#6b7280'} strokeWidth={isActive('profile') ? 2.5 : 2} />
          <span
            style={{
              fontSize: '0.6875rem',
              color: isActive('profile') ? '#EF7722' : '#6b7280',
              fontWeight: isActive('profile') ? '600' : '500',
            }}
          >
            Profile
          </span>
        </button>
      </nav>
    </>
  );
}
