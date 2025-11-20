/**
 * Join Team via Invite
 * Handles both 6-digit codes and UUID tokens
 * URL formats:
 * - /join/123456 (6-digit code)
 * - /join/uuid-token-here (UUID token from link)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';

interface InviteDetails {
  name: string;
  organizationName: string;
  role: 'technician' | 'coordinator';
  invitedBy: string;
  expiresAt: string;
  isExpired: boolean;
}

export default function JoinTeam() {
  const router = useRouter();
  const { code } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null
  );
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  // Track page view
  useEffect(() => {
    if (code) {
      OnboardingEvents.invitePageViewed(code as string);
      trackPageView(`/join/${code}`);
    }
  }, [code]);

  // Verify invite when code is available (for token links only)
  useEffect(() => {
    const verifyInvite = async () => {
      if (!code || typeof code !== 'string') return;

      // Only verify if it's a token (UUID format), not a 6-digit code
      const isToken = code.length > 10;
      if (!isToken) {
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/invites/verify/${code}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'Invalid invite link');
          setVerifying(false);
          return;
        }

        if (data.invite.isExpired) {
          setError(
            'This invite has expired. Please contact your manager for a new invite.'
          );
          setVerifying(false);
          return;
        }

        setInviteDetails(data.invite);
        setVerifying(false);
      } catch (err: any) {
        console.error('Verify invite error:', err);
        setError('Failed to verify invite');
        setVerifying(false);
      }
    };

    verifyInvite();
  }, [code]);

  const handleAccept = async () => {
    if (!user) {
      // Not logged in - redirect to signup with return URL
      const returnUrl = `/join/${code}`;
      router.push(`/signup?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isToken = typeof code === 'string' && code.length > 10;

      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isToken ? { token: code } : { code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invite');
      }

      console.log('Invite accepted:', data);

      // Track success
      OnboardingEvents.inviteAccepted(
        code as string,
        data.role,
        data.organization?.name || ''
      );

      setAcceptSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push(data.redirectTo || '/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Accept invite error:', err);
      setError(err.message || 'Failed to accept invite');
      OnboardingEvents.inviteAcceptFailed(code as string, err.message);
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading || verifying) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div>Verifying invite...</div>
      </div>
    );
  }

  // Show success state
  if (acceptSuccess) {
    return (
      <>
        <Head>
          <title>Invite Accepted - Automet</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
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
              maxWidth: '480px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                backgroundColor: '#d1fae5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
              }}
            >
              ✓
            </div>

            <h1
              style={{
                marginBottom: '0.5rem',
                fontSize: '1.75rem',
                fontWeight: '600',
              }}
            >
              Welcome to the team!
            </h1>
            <p
              style={{
                color: '#6b7280',
                marginBottom: 0,
                fontSize: '0.875rem',
              }}
            >
              Redirecting you to the dashboard...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error && !inviteDetails) {
    return (
      <>
        <Head>
          <title>Invalid Invite - Automet</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
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
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '480px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
              }}
            >
              ×
            </div>

            <h1
              style={{
                marginBottom: '0.5rem',
                fontSize: '1.75rem',
                fontWeight: '600',
              }}
            >
              Invalid or expired invite
            </h1>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '2rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </p>

            <Link href="/onboarding/welcome" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Show invite details and accept button
  const isToken = typeof code === 'string' && code.length > 10;
  const roleDisplay =
    inviteDetails?.role === 'technician' ? 'Technician' : 'Coordinator';

  return (
    <>
      <Head>
        <title>
          Join {inviteDetails?.organizationName || 'Team'} - Automet
        </title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
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
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '480px',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            👋
          </div>

          <h1
            style={{
              marginBottom: '0.5rem',
              fontSize: '1.75rem',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            You've been invited!
          </h1>
          <p
            style={{
              color: '#6b7280',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            {inviteDetails?.invitedBy || 'Your manager'} has invited you to join
            their team on Automet.
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

          {/* Invite details */}
          {inviteDetails && (
            <div
              style={{
                padding: '1.5rem',
                marginBottom: '1.5rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Organization
                </div>
                <div
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                  }}
                >
                  {inviteDetails.organizationName}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Your Role
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  {roleDisplay}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Name
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  {inviteDetails.name}
                </div>
              </div>
            </div>
          )}

          {/* Accept button or login prompt */}
          {!user ? (
            <>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                Create an account or log in to accept this invite
              </p>
              <button
                onClick={handleAccept}
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
                  marginBottom: '0.75rem',
                }}
              >
                {loading ? 'Processing...' : 'Sign up to continue'}
              </button>
              <Link
                href={`/onboarding/welcome?redirect=${encodeURIComponent(`/join/${code}`)}`}
                style={{ textDecoration: 'none' }}
              >
                <button
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Already have an account? Log in
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={handleAccept}
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
              }}
            >
              {loading ? 'Accepting invite...' : 'Accept invite →'}
            </button>
          )}

          {/* Invite code display for manual entry */}
          {!isToken && code && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#0c4a6e',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Invite Code
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#0c4a6e',
                  letterSpacing: '0.15em',
                }}
              >
                {code}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
