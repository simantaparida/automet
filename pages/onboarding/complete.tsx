/**
 * Setup Complete - Onboarding Step 5
 * Final confirmation with summary and next steps
 */

import { useEffect, useState, useRef } from 'react';
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
  const [countdown, setCountdown] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track page view
  useEffect(() => {
    OnboardingEvents.onboardingCompleted();
    trackPageView('/onboarding/complete');
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/onboarding/welcome');
    }
  }, [user, authLoading, router]);

  // Auto redirect countdown
  useEffect(() => {
    if (authLoading || loadingSummary) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authLoading, loadingSummary, router]);

  // Trigger animations
  useEffect(() => {
    if (!loadingSummary) {
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [loadingSummary]);

  // Confetti animation
  useEffect(() => {
    if (!isAnimating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#EF7722', '#ff8833', '#ffa64d', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'];

    // Create confetti particles
    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        radius: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        velocity: {
          x: Math.random() * 4 - 2,
          y: Math.random() * 3 + 2,
        },
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((particle, index) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.radius / 2, -particle.radius / 2, particle.radius, particle.radius);
        ctx.restore();

        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.rotation += particle.rotationSpeed;
        particle.velocity.y += 0.1; // Gravity

        // Remove particles that are off screen
        if (particle.y > canvas.height) {
          confetti.splice(index, 1);
        }
      });

      if (confetti.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnimating]);

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

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .success-icon {
          animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .checkmark-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.5s 0.3s ease-out forwards;
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .complete-container {
          padding: 1.5rem 1rem;
        }
        .complete-card {
          max-width: 560px;
          padding: 1.5rem;
        }
        @media (min-width: 768px) {
          .complete-container {
            padding: 2rem;
          }
          .complete-card {
            max-width: 600px;
            padding: 2.5rem;
          }
        }
      `}</style>

      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />

      <div
        className="complete-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div
          className="complete-card"
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(239,119,34,0.15)',
            width: '100%',
            margin: '0 auto',
            border: '1px solid rgba(239,119,34,0.1)',
            position: 'relative',
          }}
        >
          {/* Progress indicator */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: '500' }}>Step 5 of 5</span>
              <span style={{ fontSize: '0.8125rem', color: '#EF7722', fontWeight: '700' }}>100%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#ffe8d6', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #EF7722 0%, #ff8833 100%)', borderRadius: '3px' }}></div>
            </div>
          </div>

          {/* Success icon with animation */}
          <div
            className={isAnimating ? 'success-icon' : ''}
            style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 10px 40px rgba(16,185,129,0.3)',
            }}
          >
            <svg width="70" height="70" viewBox="0 0 52 52" style={{ position: 'relative', zIndex: 1 }}>
              <circle cx="26" cy="26" r="25" fill="none" />
              <path
                className={isAnimating ? 'checkmark-path' : ''}
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                d="M14 27l7 7 16-16"
              />
            </svg>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', border: '3px solid rgba(16,185,129,0.2)', animation: isAnimating ? 'pulse 2s infinite' : 'none' }} />
            <div style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.1)', animation: isAnimating ? 'pulse 2s 0.5s infinite' : 'none' }} />
          </div>

          <h1
            className={isAnimating ? 'fade-in-up' : ''}
            style={{
              marginBottom: '0.75rem',
              fontSize: '2rem',
              fontWeight: '700',
              textAlign: 'center',
              color: '#111827',
              animationDelay: '0.2s',
              opacity: isAnimating ? 1 : 0,
            }}
          >
            Setup complete!
          </h1>
          <p
            className={isAnimating ? 'fade-in-up' : ''}
            style={{
              color: '#6b7280',
              marginBottom: '2rem',
              fontSize: '0.9375rem',
              textAlign: 'center',
              animationDelay: '0.3s',
              opacity: isAnimating ? 1 : 0,
            }}
          >
            Your account is ready. Here's what you've set up:
          </p>

          {/* Summary cards */}
          {summary && (
            <div
              className={isAnimating ? 'fade-in-up' : ''}
              style={{
                marginBottom: '2rem',
                animationDelay: '0.4s',
                opacity: isAnimating ? 1 : 0,
              }}
            >
              <div
                style={{
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  border: '2px solid #EF7722',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#EF7722', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                  Organization
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
                  {summary.organizationName}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 100%)',
                    border: '2px solid rgba(239,119,34,0.2)',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#EF7722', marginBottom: '0.25rem' }}>
                    {summary.teamMembersCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                    Team {summary.teamMembersCount === 1 ? 'Member' : 'Members'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
                    border: '2px solid rgba(16,185,129,0.2)',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
                    {summary.customersCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                    {summary.customersCount === 1 ? 'Customer' : 'Customers'}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
                    border: '2px solid rgba(245,158,11,0.2)',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem' }}>
                    {summary.jobsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                    {summary.jobsCount === 1 ? 'Job' : 'Jobs'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next steps */}
          <div
            className={isAnimating ? 'fade-in-up' : ''}
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 100%)',
              border: '2px solid rgba(239,119,34,0.2)',
              borderRadius: '12px',
              animationDelay: '0.5s',
              opacity: isAnimating ? 1 : 0,
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#EF7722', marginBottom: '1rem', marginTop: 0 }}>
              What's next?
            </h2>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.875' }}>
              <li>View and manage your jobs from the dashboard</li>
              <li>Add more customers and team members as needed</li>
              <li>Track technician check-ins and job progress in real-time</li>
              <li>Generate reports and invoices for completed jobs</li>
            </ul>
          </div>

          {/* Auto-redirect message */}
          <div
            className={isAnimating ? 'fade-in-up' : ''}
            style={{
              textAlign: 'center',
              marginBottom: '1.25rem',
              padding: '0.75rem',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              animationDelay: '0.6s',
              opacity: isAnimating ? 1 : 0,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
              Redirecting to dashboard in{' '}
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>{countdown}</span>{' '}
              second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>

          {/* CTA button */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button
              className={isAnimating ? 'fade-in-up' : ''}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(239,119,34,0.35)',
                animationDelay: '0.7s',
                opacity: isAnimating ? 1 : 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,119,34,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,119,34,0.35)';
              }}
            >
              Go to Dashboard →
            </button>
          </Link>

          {/* Help link */}
          <p
            className={isAnimating ? 'fade-in-up' : ''}
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '1.25rem',
              marginBottom: 0,
              textAlign: 'center',
              animationDelay: '0.8s',
              opacity: isAnimating ? 1 : 0,
            }}
          >
            Need help?{' '}
            <a
              href="mailto:support@automet.in"
              style={{
                color: '#EF7722',
                textDecoration: 'none',
                fontWeight: '600',
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
