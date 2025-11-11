import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '../styles/globals.css';

/**
 * Custom App Component
 * Includes AuthProvider for authentication state management
 * ErrorBoundary for graceful error handling
 * Vercel Analytics for page view tracking
 * and Speed Insights for performance monitoring
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </ErrorBoundary>
  );
}
