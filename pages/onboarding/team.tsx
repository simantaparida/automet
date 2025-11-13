/**
 * Team Invite - Onboarding Step 2
 * Invite team members via SMS or email
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';

interface TeamMember {
  id: string;
  name: string;
  contact: string;
  contactType: 'phone' | 'email';
  role: 'technician' | 'coordinator';
}

export default function TeamInvite() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: '', contact: '', contactType: 'phone', role: 'technician' },
  ]);

  // Track page view
  useEffect(() => {
    OnboardingEvents.teamInviteViewed();
    trackPageView('/onboarding/team');
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/onboarding/welcome');
    }
  }, [user, authLoading, router]);

  const addTeamMember = () => {
    if (teamMembers.length < 10) {
      setTeamMembers([
        ...teamMembers,
        {
          id: Date.now().toString(),
          name: '',
          contact: '',
          contactType: 'phone',
          role: 'technician',
        },
      ]);
    }
  };

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((member) => member.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const handleSkip = () => {
    OnboardingEvents.teamInviteSkipped();
    router.push('/onboarding/customer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty rows
      const validMembers = teamMembers.filter(
        (member) => member.name.trim() && member.contact.trim()
      );

      if (validMembers.length === 0) {
        setError('Please add at least one team member or skip this step');
        setLoading(false);
        return;
      }

      // Detect contact type (phone vs email)
      const invites = validMembers.map((member) => {
        const isEmail = member.contact.includes('@');
        return {
          name: member.name,
          contact: member.contact,
          contactType: isEmail ? 'email' : 'phone',
          role: member.role,
        };
      });

      const response = await fetch('/api/onboarding/invite-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invites }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invites');
      }

      console.log('Invites sent:', data);

      // Track success
      const techCount = invites.filter((i) => i.role === 'technician').length;
      const coordCount = invites.filter((i) => i.role === 'coordinator').length;
      OnboardingEvents.teamInviteSent(data.invitesSent, techCount, coordCount);

      // Show any failures
      if (data.invitesFailed && data.invitesFailed.length > 0) {
        const failedContacts = data.invitesFailed.map((f: any) => f.contact).join(', ');
        setError(`Some invites failed: ${failedContacts}`);
      }

      // Continue to next step
      router.push('/onboarding/customer');
    } catch (err: any) {
      console.error('Team invite error:', err);
      setError(err.message || 'Failed to send invites');
      OnboardingEvents.teamInviteFailed(err.message, 0);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Invite Your Team - Automet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <style jsx>{`
        .team-container {
          padding: 1.5rem 1rem;
        }
        .team-form {
          max-width: 500px;
          padding: 1.25rem;
        }
        .team-title {
          font-size: 1.125rem;
          margin-bottom: 0.375rem;
        }
        .team-subtitle {
          font-size: 0.8125rem;
          margin-bottom: 1.125rem;
        }
        .field-wrapper {
          margin-bottom: 0.875rem;
        }
        @media (min-width: 768px) {
          .team-container {
            padding: 2rem 2rem;
          }
          .team-form {
            max-width: 520px;
            padding: 1.75rem;
          }
          .team-title {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .team-subtitle {
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }
          .field-wrapper {
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div
        className="team-container"
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
          className="team-form"
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            width: '100%',
            margin: '0 auto',
            border: '1px solid rgba(239,119,34,0.1)',
          }}
        >
          {/* Progress indicator */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: '500' }}>Step 2 of 5</span>
              <span style={{ fontSize: '0.8125rem', color: '#EF7722', fontWeight: '600' }}>40%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#ffe8d6', borderRadius: '3px' }}>
              <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, #EF7722 0%, #ff8833 100%)', borderRadius: '3px' }}></div>
            </div>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => router.push('/onboarding/company')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF7722')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          <h1 className="team-title" style={{ fontWeight: '700', color: '#111827', textAlign: 'center' }}>
            Invite your team
          </h1>
          <p className="team-subtitle" style={{ color: '#6b7280', textAlign: 'center' }}>
            Add technicians and coordinators. You can skip this and add them later from Settings.
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

          <form onSubmit={handleSubmit}>
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    Team Member {index + 1}
                  </span>
                  {teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(member.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        color: '#EF7722',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ff8833')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#EF7722')}
                    >
                      × Remove
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                    placeholder="Name"
                    style={{
                      width: '100%',
                      padding: '0.5625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={member.contact}
                    onChange={(e) => updateTeamMember(member.id, 'contact', e.target.value)}
                    placeholder="Phone (+91 98765 43210) or Email"
                    style={{
                      width: '100%',
                      padding: '0.5625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                  <p style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                    Phone or email
                  </p>
                </div>

                <div>
                  <select
                    value={member.role}
                    onChange={(e) => updateTeamMember(member.id, 'role', e.target.value as 'technician' | 'coordinator')}
                    style={{
                      width: '100%',
                      padding: '0.5625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  >
                    <option value="technician">Technician</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
              </div>
            ))}

            {teamMembers.length < 10 && (
              <button
                type="button"
                onClick={addTeamMember}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  backgroundColor: 'white',
                  color: '#EF7722',
                  border: '1px dashed #EF7722',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff8f1';
                  e.currentTarget.style.borderColor = '#ff8833';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#EF7722';
                }}
              >
                + Add another team member
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.625rem',
                marginBottom: '0.75rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
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
              {loading ? 'Sending invites...' : 'Send invites →'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = '#EF7722', e.currentTarget.style.color = '#EF7722')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db', e.currentTarget.style.color = '#6b7280')}
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
