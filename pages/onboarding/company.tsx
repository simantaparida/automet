/**
 * Company Details - Onboarding Step 1
 * Create organization profile after user signs up
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';

export default function CompanyOnboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    industry: '',
    workingHoursFrom: '09:00',
    workingHoursTo: '18:00',
    currency: 'INR',
  });

  // Track page view
  useEffect(() => {
    OnboardingEvents.companyDetailsViewed();
    trackPageView('/onboarding/company');
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

      // Validate working hours
      if (formData.workingHoursFrom >= formData.workingHoursTo) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }

      // Call API route
      const response = await fetch('/api/onboarding/create-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          industry: formData.industry,
          workingHours: {
            from: formData.workingHoursFrom,
            to: formData.workingHoursTo,
          },
          currency: formData.currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      console.log('Organization created successfully:', data.organization);

      // Track success
      OnboardingEvents.companyDetailsCompleted(formData.industry, formData.currency);

      // Success! Go to team invite
      router.push('/onboarding/team');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to create organization');
      OnboardingEvents.companyDetailsFailed(err.message);
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
        <title>Tell us about your company - Automet</title>
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
            maxWidth: '500px',
          }}
        >
          {/* Progress indicator */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Step 1 of 5</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>20%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{ width: '20%', height: '100%', backgroundColor: '#2563eb', borderRadius: '2px' }}></div>
            </div>
          </div>

          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '600' }}>
            Tell us about your company
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Set up your company profile to get started with Automet
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
                htmlFor="organizationName"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Company Name *
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                placeholder="e.g., Sharma Services"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="industry"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                <option value="">Select industry</option>
                <option value="hvac">HVAC</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="elevator">Elevator/Lift Maintenance</option>
                <option value="fire_safety">Fire Safety Systems</option>
                <option value="security">Security Systems</option>
                <option value="it">IT Services</option>
                <option value="facility">Facility Management</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Working Hours *
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="time"
                    name="workingHoursFrom"
                    value={formData.workingHoursFrom}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '1rem',
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                    From
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="time"
                    name="workingHoursTo"
                    value={formData.workingHoursTo}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '1rem',
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                    To
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Currency *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="currency"
                    value="INR"
                    checked={formData.currency === 'INR'}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span>Indian Rupee (₹)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="currency"
                    value="USD"
                    checked={formData.currency === 'USD'}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span>US Dollar ($)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="currency"
                    value="OTHER"
                    checked={formData.currency === 'OTHER'}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span>Other</span>
                </label>
              </div>
            </div>

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
                marginBottom: '0.75rem',
              }}
            >
              {loading ? 'Creating...' : 'Save & continue →'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
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
