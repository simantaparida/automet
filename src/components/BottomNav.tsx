import { useState } from 'react';
import { useRouter } from 'next/router';

interface BottomNavProps {
  activeTab?: 'home' | 'jobs' | 'more' | 'clients' | 'profile';
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
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div
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
          <style jsx>{`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Menu Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1f2937',
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
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              ✕
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
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
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
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🔧</span>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
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
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📦</span>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
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
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.5rem 0',
          zIndex: 10,
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
          <span style={{ fontSize: '1.5rem' }}>🏠</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: isActive('home') ? '#2563eb' : '#6b7280',
              fontWeight: isActive('home') ? '500' : '400',
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
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: isActive('jobs') ? '#2563eb' : '#6b7280',
              fontWeight: isActive('jobs') ? '500' : '400',
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
          <span style={{ fontSize: '1.5rem' }}>⋮⋮</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: isActive('more') ? '#2563eb' : '#6b7280',
              fontWeight: isActive('more') ? '500' : '400',
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
          <span style={{ fontSize: '1.5rem' }}>👥</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: isActive('clients') ? '#2563eb' : '#6b7280',
              fontWeight: isActive('clients') ? '500' : '400',
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
          <span style={{ fontSize: '1.5rem' }}>👤</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: isActive('profile') ? '#2563eb' : '#6b7280',
              fontWeight: isActive('profile') ? '500' : '400',
            }}
          >
            Profile
          </span>
        </button>
      </nav>
    </>
  );
}
