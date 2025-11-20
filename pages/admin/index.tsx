/**
 * Admin Dashboard Landing Page
 * Central hub for all admin functions
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ADMIN_SECRET_KEY = 'admin_secret_authenticated';

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const storedSecret = sessionStorage.getItem(ADMIN_SECRET_KEY);
    if (storedSecret) {
      setAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

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
    } else {
      setAuthError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SECRET_KEY);
    setAuthenticated(false);
    setPassword('');
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - Automet</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Login
              </h1>
              <p className="text-gray-600 text-sm">
                Enter your admin password to access the dashboard
              </p>
            </div>

            {/* Login Form */}
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
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                Login to Admin Dashboard
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Website
                </Link>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // Admin Dashboard
  const adminSections = [
    {
      title: 'Waitlist Management',
      description: 'View and manage all waitlist signups',
      icon: '📝',
      href: '/admin/waitlist',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Contact Messages',
      description: 'View and respond to contact form submissions',
      icon: '💬',
      href: '/admin/contact-messages',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard - Automet</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="32" height="32" rx="6" fill="currentColor" />
                    <path
                      d="M9 12L16 8L23 12V20L16 24L9 20V12Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 8V16M9 12L16 16L23 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage your Automet platform
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  ← Back to Site
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to Admin Portal
              </h2>
              <p className="text-lg text-gray-600">
                Choose a section to manage your platform
              </p>
            </div>

            {/* Admin Sections Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {adminSections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`group ${section.bgColor} border-2 ${section.borderColor} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
                    >
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {section.description}
                      </p>
                      <div className="flex items-center text-primary font-medium text-sm">
                        Access Dashboard
                        <svg
                          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Access
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/admin/waitlist"
                  className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Waitlist
                    </p>
                    <p className="text-xs text-gray-600">View signups</p>
                  </div>
                </Link>
                <Link
                  href="/admin/contact-messages"
                  className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Messages
                    </p>
                    <p className="text-xs text-gray-600">View inquiries</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
