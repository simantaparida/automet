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

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem 1rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '3rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '480px',
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
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
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
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
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

          {/* Primary CTA */}
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1rem',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              Get started →
            </button>
          </Link>

          {/* Secondary link */}
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Already have an account?{' '}
            <Link
              href="/login"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
