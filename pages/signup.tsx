import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';
import { getPostSignupRedirectPath } from '@/lib/auth-redirect';

export default function SignupPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  // Ensure client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track page view
  useEffect(() => {
    if (mounted) {
      OnboardingEvents.signupStarted('email');
      trackPageView('/signup');
    }
  }, [mounted]);

  // No automatic redirect - allow users to come back to signup page during onboarding

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Combine country code and phone number
    const fullPhone = formData.phoneNumber
      ? `${formData.countryCode} ${formData.phoneNumber}`.trim()
      : '';

    // Sign up with Supabase
    const { data, error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      fullPhone
    );

    if (error) {
      // Track signup failure
      OnboardingEvents.signupFailed(error.message);

      // Show user-friendly error messages
      if (error.message.includes('Email signups are disabled')) {
        setError('Email signups are currently disabled. Please use Google sign-in or contact support.');
      } else if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists') ||
        error.message.toLowerCase().includes('user already exists')
      ) {
        // User already exists - redirect to welcome/login
        setError('An account with this email already exists. Redirecting to sign in...');
        setTimeout(() => {
          router.push('/onboarding/welcome?message=Account already exists. Please sign in.');
        }, 2000);
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      // Track signup success
      OnboardingEvents.signupCompleted('email');
      // Check if the user was immediately logged in or needs email confirmation
      // data.user exists but data.session determines if they're logged in

      if (data?.session) {
        // User is immediately logged in (email confirmation disabled)
        // Check if they already completed onboarding (edge case: returning user)
        const userCheckResult = await supabase
          .from('users')
          .select('org_id')
          .eq('id', data.user.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows

        const userData = userCheckResult.data as { org_id: string | null } | null;

        // Use centralized post-signup redirect logic
        const redirectPath = getPostSignupRedirectPath(userData);
        router.push(redirectPath);
      } else {
        // Email confirmation required - show success screen
        setSuccess(true);
        setLoading(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Redirect happens via OAuth callback
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Check Your Email - Automet</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
              Check your email!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              We've sent a confirmation link to <strong>{formData.email}</strong>.
              Please check your inbox and click the link to verify your account.
            </p>
            <a
              href="/onboarding/welcome"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
              }}
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Create Your Account - Automet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <style jsx>{`
        .signup-container {
          padding: 1.5rem 1rem;
        }
        .signup-form {
          max-width: 440px;
          padding: 1.5rem;
        }
        .signup-title {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }
        .signup-subtitle {
          font-size: 0.8125rem;
          margin-bottom: 1.25rem;
        }
        .field-label {
          font-size: 0.8125rem;
          margin-bottom: 0.375rem;
        }
        .field-wrapper {
          margin-bottom: 0.875rem;
        }
        @media (min-width: 768px) {
          .signup-container {
            padding: 2rem 2rem;
          }
          .signup-form {
            max-width: 480px;
            padding: 2rem;
          }
          .signup-title {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .signup-subtitle {
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }
          .field-label {
            font-size: 0.875rem;
            margin-bottom: 0.4rem;
          }
          .field-wrapper {
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="signup-container"
      >
        {/* Decorative background element */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(239,119,34,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div
          className="signup-form"
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            width: '100%',
            margin: '0 auto',
            border: '1px solid rgba(239,119,34,0.1)',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #EF7722 0%, #ff9a56 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
              }}
            >
              Automet
            </h2>
          </div>

          <h1
            className="signup-title"
            style={{
              textAlign: 'center',
              fontWeight: '700',
              color: '#111827',
            }}
          >
            Create your account
          </h1>

          <p
            className="signup-subtitle"
            style={{
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Start managing your field operations today
          </p>

          {error && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignup}>
            <div className="field-wrapper">
              <label
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                placeholder="e.g., Rajesh Kumar"
                onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
            </div>

            <div className="field-wrapper">
              <label
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                placeholder="you@example.com"
                onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
            </div>

            <div className="field-wrapper">
              <label
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="field-wrapper">
              <label
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="field-wrapper">
              <label
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Phone (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  style={{
                    width: '115px',
                    padding: '0.625rem 0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    backgroundColor: 'white',
                  }}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+82">🇰🇷 +82</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+61">🇦🇺 +61</option>
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    // Only allow digits and limit to 10 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phoneNumber: value });
                  }}
                  maxLength={10}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  placeholder="9876543210"
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                Enter 10-digit mobile number
              </p>
            </div>

            <p style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', marginBottom: '1rem' }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.625rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '0.875rem',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(239,119,34,0.25)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
              }}
            >
              {loading ? 'Creating account...' : 'Sign up with Email'}
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#6b7280',
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}
            ></div>
            <span style={{ padding: '0 1rem' }}>OR</span>
            <div
              style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}
            ></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'white',
              color: '#1f2937',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <svg
              width="18"
              height="18"
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

          <p
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            Already have an account?{' '}
            <a
              href="/onboarding/welcome"
              style={{
                color: '#EF7722',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
