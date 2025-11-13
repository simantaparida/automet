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
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Add First Customer - Automet</title>
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
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Step 3 of 5</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>60%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{ width: '60%', height: '100%', backgroundColor: '#2563eb', borderRadius: '2px' }}></div>
            </div>
          </div>

          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '600' }}>
            Add your first customer
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
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
                  padding: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
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
                  padding: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  resize: 'vertical',
                }}
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
                  padding: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                }}
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
                  padding: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                With country code (e.g., +91 for India)
              </p>
            </div>

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
              {loading ? 'Creating customer...' : 'Save customer →'}
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
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
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
