import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import CollapsibleSection from '@/components/CollapsibleSection';
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
          setTimelineJobs(timelineData.upcoming || []);
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
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className="dashboard-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
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

        {/* Welcome Microcopy - Desktop only */}
        <div
          className="welcome-microcopy"
          style={{
            position: 'fixed',
            top: '64px',
            left: '260px',
            right: 0,
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
            padding: '0.5rem 2rem',
            zIndex: 20,
            fontSize: '0.875rem',
            color: '#6b7280',
          }}
        >
          {getGreeting()}, <strong style={{ color: '#111827' }}>{getOwnerName()}</strong>. Here's today's snapshot.
        </div>

        {/* Main Content */}
        <main
          className="main-content"
          style={{
            paddingTop: loading ? '1.5rem' : '0.5rem',
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
              {/* Row 1: Primary KPI Cards - Responsive Grid */}
              <div className="kpi-grid" style={{ paddingTop: '0.5rem' }}>
                {/* Scheduled */}
                <button
                    className="kpi-card"
                    onClick={() => router.push('/jobs?status=scheduled')}
                    style={{
                      backgroundColor: 'white',
                      padding: '0.875rem',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(239,119,34,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(239,119,34,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(239,119,34,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: (kpis?.overdue.count || 0) > 0 ? '2px solid #ef4444' : '1px solid rgba(239,119,34,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(239,119,34,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      position: 'relative',
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(239,119,34,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      minHeight: '90px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,119,34,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
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

              {/* Row 2: Alerts & Quick Actions */}
              <CollapsibleSection
                title="Alerts & Quick Actions"
                icon={<AlertTriangle size={20} />}
                badge={alerts.length > 0 ? alerts.length : undefined}
                badgeColor="#ef4444"
                defaultOpen={true}
              >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                }}
              >
                {/* Alerts & Exceptions */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(239,119,34,0.1)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertTriangle size={18} color="#ef4444" />
                    Alerts & Exceptions
                  </h3>
                  {alerts.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      No critical alerts. All clear.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {alerts.map((alert) => (
                        <button
                          key={alert.id}
                          onClick={() => {
                            if (alert.link) {
                              router.push(alert.link);
                            }
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            backgroundColor: alert.priority === 'high' ? '#fef2f2' : '#fffbeb',
                            border: `1px solid ${alert.priority === 'high' ? '#fee2e2' : '#fef3c7'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              alert.priority === 'high' ? '#fee2e2' : '#fef3c7';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              alert.priority === 'high' ? '#fef2f2' : '#fffbeb';
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '0.25rem',
                              }}
                            >
                              {alert.title} ({alert.count})
                            </div>
                            {alert.job_ids && alert.job_ids.length > 0 && (
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                }}
                              >
                                Job IDs: {alert.job_ids.slice(0, 3).map((id) => `#${id.slice(0, 8)}`).join(', ')}
                                {alert.job_ids.length > 3 && '...'}
                              </div>
                            )}
                          </div>
                          <ChevronRight size={16} color="#6b7280" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(239,119,34,0.1)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0 0 1rem 0',
                    }}
                  >
                    Quick Actions
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem',
                    }}
                  >
                    <button
                      onClick={() => router.push('/jobs/new')}
                      style={{
                        background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.875rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                        transition: 'all 0.2s',
                        gridColumn: '1 / -1',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
                      }}
                      title="Create a job quickly with site, client, and asset info"
                    >
                      <Plus size={18} /> Create New Job
                    </button>
                    <button
                      onClick={() => router.push('/clients/new')}
                      style={{
                        backgroundColor: 'white',
                        color: '#111827',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#EF7722';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <Building2 size={16} /> Add Client
                    </button>
                    <button
                      onClick={() => router.push('/sites/new')}
                      style={{
                        backgroundColor: 'white',
                        color: '#111827',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#EF7722';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <MapPin size={16} /> Add Site
                    </button>
                    <button
                      onClick={() => router.push('/assets/new')}
                      style={{
                        backgroundColor: 'white',
                        color: '#111827',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#EF7722';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <Package size={16} /> Add Asset
                    </button>
                  </div>
                </div>
              </div>
              </CollapsibleSection>

              {/* Row 3: Technician Overview */}
              {technicians.length > 0 && (
                <CollapsibleSection
                  title="Team Overview"
                  icon={<Users size={20} />}
                  badge={technicians.length}
                  defaultOpen={true}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <button
                      onClick={() => router.push('/profile')}
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
                      View full team <ChevronRight size={14} />
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {technicians.slice(0, 5).map((tech) => (
                      <div
                        key={tech.id}
                        onClick={() => router.push(`/profile/${tech.id}`)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.borderColor = '#EF7722';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: tech.avatar_url
                              ? `url(${tech.avatar_url})`
                              : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                            backgroundSize: 'cover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            border: `2px solid ${
                              tech.status === 'active'
                                ? '#10b981'
                                : tech.status === 'idle'
                                ? '#f59e0b'
                                : '#9ca3af'
                            }`,
                          }}
                        >
                          {!tech.avatar_url && tech.name.charAt(0).toUpperCase()}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '0.25rem',
                            textAlign: 'center',
                          }}
                        >
                          {tech.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {tech.jobs_count_today} job{tech.jobs_count_today !== 1 ? 's' : ''} today
                        </div>
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            color:
                              tech.status === 'active'
                                ? '#10b981'
                                : tech.status === 'idle'
                                ? '#f59e0b'
                                : '#9ca3af',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                          }}
                        >
                          {tech.status}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: '1rem 0 0 0',
                      fontStyle: 'italic',
                    }}
                  >
                    See who's active and who can take more jobs.
                  </p>
                </div>
                </CollapsibleSection>
              )}

              {/* Row 4: Jobs Timeline & At-risk Jobs */}
              <CollapsibleSection
                title="Timeline & At-risk Jobs"
                icon={<Clock size={20} />}
                defaultOpen={true}
              >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                }}
              >
                {/* Mini Timeline */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0,
                      }}
                    >
                      Upcoming Jobs
                    </h3>
                    <button
                      onClick={() => router.push('/jobs')}
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
                      View full schedule <ChevronRight size={14} />
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {timelineJobs.slice(0, 6).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
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
                          <Clock size={16} color="#6b7280" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
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
                                fontSize: '0.75rem',
                                color: '#6b7280',
                              }}
                            >
                              {job.site?.name || 'No site'} • {formatTime(job.scheduled_at)}
                              {job.assignee && ` • ${job.assignee.name}`}
                            </div>
                          </div>
                          {job.eta_status === 'at-risk' && (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                color: '#f59e0b',
                                fontWeight: '600',
                                backgroundColor: '#fef3c7',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              At-risk
                            </span>
                          )}
                          {job.eta_status === 'late' && (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                color: '#ef4444',
                                fontWeight: '600',
                                backgroundColor: '#fee2e2',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              Late
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unassigned & At-risk Jobs */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(239,119,34,0.1)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0 0 1rem 0',
                    }}
                  >
                    Unassigned & At-risk Jobs
                  </h3>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {unassignedJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            backgroundColor: '#fffbeb',
                            borderRadius: '8px',
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
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
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
                                fontSize: '0.75rem',
                                color: '#6b7280',
                              }}
                            >
                              {job.site?.name || 'No site'} • {formatTime(job.scheduled_at)}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/jobs/${job.id}?action=assign`);
                            }}
                            style={{
                              fontSize: '0.75rem',
                              color: '#EF7722',
                              fontWeight: '600',
                              background: 'white',
                              border: '1px solid #EF7722',
                              borderRadius: '6px',
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            Assign
                          </button>
                        </button>
                      ))}
                      {atRiskJobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            backgroundColor: '#fef2f2',
                            borderRadius: '8px',
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
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
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
                                fontSize: '0.75rem',
                                color: '#6b7280',
                              }}
                            >
                              {job.site?.name || 'No site'} • {formatTime(job.scheduled_at)}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: '#ef4444',
                              fontWeight: '600',
                              backgroundColor: '#fee2e2',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            At-risk
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </CollapsibleSection>

              {/* Row 5: Recent Activity Feed */}
              {activities.length > 0 && (
                <CollapsibleSection
                  title="Recent Activity"
                  icon={<BarChart3 size={20} />}
                  badge={activities.length}
                  defaultOpen={false}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activities.slice(0, 10).map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => activity.link && router.push(activity.link)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          cursor: activity.link ? 'pointer' : 'default',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (activity.link) {
                            e.currentTarget.style.backgroundColor = '#fff5ed';
                            e.currentTarget.style.borderColor = '#EF7722';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activity.link) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#EF7722',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {activity.type === 'job_completed' && <CheckCircle2 size={16} color="white" />}
                          {activity.type === 'job_created' && <Plus size={16} color="white" />}
                          {activity.type === 'client_added' && <Building2 size={16} color="white" />}
                          {activity.type === 'technician_added' && <Users size={16} color="white" />}
                          {activity.type === 'proof_uploaded' && <FileCheck size={16} color="white" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#111827',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {activity.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                            }}
                          >
                            {activity.description}
                          </div>
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              color: '#9ca3af',
                              marginTop: '0.25rem',
                            }}
                          >
                            {formatRelativeTime(activity.timestamp)}
                            {activity.user && ` • ${activity.user.name}`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <button
                      onClick={() => router.push('/jobs')}
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
                      <Sparkles size={14} /> Last sync: Just now
                    </button>
                  </div>
                </div>
                </CollapsibleSection>
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
