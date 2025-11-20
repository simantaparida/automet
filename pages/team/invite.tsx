import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import TopHeader from '@/components/TopHeader';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import { ArrowLeft, Mail, User, Shield, Send } from 'lucide-react';

export default function InvitePage() {
  const router = useRouter();
  const { activeRole } = useRoleSwitch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'technician',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/team');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (activeRole === 'technician') {
    if (typeof window !== 'undefined') {
      router.push('/dashboard');
    }
    return null;
  }

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <TopHeader />
        <Sidebar activeTab="team" />

        <main
          style={{
            paddingTop: '80px',
            paddingLeft: '260px', // Sidebar width
            paddingRight: '1rem',
            paddingBottom: '80px', // Bottom nav height
            minHeight: '100vh',
            transition: 'padding-left 0.2s',
          }}
          className="main-content"
        >
          <style jsx global>{`
            @media (max-width: 767px) {
              .main-content {
                padding-left: 1rem !important;
              }
            }
          `}</style>

          <Head>
            <title>Invite Member - Automet</title>
          </Head>

          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </button>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h1 className="text-xl font-bold text-gray-900">
                  Invite New Member
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Send an invitation to join your team
                </p>
              </div>

              <div className="p-6">
                {success ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <Send className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Invitation Sent!
                    </h3>
                    <p className="text-gray-500 mt-2">
                      We've sent an email to <strong>{formData.email}</strong>{' '}
                      with instructions to join.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                      Redirecting to team list...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          required
                          className="focus:ring-[#EF7722] focus:border-[#EF7722] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          required
                          className="focus:ring-[#EF7722] focus:border-[#EF7722] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Role
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="role"
                          required
                          className="focus:ring-[#EF7722] focus:border-[#EF7722] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 bg-white"
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                        >
                          <option value="technician">Technician</option>
                          <option value="coordinator">Coordinator</option>
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.role === 'technician'
                          ? 'Technicians can view assigned jobs, update status, and manage inventory.'
                          : 'Coordinators can manage jobs, clients, and view all team activities.'}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EF7722] hover:bg-[#e06912] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF7722] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Sending Invite...' : 'Send Invitation'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
        <BottomNav activeTab="team" />
      </div>
    </ProtectedRoute>
  );
}
