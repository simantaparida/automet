import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface Job {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_at: string;
  completed_at?: string;
  client: { id: string; name: string } | null;
  site: { id: string; name: string; address: string } | null;
  asset: { id: string; asset_type: string; model: string } | null;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [activeTab, filterPriority]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (filterPriority) params.append('priority', filterPriority);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const tabCounts = {
    all: jobs.length,
    scheduled: jobs.filter((j) => j.status === 'scheduled').length,
    in_progress: jobs.filter((j) => j.status === 'in_progress').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
  };

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          paddingBottom: '80px', // Space for bottom nav
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Mobile Header */}
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
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0 0 0.5rem 0',
            }}
          >
            Jobs
          </h1>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            {jobs.length} total
          </p>
        </header>

        {/* Status Tabs (Horizontal Scroll on Mobile) */}
        <div
          style={{
            backgroundColor: 'white',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: '66px',
            zIndex: 9,
          }}
        >
          <div style={{ display: 'inline-flex', padding: '0.5rem' }}>
            {[
              { key: 'all', label: 'All', count: tabCounts.all },
              {
                key: 'scheduled',
                label: 'Scheduled',
                count: tabCounts.scheduled,
              },
              {
                key: 'in_progress',
                label: 'In Progress',
                count: tabCounts.in_progress,
              },
              {
                key: 'completed',
                label: 'Completed',
                count: tabCounts.completed,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.625rem 1rem',
                  margin: '0 0.25rem',
                  backgroundColor:
                    activeTab === tab.key ? '#2563eb' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: '44px', // iOS touch target
                }}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        {activeTab !== 'completed' && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white',
                minHeight: '44px', // iOS touch target
              }}
            >
              <option value="">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        )}

        {/* Jobs List */}
        <main style={{ padding: '1rem' }}>
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#6b7280',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
              Loading jobs...
              <style jsx>{`
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
          ) : jobs.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                padding: '3rem 1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p
                style={{
                  fontSize: '1.125rem',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                No jobs found
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                }}
              >
                {activeTab === 'all'
                  ? 'Create your first job to get started'
                  : `No ${activeTab.replace('_', ' ')} jobs`}
              </p>
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${getStatusColor(job.status)}`,
                    minHeight: '44px', // Touch target
                    WebkitTapHighlightColor: 'rgba(37, 99, 235, 0.1)',
                  }}
                >
                  {/* Job Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          margin: '0 0 0.25rem 0',
                          color: '#1f2937',
                          lineHeight: '1.4',
                        }}
                      >
                        {job.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          margin: 0,
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {job.description}
                      </p>
                    </div>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                      {getPriorityIcon(job.priority)}
                    </span>
                  </div>

                  {/* Job Info */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {job.client && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ opacity: 0.6 }}>🏢</span>
                        <span style={{ color: '#374151', fontWeight: '500' }}>
                          {job.client.name}
                        </span>
                      </div>
                    )}
                    {job.site && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ opacity: 0.6 }}>📍</span>
                        <span style={{ color: '#6b7280' }}>
                          {job.site.name}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ opacity: 0.6 }}>⏰</span>
                      <span style={{ color: '#6b7280' }}>
                        {formatDate(job.scheduled_at)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: `${getStatusColor(job.status)}15`,
                        color: getStatusColor(job.status),
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                      }}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        <button
          onClick={() => router.push('/jobs/new')}
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '5rem',
            width: '56px',
            height: '56px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>

        <BottomNav activeTab="jobs" />
      </div>
    </ProtectedRoute>
  );
}
