import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';

interface DashboardStats {
  scheduledJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  totalClients: number;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    scheduledJobs: 0,
    inProgressJobs: 0,
    completedJobs: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch jobs by status to get accurate counts
        const [scheduledRes, inProgressRes, completedRes, verifyRes] =
          await Promise.all([
            fetch('/api/jobs?status=scheduled'),
            fetch('/api/jobs?status=in_progress'),
            fetch('/api/jobs?status=completed'),
            fetch('/api/verify-data'),
          ]);

        const scheduled = await scheduledRes.json();
        const inProgress = await inProgressRes.json();
        const completed = await completedRes.json();
        const verifyData = await verifyRes.json();

        setStats({
          scheduledJobs: Array.isArray(scheduled) ? scheduled.length : 0,
          inProgressJobs: Array.isArray(inProgress) ? inProgress.length : 0,
          completedJobs: Array.isArray(completed) ? completed.length : 0,
          totalClients: verifyData.clients || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          paddingBottom: '80px', // Space for bottom nav
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
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
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '1rem' }}>
          {/* Welcome Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '1rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}
            >
              Welcome! 👋
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Here's your overview for today
            </p>
          </div>

          {/* Job Status Stats - Clickable Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            {/* Scheduled Jobs */}
            <button
              onClick={() => router.push('/jobs?status=scheduled')}
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: 'none',
                cursor: 'pointer',
                minHeight: '100px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                📅
              </div>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.scheduledJobs}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: 0,
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
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: 'none',
                cursor: 'pointer',
                minHeight: '100px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                🔧
              </div>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.inProgressJobs}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: 0,
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
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: 'none',
                cursor: 'pointer',
                minHeight: '100px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                ✅
              </div>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.completedJobs}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: 0,
                }}
              >
                Completed
              </p>
            </button>

            {/* Total Clients */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                minHeight: '100px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#e0e7ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                👥
              </div>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {loading ? '...' : stats.totalClients}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: 0,
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
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '1rem',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <button
                onClick={() => router.push('/jobs/new')}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>➕</span> Create New Job
              </button>
              <button
                onClick={() => router.push('/jobs')}
                style={{
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: '1px solid #2563eb',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>📋</span> View All Jobs
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
              <strong>Mobile-First PWA Ready!</strong> You can use this app on
              any device. Tap the job status cards above to filter jobs by
              status.
            </p>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab="home" />
      </div>
    </ProtectedRoute>
  );
}
