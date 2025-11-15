/**
 * Welcome Screen - Onboarding Step 0
 * Entry point for new users
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { trackPageView } from '@/lib/analytics';

export default function Welcome() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { message } = router.query;

  useEffect(() => {
    trackPageView('/onboarding/welcome');
  }, []);

  // Redirect logged-in users immediately to dashboard
  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect to dashboard
      // Dashboard will show setup banner if they haven't completed onboarding
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Welcome to Automet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <style jsx>{`
        .welcome-container {
          padding: 2rem 1rem;
        }
        .welcome-card {
          max-width: 480px;
          padding: 3rem 2rem;
        }
        @media (min-width: 768px) {
          .welcome-container {
            padding: 2rem;
          }
          .welcome-card {
            padding: 3.5rem 2.5rem;
            max-width: 520px;
          }
        }
      `}</style>

      <div
        className="welcome-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          className="welcome-card"
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(239,119,34,0.15)',
            border: '1px solid rgba(239,119,34,0.1)',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#EF7722', margin: 0 }}>
              Automet
            </h1>
          </div>

          {/* Illustration placeholder - you can replace with an actual image */}
          <div
            style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 2rem',
              background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(239,119,34,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
            }}
          >
            📱
          </div>

          {/* Hero message */}
          <div
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 100%)',
              borderRadius: '10px',
              border: '2px solid rgba(239,119,34,0.2)',
            }}
          >
            <p
              style={{
                fontSize: '1.25rem',
                lineHeight: '1.6',
                color: '#111827',
                margin: 0,
                fontWeight: '500',
              }}
            >
              Simplify field operations. Track jobs, technicians, and assets — all in one place.
            </p>
          </div>

          {/* Message from query param (e.g., account already exists) */}
          {message && (
            <div
              style={{
                padding: '0.875rem',
                marginBottom: '1.5rem',
                backgroundColor: '#fff5ed',
                border: '2px solid rgba(239,119,34,0.3)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#EF7722',
                fontWeight: '500',
              }}
            >
              {typeof message === 'string' ? message : 'Please sign in to continue.'}
            </div>
          )}

          {/* Primary CTA */}
          <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
            <button
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1rem',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
              }}
            >
              Get started →
            </button>
          </Link>

          {/* Secondary link */}
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Already have an account?{' '}
            <Link
              href="/signup"
              style={{
                color: '#EF7722',
                textDecoration: 'none',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}