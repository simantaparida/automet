import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';

import JobDetailHeader from '@/components/jobs/JobDetailHeader';
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

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { apiFetch, activeRole } = useRoleSwitch();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);


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
        setJob(data.job);
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
        await fetchJob();
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

          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pt-24 md:pt-28">
            <JobDetailHeader
              job={job}
              activeRole={activeRole}
              updating={updating}
              onUpdateStatus={updateJobStatus}
              onDelete={handleDelete}
            />

            {/* Single Column Layout with Tabs */}
            <JobTabs
              job={job}
              activeRole={activeRole}
              onAddTask={() => toast.success('Add Task feature coming soon')}
              onCall={handleCall}
              onEmail={handleEmail}
              onNavigate={handleNavigate}
            />
          </main>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
