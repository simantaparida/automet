/**
 * Company Details - Onboarding Step 1
 * Create organization profile after user signs up
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';
import TimePickerModal from '@/components/TimePickerModal';

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

  // Time picker modal states
  const [isFromTimePickerOpen, setIsFromTimePickerOpen] = useState(false);
  const [isToTimePickerOpen, setIsToTimePickerOpen] = useState(false);

  // Format time for display (24h to 12h)
  const formatTimeDisplay = (time24: string) => {
    const [hours24 = 0, minutes = 0] = time24.split(':').map(Number);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Load cached form data from localStorage on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('companyOnboardingData');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse cached form data:', e);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('companyOnboardingData', JSON.stringify(formData));
  }, [formData]);

  // Track page view
  useEffect(() => {
    OnboardingEvents.companyDetailsViewed();
    trackPageView('/onboarding/company');
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/onboarding/welcome');
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

      // Clear cached form data after successful submission
      localStorage.removeItem('companyOnboardingData');

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

      <style jsx>{`
        .company-container {
          padding: 1.5rem 1rem;
        }
        .company-form {
          max-width: 500px;
          padding: 1.25rem;
        }
        .company-title {
          font-size: 1.125rem;
          margin-bottom: 0.375rem;
        }
        .company-subtitle {
          font-size: 0.8125rem;
          margin-bottom: 1.125rem;
        }
        .field-wrapper {
          margin-bottom: 0.875rem;
        }
        .field-label {
          font-size: 0.8125rem;
          margin-bottom: 0.375rem;
        }
        .time-selector {
          flex-direction: column;
          gap: 0.75rem;
        }
        @media (min-width: 768px) {
          .company-container {
            padding: 2rem 2rem;
          }
          .company-form {
            max-width: 520px;
            padding: 1.75rem;
          }
          .company-title {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .company-subtitle {
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }
          .field-wrapper {
            margin-bottom: 1rem;
          }
          .field-label {
            font-size: 0.875rem;
            margin-bottom: 0.4rem;
          }
          .time-selector {
            flex-direction: row;
            gap: 1rem;
          }
        }
      `}</style>

      <div
        className="company-container"
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
          className="company-form"
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
              <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: '500' }}>Step 1 of 5</span>
              <span style={{ fontSize: '0.8125rem', color: '#EF7722', fontWeight: '600' }}>20%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#ffe8d6', borderRadius: '3px' }}>
              <div style={{ width: '20%', height: '100%', background: 'linear-gradient(90deg, #EF7722 0%, #ff8833 100%)', borderRadius: '3px' }}></div>
            </div>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => router.push('/signup')}
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
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1 className="company-title" style={{ fontWeight: '700', color: '#111827', textAlign: 'center' }}>
            Tell us about your company
          </h1>
          <p className="company-subtitle" style={{ color: '#6b7280', textAlign: 'center' }}>
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
            <div className="field-wrapper">
              <label
                htmlFor="organizationName"
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
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
                  padding: '0.5625rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                placeholder="e.g., Sharma Services"
                onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
            </div>

            <div className="field-wrapper">
              <label
                htmlFor="industry"
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
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
                  padding: '0.5625rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'white',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
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

            <div className="field-wrapper">
              <label
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Working Hours *
              </label>
              <div className="time-selector" style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.375rem', display: 'block', fontWeight: '500' }}>
                    From
                  </label>
                  <div
                    onClick={() => setIsFromTimePickerOpen(true)}
                    style={{
                      width: '100%',
                      padding: '0.5625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#EF7722')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                  >
                    <span style={{ color: '#374151' }}>{formatTimeDisplay(formData.workingHoursFrom)}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.375rem', display: 'block', fontWeight: '500' }}>
                    To
                  </label>
                  <div
                    onClick={() => setIsToTimePickerOpen(true)}
                    style={{
                      width: '100%',
                      padding: '0.5625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#EF7722')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                  >
                    <span style={{ color: '#374151' }}>{formatTimeDisplay(formData.workingHoursTo)}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="field-wrapper" style={{ marginBottom: '1.125rem' }}>
              <label
                className="field-label"
                style={{
                  display: 'block',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Currency *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff8f1')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="radio"
                    name="currency"
                    value="INR"
                    checked={formData.currency === 'INR'}
                    onChange={handleChange}
                    style={{
                      marginRight: '0.625rem',
                      accentColor: '#EF7722',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Indian Rupee (₹)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff8f1')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="radio"
                    name="currency"
                    value="USD"
                    checked={formData.currency === 'USD'}
                    onChange={handleChange}
                    style={{
                      marginRight: '0.625rem',
                      accentColor: '#EF7722',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>US Dollar ($)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff8f1')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <input
                    type="radio"
                    name="currency"
                    value="OTHER"
                    checked={formData.currency === 'OTHER'}
                    onChange={handleChange}
                    style={{
                      marginRight: '0.625rem',
                      accentColor: '#EF7722',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Other</span>
                </label>
              </div>
            </div>

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
                marginBottom: '0.75rem',
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
              {loading ? 'Creating...' : 'Save & continue →'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
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

        {/* Time Picker Modals */}
        <TimePickerModal
          isOpen={isFromTimePickerOpen}
          onClose={() => setIsFromTimePickerOpen(false)}
          onConfirm={(time) => {
            setFormData({ ...formData, workingHoursFrom: time });
            setIsFromTimePickerOpen(false);
          }}
          initialValue={formData.workingHoursFrom}
          title="Select Start Time"
        />

        <TimePickerModal
          isOpen={isToTimePickerOpen}
          onClose={() => setIsToTimePickerOpen(false)}
          onConfirm={(time) => {
            setFormData({ ...formData, workingHoursTo: time });
            setIsToTimePickerOpen(false);
          }}
          initialValue={formData.workingHoursTo}
          title="Select End Time"
        />
      </div>
    </>
  );
}
