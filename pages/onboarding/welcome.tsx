/**
 * Welcome Screen - Onboarding Step 0
 * Entry point for new users
 * 2-column layout: left content + right login/signup
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { trackPageView } from '@/lib/analytics';

export default function Welcome() {
  const router = useRouter();
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackPageView('/onboarding/welcome');
    setIsMounted(true);

    // Restore "keep me logged in" preference from localStorage
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('automet_keep_me_logged_in');
      if (savedPreference !== null) {
        setKeepMeLoggedIn(savedPreference === 'true');
      }
    }
  }, []);

  // Redirect logged-in users immediately to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    const { error } = await signIn(email, password, keepMeLoggedIn);

    if (error) {
      setError(error.message);
      setAuthLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setError(null);

    const { error } = await signInWithGoogle(keepMeLoggedIn);

    if (error) {
      setError(error.message);
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Welcome to Automet - Field Service Management Made Simple</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .slide-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        .slide-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        /* Custom checkbox styling with white checkmark */
        #keepMeLoggedIn {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }

        #keepMeLoggedIn:checked {
          background-color: #ef7722;
          border-color: #ef7722;
        }

        #keepMeLoggedIn:checked::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1px;
          width: 5px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        #keepMeLoggedIn:hover {
          border-color: #ef7722;
        }

        #keepMeLoggedIn:focus {
          outline: 2px solid rgba(239, 119, 34, 0.3);
          outline-offset: 2px;
        }

        /* Responsive styles */
        @media (min-width: 768px) {
          .main-container {
            grid-template-columns: 1fr 400px !important;
            gap: 3rem !important;
            padding: 2rem 3rem !important;
          }
          .hero-content {
            text-align: left !important;
          }
          .hero-logo {
            font-size: 2rem !important;
            margin-bottom: 1.5rem !important;
          }
          .hero-headline {
            font-size: 24px !important;
            line-height: 1.3 !important;
            margin-bottom: 1rem !important;
          }
          .hero-subtitle {
            font-size: 16px !important;
            line-height: 1.6 !important;
          }
        }
        @media (min-width: 1024px) {
          .main-container {
            grid-template-columns: 1fr 420px !important;
            gap: 4rem !important;
            padding: 2.5rem 4rem !important;
          }
          .hero-logo {
            font-size: 2.5rem !important;
            margin-bottom: 2rem !important;
          }
          .hero-headline {
            font-size: 28px !important;
          }
          .hero-subtitle {
            font-size: 17px !important;
          }
        }
        @media (min-width: 1280px) {
          .main-container {
            grid-template-columns: 1fr 440px !important;
            gap: 5rem !important;
            padding: 3rem 5rem !important;
          }
          .hero-logo {
            font-size: 3rem !important;
          }
          .hero-headline {
            font-size: 32px !important;
            margin-bottom: 1.25rem !important;
          }
          .hero-subtitle {
            font-size: 18px !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background:
              'radial-gradient(circle, rgba(239,119,34,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Main container: 2 columns on desktop */}
        <div
          className="main-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1.5rem 1rem',
            minHeight: '100vh',
            alignItems: 'center',
          }}
        >
          {/* Left: Compact Hero Content */}
          <div
            className={`hero-content ${isMounted ? 'slide-left' : ''}`}
            style={{
              opacity: isMounted ? 1 : 0,
              textAlign: 'center',
            }}
          >
            {/* Logo - responsive */}
            <div style={{ marginBottom: '1rem' }}>
              <h1
                className="hero-logo"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  background:
                    'linear-gradient(135deg, #EF7722 0%, #ff9a56 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                }}
              >
                Automet
              </h1>
            </div>

            {/* Hero Headline - responsive */}
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.75rem',
                lineHeight: '1.3',
              }}
              className="hero-headline"
            >
              Field Service Management{' '}
              <span style={{ color: '#EF7722' }}>Made Simple</span>
            </h2>

            {/* Subheadline - 14px */}
            <p
              style={{
                fontSize: '13px',
                color: '#4b5563',
                marginBottom: '0',
                lineHeight: '1.5',
              }}
              className="hero-subtitle"
            >
              Track jobs, manage technicians, and monitor assets in real-time.
            </p>
          </div>

          {/* Right: Login/Signup Form */}
          <div
            className={isMounted ? 'slide-right' : ''}
            style={{
              opacity: isMounted ? 1 : 0,
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
                maxWidth: '440px',
                margin: '0 auto',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.25rem',
                  textAlign: 'center',
                }}
              >
                Welcome Back
              </h2>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                }}
              >
                Log in to continue to your dashboard
              </p>

              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailLogin}>
                <div style={{ marginBottom: '0.875rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      color: '#374151',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    placeholder="you@example.com"
                    onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      color: '#374151',
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5625rem 2.5rem 0.5625rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      placeholder="••••••••"
                      onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                      onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Keep me logged in checkbox */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <input
                    type="checkbox"
                    id="keepMeLoggedIn"
                    checked={keepMeLoggedIn}
                    onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                    style={{
                      marginRight: '0.5rem',
                    }}
                  />
                  <label
                    htmlFor="keepMeLoggedIn"
                    style={{
                      fontSize: '0.8125rem',
                      color: '#374151',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Keep me logged in
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    background: authLoading
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: authLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '0.875rem',
                    transition: 'all 0.2s',
                    boxShadow: authLoading
                      ? 'none'
                      : '0 2px 8px rgba(239,119,34,0.25)',
                  }}
                  onMouseOver={(e) => {
                    if (!authLoading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(239,119,34,0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px rgba(239,119,34,0.25)';
                  }}
                >
                  {authLoading ? 'Signing in...' : 'Log in'}
                </button>
              </form>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.875rem',
                  color: '#6b7280',
                  fontSize: '0.75rem',
                }}
              >
                <div
                  style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}
                ></div>
                <span style={{ padding: '0 0.75rem' }}>OR</span>
                <div
                  style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}
                ></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (!authLoading) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <div
                style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                }}
              >
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Don't have an account?
                </p>
                <Link href="/signup" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'white',
                      color: '#EF7722',
                      border: '1.5px solid #EF7722',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF7722';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#EF7722';
                    }}
                  >
                    Create Account
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
