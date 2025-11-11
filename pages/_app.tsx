import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '../styles/globals.css';

/**
 * Custom App Component
 * Includes AuthProvider for authentication state management
 * and ErrorBoundary for graceful error handling
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
