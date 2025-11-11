/**
 * Onboarding Success - Final Step
 * Welcome message and redirect to dashboard
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  // Redirect to dashboard after countdown
  useEffect(() => {
    if (countdown === 0) {
      router.push('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>Welcome to Automet!</title>
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
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '600px',
            textAlign: 'center',
          }}
        >
          {/* Success icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: '600', color: '#111827' }}>
            Welcome to Automet!
          </h1>

          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: '1.75' }}>
            Your organization is all set up. You're ready to start managing your field operations, tracking jobs, and growing your business.
          </p>

          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Quick Start Guide
            </h2>
            <ul style={{ textAlign: 'left', color: '#4b5563', lineHeight: '1.75', paddingLeft: '1.5rem' }}>
              <li>Add your first client from the Clients page</li>
              <li>Create job sites for your clients</li>
              <li>Add assets to track maintenance schedules</li>
              <li>Create and assign jobs to your team</li>
              <li>Invite team members from Settings</li>
            </ul>
          </div>

          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.125rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            Go to Dashboard
          </button>

          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </>
  );
}
