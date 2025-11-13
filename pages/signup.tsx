import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';
import { getAuthRedirectPath, getPostSignupRedirectPath } from '@/lib/auth-redirect';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle, user } = useAuth();
  const { redirect } = router.query;

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
        // User already exists - redirect to login
        setError('An account with this email already exists. Redirecting to login...');
        setTimeout(() => {
          router.push('/login?message=Account already exists. Please login.');
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
            href="/login"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500',
            }}
          >
            Go to Login
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
        }}
      >
        <h1
          style={{
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '1.75rem',
          }}
        >
          Create your account
        </h1>

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
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
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
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
              placeholder="e.g., Rajesh Kumar"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
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
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
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
                  width: '110px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
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
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                placeholder="9876543210"
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
              Enter 10-digit mobile number
            </p>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginBottom: '1rem' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
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
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500',
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
