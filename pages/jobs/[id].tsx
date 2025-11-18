import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Wrench,
  User,
  Phone,
  Mail,
  Navigation,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  X,
  Play,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_at: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  started_at?: string | null;
  client: {
    id: string;
    name: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
  } | null;
  site: {
    id: string;
    name: string;
    address?: string;
    gps_lat?: number | null;
    gps_lng?: number | null;
  } | null;
  asset: {
    id: string;
    asset_type: string;
    model?: string | null;
    serial_number?: string | null;
  } | null;
  assignments: Array<{
    id: string;
    started_at: string | null;
    completed_at: string | null;
    checked_in_at?: string | null;
    checked_out_at?: string | null;
    notes: string | null;
    user: {
      id: string;
      email: string;
      full_name?: string;
      contact_phone?: string;
      role: string;
    };
  }>;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { apiFetch, activeRole } = useRoleSwitch();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/jobs/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch job');
      }
      const data = await response.json();
      if (!data.job) {
        throw new Error('Job not found');
      }
      setJob(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
      alert(error instanceof Error ? error.message : 'Failed to load job');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (newStatus: string) => {
    if (!job) return;

    setUpdating(true);
    try {
      const updates: any = { status: newStatus };

      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const response = await apiFetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchJob();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job status');
    } finally {
      setUpdating(false);
    }
  };

  const deleteJob = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await apiFetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/jobs');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiFetch('/api/users?role=technician');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedUserId) return;

    try {
      const response = await apiFetch(`/api/jobs/${id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserId }),
      });

      if (response.ok) {
        setShowAssignModal(false);
        setSelectedUserId('');
        await fetchJob();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to assign technician');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Error assigning technician');
    }
  };

  const handleUnassignTechnician = async (assignmentId: string) => {
    if (!confirm('Remove this technician from the job?')) return;

    try {
      const response = await apiFetch(`/api/jobs/${id}/assignments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: assignmentId }),
      });

      if (response.ok) {
        await fetchJob();
      }
    } catch (error) {
      console.error('Error unassigning technician:', error);
    }
  };

  const handleCheckIn = async (assignmentId: string) => {
    try {
      const response = await apiFetch(`/api/jobs/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignmentId,
          action: 'checkin',
        }),
      });

      if (response.ok) {
        await fetchJob();
      }
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Error checking in');
    }
  };

  const handleCheckOut = async (assignmentId: string) => {
    const notes = prompt('Add completion notes (optional):');

    try {
      const response = await apiFetch(`/api/jobs/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignmentId,
          action: 'checkout',
          notes: notes || undefined,
        }),
      });

      if (response.ok) {
        await fetchJob();
      }
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Error checking out');
    }
  };

  const openAssignModal = async () => {
    await fetchUsers();
    setShowAssignModal(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: '#3b82f6', bg: '#eff6ff', icon: Calendar, label: 'Scheduled' };
      case 'in_progress':
        return { color: '#f59e0b', bg: '#fffbeb', icon: Play, label: 'In Progress' };
      case 'completed':
        return { color: '#10b981', bg: '#f0fdf4', icon: CheckCircle2, label: 'Completed' };
      case 'cancelled':
        return { color: '#ef4444', bg: '#fef2f2', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: '#6b7280', bg: '#f9fafb', icon: AlertCircle, label: status };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: '#ef4444', label: 'Urgent', icon: AlertCircle };
      case 'high':
        return { color: '#f59e0b', label: 'High', icon: AlertCircle };
      case 'medium':
        return { color: '#3b82f6', label: 'Medium', icon: AlertCircle };
      case 'low':
        return { color: '#10b981', label: 'Low', icon: CheckCircle };
      default:
        return { color: '#6b7280', label: priority, icon: AlertCircle };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getDuration = (startString: string, endString?: string) => {
    const start = new Date(startString);
    const end = endString ? new Date(endString) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;

    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`;
    } else {
      return `${diffMins}m`;
    }
  };

  const getTechnicianStatus = (assignment: any) => {
    if (assignment.completed_at) {
      return {
        status: 'completed',
        color: '#6b7280',
        bg: '#f3f4f6',
        icon: '✓',
        label: 'Completed'
      };
    } else if (assignment.started_at) {
      return {
        status: 'on_site',
        color: '#10b981',
        bg: '#f0fdf4',
        icon: '●',
        label: 'On-site'
      };
    } else {
      return {
        status: 'assigned',
        color: '#f59e0b',
        bg: '#fffbeb',
        icon: '○',
        label: 'Assigned'
      };
    }
  };

  const handleCall = () => {
    if (job?.client?.contact_phone) {
      window.location.href = `tel:${job.client.contact_phone}`;
    }
  };

  const handleEmail = () => {
    if (job?.client?.contact_email) {
      window.location.href = `mailto:${job.client.contact_email}`;
    }
  };

  const handleNavigate = () => {
    if (job?.site?.gps_lat && job?.site?.gps_lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${job.site.gps_lat},${job.site.gps_lng}`,
        '_blank'
      );
    } else if (job?.site?.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.site.address)}`,
        '_blank'
      );
    }
  };

  const handleCallTechnician = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Phone number not available for this technician');
    }
  };

  const handleMessageTechnician = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #ffe8d6',
              borderTopColor: '#EF7722',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Job not found
          </p>
          <button
            onClick={() => router.push('/jobs')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px',
              boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
            }}
          >
            Back to Jobs
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const statusConfig = getStatusConfig(job.status);
  const priorityConfig = getPriorityConfig(job.priority);
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

  return (
    <ProtectedRoute>
      <style jsx>{`
        .detail-container {
          padding-bottom: 80px;
        }
        .main-content-area {
          padding: 0;
        }
        .mobile-header {
          display: block;
        }
        .desktop-header {
          display: none;
        }
        .info-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .two-column-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .detail-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content-area {
            padding: 0;
          }
          .mobile-header {
            display: none;
          }
          .desktop-header {
            display: block;
          }
          .info-cards-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .two-column-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
      `}</style>

      <div
        className="detail-container"
        style={{
          minHeight: '100vh',
          backgroundColor: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="jobs" />

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Desktop Back Button */}
        <div
          className="desktop-header"
          style={{
            padding: '1rem 2rem 0 2rem',
          }}
        >
          <button
            onClick={() => router.push('/jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '0.5rem',
              marginLeft: '-0.5rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF7722';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </button>
        </div>

        {/* Desktop Job Title with Edit/Delete */}
        <div
          className="desktop-header"
          style={{
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                margin: 0,
                color: '#1f2937',
              }}
            >
              {job.title}
            </h1>
            {job.description && (
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: '#6b7280',
                  lineHeight: '1.4',
                  margin: '0.5rem 0 0 0',
                }}
              >
                {job.description}
              </p>
            )}
          </div>
          {activeRole !== 'technician' && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => router.push(`/jobs/${id}/edit`)}
                style={{
                  padding: '0.5rem 0.875rem',
                  backgroundColor: 'white',
                  color: '#EF7722',
                  border: '2px solid #EF7722',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '36px',
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
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={deleteJob}
                style={{
                  padding: '0.5rem 0.875rem',
                  backgroundColor: 'white',
                  color: '#ef4444',
                  border: '2px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Desktop: Status & Schedule Info (Horizontal) */}
        <div
          className="desktop-header"
          style={{
            padding: '0 2rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: '1rem 1.5rem',
              backgroundColor: '#fafafa',
              borderRadius: '12px',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            {/* Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: statusConfig.bg,
                borderRadius: '8px',
              }}
            >
              <StatusIcon size={20} color={statusConfig.color} />
              <div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: '#6b7280',
                    marginBottom: '0.125rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600',
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: statusConfig.color,
                    textTransform: 'capitalize',
                  }}
                >
                  {statusConfig.label}
                </div>
              </div>
            </div>

            {/* Priority */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: priorityConfig.color + '15',
                borderRadius: '8px',
              }}
            >
              <PriorityIcon size={20} color={priorityConfig.color} />
              <div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: '#6b7280',
                    marginBottom: '0.125rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600',
                  }}
                >
                  Priority
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: priorityConfig.color,
                    textTransform: 'capitalize',
                  }}
                >
                  {priorityConfig.label}
                </div>
              </div>
            </div>

            {/* Scheduled */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Calendar size={20} color="#6b7280" />
              <div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: '#6b7280',
                    marginBottom: '0.125rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600',
                  }}
                >
                  Scheduled
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#1f2937',
                  }}
                >
                  {formatDate(job.scheduled_at)}
                </div>
              </div>
            </div>

            {/* Due Date */}
            {job.due_date && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Clock size={20} color="#6b7280" />
                <div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      marginBottom: '0.125rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: '600',
                    }}
                  >
                    Due Date
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#1f2937',
                    }}
                  >
                    {formatDateShort(job.due_date)}
                  </div>
                </div>
              </div>
            )}

            {/* Completed */}
            {job.completed_at && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <CheckCircle2 size={20} color="#10b981" />
                <div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: '#6b7280',
                      marginBottom: '0.125rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: '600',
                    }}
                  >
                    Completed
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#10b981',
                    }}
                  >
                    {formatDate(job.completed_at)}
                  </div>
                </div>
              </div>
            )}
          </div>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.75rem',
            }}
          >
            <button
              onClick={() => router.push('/jobs')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ←
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {job.title || 'Job Details'}
              </h1>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <PriorityIcon size={20} color={priorityConfig.color} />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              <StatusIcon size={14} />
              {statusConfig.label}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              <PriorityIcon size={14} />
              {priorityConfig.label}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content-area" style={{ padding: '1.5rem 2rem' }}>
          {/* Desktop: Action Buttons Row */}
          <div className="desktop-header" style={{ marginBottom: '0.75rem' }}>
            {/* Action Buttons in One Line - Starting with status actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {/* Status action buttons first */}
              {job.status === 'scheduled' && (
                <button
                  onClick={() => updateJobStatus('in_progress')}
                  disabled={updating}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    minHeight: '40px',
                    opacity: updating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!updating) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
                  }}
                >
                  <Play size={16} />
                  {updating ? 'Starting...' : 'Start Job'}
                </button>
              )}
              {job.status === 'in_progress' && (
                <button
                  onClick={() => updateJobStatus('completed')}
                  disabled={updating}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    minHeight: '40px',
                    opacity: updating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!updating) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.25)';
                  }}
                >
                  <CheckCircle2 size={16} />
                  {updating ? 'Completing...' : 'Mark as Complete'}
                </button>
              )}
              {job.status !== 'completed' && job.status !== 'cancelled' && (
                <button
                  onClick={() => updateJobStatus('cancelled')}
                  disabled={updating}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    minHeight: '40px',
                    opacity: updating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <XCircle size={16} />
                  Cancel Job
                </button>
              )}

              {/* Contact and Navigation Actions */}
              {job.client?.contact_phone && (
                <button
                  onClick={handleCall}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: 'white',
                    color: '#10b981',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Phone size={16} />
                  Call
                </button>
              )}
              {job.client?.contact_email && (
                <button
                  onClick={handleEmail}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: 'white',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Mail size={16} />
                  Email
                </button>
              )}
              {(job.site?.gps_lat || job.site?.address) && (
                <button
                  onClick={handleNavigate}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: 'white',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Navigation size={16} />
                  Navigate
                </button>
              )}
            </div>
          </div>

          {/* Mobile: Keep original mobile layout */}
          <div className="mobile-header">
            {/* Job Info Card */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                marginBottom: '0.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0,
                    color: '#1f2937',
                    flex: 1,
                  }}
                >
                  {job.title}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: priorityConfig.color + '15',
                    borderRadius: '8px',
                  }}
                >
                  <PriorityIcon size={16} color={priorityConfig.color} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: priorityConfig.color,
                      textTransform: 'uppercase',
                    }}
                  >
                    {priorityConfig.label}
                  </span>
                </div>
              </div>
              {job.description && (
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  {job.description}
                </p>
              )}
            </div>

            {/* Mobile Status Actions */}
            {job.status !== 'completed' && job.status !== 'cancelled' && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderBottom: '8px solid #f5f5f5',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {job.status === 'scheduled' && (
                    <button
                      onClick={() => updateJobStatus('in_progress')}
                      disabled={updating}
                      style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: updating ? 'not-allowed' : 'pointer',
                        minHeight: '52px',
                        opacity: updating ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                      }}
                    >
                      <Play size={20} />
                      {updating ? 'Starting...' : 'Start Job'}
                    </button>
                  )}
                  {job.status === 'in_progress' && (
                    <button
                      onClick={() => updateJobStatus('completed')}
                      disabled={updating}
                      style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: updating ? 'not-allowed' : 'pointer',
                        minHeight: '52px',
                        opacity: updating ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      }}
                    >
                      <CheckCircle2 size={20} />
                      {updating ? 'Completing...' : 'Mark Completed'}
                    </button>
                  )}
                  <button
                    onClick={() => updateJobStatus('cancelled')}
                    disabled={updating}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      minHeight: '44px',
                      opacity: updating ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <XCircle size={18} />
                    Cancel Job
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Quick Actions */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: 'white',
                borderBottom: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              {activeRole !== 'technician' && (
                <button
                  onClick={() => router.push(`/jobs/${id}/edit`)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    minHeight: '72px',
                  }}
                >
                  <Edit size={20} color="#1f2937" />
                  <span>Edit</span>
                </button>
              )}
              {job.client?.contact_phone && (
                <button
                  onClick={handleCall}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f0fdf4',
                    color: '#10b981',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    minHeight: '72px',
                  }}
                >
                  <Phone size={20} color="#10b981" />
                  <span>Call</span>
                </button>
              )}
              {job.client?.contact_email && (
                <button
                  onClick={handleEmail}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    minHeight: '72px',
                  }}
                >
                  <Mail size={20} color="#2563eb" />
                  <span>Email</span>
                </button>
              )}
              {(job.site?.gps_lat || job.site?.address) && (
                <button
                  onClick={handleNavigate}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    minHeight: '72px',
                  }}
                >
                  <Navigation size={20} color="#2563eb" />
                  <span>Navigate</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop: Assigned Technicians - Full Width */}
          <div className="desktop-header" style={{ padding: '0 2rem', marginBottom: '1rem' }}>
            <div
              style={{
                backgroundColor: '#fafafa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    {activeRole === 'technician' ? 'Your Assignment' : `Assigned Technicians (${job.assignments?.length || 0})`}
                  </h3>
                  {activeRole !== 'technician' && (
                    <button
                      onClick={openAssignModal}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        minHeight: '32px',
                        boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                      }}
                    >
                      <Plus size={14} />
                      Assign
                    </button>
                  )}
                </div>
                {job.assignments && job.assignments.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {job.assignments.map((assignment) => {
                      const techStatus = getTechnicianStatus(assignment);

                      return (
                        <div
                          key={assignment.id}
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                          }}
                        >
                          {/* Technician Name & Icon */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                            <User size={16} color="#EF7722" />
                            <div>
                              <div
                                style={{
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                }}
                              >
                                {assignment.user.full_name || assignment.user.email}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div
                            style={{
                              padding: '0.25rem 0.625rem',
                              backgroundColor: techStatus.bg,
                              borderRadius: '999px',
                              fontSize: '0.6875rem',
                              fontWeight: '600',
                              color: techStatus.color,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span style={{ fontSize: '0.5rem' }}>{techStatus.icon}</span>
                            {techStatus.label}
                          </div>

                          {/* Activity Info - Compact */}
                          {activeRole !== 'technician' && (
                            <div
                              style={{
                                flex: 1,
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                              }}
                            >
                              {assignment.started_at ? (
                                <>
                                  <span style={{ color: '#10b981', fontWeight: '500' }}>
                                    Checked in {getTimeSince(assignment.started_at)}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {getDuration(assignment.started_at, assignment.completed_at)}
                                  </span>
                                </>
                              ) : (
                                <span style={{ color: '#f59e0b', fontWeight: '500' }}>
                                  Not started yet
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons - Compact */}
                          {activeRole !== 'technician' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                onClick={() => handleCallTechnician(assignment.user.contact_phone)}
                                style={{
                                  padding: '0.375rem 0.625rem',
                                  backgroundColor: 'white',
                                  color: '#10b981',
                                  border: '1px solid #10b981',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  transition: 'all 0.2s',
                                  whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }}
                              >
                                <Phone size={12} />
                                Call
                              </button>
                              <button
                                onClick={() => handleUnassignTechnician(assignment.id)}
                                style={{
                                  padding: '0.375rem 0.5rem',
                                  backgroundColor: 'white',
                                  color: '#ef4444',
                                  border: '1px solid #ef4444',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }}
                                title="Remove technician"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}

                          {/* Technician View: Check In/Out Buttons */}
                          {activeRole === 'technician' && (
                            <>
                              {assignment.started_at ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#10b981',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.375rem',
                                      fontWeight: '600',
                                      padding: '0.5rem',
                                      backgroundColor: '#f0fdf4',
                                      borderRadius: '6px',
                                    }}
                                  >
                                    <CheckCircle size={14} />
                                    Checked in {getTimeSince(assignment.started_at)} • {getDuration(assignment.started_at)} on-site
                                  </div>
                                  {assignment.completed_at ? (
                                    <div
                                      style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '6px',
                                      }}
                                    >
                                      <CheckCircle2 size={14} />
                                      Completed: {formatDate(assignment.completed_at)}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleCheckOut(assignment.id)}
                                      style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        minHeight: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                                      }}
                                    >
                                      <CheckCircle2 size={16} />
                                      Check Out
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCheckIn(assignment.id)}
                                  style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    minHeight: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                                  }}
                                >
                                  <Play size={16} />
                                  Check In
                                </button>
                              )}
                            </>
                          )}

                          {/* Notes (shown to both roles) */}
                          {assignment.notes && (
                            <div
                              style={{
                                fontSize: '0.875rem',
                                color: '#374151',
                                marginTop: '0.75rem',
                                padding: '0.75rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.5rem',
                              }}
                            >
                              <FileText size={16} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span style={{ fontStyle: 'italic' }}>"{assignment.notes}"</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#9ca3af',
                    }}
                  >
                    <User size={32} color="#d1d5db" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      No technicians assigned yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Client & Site - 2 Column Grid */}
          <div className="desktop-header" style={{ padding: '0 2rem', marginBottom: '1rem' }}>
            <div className="two-column-grid">
              {/* Client Card */}
              {job.client && (
                <div
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(239,119,34,0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      Client
                    </h3>
                    <button
                      onClick={() => router.push(`/clients/${job.client!.id}`)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: 'transparent',
                        color: '#EF7722',
                        border: '1px solid #EF7722',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {job.client.name}
                      </div>
                      {job.client.address && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.5rem',
                          }}
                        >
                          <MapPin size={16} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{job.client.address}</span>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      {job.client.contact_email && (
                        <a
                          href={`mailto:${job.client.contact_email}`}
                          style={{
                            fontSize: '0.875rem',
                            color: '#2563eb',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <Mail size={16} color="#2563eb" />
                          {job.client.contact_email}
                        </a>
                      )}
                      {job.client.contact_phone && (
                        <a
                          href={`tel:${job.client.contact_phone}`}
                          style={{
                            fontSize: '0.875rem',
                            color: '#2563eb',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <Phone size={16} color="#2563eb" />
                          {job.client.contact_phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Site Info */}
              {job.site && (
                <div
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(239,119,34,0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      Site Location
                    </h3>
                    <button
                      onClick={() => router.push(`/sites/${job.site!.id}`)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: 'transparent',
                        color: '#EF7722',
                        border: '1px solid #EF7722',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {job.site.name}
                      </div>
                      {job.site.address && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.5rem',
                          }}
                        >
                          <MapPin size={16} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{job.site.address}</span>
                        </div>
                      )}
                      {job.site.gps_lat && job.site.gps_lng && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#EF7722',
                            marginTop: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          📍 GPS: {job.site.gps_lat.toFixed(6)}, {job.site.gps_lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Service History Card */}
          <div className="desktop-header" style={{ padding: '0 2rem', marginTop: '1rem', marginBottom: '2rem' }}>
            <div
              style={{
                backgroundColor: '#fafafa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                }}
              >
                Service History
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {job.assignments && job.assignments.length > 0 ? (
                  job.assignments
                    .filter(a => a.started_at) // Only show assignments that have been started
                    .sort((a, b) => {
                      // Sort by started_at, most recent first
                      const dateA = new Date(a.started_at || 0).getTime();
                      const dateB = new Date(b.started_at || 0).getTime();
                      return dateB - dateA;
                    })
                    .map((assignment, index) => (
                      <div
                        key={assignment.id}
                        style={{
                          padding: '1rem',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        {/* Timeline Dot */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: assignment.completed_at ? '#f0fdf4' : '#fffbeb',
                            border: `2px solid ${assignment.completed_at ? '#10b981' : '#f59e0b'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: assignment.completed_at ? '#10b981' : '#f59e0b',
                          }}
                        >
                          {assignment.completed_at ? '✓' : '•'}
                        </div>

                        {/* Info Column */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: '#1f2937',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {assignment.user.full_name || assignment.user.email}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              alignItems: 'center',
                            }}
                          >
                            {assignment.started_at && (
                              <span>
                                Started: {formatDate(assignment.started_at)}
                              </span>
                            )}
                            {assignment.started_at && assignment.completed_at && (
                              <span style={{ color: '#d1d5db' }}>•</span>
                            )}
                            {assignment.completed_at && (
                              <span>
                                Completed: {formatDate(assignment.completed_at)}
                              </span>
                            )}
                          </div>
                          {assignment.notes && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                marginTop: '0.5rem',
                                fontStyle: 'italic',
                                backgroundColor: '#f9fafb',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb',
                              }}
                            >
                              "{assignment.notes}"
                            </div>
                          )}
                        </div>

                        {/* Duration Badge */}
                        {assignment.started_at && (
                          <div
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: assignment.completed_at ? '#f3f4f6' : '#fffbeb',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: assignment.completed_at ? '#6b7280' : '#f59e0b',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getDuration(assignment.started_at, assignment.completed_at)}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#9ca3af',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px dashed #e5e7eb',
                    }}
                  >
                    <Clock size={32} color="#d1d5db" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      No service history yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile: Info Cards - Keep original layout */}
          <div className="mobile-header">
            {/* Status & Schedule Card */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                marginBottom: '0.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                }}
              >
                Status & Schedule
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: statusConfig.bg,
                    borderRadius: '8px',
                  }}
                >
                  <StatusIcon size={20} color={statusConfig.color} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Status
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: statusConfig.color,
                        textTransform: 'capitalize',
                      }}
                    >
                      {statusConfig.label}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Calendar size={20} color="#6b7280" />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Scheduled
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#1f2937',
                      }}
                    >
                      {formatDate(job.scheduled_at)}
                    </div>
                  </div>
                </div>
                {job.due_date && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <Clock size={20} color="#6b7280" />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Due Date
                      </div>
                      <div
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          color: '#1f2937',
                        }}
                      >
                        {formatDateShort(job.due_date)}
                      </div>
                    </div>
                  </div>
                )}
                {job.completed_at && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <CheckCircle2 size={20} color="#10b981" />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Completed
                      </div>
                      <div
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          color: '#10b981',
                        }}
                      >
                        {formatDate(job.completed_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Client Info */}
            {job.client && (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  marginBottom: '0.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(239,119,34,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Client
                  </h3>
                  <button
                    onClick={() => router.push(`/clients/${job.client!.id}`)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'transparent',
                      color: '#EF7722',
                      border: '1px solid #EF7722',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {job.client.name}
                    </div>
                    {job.client.address && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'start',
                          gap: '0.5rem',
                        }}
                      >
                        <MapPin size={16} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{job.client.address}</span>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {job.client.contact_email && (
                      <a
                        href={`mailto:${job.client.contact_email}`}
                        style={{
                          fontSize: '0.875rem',
                          color: '#2563eb',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Mail size={16} color="#2563eb" />
                        {job.client.contact_email}
                      </a>
                    )}
                    {job.client.contact_phone && (
                      <a
                        href={`tel:${job.client.contact_phone}`}
                        style={{
                          fontSize: '0.875rem',
                          color: '#2563eb',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Phone size={16} color="#2563eb" />
                        {job.client.contact_phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Site Info */}
            {job.site && (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  marginBottom: '0.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(239,119,34,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Site Location
                  </h3>
                  <button
                    onClick={() => router.push(`/sites/${job.site!.id}`)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'transparent',
                      color: '#EF7722',
                      border: '1px solid #EF7722',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {job.site.name}
                    </div>
                    {job.site.address && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'start',
                          gap: '0.5rem',
                        }}
                      >
                        <MapPin size={16} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{job.site.address}</span>
                      </div>
                    )}
                    {job.site.gps_lat && job.site.gps_lng && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#EF7722',
                          marginTop: '0.5rem',
                          fontWeight: '500',
                        }}
                      >
                        📍 GPS: {job.site.gps_lat.toFixed(6)}, {job.site.gps_lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asset Info - Full width for both mobile and desktop */}
          {job.asset && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                marginBottom: '0.5rem',
                margin: '0 1rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: 0,
                  }}
                >
                  Asset
                </h3>
                <button
                  onClick={() => router.push(`/assets/${job.asset!.id}`)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'transparent',
                    color: '#EF7722',
                    border: '1px solid #EF7722',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    Type
                  </div>
                  <div
                    style={{
                      fontWeight: '700',
                      color: '#1f2937',
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Wrench size={16} color="#EF7722" />
                    {job.asset.asset_type.replace('_', ' ')}
                  </div>
                </div>
                {job.asset.model && (
                  <div>
                    <div
                      style={{
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      Model
                    </div>
                    <div style={{ fontWeight: '700', color: '#1f2937' }}>
                      {job.asset.model}
                    </div>
                  </div>
                )}
                {job.asset.serial_number && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div
                      style={{
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      Serial Number
                    </div>
                    <div
                      style={{
                        fontWeight: '700',
                        color: '#1f2937',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      {job.asset.serial_number}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile: Assigned Technicians */}
          <div className="mobile-header">
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                marginBottom: '0.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: 0,
                  }}
                >
                  Assigned Technicians ({job.assignments?.length || 0})
                </h3>
                {activeRole !== 'technician' && (
                  <button
                    onClick={openAssignModal}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      minHeight: '32px',
                      boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                    }}
                  >
                    <Plus size={14} />
                    Assign
                  </button>
                )}
              </div>
              {job.assignments && job.assignments.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {job.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: '700',
                              color: '#1f2937',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <User size={16} color="#EF7722" />
                            {assignment.user.full_name || assignment.user.email}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              textTransform: 'capitalize',
                            }}
                          >
                            {assignment.user.role}
                          </div>
                        </div>
                        {activeRole !== 'technician' && (
                          <button
                            onClick={() => handleUnassignTechnician(assignment.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#ef4444',
                              border: 'none',
                              fontSize: '1.25rem',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '32px',
                              minHeight: '32px',
                              borderRadius: '6px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>

                      {assignment.started_at ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              fontWeight: '600',
                            }}
                          >
                            <CheckCircle size={14} />
                            Checked in: {formatDate(assignment.started_at)}
                          </div>
                          {assignment.completed_at ? (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                              }}
                            >
                              <CheckCircle2 size={14} />
                              Completed: {formatDate(assignment.completed_at)}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCheckOut(assignment.id)}
                              style={{
                                width: '100%',
                                padding: '0.625rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                minHeight: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                              }}
                            >
                              <CheckCircle2 size={16} />
                              Check Out
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(assignment.id)}
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                          }}
                        >
                          <Play size={16} />
                          Check In
                        </button>
                      )}

                      {assignment.notes && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#374151',
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.5rem',
                          }}
                        >
                          <FileText size={16} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ fontStyle: 'italic' }}>"{assignment.notes}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#9ca3af',
                  }}
                >
                  <User size={32} color="#d1d5db" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    No technicians assigned yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Assign Technician Modal */}
        {showAssignModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '1rem',
            }}
            onClick={() => setShowAssignModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: '#1f2937',
                }}
              >
                Assign Technician
              </h2>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  marginBottom: '1rem',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EF7722';
                  e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select a technician...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email} ({user.role})
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleAssignTechnician}
                  disabled={!selectedUserId}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: selectedUserId
                      ? 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)'
                      : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: selectedUserId ? 'pointer' : 'not-allowed',
                    minHeight: '48px',
                    boxShadow: selectedUserId
                      ? '0 2px 8px rgba(239,119,34,0.25)'
                      : 'none',
                  }}
                >
                  Assign
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUserId('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '48px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <BottomNav activeTab="jobs" />
      </div>
    </ProtectedRoute>
  );
}
