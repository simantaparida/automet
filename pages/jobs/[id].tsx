import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_at: string;
  completed_at?: string;
  created_at: string;
  client: {
    id: string;
    name: string;
    contact_email: string;
    contact_phone: string;
    address: string;
  } | null;
  site: {
    id: string;
    name: string;
    address: string;
    gps_lat: number | null;
    gps_lng: number | null;
  } | null;
  asset: {
    id: string;
    asset_type: string;
    model: string;
    serial_number: string;
  } | null;
  assignments: Array<{
    id: string;
    started_at: string | null;
    completed_at: string | null;
    notes: string | null;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }>;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
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
      const response = await fetch(`/api/jobs/${id}`);
      const data = await response.json();
      setJob(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
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

      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchJob();
      }
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteJob = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?role=technician');
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
      const response = await fetch(`/api/jobs/${id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserId }),
      });

      if (response.ok) {
        setShowAssignModal(false);
        setSelectedUserId('');
        await fetchJob();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign technician');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Error assigning technician');
    }
  };

  const handleUnassignTechnician = async (assignmentId: string) => {
    if (!confirm('Remove this technician from the job?')) return;

    try {
      const response = await fetch(`/api/jobs/${id}/assignments`, {
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
      const response = await fetch(`/api/jobs/${id}/checkin`, {
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
    }
  };

  const handleCheckOut = async (assignmentId: string) => {
    const notes = prompt('Add completion notes (optional):');

    try {
      const response = await fetch(`/api/jobs/${id}/checkin`, {
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
    }
  };

  const openAssignModal = async () => {
    await fetchUsers();
    setShowAssignModal(true);
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
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCall = () => {
    if (job?.client?.contact_phone) {
      window.location.href = `tel:${job.client.contact_phone}`;
    }
  };

  const handleNavigate = () => {
    if (job?.site?.gps_lat && job?.site?.gps_lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${job.site.gps_lat},${job.site.gps_lng}`,
        '_blank'
      );
    }
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
            backgroundColor: '#f5f5f5',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#2563eb',
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
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Job not found
          </p>
          <button
            onClick={() => router.push('/jobs')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Back to Jobs
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          paddingBottom: '80px',
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
              }}
            >
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h1
                style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}
              >
                Job Details
              </h1>
            </div>
            <span style={{ fontSize: '1.5rem' }}>
              {getPriorityIcon(job.priority)}
            </span>
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}
          >
            {job.status.replace('_', ' ')}
          </div>
        </header>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => router.push(`/jobs/${id}/edit`)}
            style={{
              padding: '0.75rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '44px',
            }}
          >
            <span>✏️</span> Edit Job
          </button>
          {job.client?.contact_phone && (
            <button
              onClick={handleCall}
              style={{
                padding: '0.75rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '44px',
              }}
            >
              <span>📞</span> Call Client
            </button>
          )}
          {job.site?.gps_lat && job.site?.gps_lng && (
            <button
              onClick={handleNavigate}
              style={{
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '44px',
              }}
            >
              <span>🗺️</span> Navigate
            </button>
          )}
        </div>

        {/* Status Actions */}
        {job.status !== 'completed' && job.status !== 'cancelled' && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderBottom: '8px solid #f5f5f5',
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: '#1f2937',
              }}
            >
              Update Status
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {job.status === 'scheduled' && (
                <button
                  onClick={() => updateJobStatus('in_progress')}
                  disabled={updating}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  {updating ? 'Updating...' : '▶️ Start Job'}
                </button>
              )}
              {job.status === 'in_progress' && (
                <button
                  onClick={() => updateJobStatus('completed')}
                  disabled={updating}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  {updating ? 'Updating...' : '✅ Mark Completed'}
                </button>
              )}
              <button
                onClick={() => updateJobStatus('cancelled')}
                disabled={updating}
                style={{
                  padding: '0.875rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  minHeight: '44px',
                  opacity: updating ? 0.6 : 1,
                }}
              >
                {updating ? 'Updating...' : '❌ Cancel Job'}
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main style={{ padding: '0' }}>
          {/* Job Info Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '8px',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                color: '#1f2937',
              }}
            >
              {job.title}
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              {job.description}
            </p>
          </div>

          {/* Client Info */}
          {job.client && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                marginBottom: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}
              >
                Client
              </h3>
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
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {job.client.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {job.client.address}
                  </div>
                </div>
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
                    <span>📧</span> {job.client.contact_email}
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
                    <span>📞</span> {job.client.contact_phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Site Info */}
          {job.site && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                marginBottom: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}
              >
                Site Location
              </h3>
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
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {job.site.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {job.site.address}
                  </div>
                </div>
                {job.site.gps_lat && job.site.gps_lng && (
                  <button
                    onClick={handleNavigate}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      minHeight: '44px',
                    }}
                  >
                    <span>🗺️</span> Open in Maps
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Asset Info */}
          {job.asset && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                marginBottom: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}
              >
                Asset
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
                    Type
                  </div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      textTransform: 'capitalize',
                    }}
                  >
                    {job.asset.asset_type.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
                    Model
                  </div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {job.asset.model}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
                    Serial Number
                  </div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      fontFamily: 'monospace',
                    }}
                  >
                    {job.asset.serial_number}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Info */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '8px',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Schedule
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.875rem',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>⏰</span>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Scheduled
                  </div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {formatDate(job.scheduled_at)}
                  </div>
                </div>
              </div>
              {job.completed_at && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>✅</span>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      Completed
                    </div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                      {formatDate(job.completed_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Technicians */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
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
                Assigned Technicians
              </h3>
              <button
                onClick={openAssignModal}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minHeight: '32px',
                }}
              >
                + Assign
              </button>
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
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {assignment.user.email}
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
                      <button
                        onClick={() => handleUnassignTechnician(assignment.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: 'none',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {assignment.started_at ? (
                      <>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#10b981',
                            marginBottom: '0.5rem',
                          }}
                        >
                          ✓ Checked in: {formatDate(assignment.started_at)}
                        </div>
                        {assignment.completed_at ? (
                          <div
                            style={{ fontSize: '0.75rem', color: '#6b7280' }}
                          >
                            Completed: {formatDate(assignment.completed_at)}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCheckOut(assignment.id)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              minHeight: '36px',
                            }}
                          >
                            Check Out
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(assignment.id)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          minHeight: '36px',
                        }}
                      >
                        Check In
                      </button>
                    )}

                    {assignment.notes && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#374151',
                          marginTop: '0.5rem',
                          fontStyle: 'italic',
                          padding: '0.5rem',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                        }}
                      >
                        "{assignment.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                No technicians assigned yet
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ backgroundColor: 'white', padding: '1rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <button
                onClick={() => router.push(`/jobs/${id}/edit`)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: '1px solid #2563eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={deleteJob}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                🗑️ Delete
              </button>
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
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '400px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Assign Technician
              </h2>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  marginBottom: '1rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select a technician...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.role})
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleAssignTechnician}
                  disabled={!selectedUserId}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: selectedUserId ? '#2563eb' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: selectedUserId ? 'pointer' : 'not-allowed',
                    minHeight: '48px',
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
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '500',
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
