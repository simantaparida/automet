import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopHeader from '@/components/TopHeader';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import {
    Mail,
    Plus
} from 'lucide-react';

interface TeamMember {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

interface Invite {
    id: string;
    contact: string;
    name: string;
    role: string;
    created_at: string;
    status: string;
}

export default function TeamPage() {
    const { user } = useAuth();
    const { activeRole } = useRoleSwitch();
    const router = useRouter();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);

    useEffect(() => {
        if (activeRole === 'technician') {
            router.push('/dashboard');
            return;
        }
        fetchTeamData();
    }, [activeRole, router]);

    const fetchTeamData = async () => {
        try {
            const res = await fetch('/api/team');
            if (!res.ok) throw new Error('Failed to fetch team data');
            const data = await res.json();
            setMembers(data.users);
            setInvites(data.invites);
        } catch (err) {
            console.error(err);
            setError('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user? They will lose access immediately.')) {
            return;
        }

        setActionLoading(userId);
        try {
            const res = await fetch(`/api/team?userId=${userId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to remove user');
            }

            // Refresh list
            fetchTeamData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevokeInvite = async (inviteId: string) => {
        if (!confirm('Are you sure you want to revoke this invite?')) {
            return;
        }

        setActionLoading(inviteId);
        try {
            const res = await fetch(`/api/team/invite?inviteId=${inviteId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to revoke invite');
            }

            // Refresh list
            fetchTeamData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        setActionLoading(userId);
        try {
            const res = await fetch('/api/team', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update role');
            }

            // Refresh list
            fetchTeamData();
            setShowRoleModal(false);
            setSelectedUser(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const openRoleModal = (user: TeamMember) => {
        setSelectedUser(user);
        setShowRoleModal(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'coordinator':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'technician':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Desktop Top Header with Glassmorphism */}
                <div className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/80 border-b border-primary/10">
                    <TopHeader />
                </div>
                <Sidebar activeTab="team" />

                <main className="pt-20 pl-0 md:pl-[260px] pr-4 pb-20 min-h-screen transition-all">
                    <style jsx global>{`
                        @media (max-width: 767px) {
                            .main-content {
                                padding-left: 1rem !important;
                            }
                        }
                    `}</style>

                    <Head>
                        <title>Team Management - Automet</title>
                    </Head>

                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                                <p className="text-gray-500 mt-1">Manage your organization's users and roles</p>
                            </div>
                            <button
                                onClick={() => router.push('/team/invite')}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EF7722] hover:bg-[#e06912] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF7722] transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Invite Member
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF7722]"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Active Members */}
                                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h2 className="text-lg font-medium text-gray-900">Active Members ({members.length})</h2>
                                    </div>
                                    {members.length === 0 ? (
                                        <div className="p-8">
                                            <EmptyState
                                                title="No team members yet"
                                                description="Invite your first team member to get started"
                                            />
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            User
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Role
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Joined
                                                        </th>
                                                        <th scope="col" className="relative px-6 py-3">
                                                            <span className="sr-only">Actions</span>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {members.map((member) => (
                                                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                                                                        {member.full_name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                                                                        <div className="text-sm text-gray-500">{member.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(member.role)}`}>
                                                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(member.created_at)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                {/* Only show actions if not self and user is owner */}
                                                                {member.id !== user?.id && activeRole === 'owner' && (
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => openRoleModal(member)}
                                                                            className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold"
                                                                            disabled={actionLoading === member.id}
                                                                        >
                                                                            Edit Role
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRemoveUser(member.id)}
                                                                            className="text-red-600 hover:text-red-900 text-xs font-semibold"
                                                                            disabled={actionLoading === member.id}
                                                                        >
                                                                            {actionLoading === member.id ? 'Removing...' : 'Remove'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Pending Invites */}
                                {invites.length > 0 && (
                                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <h2 className="text-lg font-medium text-gray-900">Pending Invites ({invites.length})</h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Contact
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Role
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Sent
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th scope="col" className="relative px-6 py-3">
                                                            <span className="sr-only">Actions</span>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {invites.map((invite) => (
                                                        <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <Mail className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">{invite.name}</div>
                                                                        <div className="text-sm text-gray-500">{invite.contact}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(invite.role)}`}>
                                                                    {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(invite.created_at)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                                    Pending
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                {activeRole === 'owner' && (
                                                                    <button
                                                                        onClick={() => handleRevokeInvite(invite.id)}
                                                                        className="text-red-600 hover:text-red-900 ml-4"
                                                                        disabled={actionLoading === invite.id}
                                                                    >
                                                                        {actionLoading === invite.id ? 'Revoking...' : 'Revoke'}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Role Edit Modal */}
                    {showRoleModal && selectedUser && (
                        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowRoleModal(false)}></div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                    Edit Role for {selectedUser.full_name}
                                                </h3>
                                                <div className="mt-4 space-y-4">
                                                    <p className="text-sm text-gray-500">Select a new role for this user:</p>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {['owner', 'coordinator', 'technician'].map((role) => (
                                                            <button
                                                                key={role}
                                                                onClick={() => handleUpdateRole(selectedUser.id, role)}
                                                                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${selectedUser.role === role ? 'border-[#EF7722] bg-orange-50' : 'border-gray-200'}`}
                                                                disabled={actionLoading === selectedUser.id}
                                                            >
                                                                <div className="flex flex-col items-start">
                                                                    <span className="font-medium text-gray-900 capitalize">{role}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {role === 'owner' ? 'Full access to all features' :
                                                                            role === 'coordinator' ? 'Can manage jobs and team' :
                                                                                'Can view and complete assigned jobs'}
                                                                    </span>
                                                                </div>
                                                                {selectedUser.role === role && (
                                                                    <div className="h-2 w-2 rounded-full bg-[#EF7722]"></div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF7722] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => setShowRoleModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                <BottomNav activeTab="team" />
            </div>
        </ProtectedRoute>
    );
}
