/**
 * Admin Waitlist Page
 * View all waitlist entries with details
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';

const ADMIN_SECRET_KEY = 'admin_secret_authenticated';

interface Preorder {
  id: string;
  org_name: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  tech_count: number | null;
  city: string | null;
  plan_interest: string | null;
  payment_status: string;
  amount_paid: number;
  email_confirmed: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
}

interface WaitlistStats {
  total: number;
  confirmed: number;
  paid: number;
}

export default function AdminWaitlistPage() {
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [stats, setStats] = useState<WaitlistStats>({
    total: 0,
    confirmed: 0,
    paid: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const storedSecret = sessionStorage.getItem(ADMIN_SECRET_KEY);
    if (storedSecret) {
      setAuthenticated(true);
      setCheckingAuth(false);
      void fetchWaitlist(storedSecret);
    } else {
      setCheckingAuth(false);
      setLoading(false);
    }
  }, []);

  async function fetchWaitlist(secret: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/waitlist', {
        headers: {
          'X-Admin-Secret': secret,
        },
      });
      const data = (await response.json()) as {
        success?: boolean;
        data?: Preorder[];
        stats?: WaitlistStats;
        message?: string;
      };

      if (!response.ok) {
        if (response.status === 401) {
          // Invalid secret, clear stored secret
          sessionStorage.removeItem(ADMIN_SECRET_KEY);
          setAuthenticated(false);
          setAuthError(data.message || 'Invalid password');
          setLoading(false);
          return;
        }
        throw new Error(data.message || 'Failed to fetch waitlist');
      }

      setPreorders(data.data || []);
      setStats(data.stats || { total: 0, confirmed: 0, paid: 0 });
    } catch (err) {
      console.error('Error fetching waitlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    if (!password.trim()) {
      setAuthError('Please enter the admin password');
      return;
    }

    // Try to authenticate by fetching the waitlist
    setLoading(true);
    try {
      const response = await fetch('/api/admin/waitlist', {
        headers: {
          'X-Admin-Secret': password,
        },
      });
      const data = (await response.json()) as {
        success?: boolean;
        data?: Preorder[];
        stats?: WaitlistStats;
        message?: string;
      };

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError(data.message || 'Invalid password. Access denied.');
          setLoading(false);
          return;
        }
        throw new Error(data.message || 'Failed to authenticate');
      }

      // Success - store secret and authenticate
      sessionStorage.setItem(ADMIN_SECRET_KEY, password);
      setAuthenticated(true);
      setPreorders(data.data || []);
      setStats(data.stats || { total: 0, confirmed: 0, paid: 0 });
    } catch (err) {
      console.error('Authentication error:', err);
      setAuthError(
        err instanceof Error ? err.message : 'Failed to authenticate'
      );
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPlanInterest = (plan: string | null) => {
    if (!plan) return '—';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  // Show login form if not authenticated
  if (checkingAuth) {
    return (
      <>
        <Head>
          <title>Waitlist - Admin | Automet</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Admin Login | Automet</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
              <p className="text-gray-600 mt-2">
                Enter the admin password to view waitlist
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin(e);
              }}
            >
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter admin password"
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {authError && (
                  <p className="mt-2 text-sm text-red-600">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Access Waitlist'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Waitlist - Admin | Automet</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading waitlist...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Waitlist - Admin | Automet</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Waitlist
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Waitlist - Admin | Automet</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Waitlist</h1>
            <p className="text-gray-600">View all waitlist signups</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">
                Total Signups
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">
                Email Confirmed
              </div>
              <div className="text-3xl font-bold text-primary mt-2">
                {stats.confirmed}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">Paid</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {stats.paid}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preorders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No waitlist entries yet.
                      </td>
                    </tr>
                  ) : (
                    preorders.map((preorder) => (
                      <tr key={preorder.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {preorder.contact_name || '—'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {preorder.email}
                            </div>
                            {preorder.phone && (
                              <div className="text-sm text-gray-500">
                                {preorder.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {preorder.org_name || '—'}
                          </div>
                          {preorder.city && (
                            <div className="text-sm text-gray-500">
                              {preorder.city}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {preorder.tech_count
                              ? `${preorder.tech_count} techs`
                              : '—'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Plan: {formatPlanInterest(preorder.plan_interest)}
                          </div>
                          {preorder.utm_source && (
                            <div className="text-xs text-gray-400 mt-1">
                              Source: {preorder.utm_source}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {preorder.email_confirmed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Confirmed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pending
                              </span>
                            )}
                            {preorder.payment_status === 'paid' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                ₹{preorder.amount_paid} Paid
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(preorder.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Button */}
          {preorders.length > 0 && (
            <div className="mt-6 text-center">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    const csv = [
                      [
                        'Name',
                        'Email',
                        'Phone',
                        'Organization',
                        'City',
                        'Tech Count',
                        'Plan Interest',
                        'Payment Status',
                        'Amount Paid',
                        'Email Confirmed',
                        'Created At',
                      ].join(','),
                      ...preorders.map((p) =>
                        [
                          p.contact_name || '',
                          p.email,
                          p.phone || '',
                          p.org_name || '',
                          p.city || '',
                          p.tech_count || '',
                          p.plan_interest || '',
                          p.payment_status,
                          p.amount_paid,
                          p.email_confirmed ? 'Yes' : 'No',
                          p.created_at,
                        ].join(',')
                      ),
                    ].join('\n');

                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Export to CSV
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem(ADMIN_SECRET_KEY);
                    setAuthenticated(false);
                    setPreorders([]);
                    setStats({ total: 0, confirmed: 0, paid: 0 });
                    setPassword('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
