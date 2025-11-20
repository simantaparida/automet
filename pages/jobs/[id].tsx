import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import {
  MapPin,
  Wrench,
  User,
  Phone,
  Mail,
  Navigation,
  X,
  Plus,
  Building2
} from 'lucide-react';
import JobDetailHeader from '@/components/jobs/JobDetailHeader';
import JobInfoCard from '@/components/jobs/JobInfoCard';
import JobTabs from '@/components/jobs/JobTabs';
import toast from 'react-hot-toast';

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
    try {
      const response = await apiFetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        console.error('Failed to fetch job details');
        toast.error('Failed to load job details');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Error loading job');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiFetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        // Filter for technicians only
        const technicians = data.users.filter((u: User) => u.role === 'technician');
        setUsers(technicians);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load technicians');
    }
  };

  const updateJobStatus = async (newStatus: string) => {
    if (!job) return;
    setUpdating(true);
    try {
      const response = await apiFetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJob(updatedJob);
        toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update job status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;

    try {
      const response = await apiFetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Job deleted successfully');
        router.push('/jobs');
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId || !job) return;

    try {
      const response = await apiFetch(`/api/jobs/${job.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserId }),
      });

      if (response.ok) {
        toast.success('Technician assigned successfully');
        setShowAssignModal(false);
        fetchJob(); // Refresh job data
      } else {
        throw new Error('Failed to assign technician');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error('Failed to assign technician');
    }
  };

  const openAssignModal = () => {
    fetchUsers();
    setShowAssignModal(true);
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
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.site.gps_lat},${job.site.gps_lng}`, '_blank');
    } else if (job?.site?.address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.site.address)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col md:pl-64">
            <TopHeader />
            <main className="flex-1 p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
          </div>
          <BottomNav />
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col md:pl-64">
            <TopHeader />
            <main className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Job not found</h2>
                <button
                  onClick={() => router.push('/jobs')}
                  className="mt-4 text-primary hover:underline"
                >
                  Back to Jobs
                </button>
              </div>
            </main>
          </div>
          <BottomNav />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col md:pl-64 pb-20 md:pb-0">
          <TopHeader />

          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            <JobDetailHeader
              job={job}
              activeRole={activeRole}
              updating={updating}
              onUpdateStatus={updateJobStatus}
              onDelete={handleDelete}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                {/* Customer Info */}
                <JobInfoCard
                  title="Customer"
                  icon={User}
                  items={[
                    {
                      label: 'Name',
                      value: job.client?.name || 'N/A',
                      icon: User
                    },
                    {
                      label: 'Phone',
                      value: job.client?.contact_phone || 'N/A',
                      icon: Phone,
                      action: job.client?.contact_phone ? {
                        label: 'Call',
                        onClick: handleCall,
                        icon: Phone
                      } : undefined
                    },
                    {
                      label: 'Email',
                      value: job.client?.contact_email || 'N/A',
                      icon: Mail,
                      action: job.client?.contact_email ? {
                        label: 'Email',
                        onClick: handleEmail,
                        icon: Mail
                      } : undefined
                    }
                  ]}
                />

                {/* Site Info */}
                <JobInfoCard
                  title="Site Location"
                  icon={MapPin}
                  items={[
                    {
                      label: 'Site Name',
                      value: job.site?.name || 'N/A',
                      icon: Building2
                    },
                    {
                      label: 'Address',
                      value: job.site?.address || 'N/A',
                      icon: MapPin,
                      action: (job.site?.address || (job.site?.gps_lat && job.site?.gps_lng)) ? {
                        label: 'Navigate',
                        onClick: handleNavigate,
                        icon: Navigation
                      } : undefined
                    }
                  ]}
                />

                {/* Asset Info (if available) */}
                {job.asset && (
                  <JobInfoCard
                    title="Asset Details"
                    icon={Wrench}
                    items={[
                      { label: 'Type', value: job.asset.asset_type, icon: Wrench },
                      { label: 'Model', value: job.asset.model || 'N/A', icon: Wrench },
                      { label: 'Serial Number', value: job.asset.serial_number || 'N/A', icon: Wrench }
                    ]}
                  />
                )}

                {/* Assigned Technicians (Desktop View) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <User size={18} className="text-primary" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide m-0">
                        Technicians
                      </h3>
                    </div>
                    {activeRole !== 'technician' && (
                      <button
                        onClick={openAssignModal}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-600 uppercase tracking-wide"
                      >
                        <Plus size={14} /> Assign
                      </button>
                    )}
                  </div>
                  <div className="p-5">
                    {job.assignments && job.assignments.length > 0 ? (
                      <div className="space-y-3">
                        {job.assignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary border border-gray-200 shadow-sm">
                              <User size={14} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {assignment.user?.full_name || assignment.user?.email}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {assignment.user?.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No technicians assigned
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Tabs & Activity */}
              <div className="lg:col-span-2">
                <JobTabs job={job} activeRole={activeRole} />
              </div>
            </div>
          </main>
        </div>
        <BottomNav />

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Assign Technician</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Technician
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select a technician...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedUserId}
                    className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
