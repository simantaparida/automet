import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import Breadcrumb from '@/components/Breadcrumb';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import ProfileEditModal from '@/components/ProfileEditModal';
import toast from 'react-hot-toast';
import {
  Building2,
  Mail,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  Phone,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  org_id: string;
  role: 'owner' | 'coordinator' | 'technician';
  full_name: string | null;
  contact_phone: string | null;
  profile_photo_url: string | null;
  created_at: string | null;
}

interface Organization {
  id: string;
  name: string;
  created_at: string | null;
}

interface UserStats {
  jobsAssigned: number;
  jobsCompleted: number;
  jobsInProgress: number;
  jobsCreated?: number;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { apiFetch, actualRole, activeRole } = useRoleSwitch();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const profileResponse = await apiFetch('/api/user/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch organization data
        if (profileData.org_id) {
          try {
            const orgResponse = await apiFetch('/api/organizations');
            if (orgResponse.ok) {
              const orgData = await orgResponse.json();
              setOrganization(orgData);
            }
          } catch (error) {
            console.error('Error fetching organization:', error);
          }
        }

        // Fetch user stats based on role
        await fetchUserStats(profileData.id, profileData.role);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: string, role: string) => {
    try {
      if (role === 'technician') {
        // For technicians, get assigned jobs
        const jobsResponse = await apiFetch('/api/jobs');
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const jobs = jobsData.jobs || jobsData || [];

          // Filter jobs assigned to this user
          const assignedJobs = jobs.filter((job: any) => {
            if (job.assignments && Array.isArray(job.assignments)) {
              return job.assignments.some((assignment: any) => assignment.user_id === userId);
            }
            return job.assigned_to === userId;
          });

          setStats({
            jobsAssigned: assignedJobs.length,
            jobsCompleted: assignedJobs.filter((j: any) => j.status === 'completed').length,
            jobsInProgress: assignedJobs.filter((j: any) => j.status === 'in_progress').length,
          });
        }
      } else {
        // For owners/coordinators, get all org jobs
        const jobsResponse = await apiFetch('/api/jobs');
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const jobs = jobsData.jobs || jobsData || [];

          setStats({
            jobsAssigned: jobs.length,
            jobsCompleted: jobs.filter((j: any) => j.status === 'completed').length,
            jobsInProgress: jobs.filter((j: any) => j.status === 'in_progress').length,
            jobsCreated: jobs.filter((j: any) => j.created_by === userId || !j.created_by).length,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/onboarding/welcome');
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
    }
  };

  const handleSaveProfile = async (updatedProfile: {
    full_name: string;
    contact_phone: string;
    profile_photo_url: string | null;
  }) => {
    try {
      const response = await apiFetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Refresh profile data
      await fetchProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };


  const getRoleConfig = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return {
          bg: '#fef3c7',
          color: '#d97706',
          border: '#fbbf24',
          label: 'Owner',
          icon: Shield,
        };
      case 'coordinator':
        return {
          bg: '#dbeafe',
          color: '#1e40af',
          border: '#3b82f6',
          label: 'Coordinator',
          icon: Shield,
        };
      case 'technician':
        return {
          bg: '#d1fae5',
          color: '#065f46',
          border: '#10b981',
          label: 'Technician',
          icon: Shield,
        };
      default:
        return {
          bg: '#f3f4f6',
          color: '#374151',
          border: '#9ca3af',
          label: 'User',
          icon: Shield,
        };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getInitials = () => {
    const name = getDisplayName() || 'User';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

  const roleConfig = getRoleConfig(profile?.role || 'user');
  const RoleIcon = roleConfig.icon;
  const isRoleSwitched = activeRole && actualRole && activeRole !== actualRole;

  return (
    <ProtectedRoute>
      <style jsx>{`
        .profile-container {
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
        @media (min-width: 768px) {
          .profile-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          .mobile-header {
            display: none;
          }
          .desktop-header {
            display: block;
          }
        }
      `}</style>

      <div
        className="profile-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="profile" />

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Desktop Breadcrumb */}
        <div
          className="desktop-header"
          style={{
            position: 'sticky',
            top: '64px',
            zIndex: 19,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Breadcrumb items={[{ label: 'Profile' }]} />
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
              margin: 0,
            }}
          >
            Profile
          </h1>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* User Info Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            {/* Edit Profile Button */}
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(239,119,34,0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(239,119,34,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(239,119,34,0.3)';
              }}
            >
              <Settings size={16} />
              Edit Profile
            </button>
            {/* Avatar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={getDisplayName()}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(239,119,34,0.3)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(239,119,34,0.3)',
                    border: '4px solid white',
                  }}
                >
                  {getInitials()}
                </div>
              )}
            </div>

            {/* User Details */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: '#111827',
                }}
              >
                {getDisplayName()}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <Mail size={16} color="#6b7280" />
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  {profile?.email || user?.email}
                </p>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: roleConfig.bg,
                  color: roleConfig.color,
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: `2px solid ${roleConfig.border}40`,
                }}
              >
                <RoleIcon size={14} />
                <span>{roleConfig.label}</span>
              </div>
              {isRoleSwitched && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#1e40af',
                    display: 'inline-block',
                  }}
                >
                  Viewing as: {getRoleConfig(activeRole).label}
                </div>
              )}
            </div>

            {/* Account Info */}
            <div
              style={{
                borderTop: '1px solid #f3f4f6',
                paddingTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {profile?.created_at && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(239,119,34,0.2)',
                    }}
                  >
                    <Calendar size={20} color="#EF7722" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        margin: 0,
                        fontWeight: '500',
                      }}
                    >
                      Member Since
                    </p>
                    <p
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0.25rem 0 0 0',
                      }}
                    >
                      {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>
              )}
              {/* Phone Number */}
              {profile?.contact_phone && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(239,119,34,0.2)',
                    }}
                  >
                    <Phone size={20} color="#EF7722" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        margin: 0,
                        fontWeight: '500',
                      }}
                    >
                      Phone Number
                    </p>
                    <p
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0.25rem 0 0 0',
                      }}
                    >
                      {profile.contact_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Stats */}
          {stats && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
                marginBottom: '1rem',
                padding: '1.5rem',
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
                Activity Summary
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem',
                }}
              >
                {actualRole === 'technician' ? (
                  <>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#eff6ff',
                        borderRadius: '10px',
                        border: '1px solid #93c5fd',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <Briefcase size={18} color="#2563eb" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Assigned
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#1e40af',
                        }}
                      >
                        {stats.jobsAssigned}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#fffbeb',
                        borderRadius: '10px',
                        border: '1px solid #fbbf24',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <Clock size={18} color="#f59e0b" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          In Progress
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#d97706',
                        }}
                      >
                        {stats.jobsInProgress}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '10px',
                        border: '1px solid #86efac',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <CheckCircle2 size={18} color="#10b981" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Completed
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#065f46',
                        }}
                      >
                        {stats.jobsCompleted}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#eff6ff',
                        borderRadius: '10px',
                        border: '1px solid #93c5fd',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <TrendingUp size={18} color="#2563eb" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Total Jobs
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#1e40af',
                        }}
                      >
                        {stats.jobsAssigned}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#fffbeb',
                        borderRadius: '10px',
                        border: '1px solid #fbbf24',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <Clock size={18} color="#f59e0b" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          In Progress
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#d97706',
                        }}
                      >
                        {stats.jobsInProgress}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '10px',
                        border: '1px solid #86efac',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <CheckCircle2 size={18} color="#10b981" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          Completed
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#065f46',
                        }}
                      >
                        {stats.jobsCompleted}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Organization Info */}
          {organization && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
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
                  marginBottom: '1rem',
                }}
              >
                Organization
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <Building2 size={24} color="#EF7722" />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      margin: 0,
                      fontWeight: '500',
                    }}
                  >
                    Organization Name
                  </p>
                  <p
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0.25rem 0 0 0',
                    }}
                  >
                    {organization.name}
                  </p>
                  {organization.created_at && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                      }}
                    >
                      Created {formatDate(organization.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
              marginBottom: '1rem',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => router.push('/settings')}
              disabled
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: 'white',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'not-allowed',
                opacity: 0.6,
                minHeight: '64px',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <Settings size={20} color="#EF7722" />
                </div>
                <span
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Settings
                </span>
              </div>
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                Coming Soon
              </span>
            </button>

            <button
              onClick={() => router.push('/help')}
              disabled
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: 'white',
                border: 'none',
                cursor: 'not-allowed',
                opacity: 0.6,
                minHeight: '64px',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <HelpCircle size={20} color="#EF7722" />
                </div>
                <span
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Help & Support
                </span>
              </div>
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                Coming Soon
              </span>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: signingOut
                ? '#9ca3af'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: signingOut ? 'not-allowed' : 'pointer',
              minHeight: '56px',
              boxShadow: signingOut
                ? 'none'
                : '0 2px 8px rgba(239,68,68,0.25)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
            onMouseEnter={(e) => {
              if (!signingOut) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!signingOut) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.25)';
              }
            }}
          >
            <LogOut size={20} />
            <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>

          {/* Info */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(239,119,34,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: '#EF7722',
                margin: 0,
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              Automet Field Service Management
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                margin: '0.5rem 0 0 0',
                textAlign: 'center',
              }}
            >
              Version 2.0.0 (MVP)
            </p>
          </div>
        </main>

        {/* Profile Edit Modal */}
        {profile && (
          <ProfileEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            currentProfile={{
              full_name: profile.full_name,
              contact_phone: profile.contact_phone,
              profile_photo_url: profile.profile_photo_url,
            }}
            onSave={handleSaveProfile}
          />
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab="profile" />
      </div>
    </ProtectedRoute>
  );
}
