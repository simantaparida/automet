import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import {
  Plus,
  Building2,
  MapPin,
  Clock,
  AlertCircle,
  AlertTriangle,
  Circle,
  CheckCircle,
  Loader2
} from 'lucide-react';

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
        return '#EF7722';
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

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2' };
      case 'high':
        return { icon: AlertTriangle, color: '#EF7722', bg: '#fff5ed' };
      case 'medium':
        return { icon: Circle, color: '#f59e0b', bg: '#fef3c7' };
      case 'low':
        return { icon: CheckCircle, color: '#10b981', bg: '#d1fae5' };
      default:
        return { icon: Circle, color: '#6b7280', bg: '#f3f4f6' };
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
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .jobs-container {
          padding-bottom: 80px;
        }
        .main-content {
          padding: 1rem;
        }
        .mobile-header {
          display: block;
        }
        .fab-button {
          bottom: 5rem;
        }
        @media (min-width: 768px) {
          .jobs-container {
            margin-left: 260px;
            padding-bottom: 0;
          }
          .main-content {
            padding: 2rem;
          }
          .mobile-header {
            display: none;
          }
          .fab-button {
            bottom: 2rem;
          }
        }
      `}</style>

      <div
        className="jobs-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="jobs" />

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
              margin: '0 0 0.5rem 0',
            }}
          >
            Jobs
          </h1>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            {jobs.length} total
          </p>
        </header>

        {/* Status Tabs */}
        <div
          style={{
            backgroundColor: 'white',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
            position: 'sticky',
            top: '66px',
            zIndex: 19,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '0.75rem 1rem', gap: '0.5rem' }}>
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
                  padding: '0.625rem 1.25rem',
                  background:
                    activeTab === tab.key
                      ? 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)'
                      : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#6b7280',
                  border: activeTab === tab.key ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab.key ? '600' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: '44px',
                  transition: 'all 0.2s',
                  boxShadow:
                    activeTab === tab.key
                      ? '0 2px 8px rgba(239,119,34,0.25)'
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = '#fff5ed';
                    e.currentTarget.style.borderColor = '#EF7722';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }
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
              borderBottom: '1px solid rgba(239,119,34,0.1)',
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
                fontSize: '0.9375rem',
                backgroundColor: 'white',
                minHeight: '44px',
                outline: 'none',
                transition: 'border-color 0.2s',
                cursor: 'pointer',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
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
        <main className="main-content">
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Loader2 size={40} color="#EF7722" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              Loading jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                padding: '3rem 1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(239,119,34,0.1)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 1.5rem',
                  background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF7722',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
              </div>
              <p
                style={{
                  fontSize: '1.25rem',
                  color: '#111827',
                  marginBottom: '0.5rem',
                  fontWeight: '700',
                }}
              >
                No jobs found
              </p>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: '#6b7280',
                  marginBottom: 0,
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
              {jobs.map((job) => {
                const priorityConfig = getPriorityConfig(job.priority);
                const PriorityIcon = priorityConfig.icon;

                return (
                  <div
                    key={job.id}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    style={{
                      backgroundColor: 'white',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                      borderLeft: `4px solid ${getStatusColor(job.status)}`,
                      border: `1px solid rgba(239,119,34,0.1)`,
                      borderLeftWidth: '4px',
                      borderLeftColor: getStatusColor(job.status),
                      minHeight: '44px',
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
                    {/* Job Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                        <h3
                          style={{
                            fontSize: '1.0625rem',
                            fontWeight: '700',
                            margin: '0 0 0.25rem 0',
                            color: '#111827',
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
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {job.description}
                        </p>
                      </div>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: priorityConfig.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <PriorityIcon size={20} color={priorityConfig.color} />
                      </div>
                    </div>

                    {/* Job Info */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
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
                          <Building2 size={16} color="#6b7280" />
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
                          <MapPin size={16} color="#6b7280" />
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
                        <Clock size={16} color="#6b7280" />
                        <span style={{ color: '#6b7280' }}>
                          {formatDate(job.scheduled_at)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.875rem',
                          backgroundColor: `${getStatusColor(job.status)}15`,
                          color: getStatusColor(job.status),
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        <button
          onClick={() => router.push('/jobs/new')}
          className="fab-button"
          style={{
            position: 'fixed',
            right: '1.5rem',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(239,119,34,0.4)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,119,34,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,119,34,0.4)';
          }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>

        <BottomNav activeTab="jobs" />
      </div>
    </ProtectedRoute>
  );
}
