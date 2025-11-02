import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Supabase Admin Client (Server-Side Only)
 * Uses service_role key to bypass RLS
 *
 * ⚠️ WARNING: NEVER expose this client to the browser!
 * Only use in API routes, server-side functions, and migrations
 */
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Supabase Client (Server-Side with RLS)
 * Uses anon key and respects RLS policies
 * Use for server-side operations that should respect user permissions
 */
export const supabaseServer = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);
