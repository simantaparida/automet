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
} from 'lucide-react';

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
  assignee: { id: string; name: string } | null;
  eta_status: 'on-time' | 'at-risk' | 'late';
}

interface AtRiskJob {
  id: string;
  title: string;
  scheduled_at: string;
  site: { id: string; name: string } | null;
  priority: string;
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
  const { apiFetch } = useRoleSwitch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [timelineJobs, setTimelineJobs] = useState<TimelineJob[]>([]);
  const [unassignedJobs, setUnassignedJobs] = useState<AtRiskJob[]>([]);
  const [atRiskJobs, setAtRiskJobs] = useState<AtRiskJob[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [overdueJobs, setOverdueJobs] = useState<TimelineJob[]>([]);
  const [inProgressJobs, setInProgressJobs] = useState<TimelineJob[]>([]);

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
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts || []);
        }

        if (techniciansRes.ok) {
          const techniciansData = await techniciansRes.json();
          setTechnicians(techniciansData.technicians || []);
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
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivities(activityData.activities || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
      <style jsx>{`
        .dashboard-container {
          margin-left: 260px;
          padding-top: 64px;
          padding-bottom: 0;
        }
        .dashboard-container:has(.desktop-header:has(.role-badge)) {
          padding-top: 96px;
        }
        .main-content {
          padding: 1.5rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .kpi-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          padding-bottom: 0.5rem;
        }
        .kpi-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .kpi-scroll-container::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .kpi-scroll-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .kpi-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <div
        className="dashboard-container"
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="home" />

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

        {/* Desktop Role Badge - Shows when role is switched */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Main Content */}
        <main
          className="main-content"
          style={{
            paddingTop: '1.5rem',
          }}
        >
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
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
            </div>
          ) : (
            <>
              {/* Welcome Header with Quick Actions */}
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0 0 0.25rem 0',
                    }}
                  >
                    {getGreeting()}, {getOwnerName()}!
                  </h1>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: '#6b7280',
                      margin: 0,
                    }}
                  >
                    Here's your snapshot for {getCurrentMonthYear()}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    onClick={() => router.push('/jobs/new')}
                    style={{
                      background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 1px 3px rgba(239,119,34,0.2)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
                    }}
                  >
                    <Plus size={18} /> Create Job
                  </button>
                  <button
                    onClick={() => router.push('/clients/new')}
                    style={{
                      backgroundColor: 'white',
                      color: '#111827',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    <Building2 size={16} /> Add Client
                  </button>
                  <button
                    onClick={() => router.push('/sites/new')}
                    style={{
                      backgroundColor: 'white',
                      color: '#111827',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    <MapPin size={16} /> Add Site
                  </button>
                  <button
                    onClick={() => router.push('/assets/new')}
                    style={{
                      backgroundColor: 'white',
                      color: '#111827',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    <Package size={16} /> Add Asset
                  </button>
                </div>
              </div>

              {/* Row 1: Primary KPI Cards - Horizontal Scroll */}
              <div className="kpi-scroll-container" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', minWidth: 'fit-content' }}>
                  {/* Scheduled */}
                  <button
                    className="kpi-card"
                    onClick={() => router.push('/jobs?status=scheduled')}
                    style={{
                      backgroundColor: 'white',
                      padding: '0.875rem',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      minWidth: '130px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    title="Jobs scheduled for today. Click to view."
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Calendar size={18} color="#EF7722" />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Scheduled</span>
                    </div>
                    <p style={{ fontSize: '1.375rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                      {kpis?.scheduled.count || 0}
                    </p>
                  </button>
                  {/* In Progress */}
                  <button
                    className="kpi-card"
                    onClick={() => router.push('/jobs?status=in_progress')}
                    style={{
                      backgroundColor: 'white',
                      padding: '0.875rem',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      minWidth: '130px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    title="Jobs currently being worked on. Click to view."
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Wrench size={18} color="#f59e0b" />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>In Progress</span>
                    </div>
                    <p style={{ fontSize: '1.375rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                      {kpis?.in_progress.count || 0}
                    </p>
                    {kpis?.in_progress.longest_running_hours && kpis.in_progress.longest_running_hours > 8 && (
                      <p style={{ fontSize: '0.6875rem', color: '#ef4444', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
                        Longest: {Math.round(kpis.in_progress.longest_running_hours)}h
                      </p>
                    )}
                  </button>
                  {/* Completed */}
                  <button
                    className="kpi-card"
                    onClick={() => router.push('/jobs?status=completed')}
                    style={{
                      backgroundColor: 'white',
                      padding: '0.875rem',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      minWidth: '130px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    title="Jobs completed today. Click to view."
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Completed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '1.375rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                        {kpis?.completed.count || 0}
                      </p>
                      {kpis?.completed.trend !== undefined && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.125rem',
                            fontSize: '0.6875rem',
                            color: kpis.completed.trend >= 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {kpis.completed.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>{Math.abs(Math.round(kpis.completed.trend))}%</span>
                        </div>
                      )}
                    </div>
                  </button>
                  {/* Overdue */}
                  <button
                    className="kpi-card"
                    onClick={() => router.push('/jobs?status=overdue')}
                    style={{
                      backgroundColor: 'white',
                      padding: '0.875rem',
                      borderRadius: '10px',
                      border: (kpis?.overdue.count || 0) > 0 ? '2px solid #ef4444' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      minWidth: '130px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = (kpis?.overdue.count || 0) > 0 ? '#ef4444' : '#e5e7eb';
                    }}
                    title="Jobs past due — action required. Click to view."
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertCircle size={18} color="#ef4444" />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Overdue</span>
                    </div>
                    <p
                      style={{
                        fontSize: '1.375rem',
                        fontWeight: '700',
                        color: (kpis?.overdue.count || 0) > 0 ? '#ef4444' : '#111827',
                        margin: 0,
                        lineHeight: '1.2',
                      }}
                    >
                      {kpis?.overdue.count || 0}
                    </p>
                  </button>
                  {/* Proof Pending */}
                  <button
                    className="kpi-card"
                    onClick={() => router.push('/jobs?status=completed&proof_missing=true')}
                    style={{
                      backgroundColor: 'white',
                      padding: '0.875rem',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      minWidth: '130px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      position: 'relative',
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    title="Completed jobs missing proof of completion. Click to review."
                  >
                    {kpis?.proof_pending.high_priority_count && kpis.proof_pending.high_priority_count > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '0.375rem',
                          right: '0.375rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontSize: '0.625rem',
                          fontWeight: '700',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '10px',
                        }}
                      >
                        {kpis.proof_pending.high_priority_count}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileCheck size={18} color="#f59e0b" />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Proof Pending</span>
                    </div>
                    <p style={{ fontSize: '1.375rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                      {kpis?.proof_pending.count || 0}
                    </p>
                  </button>
                  {/* Unassigned */}
                  <button
                    className="kpi-card"
                    onClick={() => router.push('/jobs?status=unassigned')}
                    style={{
                      backgroundColor: 'white',
                      padding: '0.875rem',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      minWidth: '130px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#EF7722';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    title="Jobs that need assignment. Click to assign."
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <UserPlus size={18} color="#6366f1" />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Unassigned</span>
                    </div>
                    <p style={{ fontSize: '1.375rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                      {kpis?.unassigned.count || 0}
                    </p>
                  </button>
                </div>
              </div>

              {/* Row 2: Overdue Jobs & Jobs in Progress */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Overdue Jobs */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
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
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <AlertCircle size={16} color="#ef4444" />
                      Overdue Jobs
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?status=overdue')}
                      style={{
                        fontSize: '0.8125rem',
                        color: '#EF7722',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {overdueJobs.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      No overdue jobs
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {overdueJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            padding: '0.625rem',
                            backgroundColor: '#fef2f2',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '0.8125rem',
                                  fontWeight: '600',
                                  color: '#111827',
                                  marginBottom: '0.25rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {job.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.6875rem',
                                  color: '#6b7280',
                                  lineHeight: '1.3',
                                }}
                              >
                                {job.site?.name || 'No site'} • {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(job.scheduled_at)}
                                {job.assignee && ` • ${job.assignee.name}`}
                              </div>
                            </div>
                            <span
                              style={{
                                backgroundColor: '#fecaca',
                                color: '#991b1b',
                                fontSize: '0.625rem',
                                fontWeight: '600',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '3px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
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
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
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
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Wrench size={16} color="#f59e0b" />
                      Jobs in Progress
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?status=in_progress')}
                      style={{
                        fontSize: '0.8125rem',
                        color: '#EF7722',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {inProgressJobs.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      No jobs in progress
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {inProgressJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            padding: '0.625rem',
                            backgroundColor: '#fffbeb',
                            borderRadius: '6px',
                            border: '1px solid #fef3c7',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef3c7';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fffbeb';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '0.8125rem',
                                  fontWeight: '600',
                                  color: '#111827',
                                  marginBottom: '0.25rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {job.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.6875rem',
                                  color: '#6b7280',
                                  lineHeight: '1.3',
                                }}
                              >
                                {job.site?.name || 'No site'} • {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(job.scheduled_at)}
                                {job.assignee && ` • ${job.assignee.name}`}
                              </div>
                            </div>
                            <span
                              style={{
                                backgroundColor: '#fde68a',
                                color: '#92400e',
                                fontSize: '0.625rem',
                                fontWeight: '600',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '3px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              IN PROGRESS
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Upcoming Jobs & Unassigned/At-risk Jobs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Upcoming Jobs */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
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
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Clock size={16} color="#6b7280" />
                      Upcoming Jobs
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?status=scheduled')}
                      style={{
                        fontSize: '0.8125rem',
                        color: '#EF7722',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {timelineJobs.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      No upcoming jobs
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {timelineJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            padding: '0.625rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff5ed';
                            e.currentTarget.style.borderColor = '#EF7722';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '0.8125rem',
                                  fontWeight: '600',
                                  color: '#111827',
                                  marginBottom: '0.25rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {job.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.6875rem',
                                  color: '#6b7280',
                                  lineHeight: '1.3',
                                }}
                              >
                                {job.site?.name || 'No site'} • {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(job.scheduled_at)}
                                {job.assignee && ` • ${job.assignee.name}`}
                              </div>
                            </div>
                            {job.eta_status === 'at-risk' && (
                              <span
                                style={{
                                  backgroundColor: '#fde68a',
                                  color: '#92400e',
                                  fontSize: '0.625rem',
                                  fontWeight: '600',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '3px',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                AT RISK
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unassigned & At-risk Jobs */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
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
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <AlertTriangle size={16} color="#f59e0b" />
                      Unassigned & At-risk Jobs
                    </h3>
                    <button
                      onClick={() => router.push('/jobs?filter=unassigned_or_atrisk')}
                      style={{
                        fontSize: '0.8125rem',
                        color: '#EF7722',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {unassignedJobs.length === 0 && atRiskJobs.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      No unassigned or at-risk jobs
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[...unassignedJobs.slice(0, 3), ...atRiskJobs.slice(0, 2)].slice(0, 5).map((job) => {
                        const isUnassigned = unassignedJobs.includes(job as AtRiskJob);
                        return (
                          <button
                            key={job.id}
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem',
                              padding: '0.625rem',
                              backgroundColor: isUnassigned ? '#fffbeb' : '#fef2f2',
                              borderRadius: '6px',
                              border: `1px solid ${isUnassigned ? '#fef3c7' : '#fee2e2'}`,
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isUnassigned ? '#fef3c7' : '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isUnassigned ? '#fffbeb' : '#fef2f2';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    color: '#111827',
                                    marginBottom: '0.25rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {job.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.6875rem',
                                    color: '#6b7280',
                                    lineHeight: '1.3',
                                  }}
                                >
                                  {job.site?.name || 'No site'} • {new Date(job.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(job.scheduled_at)}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.625rem',
                                  color: isUnassigned ? '#92400e' : '#991b1b',
                                  fontWeight: '600',
                                  backgroundColor: isUnassigned ? '#fde68a' : '#fecaca',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '3px',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
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
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0 0 0.75rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Sparkles size={16} color="#EF7722" />
                    Recent Activity
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: '2px solid #e5e7eb',
                          }}
                        >
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.5rem 0.375rem',
                              fontWeight: '600',
                              color: '#6b7280',
                              fontSize: '0.6875rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Type
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.5rem 0.375rem',
                              fontWeight: '600',
                              color: '#6b7280',
                              fontSize: '0.6875rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Action
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.5rem 0.375rem',
                              fontWeight: '600',
                              color: '#6b7280',
                              fontSize: '0.6875rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Details
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.5rem 0.375rem',
                              fontWeight: '600',
                              color: '#6b7280',
                              fontSize: '0.6875rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              width: '100px',
                            }}
                          >
                            Time
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.5rem 0.375rem',
                              fontWeight: '600',
                              color: '#6b7280',
                              fontSize: '0.6875rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            User
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.slice(0, 10).map((activity, index) => (
                          <tr
                            key={activity.id}
                            onClick={() => activity.link && router.push(activity.link)}
                            style={{
                              borderBottom: index < 9 ? '1px solid #f3f4f6' : 'none',
                              cursor: activity.link ? 'pointer' : 'default',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (activity.link) {
                                e.currentTarget.style.backgroundColor = '#fff5ed';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (activity.link) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <td
                              style={{
                                padding: '0.625rem 0.375rem',
                                verticalAlign: 'middle',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                }}
                              >
                                <div
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '5px',
                                    backgroundColor: '#fff5ed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {activity.type === 'job_completed' && <CheckCircle2 size={14} color="#10b981" />}
                                  {activity.type === 'job_created' && <Plus size={14} color="#EF7722" />}
                                  {activity.type === 'client_added' && <Building2 size={14} color="#6366f1" />}
                                  {activity.type === 'technician_added' && <Users size={14} color="#f59e0b" />}
                                  {activity.type === 'proof_uploaded' && <FileCheck size={14} color="#8b5cf6" />}
                                </div>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: '0.625rem 0.375rem',
                                fontWeight: '600',
                                color: '#111827',
                                verticalAlign: 'middle',
                              }}
                            >
                              {activity.title}
                            </td>
                            <td
                              style={{
                                padding: '0.625rem 0.375rem',
                                color: '#6b7280',
                                verticalAlign: 'middle',
                                maxWidth: '300px',
                              }}
                            >
                              <div
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {activity.description}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: '0.625rem 0.375rem',
                                color: '#9ca3af',
                                fontSize: '0.75rem',
                                verticalAlign: 'middle',
                              }}
                            >
                              {formatRelativeTime(activity.timestamp)}
                            </td>
                            <td
                              style={{
                                padding: '0.625rem 0.375rem',
                                color: '#6b7280',
                                fontSize: '0.75rem',
                                verticalAlign: 'middle',
                              }}
                            >
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2rem',
                  padding: '1.5rem',
                  marginTop: '2rem',
                }}
              >
                <button
                  onClick={() => router.push('/profile')}
                  style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  onClick={() => router.push('/help')}
                  style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <HelpCircle size={14} /> Help & Support
                </button>
                <button
                  onClick={() => router.push('/analytics')}
                  style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <BarChart3 size={14} /> Analytics
                </button>
              </div>
            </>
          )}
        </main>

        {/* Bottom Navigation - Only visible on mobile */}
        <BottomNav activeTab="home" />
      </div>
    </ProtectedRoute>
  );
}
