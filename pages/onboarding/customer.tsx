/**
 * Add First Customer - Onboarding Step 3
 * Create the first customer to prepare for job scheduling
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';

export default function AddCustomer() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactPerson: '',
    phone: '',
  });

  // Track page view
  useEffect(() => {
    OnboardingEvents.firstCustomerViewed();
    trackPageView('/onboarding/customer');
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/onboarding/welcome');
    }
  }, [user, authLoading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Customer name is required');
        setLoading(false);
        return;
      }

      if (formData.name.length < 2 || formData.name.length > 200) {
        setError('Customer name must be between 2 and 200 characters');
        setLoading(false);
        return;
      }

      if (!formData.address.trim()) {
        setError('Address is required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/onboarding/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          address: formData.address.trim(),
          contactPerson: formData.contactPerson.trim() || undefined,
          phone: formData.phone.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }

      console.log('Customer created:', data);

      // Track success
      OnboardingEvents.firstCustomerCreated(
        !!formData.contactPerson.trim(),
        !!formData.phone.trim()
      );

      // Redirect to job creation
      router.push('/onboarding/job');
    } catch (err: any) {
      console.error('Create customer error:', err);
      setError(err.message || 'Failed to create customer');
      OnboardingEvents.firstCustomerFailed(err.message);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    OnboardingEvents.firstCustomerSkipped();
    router.push('/onboarding/job');
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Add First Customer - Automet</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <style jsx>{`
        .customer-container {
          padding: 1.5rem 1rem;
        }
        .customer-form {
          max-width: 500px;
          padding: 1.25rem;
        }
        .customer-title {
          font-size: 1.125rem;
          margin-bottom: 0.375rem;
        }
        .customer-subtitle {
          font-size: 0.8125rem;
          margin-bottom: 1.125rem;
        }
        .field-wrapper {
          margin-bottom: 0.875rem;
        }
        @media (min-width: 768px) {
          .customer-container {
            padding: 2rem 2rem;
          }
          .customer-form {
            max-width: 520px;
            padding: 1.75rem;
          }
          .customer-title {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .customer-subtitle {
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }
          .field-wrapper {
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div
        className="customer-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
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
            background:
              'radial-gradient(circle, rgba(239,119,34,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div
          className="customer-form"
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  fontWeight: '500',
                }}
              >
                Step 3 of 5
              </span>
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: '#EF7722',
                  fontWeight: '600',
                }}
              >
                60%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#ffe8d6',
                borderRadius: '3px',
              }}
            >
              <div
                style={{
                  width: '60%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, #EF7722 0%, #ff8833 100%)',
                  borderRadius: '3px',
                }}
              ></div>
            </div>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => router.push('/onboarding/team')}
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1
            className="customer-title"
            style={{ fontWeight: '700', color: '#111827', textAlign: 'center' }}
          >
            Add your first customer
          </h1>
          <p
            className="customer-subtitle"
            style={{ color: '#6b7280', textAlign: 'center' }}
          >
            Create a customer to assign jobs.
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
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Customer Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Prestige Apartments"
                required
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
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem',
                  marginBottom: 0,
                }}
              >
                Building, apartment complex, or company name
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="address"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Address <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, area, city"
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5625rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#EF7722')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="contactPerson"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Contact Person (optional)
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g., Mr. Ravi Kumar"
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

            <div style={{ marginBottom: '2rem' }}>
              <label
                htmlFor="phone"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
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
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem',
                  marginBottom: 0,
                }}
              >
                With country code (e.g., +91 for India)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.625rem',
                marginBottom: '0.75rem',
                background: loading
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
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
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(239,119,34,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(239,119,34,0.25)';
              }}
            >
              {loading ? 'Creating customer...' : 'Save customer →'}
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
              onMouseEnter={(e) =>
                !loading &&
                ((e.currentTarget.style.borderColor = '#EF7722'),
                (e.currentTarget.style.color = '#EF7722'))
              }
              onMouseLeave={(e) => (
                (e.currentTarget.style.borderColor = '#d1d5db'),
                (e.currentTarget.style.color = '#6b7280')
              )}
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
