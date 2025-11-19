import { useRouter } from 'next/router';
import { Home, Briefcase, Users, MapPin, Wrench, Package, User, Users2 } from 'lucide-react';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';

interface SidebarProps {
  activeTab?: 'home' | 'jobs' | 'clients' | 'sites' | 'assets' | 'inventory' | 'profile' | 'team';
}

export default function Sidebar({ activeTab = 'home' }: SidebarProps) {
  const router = useRouter();
  const { activeRole } = useRoleSwitch();

  const isActive = (tab: string) => activeTab === tab;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
    { id: 'sites', label: 'Sites', icon: MapPin, path: '/sites' },
    { id: 'assets', label: 'Assets', icon: Wrench, path: '/assets' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  // Add Team link for owners and coordinators
  if (activeRole === 'owner' || activeRole === 'coordinator') {
    // Insert after Clients (index 2)
    navItems.splice(2, 0, { id: 'team', label: 'Team', icon: Users2, path: '/team' });
  }

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
          top: '64px',
          bottom: 0,
          width: '260px',
          background: '#f7f7f7',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.5rem',
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
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  marginBottom: '0.125rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: active
                    ? 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)'
                    : 'transparent',
                  color: active ? 'white' : '#4b5563',
                  fontSize: '0.875rem',
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
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
