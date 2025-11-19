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
import {
  Calendar,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserPlus,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Plus,
  Users,
  Building2,
  MapPin,
  Package,
  FileCheck,
  AlertTriangle,
  Settings,
  HelpCircle,
  BarChart3,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';

interface KPIs {
  scheduled: { count: number; trend?: number };
  in_progress: { count: number; longest_running_hours?: number };
  completed: { count: number; trend?: number };
  overdue: { count: number };
  proof_pending: { count: number; high_priority_count: number };
  unassigned: { count: number };
}

interface Alert {
  id: string;
  type: 'overdue_job' | 'stuck_job' | 'proof_missing' | 'low_inventory';
  title: string;
  count: number;
  job_ids?: string[];
  priority: 'high' | 'medium' | 'low';
  link?: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status: 'active' | 'idle' | 'offline';
  jobs_count_today: number;
  last_checkin_at?: string;
}

interface TimelineJob {
  id: string;
  title: string;
  scheduled_at: string;
  site: { id: string; name: string } | null;
  assignee: { id: string; name: string; started_at?: string } | null;
  eta_status: 'on-time' | 'at-risk' | 'late';
}

interface AtRiskJob {
  id: string;
  title: string;
  scheduled_at: string;
  site: { id: string; name: string } | null;
  priority: string;
  risk_reason?: string;
}

interface ActivityItem {
  id: string;
  type: 'job_completed' | 'job_created' | 'client_added' | 'technician_added' | 'proof_uploaded';
  title: string;
  description: string;
  timestamp: string;
  user?: { id: string; name: string };
  link?: string;
}

interface UserProfile {
  full_name?: string;
  email: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { apiFetch, activeRole } = useRoleSwitch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [, setAlerts] = useState<Alert[]>([]);
  const [, setTechnicians] = useState<Technician[]>([]);
  const [timelineJobs, setTimelineJobs] = useState<TimelineJob[]>([]);
  const [unassignedJobs, setUnassignedJobs] = useState<AtRiskJob[]>([]);
  const [atRiskJobs, setAtRiskJobs] = useState<AtRiskJob[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [overdueJobs, setOverdueJobs] = useState<TimelineJob[]>([]);
  const [inProgressJobs, setInProgressJobs] = useState<TimelineJob[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);


  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current month and year
  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    const year = now.getFullYear();
    return `${month} ${year}`;
  };

  // Calculate days overdue
  const getDaysOverdue = (scheduledAt: string): number => {
    const scheduled = new Date(scheduledAt);
    const now = new Date();
    const diffTime = now.getTime() - scheduled.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get duration string for in-progress jobs
  const getInProgressDuration = (startedAt?: string): string => {
    if (!startedAt) return '0m';

    const started = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - started.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

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

  // Fetch user profile for welcome message
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !apiFetch) return;
      try {
        const response = await apiFetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [user, apiFetch]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (hasOrganization === false || !apiFetch) {
        setLoading(false);
        return;
      }

      try {
        const [kpisRes, alertsRes, techniciansRes, timelineRes, activityRes] =
          await Promise.all([
            apiFetch('/api/dashboard/kpis'),
            apiFetch('/api/dashboard/alerts'),
            apiFetch('/api/dashboard/technicians'),
            apiFetch('/api/dashboard/jobs-timeline'),
            apiFetch('/api/dashboard/activity'),
          ]);

        if (kpisRes.ok) {
          const kpisData = await kpisRes.json();
          setKpis(kpisData);
        } else {
          const errorData = await kpisRes.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch KPIs:', kpisRes.status, errorData);
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts || []);
        } else {
          const errorData = await alertsRes.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch alerts:', alertsRes.status, errorData);
        }

        if (techniciansRes.ok) {
          const techniciansData = await techniciansRes.json();
          setTechnicians(techniciansData.technicians || []);
        } else {
          const errorData = await techniciansRes.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch technicians:', techniciansRes.status, errorData);
        }

        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          const allJobs = timelineData.upcoming || [];

          // Separate jobs into categories
          const overdue = allJobs.filter((job: TimelineJob) => job.eta_status === 'late');
          const inProgress = allJobs.filter((job: TimelineJob) => {
            // We'll need to check job status - for now, use a simple heuristic
            return job.eta_status === 'on-time' || job.eta_status === 'at-risk';
          });

          setTimelineJobs(allJobs);
          setOverdueJobs(overdue);
          setInProgressJobs(inProgress);
          setUnassignedJobs(timelineData.unassigned || []);
          setAtRiskJobs(timelineData.at_risk || []);
        } else {
          const errorData = await timelineRes.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch jobs timeline:', timelineRes.status, errorData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivities(activityData.activities || []);
        } else {
          const errorData = await activityRes.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch activity:', activityRes.status, errorData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Log more detailed error information for debugging
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (hasOrganization !== null) {
      fetchDashboardData();
    }
  }, [hasOrganization, apiFetch]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getOwnerName = () => {
    return userProfile?.full_name || user?.email?.split('@')[0] || 'Owner';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white font-sans">
        {/* Desktop Sidebar */}
        <Sidebar activeTab="home" />

        {/* Desktop Top Header with Glassmorphism */}
        <div className="desktop-header fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/80 border-b border-primary/10">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Main Content */}
        <main className="ml-0 md:ml-[260px] pt-16 md:pt-20 pb-0 px-4 md:px-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Welcome Header with Quick Actions */}
              <div className="mb-5 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {getGreeting()}, {getOwnerName()}!
                  </h1>
                  <p className="text-[15px] text-gray-500">
                    Here's your snapshot for {getCurrentMonthYear()}
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap relative">
                  {activeRole !== 'technician' && (
                    <>
                      {/* Primary Action - Always Visible */}
                      <button
                        onClick={() => router.push('/jobs/new')}
                        className="bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/35"
                      >
                        <Plus size={18} /> Create Job
                      </button>

                      {/* Desktop: Show all buttons */}
                      <div className="hidden md:flex gap-3">
                        <button
                          onClick={() => router.push('/clients/new')}
                          className="bg-white text-gray-900 border border-gray-300 rounded-md px-3.5 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-gray-50 hover:border-primary"
                        >
                          <Building2 size={16} /> Add Client
                        </button>
                        <button
                          onClick={() => router.push('/sites/new')}
                          className="bg-white text-gray-900 border border-gray-300 rounded-md px-3.5 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-gray-50 hover:border-primary"
                        >
                          <MapPin size={16} /> Add Site
                        </button>
                        <button
                          onClick={() => router.push('/assets/new')}
                          className="bg-white text-gray-900 border border-gray-300 rounded-md px-3.5 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-gray-50 hover:border-primary"
                        >
                          <Package size={16} /> Add Asset
                        </button>
                      </div>

                      {/* Mobile: Dropdown Menu */}
                      <div className="md:hidden relative">
                        <button
                          onClick={() => setShowMobileMenu(!showMobileMenu)}
                          className="bg-white text-gray-900 border border-gray-300 rounded-md px-3.5 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-gray-50 hover:border-primary"
                        >
                          <MoreHorizontal size={16} /> More
                        </button>

                        {/* Dropdown Menu */}
                        {showMobileMenu && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMobileMenu(false)}
                            ></div>

                            {/* Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => {
                                  router.push('/clients/new');
                                  setShowMobileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <Building2 size={16} className="text-gray-400" />
                                Add Client
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/sites/new');
                                  setShowMobileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <MapPin size={16} className="text-gray-400" />
                                Add Site
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/assets/new');
                                  setShowMobileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <Package size={16} className="text-gray-400" />
                                Add Asset
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>


              {/* Row 1: Primary KPI Cards - Horizontal Scroll */}
              <div className="overflow-x-auto -webkit-overflow-scrolling-touch pb-2 mb-6 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                <div className="flex gap-4 min-w-fit">
                  {/* Scheduled */}
                  <button
                    onClick={() => router.push('/jobs?status=scheduled')}
                    className="bg-white p-3.5 rounded-lg border border-gray-200 cursor-pointer min-w-[130px] text-left transition-all flex-shrink-0 min-h-[90px] hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                    title="Jobs scheduled for today. Click to view."
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={18} className="text-primary" />
                      <span className="text-xs text-gray-500 font-medium">Scheduled</span>
                    </div>
                    <p className="text-[22px] font-bold text-gray-900 m-0 leading-tight">
                      {kpis?.scheduled.count || 0}
                    </p>
                  </button>

                  {/* In Progress */}
                  <button
                    onClick={() => router.push('/jobs?status=in_progress')}
                    className="bg-white p-3.5 rounded-lg border border-gray-200 cursor-pointer min-w-[130px] text-left transition-all flex-shrink-0 min-h-[90px] hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                    title="Jobs currently being worked on. Click to view."
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench size={18} className="text-amber-500" />
                      <span className="text-xs text-gray-500 font-medium">In Progress</span>
                    </div>
                    <p className="text-[22px] font-bold text-gray-900 m-0 leading-tight">
                      {kpis?.in_progress.count || 0}
                    </p>
                    {kpis?.in_progress.longest_running_hours && kpis.in_progress.longest_running_hours > 8 && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">
                        Longest: {Math.round(kpis.in_progress.longest_running_hours)}h
                      </p>
                    )}
                  </button>

                  {/* Completed */}
                  <button
                    onClick={() => router.push('/jobs?status=completed')}
                    className="bg-white p-3.5 rounded-lg border border-gray-200 cursor-pointer min-w-[130px] text-left transition-all flex-shrink-0 min-h-[90px] hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                    title="Jobs completed today. Click to view."
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <span className="text-xs text-gray-500 font-medium">Completed</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-[22px] font-bold text-gray-900 m-0 leading-tight">
                        {kpis?.completed.count || 0}
                      </p>
                      {kpis?.completed.trend !== undefined && (
                        <div className="flex items-center gap-0.5 text-[11px]" style={{ color: kpis.completed.trend >= 0 ? '#10b981' : '#ef4444' }}>
                          {kpis.completed.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>{Math.abs(Math.round(kpis.completed.trend))}%</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Overdue */}
                  <button
                    onClick={() => router.push('/jobs?status=overdue')}
                    className={`bg-white p-3.5 rounded-lg cursor-pointer min-w-[130px] text-left transition-all flex-shrink-0 min-h-[90px] hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15 ${(kpis?.overdue.count || 0) > 0 ? 'border-2 border-red-500' : 'border border-gray-200'
                      }`}
                    title="Jobs past due — action required. Click to view."
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={18} className="text-red-500" />
                      <span className="text-xs text-gray-500 font-medium">Overdue</span>
                    </div>
                    <p className={`text-[22px] font-bold m-0 leading-tight ${(kpis?.overdue.count || 0) > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                      {kpis?.overdue.count || 0}
                    </p>
                  </button>

                  {/* Proof Pending */}
                  <button
                    onClick={() => router.push('/jobs?status=completed&proof_missing=true')}
                    className="bg-white p-3.5 rounded-lg border border-gray-200 cursor-pointer min-w-[130px] text-left transition-all flex-shrink-0 relative min-h-[90px] hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                    title="Completed jobs missing proof of completion. Click to review."
                  >
                    {kpis?.proof_pending.high_priority_count && kpis.proof_pending.high_priority_count > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                        {kpis.proof_pending.high_priority_count}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck size={18} className="text-amber-500" />
                      <span className="text-xs text-gray-500 font-medium">Proof Pending</span>
                    </div>
                    <p className="text-[22px] font-bold text-gray-900 m-0 leading-tight">
                      {kpis?.proof_pending.count || 0}
                    </p>
                  </button>

                  {/* Unassigned - Hide for technicians */}
                  {activeRole !== 'technician' && (
                    <button
                      onClick={() => router.push('/jobs?status=unassigned')}
                      className="bg-white p-3.5 rounded-lg border border-gray-200 cursor-pointer min-w-[130px] text-left transition-all flex-shrink-0 min-h-[90px] hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                      title="Jobs that need assignment. Click to assign."
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus size={18} className="text-indigo-600" />
                        <span className="text-xs text-gray-500 font-medium">Unassigned</span>
                      </div>
                      <p className="text-[22px] font-bold text-gray-900 m-0 leading-tight">
                        {kpis?.unassigned.count || 0}
                      </p>
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Overdue Jobs & Jobs in Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Overdue Jobs */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[15px] font-bold text-gray-900 m-0 flex items-center gap-1.5">
                      <AlertCircle size={16} className="text-red-500" />
                      Overdue Jobs
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?status=overdue')}
                      className="text-[13px] text-primary font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 p-2 hover:underline"
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {overdueJobs.length === 0 ? (
                    <EmptyState title="No overdue jobs" description="All jobs are on track! 🎉" />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {overdueJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="flex flex-col gap-1.5 p-2.5 bg-red-50 rounded-md border border-red-200 cursor-pointer text-left transition-all hover:bg-red-100"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-gray-900 mb-1 truncate">
                                {job.title}
                              </div>
                              <div className="text-[11px] text-gray-500 leading-snug">
                                {job.site?.name || 'No site'} • {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(job.scheduled_at)}
                                {job.assignee && ` • ${job.assignee.name}`}
                              </div>
                            </div>
                            <span className="bg-red-200 text-red-900 text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                              {(() => {
                                const days = getDaysOverdue(job.scheduled_at);
                                return days === 0 ? 'OVERDUE' : `${days} ${days === 1 ? 'DAY' : 'DAYS'} OVERDUE`;
                              })()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Jobs in Progress */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[15px] font-bold text-gray-900 m-0 flex items-center gap-1.5">
                      <Wrench size={16} className="text-amber-500" />
                      Jobs in Progress
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?status=in_progress')}
                      className="text-[13px] text-primary font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 p-2 hover:underline"
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {inProgressJobs.length === 0 ? (
                    <EmptyState title="No jobs in progress" description="Ready to start a new job?" />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {inProgressJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="flex flex-col gap-1.5 p-2.5 bg-amber-50 rounded-md border border-amber-200 cursor-pointer text-left transition-all hover:bg-amber-100"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-gray-900 mb-1 truncate">
                                {job.title}
                              </div>
                              <div className="text-[11px] text-gray-500 leading-snug">
                                {job.site?.name || 'No site'} • {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(job.scheduled_at)}
                                {job.assignee && ` • ${job.assignee.name}`}
                              </div>
                            </div>
                            <span className="bg-amber-200 text-amber-900 text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                              {getInProgressDuration(job.assignee?.started_at)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Upcoming Jobs & Unassigned/At-risk Jobs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Upcoming Jobs */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[15px] font-bold text-gray-900 m-0 flex items-center gap-1.5">
                      <Clock size={16} className="text-gray-500" />
                      Upcoming Jobs
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?status=scheduled')}
                      className="text-[13px] text-primary font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 p-2 hover:underline"
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {timelineJobs.length === 0 ? (
                    <EmptyState title="No upcoming jobs" description="Time to schedule some work!" />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {timelineJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="flex flex-col gap-1.5 p-2.5 bg-gray-50 rounded-md border border-gray-200 cursor-pointer text-left transition-all hover:bg-orange-50 hover:border-primary"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-gray-900 mb-1 truncate">
                                {job.title}
                              </div>
                              <div className="text-[11px] text-gray-500 leading-snug">
                                {job.site?.name || 'No site'}
                                {job.assignee && ` • ${job.assignee.name}`}
                              </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${job.eta_status === 'at-risk'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                              }`}>
                              {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unassigned & At-risk Jobs */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[15px] font-bold text-gray-900 m-0 flex items-center gap-1.5">
                      <AlertTriangle size={16} className="text-amber-500" />
                      Unassigned & At-risk Jobs
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?filter=unassigned_or_atrisk')}
                      className="text-[13px] text-primary font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 p-2 hover:underline"
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {unassignedJobs.length === 0 && atRiskJobs.length === 0 ? (
                    <EmptyState title="All jobs assigned" description="Great job managing your team! 👏" />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {[...unassignedJobs.slice(0, 3), ...atRiskJobs.slice(0, 2)].slice(0, 5).map((job) => {
                        const isUnassigned = unassignedJobs.includes(job as AtRiskJob);
                        return (
                          <button
                            key={job.id}
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className={`flex flex-col gap-1.5 p-2.5 rounded-md border cursor-pointer text-left transition-all ${isUnassigned
                              ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                              : 'bg-red-50 border-red-200 hover:bg-red-100'
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold text-gray-900 mb-1 truncate">
                                  {job.title}
                                </div>
                                <div className="text-[11px] text-gray-500 leading-snug">
                                  {job.site?.name || 'No site'} • {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(job.scheduled_at)}
                                  {!isUnassigned && job.risk_reason && ` • ${job.risk_reason}`}
                                </div>
                              </div>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${isUnassigned
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-red-200 text-red-900'
                                }`}>
                                {isUnassigned ? 'UNASSIGNED' : 'AT RISK'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Recent Activity Table */}
              {activities.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                  <h3 className="text-[15px] font-bold text-gray-900 m-0 mb-3 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-primary" />
                    Recent Activity
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 px-1.5 font-semibold text-gray-500 text-[11px] uppercase tracking-wide">
                            Type
                          </th>
                          <th className="text-left py-2 px-1.5 font-semibold text-gray-500 text-[11px] uppercase tracking-wide">
                            Action
                          </th>
                          <th className="text-left py-2 px-1.5 font-semibold text-gray-500 text-[11px] uppercase tracking-wide">
                            Details
                          </th>
                          <th className="text-left py-2 px-1.5 font-semibold text-gray-500 text-[11px] uppercase tracking-wide w-[100px]">
                            Time
                          </th>
                          <th className="text-left py-2 px-1.5 font-semibold text-gray-500 text-[11px] uppercase tracking-wide">
                            User
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.slice(0, 10).map((activity, index) => (
                          <tr
                            key={activity.id}
                            onClick={() => activity.link && router.push(activity.link)}
                            className={`${index < 9 ? 'border-b border-gray-100' : ''} ${activity.link ? 'cursor-pointer hover:bg-orange-50 transition-colors' : 'cursor-default'
                              }`}
                          >
                            <td className="py-2.5 px-1.5 align-middle">
                              <div className="flex items-center gap-1.5">
                                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-orange-50">
                                  {activity.type === 'job_completed' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                  {activity.type === 'job_created' && <Plus size={14} className="text-primary" />}
                                  {activity.type === 'client_added' && <Building2 size={14} className="text-indigo-500" />}
                                  {activity.type === 'technician_added' && <Users size={14} className="text-amber-500" />}
                                  {activity.type === 'proof_uploaded' && <FileCheck size={14} className="text-purple-500" />}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-1.5 font-semibold text-gray-900 align-middle">
                              {activity.title}
                            </td>
                            <td className="py-2.5 px-1.5 text-gray-500 align-middle max-w-[300px]">
                              <div className="truncate">
                                {activity.description}
                              </div>
                            </td>
                            <td className="py-2.5 px-1.5 text-gray-400 text-xs align-middle">
                              {formatRelativeTime(activity.timestamp)}
                            </td>
                            <td className="py-2.5 px-1.5 text-gray-500 text-xs align-middle">
                              {activity.user?.name || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Footer Links */}
              <div className="flex justify-center gap-8 p-6 mt-8">
                <button
                  onClick={() => router.push('/profile')}
                  className="text-[13px] text-gray-500 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  onClick={() => router.push('/help')}
                  className="text-[13px] text-gray-500 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <HelpCircle size={14} /> Help
                </button>
                <button
                  onClick={() => router.push('/reports')}
                  className="text-[13px] text-gray-500 bg-transparent border-none cursor-pointer flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <BarChart3 size={14} /> Reports
                </button>
              </div>
            </>
          )}
        </main>

        {/* Bottom Navigation - Only visible on mobile */}
        <BottomNav activeTab="home" />
      </div>
    </ProtectedRoute >
  );
}
