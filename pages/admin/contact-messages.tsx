/**
 * Admin Contact Messages Page
 * View and manage all contact form submissions
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminNav from '@/components/admin/AdminNav';

const ADMIN_SECRET_KEY = 'admin_secret_authenticated';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  notes: string | null;
}

interface ContactMessagesStats {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactMessagesStats>({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const storedSecret = sessionStorage.getItem(ADMIN_SECRET_KEY);
    if (storedSecret) {
      setAuthenticated(true);
      setCheckingAuth(false);
      void fetchMessages(storedSecret);
    } else {
      setCheckingAuth(false);
      setLoading(false);
    }
  }, []);

  async function fetchMessages(secret: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/contact-messages', {
        headers: {
          'X-Admin-Secret': secret,
        },
      });
      const data = (await response.json()) as {
        success?: boolean;
        data?: ContactMessage[];
        stats?: ContactMessagesStats;
        message?: string;
        error?: string;
      };

      console.log('API Response:', { status: response.status, data });

      if (!response.ok || !data.success) {
        const errorMsg = data.message || data.error || 'Failed to fetch contact messages';
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      setMessages(data.data || []);
      setStats(data.stats || { total: 0, new: 0, in_progress: 0, resolved: 0 });
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load contact messages'
      );
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const validAdminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;

    if (!validAdminSecret) {
      setAuthError('Admin authentication not configured');
      return;
    }

    if (password === validAdminSecret) {
      sessionStorage.setItem(ADMIN_SECRET_KEY, password);
      setAuthenticated(true);
      void fetchMessages(password);
    } else {
      setAuthError('Invalid admin password');
    }
  };

  const handleUpdateStatus = async (
    messageId: string,
    newStatus: string,
    notes?: string
  ) => {
    setUpdatingStatus(true);
    try {
      const secret = sessionStorage.getItem(ADMIN_SECRET_KEY);
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': secret || '',
        },
        body: JSON.stringify({
          id: messageId,
          status: newStatus,
          notes: notes || undefined,
        }),
      });

      if (response.ok) {
        // Refresh messages
        void fetchMessages(secret || '');
        setSelectedMessage(null);
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTopicLabel = (topic: string) => {
    const labels: Record<string, string> = {
      pricing: '💰 Pricing & Plans',
      features: '✨ Features',
      technical: '🔧 Technical',
      demo: '🎬 Demo',
      partnership: '🤝 Partnership',
      other: '💬 Other',
    };
    return labels[topic] || topic;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredMessages = messages.filter((msg) => {
    if (filterStatus === 'all') return true;
    return msg.status === filterStatus;
  });

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - Contact Messages</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Login
              </h1>
              <p className="text-gray-600 text-sm">
                Enter admin password to view contact messages
              </p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
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
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter admin password"
                    required
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
              </div>
              {authError && (
                <p className="text-red-600 text-sm mb-4">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Contact Messages - Admin Dashboard</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Contact Messages
            </h1>
            <p className="text-gray-600">
              View and manage all contact form submissions
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <p className="text-sm text-blue-800 mb-1">New</p>
              <p className="text-2xl font-bold text-blue-900">{stats.new}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <p className="text-sm text-yellow-800 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900">
                {stats.in_progress}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-green-800 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.resolved}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'new', 'in_progress', 'resolved', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filterStatus === status
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status === 'all'
                  ? 'All'
                  : status
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
              </button>
            ))}
          </div>

          {/* Messages List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No messages found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-white rounded-lg border-2 border-gray-200 hover:border-primary/40 transition-all overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() =>
                      setSelectedMessage(
                        selectedMessage?.id === message.id ? null : message
                      )
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {message.name}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            {message.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {getTopicLabel(message.topic)}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(
                              message.status
                            )}`}
                          >
                            {message.status
                              .split('_')
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {message.message}
                        </p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          selectedMessage?.id === message.id
                            ? 'transform rotate-180'
                            : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedMessage?.id === message.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Full Message:
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                          {message.message}
                        </p>
                      </div>

                      {message.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Internal Notes:
                          </h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                            {message.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">
                          Update Status:
                        </span>
                        {['new', 'in_progress', 'resolved', 'archived'].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleUpdateStatus(message.id, status)
                              }
                              disabled={
                                updatingStatus || message.status === status
                              }
                              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                message.status === status
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {status
                                .split('_')
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(' ')}
                            </button>
                          )
                        )}
                        <a
                          href={`mailto:${message.email}?subject=Re: ${getTopicLabel(message.topic)}`}
                          className="ml-auto px-3 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          Reply via Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

