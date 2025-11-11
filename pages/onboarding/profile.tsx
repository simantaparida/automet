/**
 * Profile Onboarding - Step 2
 * Complete user profile after organization is created
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProfileOnboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check if user has completed organization setup
  useEffect(() => {
    const checkOrgSetup = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!data?.org_id) {
        // No organization, go back to step 1
        router.push('/onboarding/organization');
      }
    };

    checkOrgSetup();
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('Not authenticated');

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          metadata: {
            designation: formData.designation,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          },
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Success! Go to success page
      router.push('/onboarding/success');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/success');
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
        <title>Complete Your Profile - Automet</title>
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
            maxWidth: '500px',
          }}
        >
          {/* Progress indicator */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Step 2 of 2</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>100%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#2563eb', borderRadius: '2px' }}></div>
            </div>
          </div>

          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '600' }}>
            Complete Your Profile
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Tell us a bit about yourself (you can skip this and complete it later)
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
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="fullName"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                placeholder="Your name"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label
                htmlFor="designation"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Your Role/Designation
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                placeholder="e.g., Operations Manager, Owner"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleSkip}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
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
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
