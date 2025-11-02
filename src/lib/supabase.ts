import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

/**
 * Supabase Client (Browser)
 * Use this client in React components and client-side code
 *
 * This client uses the ANON key and respects RLS policies
 */
export const supabase = createPagesBrowserClient<Database>();
