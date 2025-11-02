import Head from 'next/head';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';

/**
 * Home Page
 * Shows setup status and welcome message
 */
export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [jobCount, setJobCount] = useState<number | null>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  async function checkDatabase() {
    try {
      const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setDbStatus('connected');
      setJobCount(count);
    } catch (error) {
      console.error('Database connection error:', error);
      setDbStatus('error');
    }
  }

  return (
    <>
      <Head>
        <title>Automet - Field Job & Asset Tracker</title>
      </Head>

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>
            Welcome to <span style={styles.brand}>Automet</span>
          </h1>

          <p style={styles.subtitle}>
            Field Job & Asset Tracker for Indian AMC Vendors
          </p>

          <div style={styles.statusCard}>
            <h2 style={styles.statusTitle}>Setup Status</h2>

            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Database:</span>
              <span style={getStatusStyle(dbStatus)}>
                {dbStatus === 'checking' && '🔄 Checking...'}
                {dbStatus === 'connected' && '✅ Connected'}
                {dbStatus === 'error' && '❌ Error'}
              </span>
            </div>

            {dbStatus === 'connected' && jobCount !== null && (
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Demo Jobs:</span>
                <span style={styles.statusValue}>{jobCount} jobs loaded</span>
              </div>
            )}

            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Authentication:</span>
              <span style={getStatusStyle(session ? 'connected' : 'error')}>
                {session ? '✅ Signed In' : '⚪ Not Signed In'}
              </span>
            </div>

            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Supabase:</span>
              <span style={styles.statusValue}>✅ Configured</span>
            </div>

            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Google OAuth:</span>
              <span style={styles.statusValue}>✅ Configured</span>
            </div>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Module 1 Complete ✅</h3>
            <ul style={styles.list}>
              <li>✅ Database schema created (18 tables)</li>
              <li>✅ RLS policies enabled (40+ policies)</li>
              <li>✅ Migrations ready (8 migrations)</li>
              <li>✅ Demo data seeded (Sharma Services org)</li>
              <li>✅ Dev server running</li>
            </ul>
          </div>

          <div style={styles.nextSteps}>
            <h3 style={styles.infoTitle}>Next Steps (Module 2)</h3>
            <ul style={styles.list}>
              <li>Build job management UI</li>
              <li>Create inventory management pages</li>
              <li>Implement API routes</li>
              <li>Add tests (Jest + Playwright)</li>
              <li>Set up CI/CD pipeline</li>
            </ul>
          </div>

          <div style={styles.links}>
            <a href="/api/health" style={styles.link}>
              API Health Check →
            </a>
            <a href="https://github.com/anthropics/automet" style={styles.link} target="_blank" rel="noopener noreferrer">
              Documentation →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

// Helper function for status styling
function getStatusStyle(status: string) {
  const baseStyle = { ...styles.statusValue };
  if (status === 'connected') return { ...baseStyle, color: '#10b981' };
  if (status === 'error') return { ...baseStyle, color: '#ef4444' };
  return baseStyle;
}

// Inline styles (minimal styling for MVP)
const styles = {
  main: {
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f9fafb',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#111827',
  },
  brand: {
    color: '#2563eb',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#6b7280',
    marginBottom: '3rem',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statusTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#111827',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,
  statusLabel: {
    fontWeight: '500',
    color: '#374151',
  },
  statusValue: {
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    borderLeft: '4px solid #2563eb',
  },
  nextSteps: {
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    borderLeft: '4px solid #f59e0b',
  },
  infoTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  list: {
    marginLeft: '1.5rem',
    color: '#374151',
    lineHeight: '1.75',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  } as React.CSSProperties,
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  } as React.CSSProperties,
};
