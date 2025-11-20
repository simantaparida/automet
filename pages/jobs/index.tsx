import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import EmptyState from '@/components/EmptyState';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import {
  Plus,
  MapPin,
  Clock,
  AlertCircle,
  AlertTriangle,
  Circle,
  CheckCircle,
  Loader2,
  CheckSquare,
  Square,
  Trash2,
  Download,
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
  const { status, priority } = router.query;
  const { apiFetch, activeRole } = useRoleSwitch();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(() => (status as string) || 'all');
  const [filterPriority, setFilterPriority] = useState<string>(() => (priority as string) || '');
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('status', activeTab);
    if (filterPriority) params.set('priority', filterPriority);

    const queryString = params.toString();
    const newUrl = queryString ? `/jobs?${queryString}` : '/jobs';

    // Update URL without triggering a page reload
    const currentPath = router.asPath.split('?')[0];
    const currentQuery = new URLSearchParams(router.asPath.split('?')[1] || '');
    const newQuery = new URLSearchParams(queryString);

    // Only update if query params changed
    if (
      currentPath !== '/jobs' ||
      currentQuery.get('status') !== newQuery.get('status') ||
      currentQuery.get('priority') !== newQuery.get('priority')
    ) {
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [activeTab, filterPriority, router]);

  useEffect(() => {
    fetchJobs();
  }, [activeTab, filterPriority]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (filterPriority) params.append('priority', filterPriority);

      const response = await apiFetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };



  // Selection handlers
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedJobs(new Set());
    }
  };

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedJobs.size === jobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(jobs.map((job) => job.id)));
    }
  };

  // Bulk actions
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedJobs.size === 0) return;

    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedJobs).map((jobId) =>
        apiFetch(`/api/jobs/${jobId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        })
      );

      await Promise.all(promises);
      setSelectedJobs(new Set());

      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error updating jobs:', error);
      alert('Failed to update jobs. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobs.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedJobs.size} job(s)? This action cannot be undone.`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedJobs).map((jobId) =>
        apiFetch(`/api/jobs/${jobId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      setSelectedJobs(new Set());

      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting jobs:', error);
      alert('Failed to delete jobs. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedJobs.size === 0) return;

    const selectedJobsData = jobs.filter((job) => selectedJobs.has(job.id));
    const csv = [
      ['Title', 'Status', 'Priority', 'Client', 'Site', 'Scheduled At'].join(','),
      ...selectedJobsData.map((job) =>
        [
          `"${job.title}"`,
          job.status,
          job.priority,
          `"${job.client?.name || ''}"`,
          `"${job.site?.name || ''}"`,
          job.scheduled_at,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  // Get counts
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
        .desktop-header {
          display: none;
        }
        .job-info {
          flex-direction: column;
        }
        .job-info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .jobs-container {
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
          .mobile-header.status-tabs {
            top: 64px !important;
          }
          .job-info {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .job-info-item:not(:last-child)::after {
            content: '•';
            margin-left: 0.5rem;
            color: #d1d5db;
          }
        }
      `}</style>

      <div className="jobs-container min-h-screen bg-white">
        {/* Desktop Sidebar */}
        <Sidebar activeTab="jobs" />

        {/* Desktop Top Header with Glassmorphism */}
        <div className="desktop-header fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/80 border-b border-primary/10">
          <TopHeader />
        </div>

        {/* Desktop Role Badge - Shows when role is switched */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Mobile Header */}
        <header className="mobile-header bg-gradient-to-br from-primary to-orange-500 text-white p-4 sticky top-0 z-20 shadow-lg shadow-primary/20">
          <h1 className="text-xl font-bold m-0 mb-2">
            Jobs
          </h1>
          <p className="text-sm m-0 opacity-90">
            {jobs.length} total
          </p>
        </header>

        {/* Desktop Page Header */}
        <div className="desktop-header px-8 pt-8 pb-3">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-gray-900 m-0">
              Jobs
            </h1>
            {activeRole !== 'technician' && (
              <button
                onClick={() => router.push('/jobs/new')}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-semibold shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/35"
              >
                <Plus size={18} />
                Create New Job
              </button>
            )}
          </div>
        </div>

        {/* Desktop: Tabs, Sort by, and Select in One Line */}
        <div className="desktop-header bg-transparent px-8 border-b-2 border-gray-200 flex justify-between items-center">
          {/* Tabs */}
          <div className="flex gap-0 items-center">
            {[
              { key: 'all', label: activeRole === 'technician' ? 'My Jobs' : 'All', count: tabCounts.all },
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
                className={`px-4 py-3 bg-transparent border-none text-[13px] whitespace-nowrap transition-all -mb-0.5 ${activeTab === tab.key
                  ? 'text-primary font-semibold border-b-[3px] border-primary'
                  : 'text-gray-500 font-medium border-b-[3px] border-transparent hover:text-primary'
                  }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>

          {/* Sort by and Select */}
          <div className="flex gap-3 items-center -mb-0.5">
            {activeTab !== 'completed' && (
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-[13px] bg-white outline-none transition-colors cursor-pointer focus:border-primary"
              >
                <option value="">Sort by Priority</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            )}
            {activeRole !== 'technician' && (
              <button
                onClick={toggleSelectMode}
                className={`px-3 py-2 rounded-md text-[13px] font-medium cursor-pointer flex items-center gap-1.5 transition-all whitespace-nowrap ${isSelectMode
                  ? 'bg-primary text-white border border-primary'
                  : 'bg-white text-primary border border-gray-300 hover:bg-orange-50'
                  }`}
              >
                {isSelectMode ? <CheckSquare size={16} /> : <Square size={16} />}
                {isSelectMode ? 'Done' : 'Select'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Status Tabs */}
        <div
          className="status-tabs mobile-header"
          style={{
            backgroundColor: 'white',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
            position: 'sticky',
            top: '66px',
            zIndex: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '0.75rem 1rem', gap: '0.5rem' }}>
            {[
              { key: 'all', label: activeRole === 'technician' ? 'My Jobs' : 'All', count: tabCounts.all },
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



        {/* Bulk Actions Toolbar */}
        {isSelectMode && selectedJobs.size > 0 && (
          <div
            style={{
              backgroundColor: '#fff5ed',
              borderBottom: '2px solid #EF7722',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              position: 'sticky',
              top: '214px',
              zIndex: 17,
              boxShadow: '0 2px 8px rgba(239,119,34,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <button
                onClick={toggleSelectAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#111827',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  padding: '0.5rem',
                }}
              >
                {selectedJobs.size === jobs.length ? (
                  <CheckSquare size={20} color="#EF7722" />
                ) : (
                  <Square size={20} color="#6b7280" />
                )}
                <span>
                  {selectedJobs.size === jobs.length
                    ? 'Deselect All'
                    : `Select All (${jobs.length})`}
                </span>
              </button>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500',
                }}
              >
                {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative',
              }}
            >
              {/* Bulk Status Update */}
              {activeTab !== 'completed' && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusUpdate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={bulkActionLoading}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #EF7722',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: 'white',
                    color: '#EF7722',
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="">Update Status...</option>
                  {activeTab !== 'scheduled' && (
                    <option value="scheduled">Mark as Scheduled</option>
                  )}
                  {activeTab !== 'in_progress' && (
                    <option value="in_progress">Mark as In Progress</option>
                  )}
                  {activeTab !== 'completed' && (
                    <option value="completed">Mark as Completed</option>
                  )}
                  <option value="cancelled">Mark as Cancelled</option>
                </select>
              )}
              <button
                onClick={handleBulkExport}
                disabled={bulkActionLoading}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'white',
                  color: '#EF7722',
                  border: '1px solid #EF7722',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkActionLoading) {
                    e.currentTarget.style.backgroundColor = '#fff5ed';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!bulkActionLoading) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'white',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkActionLoading) {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!bulkActionLoading) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <main className="main-content">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="text-sm text-gray-600 mt-4">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No jobs found"
              description={activeTab === 'all' ? 'Create your first job to get started' : `No ${activeTab.replace('_', ' ')} jobs`}
            />
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
                    onClick={(e) => {
                      if (isSelectMode) {
                        e.stopPropagation();
                        toggleJobSelection(job.id);
                      } else {
                        router.push(`/jobs/${job.id}`);
                      }
                    }}
                    style={{
                      backgroundColor: selectedJobs.has(job.id) ? '#fff5ed' : '#fafafa',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      cursor: isSelectMode ? 'default' : 'pointer',
                      borderLeft: `4px solid ${getStatusColor(job.status)}`,
                      border: selectedJobs.has(job.id)
                        ? `2px solid #EF7722`
                        : `1px solid #e5e7eb`,
                      borderLeftWidth: '4px',
                      borderLeftColor: getStatusColor(job.status),
                      minHeight: '44px',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelectMode) {
                        e.currentTarget.style.borderColor = '#EF7722';
                        e.currentTarget.style.borderLeftColor = getStatusColor(job.status);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelectMode) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.borderLeftColor = getStatusColor(job.status);
                      }
                    }}
                  >
                    {/* Checkbox - Only visible in select mode */}
                    {isSelectMode && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem',
                          zIndex: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleJobSelection(job.id);
                        }}
                      >
                        {selectedJobs.has(job.id) ? (
                          <CheckSquare size={24} color="#EF7722" style={{ cursor: 'pointer' }} />
                        ) : (
                          <Square size={24} color="#6b7280" style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                    )}

                    {/* Job Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                        marginLeft: isSelectMode ? '2.5rem' : '0',
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
                      {/* Status and Priority Icon on Right */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.625rem',
                            backgroundColor: `${getStatusColor(job.status)}15`,
                            color: getStatusColor(job.status),
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                          }}
                        >
                          {job.status.replace('_', ' ')}
                        </span>
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
                    </div>

                    {/* Job Info */}
                    <div
                      className="job-info"
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        fontSize: '0.8125rem',
                        alignItems: 'center',
                      }}
                    >
                      {job.site && (
                        <div className="job-info-item" style={{ color: '#6b7280' }}>
                          <MapPin size={14} color="#6b7280" />
                          <span>{job.site.name}</span>
                        </div>
                      )}
                      <div className="job-info-item" style={{ color: '#6b7280' }}>
                        <Clock size={14} color="#6b7280" />
                        <span>{formatDate(job.scheduled_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <BottomNav activeTab="jobs" />
      </div>
    </ProtectedRoute>
  );
}
