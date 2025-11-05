import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

/**
 * Authenticated API Response with user context
 */
export interface AuthenticatedApiRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
    org_id: string;
    role: 'owner' | 'coordinator' | 'technician';
  };
}

/**
 * API Authentication Middleware
 * Verifies user session and extracts user context from Supabase Auth
 *
 * @usage
 * ```ts
 * const authResult = await withAuth(req, res);
 * if (!authResult.authenticated) return; // 401 already sent
 *
 * const { user } = authResult;
 * // Use user.id, user.org_id, user.role
 * ```
 */
export async function withAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<
  | { authenticated: true; user: AuthenticatedApiRequest['user'] }
  | { authenticated: false }
> {
  try {
    // Create authenticated Supabase client from request
    const supabase = createServerSupabaseClient<Database>({ req, res });

    // Get session from request cookies
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource',
      });
      return { authenticated: false };
    }

    // Get user profile with org_id and role from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, org_id, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      res.status(403).json({
        error: 'Forbidden',
        message: 'User profile not found. Please complete your registration.',
      });
      return { authenticated: false };
    }

    // Return authenticated user context
    return {
      authenticated: true,
      user: {
        id: userProfile.id,
        email: userProfile.email || session.user.email || '',
        org_id: userProfile.org_id,
        role: userProfile.role as 'owner' | 'coordinator' | 'technician',
      },
    };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication check failed',
    });
    return { authenticated: false };
  }
}

/**
 * Role-based authorization check
 * Use after withAuth to verify user has required role
 */
export function requireRole(
  user: AuthenticatedApiRequest['user'],
  allowedRoles: Array<'owner' | 'coordinator' | 'technician'>,
  res: NextApiResponse
): boolean {
  if (!allowedRoles.includes(user.role)) {
    res.status(403).json({
      error: 'Forbidden',
      message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
    });
    return false;
  }
  return true;
}
