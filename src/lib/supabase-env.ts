/**
 * Environment Variable Helper for Supabase
 * Supports both naming conventions:
 * - Server-side: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 * - Client-side: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

/**
 * Get Supabase URL from environment
 * Checks both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL
 */
export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Get Supabase Anon Key from environment
 * Checks both SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get Supabase Service Role Key from environment
 * Only checks server-side env var (should never be prefixed with NEXT_PUBLIC_)
 */
export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Get Supabase credentials for public API routes (blog, etc.)
 * Uses anon key (safe for public access)
 *
 * @throws {Error} If required credentials are missing
 */
export function getPublicSupabaseCredentials(): {
  url: string;
  anonKey: string;
} {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY ' +
        '(or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) in your .env.local file.'
    );
  }

  return { url, anonKey };
}

/**
 * Get Supabase credentials for authenticated API routes
 * Uses service role key (bypasses RLS - use with caution)
 *
 * @throws {Error} If required credentials are missing
 */
export function getAdminSupabaseCredentials(): {
  url: string;
  serviceRoleKey: string;
} {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
        'in your .env.local file.'
    );
  }

  return { url, serviceRoleKey };
}

/**
 * Check if Supabase is configured
 * Returns true if minimum required env vars are present
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  return !!(url && anonKey);
}

/**
 * Get environment variable naming convention being used
 * Useful for debugging configuration issues
 */
export function getSupabaseEnvConvention(): {
  url: 'SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_URL' | 'none';
  anonKey: 'SUPABASE_ANON_KEY' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY' | 'none';
  serviceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY' | 'none';
} {
  return {
    url: process.env.SUPABASE_URL
      ? 'SUPABASE_URL'
      : process.env.NEXT_PUBLIC_SUPABASE_URL
      ? 'NEXT_PUBLIC_SUPABASE_URL'
      : 'none',
    anonKey: process.env.SUPABASE_ANON_KEY
      ? 'SUPABASE_ANON_KEY'
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      : 'none',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? 'SUPABASE_SERVICE_ROLE_KEY'
      : 'none',
  };
}
