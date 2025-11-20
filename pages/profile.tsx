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
              return job.assignments.some(
                (assignment: any) => assignment.user_id === userId
              );
            }
            return job.assigned_to === userId;
          });

          setStats({
            jobsAssigned: assignedJobs.length,
            jobsCompleted: assignedJobs.filter(
              (j: any) => j.status === 'completed'
            ).length,
            jobsInProgress: assignedJobs.filter(
              (j: any) => j.status === 'in_progress'
            ).length,
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
            jobsCompleted: jobs.filter((j: any) => j.status === 'completed')
              .length,
            jobsInProgress: jobs.filter((j: any) => j.status === 'in_progress')
              .length,
            jobsCreated: jobs.filter(
              (j: any) => j.created_by === userId || !j.created_by
            ).length,
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
      return (
        (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')
      ).toUpperCase();
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
            background:
              'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pb-20 md:pb-0 md:pt-16 md:ml-[260px] font-sans">
        {/* Desktop Sidebar */}
        <Sidebar activeTab="profile" />

        {/* Desktop Top Header */}
        <div className="hidden md:block">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="hidden md:block">
          <RoleBadge />
        </div>

        {/* Desktop Breadcrumb */}
        <div className="hidden md:block sticky top-16 z-10 shadow-sm">
          <Breadcrumb items={[{ label: 'Profile' }]} />
        </div>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4 shadow-lg shadow-primary-500/20">
          <h1 className="text-xl font-bold m-0">Profile</h1>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8 max-w-3xl mx-auto">
          {/* User Info Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-orange-100 relative mb-6">
            {/* Edit Profile Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-primary-500/30 transition-all flex items-center gap-2"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>

            {/* Avatar */}
            <div className="flex justify-center mb-6">
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={getDisplayName()}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl shadow-orange-500/20"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary-500/20 border-4 border-white">
                  {getInitials()}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {getDisplayName()}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail size={16} className="text-gray-500" />
                <p className="text-sm text-gray-500 m-0">
                  {profile?.email || user?.email}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${
                    roleConfig.bg === '#fef3c7'
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : roleConfig.bg === '#dbeafe'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : roleConfig.bg === '#d1fae5'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <RoleIcon size={14} />
                  <span>{roleConfig.label}</span>
                </div>

                {isRoleSwitched && (
                  <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
                    Viewing as: {getRoleConfig(activeRole).label}
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="border-t border-gray-100 pt-6 flex flex-col gap-4">
              {profile?.created_at && (
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-orange-50/50 transition-colors">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
                    <Calendar size={20} className="text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                      Member Since
                    </p>
                    <p className="text-base font-semibold text-gray-900 m-0">
                      {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone Number */}
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-orange-50/50 transition-colors">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
                  <Phone size={20} className="text-primary-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                    Phone Number
                  </p>
                  <p className="text-base font-semibold text-gray-900 m-0">
                    {profile?.contact_phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          {stats && (
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 mb-6 p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Activity Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {actualRole === 'technician' ? (
                  <>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={18} className="text-blue-600" />
                        <span className="text-xs text-gray-500 font-medium">
                          Assigned
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        {stats.jobsAssigned}
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-amber-500" />
                        <span className="text-xs text-gray-500 font-medium">
                          In Progress
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-amber-700">
                        {stats.jobsInProgress}
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-xs text-gray-500 font-medium">
                          Completed
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-800">
                        {stats.jobsCompleted}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        <span className="text-xs text-gray-500 font-medium">
                          Total Jobs
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        {stats.jobsAssigned}
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-amber-500" />
                        <span className="text-xs text-gray-500 font-medium">
                          In Progress
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-amber-700">
                        {stats.jobsInProgress}
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-xs text-gray-500 font-medium">
                          Completed
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-800">
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Organization
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                  <Building2 size={24} className="text-primary-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    Organization Name
                  </p>
                  <p className="text-lg font-bold text-gray-900 m-0">
                    {organization.name}
                  </p>
                  {organization.created_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Created {formatDate(organization.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 mb-6 overflow-hidden divide-y divide-gray-100">
            <button
              onClick={() => router.push('/settings')}
              disabled
              className="w-full flex items-center justify-between p-4 bg-white border-none cursor-not-allowed opacity-60 min-h-[64px] hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
                  <Settings size={20} className="text-primary-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Settings
                </span>
              </div>
              <span className="text-xs font-medium text-gray-400">
                Coming Soon
              </span>
            </button>

            <button
              onClick={() => router.push('/help')}
              disabled
              className="w-full flex items-center justify-between p-4 bg-white border-none cursor-not-allowed opacity-60 min-h-[64px] hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
                  <HelpCircle size={20} className="text-primary-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Help & Support
                </span>
              </div>
              <span className="text-xs font-medium text-gray-400">
                Coming Soon
              </span>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={`w-full p-4 mb-6 border-none rounded-xl text-base font-semibold cursor-pointer min-h-[56px] flex items-center justify-center gap-2 transition-all ${
              signingOut
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 hover:-translate-y-0.5 hover:shadow-red-500/30'
            }`}
          >
            <LogOut size={20} />
            <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>

          {/* Info */}
          <div className="p-5 bg-white rounded-xl border border-orange-100 shadow-sm text-center">
            <p className="text-sm font-semibold text-primary-500 m-0">
              Automet Field Service Management
            </p>
            <p className="text-xs text-gray-400 mt-2 m-0">
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
