import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { logError } from './logger';

/**
 * Authenticated API Response with user context
 */
export interface AuthenticatedApiRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
    org_id: string | null;
    role: 'owner' | 'coordinator' | 'technician' | null;
  };
}

/**
 * Authenticated API Response with user who has completed onboarding
 */
export interface OnboardedApiRequest extends NextApiRequest {
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
    type UserProfile = Pick<
      Database['public']['Tables']['users']['Row'],
      'id' | 'email' | 'org_id' | 'role'
    >;

    const isUserProfile = (value: unknown): value is UserProfile => {
      return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { id?: unknown }).id === 'string' &&
        (typeof (value as { email?: unknown }).email === 'string' ||
          (value as { email?: unknown }).email === null) &&
        (typeof (value as { org_id?: unknown }).org_id === 'string' ||
          (value as { org_id?: unknown }).org_id === null) &&
        (typeof (value as { role?: unknown }).role === 'string' ||
          (value as { role?: unknown }).role === null)
      );
    };

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, org_id, role')
      .eq('id', session.user.id)
      .maybeSingle<UserProfile>();

    if (profileError || !isUserProfile(userProfile)) {
      logError('Error fetching user profile:', profileError);
      res.status(403).json({
        error: 'Forbidden',
        message: 'User profile not found. Please complete your registration.',
      });
      return { authenticated: false };
    }

    const sanitizedEmail = userProfile.email ?? '';

    // Return authenticated user context
    return {
      authenticated: true,
      user: {
        id: userProfile.id,
        email: sanitizedEmail || '',
        org_id: userProfile.org_id,
        role: userProfile.role,
      },
    };
  } catch (error) {
    logError('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication check failed',
    });
    return { authenticated: false };
  }
}

/**
 * Authentication middleware that requires completed onboarding
 * Use this for API routes that need org_id to be present
 */
export async function withOnboardedAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<
  | { authenticated: true; user: OnboardedApiRequest['user'] }
  | { authenticated: false }
> {
  const authResult = await withAuth(req, res);

  if (!authResult.authenticated) {
    return { authenticated: false };
  }

  // Check if user has completed onboarding
  if (!authResult.user.org_id || !authResult.user.role) {
    res.status(403).json({
      error: 'Onboarding Required',
      message: 'You must complete onboarding before accessing this resource',
    });
    return { authenticated: false };
  }

  // TypeScript now knows org_id and role are non-null
  return {
    authenticated: true,
    user: {
      id: authResult.user.id,
      email: authResult.user.email,
      org_id: authResult.user.org_id,
      role: authResult.user.role,
    },
  };
}

/**
 * Role-based authorization check
 * Use after withOnboardedAuth to verify user has required role
 */
export function requireRole(
  user: OnboardedApiRequest['user'],
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
