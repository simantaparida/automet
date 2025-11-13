/**
 * Setup Complete - Onboarding Step 5
 * Final confirmation with summary and next steps
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { OnboardingEvents, trackPageView } from '@/lib/analytics';

interface OnboardingSummary {
  organizationName: string;
  teamMembersCount: number;
  customersCount: number;
  jobsCount: number;
}

export default function OnboardingComplete() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<OnboardingSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Track page view
  useEffect(() => {
    OnboardingEvents.onboardingCompleted();
    trackPageView('/onboarding/complete');
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      if (!user) return;

      try {
        // Get user's org_id and organization name
        const userResult = await supabase
          .from('users')
          .select('org_id, organizations(name)')
          .eq('id', user.id)
          .maybeSingle();

        const userData = userResult.data as { org_id: string | null; organizations: { name: string} | null } | null;

        if (!userData?.org_id) {
          // User hasn't completed onboarding - just show default state
          setLoadingSummary(false);
          return;
        }

        // Count team members
        const { count: teamCount } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', userData.org_id);

        // Count customers
        const { count: customersCount } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', userData.org_id);

        // Count jobs
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', userData.org_id);

        setSummary({
          organizationName: (userData.organizations as any)?.name || 'Your Organization',
          teamMembersCount: teamCount || 1, // At least the owner
          customersCount: customersCount || 0,
          jobsCount: jobsCount || 0,
        });

        setLoadingSummary(false);
      } catch (err) {
        console.error('Error loading summary:', err);
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [user, router]);

  if (authLoading || loadingSummary) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Setup Complete - Automet</title>
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
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Step 5 of 5</span>
              <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>100%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
            </div>
          </div>

          {/* Success icon */}
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

          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '600', textAlign: 'center' }}>
            Setup complete!
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem', textAlign: 'center' }}>
            Your account is ready. Here's what you've set up:
          </p>

          {/* Summary cards */}
          {summary && (
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Organization
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                  {summary.organizationName}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.25rem' }}>
                    {summary.teamMembersCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                    Team {summary.teamMembersCount === 1 ? 'Member' : 'Members'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d', marginBottom: '0.25rem' }}>
                    {summary.customersCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                    {summary.customersCount === 1 ? 'Customer' : 'Customers'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e', marginBottom: '0.25rem' }}>
                    {summary.jobsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                    {summary.jobsCount === 1 ? 'Job' : 'Jobs'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next steps */}
          <div
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '1rem', marginTop: 0 }}>
              What's next?
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#0c4a6e', lineHeight: '1.75' }}>
              <li>View and manage your jobs from the dashboard</li>
              <li>Add more customers and team members as needed</li>
              <li>Track technician check-ins and job progress in real-time</li>
              <li>Generate reports and invoices for completed jobs</li>
            </ul>
          </div>

          {/* CTA button */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
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
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              Go to Dashboard →
            </button>
          </Link>

          {/* Help link */}
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', marginBottom: 0, textAlign: 'center' }}>
            Need help?{' '}
            <a
              href="mailto:support@automet.in"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
