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
      router.push('/login');
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
            maxWidth: '600px',
          }}
        >
          {/* Progress indicator */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Step 2 of 5</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>40%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{ width: '40%', height: '100%', backgroundColor: '#2563eb', borderRadius: '2px' }}></div>
            </div>
          </div>

          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '600' }}>
            Invite your team
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
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
                        color: '#dc2626',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
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
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                    }}
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
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                    }}
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
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                    }}
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
                  color: '#2563eb',
                  border: '1px dashed #2563eb',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
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
                padding: '0.75rem',
                marginBottom: '0.75rem',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
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
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
