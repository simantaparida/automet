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
    activeRole?: 'owner' | 'coordinator' | 'technician'; // Role being viewed as (role switch)
    full_name: string;
  };
}

/**
 * Calculate which roles a user can view as based on their actual role
 */
function getAvailableRoles(actualRole: 'owner' | 'coordinator' | 'technician'): Array<'owner' | 'coordinator' | 'technician'> {
  switch (actualRole) {
    case 'owner':
      return ['owner', 'coordinator', 'technician'];
    case 'coordinator':
      return ['coordinator', 'technician'];
    case 'technician':
      return ['technician'];
    default:
      return [];
  }
}

/**
 * Validate that a role switch is allowed (no privilege escalation)
 */
function canSwitchToRole(
  actualRole: 'owner' | 'coordinator' | 'technician',
  targetRole: 'owner' | 'coordinator' | 'technician'
): boolean {
  const availableRoles = getAvailableRoles(actualRole);
  return availableRoles.includes(targetRole);
}

/**
 * Parse and validate active role from request header
 */
function getActiveRole(
  req: NextApiRequest,
  actualRole: 'owner' | 'coordinator' | 'technician'
): 'owner' | 'coordinator' | 'technician' {
  const activeRoleHeader = req.headers['x-active-role'];

  if (!activeRoleHeader || typeof activeRoleHeader !== 'string') {
    return actualRole; // Default to actual role if no header
  }

  const validRoles: Array<'owner' | 'coordinator' | 'technician'> = ['owner', 'coordinator', 'technician'];

  if (!validRoles.includes(activeRoleHeader as 'owner' | 'coordinator' | 'technician')) {
    return actualRole; // Invalid role, default to actual
  }

  const targetRole = activeRoleHeader as 'owner' | 'coordinator' | 'technician';

  // Validate no privilege escalation
  if (!canSwitchToRole(actualRole, targetRole)) {
    return actualRole; // Not allowed, default to actual
  }

  return targetRole;
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
 * 
 * Returns the authenticated Supabase client that has the session properly configured
 * This ensures RLS policies can access auth.uid() correctly
 */
export async function withOnboardedAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<
  | { authenticated: true; user: OnboardedApiRequest['user']; supabase: ReturnType<typeof createServerSupabaseClient<Database>> }
  | { authenticated: false }
> {
  try {
    // Create authenticated Supabase client from request
    // This client has the session in its context, so RLS policies will work
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
      'id' | 'email' | 'org_id' | 'role' | 'full_name'
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
          (value as { role?: unknown }).role === null) &&
        (typeof (value as { full_name?: unknown }).full_name === 'string')
      );
    };

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, org_id, role, full_name')
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

    // Check if user has completed onboarding
    if (!userProfile.org_id || !userProfile.role) {
      res.status(403).json({
        error: 'Onboarding Required',
        message: 'You must complete onboarding before accessing this resource',
      });
      return { authenticated: false };
    }

    // TypeScript now knows org_id and role are non-null
    const actualRole = userProfile.role as 'owner' | 'coordinator' | 'technician';

    // Get active role from header (role switch)
    const activeRole = getActiveRole(req, actualRole);

    const sanitizedEmail = userProfile.email ?? '';

    return {
      authenticated: true,
      user: {
        id: userProfile.id,
        email: sanitizedEmail || '',
        org_id: userProfile.org_id,
        role: actualRole,
        activeRole: activeRole !== actualRole ? activeRole : undefined,
        full_name: userProfile.full_name,
      },
      supabase, // Return the authenticated Supabase client with session
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
 * Role-based authorization check
 * Use after withOnboardedAuth to verify user has required role
 * 
 * IMPORTANT: For write operations, this checks the actual role, not activeRole.
 * For read operations, you can use getEffectiveRole() to get activeRole.
 */
export function requireRole(
  user: OnboardedApiRequest['user'],
  allowedRoles: Array<'owner' | 'coordinator' | 'technician'>,
  res: NextApiResponse
): boolean {
  // Always check actual role for write operations (security)
  if (!allowedRoles.includes(user.role)) {
    res.status(403).json({
      error: 'Forbidden',
      message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
    });
    return false;
  }
  return true;
}

/**
 * Get the effective role to use for filtering/display
 * Returns activeRole if set (role switch), otherwise actual role
 * Use this for read operations and data filtering
 */
export function getEffectiveRole(user: OnboardedApiRequest['user']): 'owner' | 'coordinator' | 'technician' {
  return user.activeRole || user.role;
}
