import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Get Supabase URL from environment variables
 */
const getSupabaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
};

/**
 * Supabase Admin Client (Server-Side Only)
 * Uses service_role key to bypass RLS
 * 
 * ⚠️ CRITICAL: This is created lazily (on-demand) to ensure env vars are loaded
 * ⚠️ WARNING: NEVER expose this client to the browser!
 * Only use in API routes, server-side functions, and migrations
 * 
 * Returns null if service role key is not configured
 * 
 * @returns Supabase client with admin privileges or null
 */
export const getSupabaseAdmin = (): ReturnType<typeof createClient<Database>> | null => {
  // Always read env vars fresh (don't cache at module level)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const url = getSupabaseUrl();
  
  if (!serviceRoleKey || serviceRoleKey.length < 20 || !url) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Supabase Admin Client cannot be created:');
      console.warn('   - Service Role Key:', serviceRoleKey ? `Set (${serviceRoleKey.length} chars)` : 'NOT SET');
      console.warn('   - Supabase URL:', url || 'NOT SET');
    }
    return null;
  }
  
  // Create admin client with service role key - always fresh instance
  const client = createClient<Database>(
    url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  
  // Verify the client was created with the service role key
  // Check if the key starts with 'eyJ' (JWT token format)
  if (process.env.NODE_ENV === 'development' && serviceRoleKey.substring(0, 3) === 'eyJ') {
    // Try to decode JWT to verify it's a service role key
    try {
      const payload = JSON.parse(Buffer.from(serviceRoleKey.split('.')[1], 'base64').toString());
      if (payload.role === 'service_role') {
        console.log('✅ Admin client created with valid service_role key');
      } else {
        console.warn('⚠️ Service role key does not have service_role role:', payload.role);
      }
    } catch (e) {
      // Not a valid JWT format, but that's okay - Supabase will validate it
    }
  }
  
  return client;
};

/**
 * Supabase Admin Client (Server-Side Only)
 * 
 * ⚠️ DEPRECATED: Use getSupabaseAdmin() instead for lazy initialization
 * This creates a client at module load which may fail if env vars aren't loaded yet
 * 
 * @deprecated Use getSupabaseAdmin() for reliable lazy initialization
 */
export const supabaseAdmin = getSupabaseAdmin(); // May be null if env vars not loaded at module init

/**
 * Supabase Client (Server-Side with RLS)
 * Uses anon key and respects RLS policies
 * Use for server-side operations that should respect user permissions
 * 
 * This is safe to cache at module level since anon key doesn't change
 */
export const supabaseServer = createClient<Database>(
  getSupabaseUrl(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);
