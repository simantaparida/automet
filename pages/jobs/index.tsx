import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import {
  Plus,
  Building2,
  MapPin,
  Clock,
  AlertCircle,
  AlertTriangle,
  Circle,
  CheckCircle,
  Loader2,
  Search,
  X,
  Filter,
  CheckSquare,
  Square,
  MoreVertical,
  Trash2,
  Download,
  FileText,
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
  const { status, priority, search: searchParam } = router.query;
  const { apiFetch, activeRole } = useRoleSwitch();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(() => (status as string) || 'all');
  const [filterPriority, setFilterPriority] = useState<string>(() => (priority as string) || '');
  const [searchQuery, setSearchQuery] = useState<string>(() => (searchParam as string) || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('status', activeTab);
    if (filterPriority) params.set('priority', filterPriority);
    if (searchQuery) params.set('search', searchQuery);
    
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
      currentQuery.get('priority') !== newQuery.get('priority') ||
      currentQuery.get('search') !== newQuery.get('search')
    ) {
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [activeTab, filterPriority, searchQuery, router]);

  useEffect(() => {
    fetchJobs();
  }, [activeTab, filterPriority]);

  // Client-side search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setJobs(allJobs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.client?.name.toLowerCase().includes(query) ||
        job.site?.name.toLowerCase().includes(query)
    );
    setJobs(filtered);
  }, [searchQuery, allJobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (filterPriority) params.append('priority', filterPriority);

      const response = await apiFetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();
      const fetchedJobs = data.jobs || [];
      setAllJobs(fetchedJobs);
      // Apply client-side search if exists
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const filtered = fetchedJobs.filter(
          (job: Job) =>
            job.title.toLowerCase().includes(query) ||
            job.description?.toLowerCase().includes(query) ||
            job.client?.name.toLowerCase().includes(query) ||
            job.site?.name.toLowerCase().includes(query)
        );
        setJobs(filtered);
      } else {
        setJobs(fetchedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setActiveTab('all');
    setFilterPriority('');
    setSearchQuery('');
  };

  const hasActiveFilters = activeTab !== 'all' || filterPriority || searchQuery;

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
      setShowBulkMenu(false);
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
      setShowBulkMenu(false);
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

  // Get counts from allJobs (not filtered by search)
  const tabCounts = {
    all: allJobs.length,
    scheduled: allJobs.filter((j) => j.status === 'scheduled').length,
    in_progress: allJobs.filter((j) => j.status === 'in_progress').length,
    completed: allJobs.filter((j) => j.status === 'completed').length,
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
        .desktop-header {
          display: none;
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
          .desktop-search-bar {
            top: 64px !important;
          }
          .status-tabs {
            top: 156px !important;
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

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

        {/* Desktop Role Badge - Shows when role is switched */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

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

        {/* Search Bar */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
            position: 'sticky',
            top: '66px',
            zIndex: 19,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
          className="desktop-search-bar"
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search jobs by title, description, client, or site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EF7722';
                  e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#EF7722';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '0.625rem 1rem',
                  background: 'white',
                  color: '#EF7722',
                  border: '1px solid #EF7722',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: '44px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff5ed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div
          className="status-tabs"
          style={{
            backgroundColor: 'white',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
            position: 'sticky',
            top: '158px',
            zIndex: 18,
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
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                flex: 1,
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
            {/* Hide select mode button for technicians */}
            {activeRole !== 'technician' && (
              <button
                onClick={toggleSelectMode}
                style={{
                  padding: '0.75rem 1rem',
                  background: isSelectMode
                    ? 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)'
                    : 'white',
                  color: isSelectMode ? 'white' : '#EF7722',
                  border: '1px solid #EF7722',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isSelectMode) {
                    e.currentTarget.style.backgroundColor = '#fff5ed';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelectMode) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {isSelectMode ? <CheckSquare size={18} /> : <Square size={18} />}
                {isSelectMode ? 'Done' : 'Select'}
              </button>
            )}
          </div>
        )}

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
              top: searchQuery ? '214px' : '214px',
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
                {searchQuery
                  ? 'No jobs match your search'
                  : activeTab === 'all'
                  ? 'Create your first job to get started'
                  : `No ${activeTab.replace('_', ' ')} jobs`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Clear Search
                </button>
              )}
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
                    onClick={(e) => {
                      if (isSelectMode) {
                        e.stopPropagation();
                        toggleJobSelection(job.id);
                      } else {
                        router.push(`/jobs/${job.id}`);
                      }
                    }}
                    style={{
                      backgroundColor: selectedJobs.has(job.id) ? '#fff5ed' : 'white',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      cursor: isSelectMode ? 'default' : 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                      borderLeft: `4px solid ${getStatusColor(job.status)}`,
                      border: selectedJobs.has(job.id)
                        ? `2px solid #EF7722`
                        : `1px solid rgba(239,119,34,0.1)`,
                      borderLeftWidth: '4px',
                      borderLeftColor: getStatusColor(job.status),
                      minHeight: '44px',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelectMode) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelectMode) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
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

        {/* Floating Action Button - Hide for technicians */}
        {activeRole !== 'technician' && (
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
        )}

        <BottomNav activeTab="jobs" />
      </div>
    </ProtectedRoute>
  );
}
