import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleSwitchProvider } from '@/contexts/RoleSwitchContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import CommandPalette from '@/components/CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import '../styles/globals.css';

/**
 * Custom App Component
 * Includes AuthProvider for authentication state management
 * and ErrorBoundary for graceful error handling
 */
function AppContent({ Component, pageProps }: AppProps) {
  const { isOpen, close } = useCommandPalette();

  return (
    <>
      <Component {...pageProps} />
      <CommandPalette isOpen={isOpen} onClose={close} />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RoleSwitchProvider>
          <AppContent {...props} />
        </RoleSwitchProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
