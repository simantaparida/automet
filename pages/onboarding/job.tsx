/**
 * Create First Job - Onboarding Step 4
 * Schedule the first job with optional technician assignment
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';

interface Customer {
  id: string;
  name: string;
}

interface Technician {
  id: string;
  full_name: string;
}

export default function CreateJob() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    customerId: '',
    title: 'Sample Maintenance Visit',
    technicianId: '',
    scheduledDate: '',
    scheduledTime: '10:00',
  });

  // Track page view
  useEffect(() => {
    OnboardingEvents.firstJobViewed();
    trackPageView('/onboarding/job');
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load customers and technicians
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Use a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Data loading timed out');
          setLoadingData(false);
        }, 5000);

        // Get user's org_id (don't rely on this check - onboarding ensures org_id exists)
        const userResult = await supabase
          .from('users')
          .select('org_id')
          .eq('id', user.id)
          .maybeSingle();

        const userData = userResult.data as { org_id: string | null } | null;

        // Even if we don't find org_id due to cache, continue anyway
        // The create-job API will handle validation
        const orgId = userData?.org_id;

        if (orgId) {
          // Fetch customers
          const customerResult = await supabase
            .from('clients')
            .select('id, name')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(10);

          const customerData = customerResult.data as Array<{ id: string; name: string }> | null;
          const customerError = customerResult.error;

          if (!customerError && customerData && customerData.length > 0) {
            setCustomers(customerData);
            // Pre-select the first customer (most recent = just created)
            setFormData(prev => ({ ...prev, customerId: customerData[0]!.id }));
          }

          // Fetch technicians (optional)
          const techResult = await supabase
            .from('users')
            .select('id, full_name')
            .eq('org_id', orgId)
            .eq('role', 'technician')
            .order('full_name', { ascending: true});

          const techData = techResult.data as Array<{ id: string; full_name: string }> | null;
          const techError = techResult.error;

          if (!techError && techData) {
            setTechnicians(techData);
          }
        }

        clearTimeout(timeoutId);
        setLoadingData(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0]!;
    setFormData(prev => ({ ...prev, scheduledDate: dateStr }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      if (!formData.customerId) {
        setError('Please select a customer');
        setLoading(false);
        return;
      }

      if (!formData.title.trim()) {
        setError('Job title is required');
        setLoading(false);
        return;
      }

      if (!formData.scheduledDate) {
        setError('Scheduled date is required');
        setLoading(false);
        return;
      }

      // Combine date and time into ISO string
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`).toISOString();

      const response = await fetch('/api/onboarding/create-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: formData.customerId,
          title: formData.title.trim(),
          technicianId: formData.technicianId || undefined,
          scheduledAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      console.log('Job created:', data);

      // Track success - calculate hours from now
      const scheduledTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`);
      const hoursFromNow = (scheduledTime.getTime() - Date.now()) / (1000 * 60 * 60);

      OnboardingEvents.firstJobCreated(
        !!formData.technicianId,
        Math.round(hoursFromNow)
      );

      // Show warning if assignment failed
      if (data.warning) {
        console.warn(data.warning);
      }

      // Redirect to completion page
      router.push('/onboarding/complete');
    } catch (err: any) {
      console.error('Create job error:', err);
      setError(err.message || 'Failed to create job');
      OnboardingEvents.firstJobFailed(err.message);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    OnboardingEvents.firstJobSkipped();
    router.push('/onboarding/complete');
  };

  if (authLoading || loadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create First Job - Automet</title>
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
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Step 4 of 5</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>80%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{ width: '80%', height: '100%', backgroundColor: '#2563eb', borderRadius: '2px' }}></div>
            </div>
          </div>

          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '600' }}>
            Create your first job
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Schedule a job and optionally assign it to a technician.
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

          {customers.length === 0 && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1.5rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            >
              No customers found. Please go back and create a customer first.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="customerId"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Customer <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                disabled={customers.length === 0}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: customers.length === 0 ? '#f9fafb' : 'white',
                }}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="title"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Job Title <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., AC Maintenance Visit"
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
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="technicianId"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Assign Technician (optional)
              </label>
              <select
                id="technicianId"
                name="technicianId"
                value={formData.technicianId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                }}
              >
                <option value="">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.full_name}
                  </option>
                ))}
              </select>
              {technicians.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                  No technicians yet. You can assign later.
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label
                  htmlFor="scheduledDate"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Date <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
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
              </div>

              <div>
                <label
                  htmlFor="scheduledTime"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Time <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="time"
                  id="scheduledTime"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
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
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || customers.length === 0}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                backgroundColor: loading || customers.length === 0 ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading || customers.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating job...' : 'Create job →'}
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
