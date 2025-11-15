import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import { supabase } from '@/lib/supabase';
import { Calendar, Wrench, CheckCircle2, Users, Plus, ClipboardList, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  scheduledJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  totalClients: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { apiFetch } = useRoleSwitch();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    scheduledJobs: 0,
    inProgressJobs: 0,
    completedJobs: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);

  // Check if user has organization
  useEffect(() => {
    const checkOrganization = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', user.id)
          .maybeSingle();

        const userData = data as { org_id: string | null } | null;
        setHasOrganization(!!userData?.org_id);
      } catch (error) {
        console.error('Error checking organization:', error);
        setHasOrganization(false);
      }
    };

    checkOrganization();
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      // Don't fetch stats if user doesn't have an organization
      if (hasOrganization === false) {
        setLoading(false);
        return;
      }

      try {
        // Use apiFetch to include authentication headers (X-Active-Role)
        // Fetch jobs by status to get accurate counts
        const [scheduledRes, inProgressRes, completedRes, clientsRes] =
          await Promise.all([
            apiFetch('/api/jobs?status=scheduled'),
            apiFetch('/api/jobs?status=in_progress'),
            apiFetch('/api/jobs?status=completed'),
            apiFetch('/api/clients'),
          ]);

        // Parse job responses - jobs API returns { jobs: [...], total: ... }
        const scheduledData = await scheduledRes.json();
        const inProgressData = await inProgressRes.json();
        const completedData = await completedRes.json();
        const clients = await clientsRes.json();

        // Handle both array responses (old format) and object responses (new format)
        const scheduledJobs = Array.isArray(scheduledData) 
          ? scheduledData 
          : (scheduledData?.jobs || []);
        const inProgressJobs = Array.isArray(inProgressData) 
          ? inProgressData 
          : (inProgressData?.jobs || []);
        const completedJobs = Array.isArray(completedData) 
          ? completedData 
          : (completedData?.jobs || []);
        const clientsList = Array.isArray(clients) ? clients : [];

        setStats({
          scheduledJobs: scheduledJobs.length,
          inProgressJobs: inProgressJobs.length,
          completedJobs: completedJobs.length,
          totalClients: clientsList.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hasOrganization !== null && apiFetch) {
      fetchStats();
    }
  }, [hasOrganization, apiFetch]);

  return (
    <ProtectedRoute>
      <style jsx>{`
        .dashboard-container {
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
          .dashboard-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content {
            padding: 2rem;
          }
          .mobile-header {
            display: none;
          }
          .desktop-header {
            display: block;
          }
          .dashboard-container:has(.desktop-header:has(.role-badge)) {
            padding-top: 96px;
          }
        }
      `}</style>

      <div
        className="dashboard-container"
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

        {/* Desktop Role Badge - Shows when role is switched */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Mobile Header - Only visible on mobile */}
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                Dashboard
              </h1>
              <p
                style={{
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0',
                  opacity: 0.9,
                }}
              >
                {user?.email}
              </p>
            </div>
          </div>
        </header>

        {/* Setup Banner - Show if user doesn't have organization */}
        {hasOrganization === false && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              borderLeft: '4px solid #EF7722',
              padding: '1rem',
              margin: '1rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(239,119,34,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(239,119,34,0.1)',
                  borderRadius: '8px',
                  color: '#EF7722',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#92400e',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Complete your setup
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#78350f', margin: '0 0 0.75rem 0' }}>
                  You skipped the onboarding process. Complete your company setup to start using all features.
                </p>
                <button
                  onClick={() => router.push('/onboarding/company')}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(239,119,34,0.3)',
                  }}
                >
                  Complete setup now →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="main-content">
          {/* Welcome Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#111827',
              }}
            >
              Welcome! 👋
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#6b7280', margin: 0 }}>
              Here's your overview for today
            </p>
          </div>

          {/* Job Status Stats - Clickable Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Scheduled Jobs */}
            <button
              onClick={() => router.push('/jobs?status=scheduled')}
              style={{
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                border: '1px solid rgba(239,119,34,0.1)',
                cursor: 'pointer',
                minHeight: '120px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  color: '#EF7722',
                }}
              >
                <Calendar size={24} />
              </div>
              <p
                style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.scheduledJobs}
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                Scheduled
              </p>
            </button>

            {/* In Progress Jobs */}
            <button
              onClick={() => router.push('/jobs?status=in_progress')}
              style={{
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                border: '1px solid rgba(239,119,34,0.1)',
                cursor: 'pointer',
                minHeight: '120px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  color: '#f59e0b',
                }}
              >
                <Wrench size={24} />
              </div>
              <p
                style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.inProgressJobs}
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                In Progress
              </p>
            </button>

            {/* Completed Jobs */}
            <button
              onClick={() => router.push('/jobs?status=completed')}
              style={{
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                border: '1px solid rgba(239,119,34,0.1)',
                cursor: 'pointer',
                minHeight: '120px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  color: '#10b981',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <p
                style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.completedJobs}
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                Completed
              </p>
            </button>

            {/* Total Clients */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                border: '1px solid rgba(239,119,34,0.1)',
                minHeight: '120px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  color: '#6366f1',
                }}
              >
                <Users size={24} />
              </div>
              <p
                style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.totalClients}
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                Clients
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#111827',
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <button
                onClick={() => router.push('/jobs/new')}
                style={{
                  background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
                }}
              >
                <Plus size={20} /> Create New Job
              </button>
              <button
                onClick={() => router.push('/jobs')}
                style={{
                  backgroundColor: 'white',
                  color: '#EF7722',
                  border: '2px solid #EF7722',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff5ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <ClipboardList size={20} /> View All Jobs
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '2px solid rgba(239,119,34,0.2)',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0, lineHeight: '1.6' }}>
              <strong style={{ color: '#EF7722' }}>Mobile-First PWA Ready!</strong> You can use this app on
              any device. Tap the job status cards above to filter jobs by
              status.
            </p>
          </div>
        </main>

        {/* Bottom Navigation - Only visible on mobile */}
        <BottomNav activeTab="home" />
      </div>
    </ProtectedRoute>
  );
}
