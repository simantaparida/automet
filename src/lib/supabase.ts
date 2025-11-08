import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

/**
 * Get Supabase URL from environment variables
 * Supports both naming conventions for flexibility
 */
const getSupabaseUrl = (): string =>
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

/**
 * Get Supabase Anon Key from environment variables
 * Supports both naming conventions for flexibility
 */
const getSupabaseAnonKey = (): string =>
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

/**
 * Supabase Client (Browser)
 * Use this client in React components and client-side code
 *
 * This client uses the ANON key and respects RLS policies
 *
 * ⚠️ IMPORTANT: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * must be set in Vercel environment variables for the build to succeed.
 */
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Validate environment variables at build time
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars: string[] = [];
  if (!supabaseUrl) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  }
  if (!supabaseAnonKey) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  }

  // In production/build, throw an error to fail fast
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please set these in your Vercel project settings.'
    );
  }

  // In development, log a warning but allow the app to continue
  if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️ Missing Supabase environment variables: ${missingVars.join(', ')}. ` +
        'Some features may not work. Please set these in your .env.local file.'
    );
  }
}

// Create the Supabase client
// The auth-helpers library will throw if env vars are missing, so we need them
export const supabase = createPagesBrowserClient<Database>({
  supabaseUrl: supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey: supabaseAnonKey || 'placeholder-key',
});
