/**
 * Centralized authentication redirect logic
 *
 * This module provides a single source of truth for where users should be
 * redirected based on their authentication state and onboarding progress.
 */

import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  org_id: string | null;
  role?: string;
  full_name?: string;
}

/**
 * Partial user profile with only org_id (used when we only need to check onboarding status)
 */
export type PartialUserProfile = Pick<UserProfile, 'org_id'> | { org_id: string | null };

/**
 * Determines the correct redirect path after authentication
 *
 * @param user - Supabase auth user (null if not authenticated)
 * @param profile - User profile from public.users table (null if not found)
 * @returns The path to redirect to
 */
export function getAuthRedirectPath(
  user: User | null,
  profile: PartialUserProfile | null
): string {
  // Not authenticated → welcome page (has login form)
  if (!user) {
    return '/onboarding/welcome';
  }

  // Authenticated but no profile → this shouldn't happen, but handle gracefully
  if (!profile) {
    return '/onboarding/company';
  }

  // Has organization → go to dashboard
  if (profile.org_id) {
    return '/dashboard';
  }

  // Authenticated but no organization → start onboarding from company step
  return '/onboarding/company';
}

/**
 * Determines redirect path after successful signup
 * Always goes to company onboarding (skips welcome page)
 *
 * @param profile - User profile from public.users table
 * @returns The path to redirect to
 */
export function getPostSignupRedirectPath(profile: PartialUserProfile | null): string {
  // If user already has an org (shouldn't happen on signup, but handle it)
  if (profile?.org_id) {
    return '/dashboard';
  }

  // New user → start onboarding from company step
  return '/onboarding/company';
}

/**
 * Determines redirect path after successful login
 * Always goes to dashboard (onboarding is skippable)
 *
 * @param _profile - User profile from public.users table (unused, kept for API compatibility)
 * @returns The path to redirect to
 */
export function getPostLoginRedirectPath(_profile: PartialUserProfile | null): string {
  // Always go to dashboard
  // Dashboard will show setup banner if user hasn't completed onboarding
  return '/dashboard';
}

/**
 * Determines redirect path for OAuth callback
 * Same logic as login
 *
 * @param profile - User profile from public.users table
 * @returns The path to redirect to
 */
export function getOAuthCallbackRedirectPath(profile: PartialUserProfile | null): string {
  return getPostLoginRedirectPath(profile);
}

/**
 * Checks if a user should have access to a protected route
 * NOTE: Dashboard no longer requires org (onboarding is skippable)
 *
 * @param user - Supabase auth user
 * @param requireOrg - Whether the route requires an organization
 * @param profile - User profile from public.users table
 * @returns Object with { allowed: boolean, redirectTo: string | null }
 */
export function checkRouteAccess(
  user: User | null,
  requireOrg: boolean,
  profile: UserProfile | null
): { allowed: boolean; redirectTo: string | null } {
  // Not authenticated → redirect to login
  if (!user) {
    return { allowed: false, redirectTo: '/login' };
  }

  // Route requires org but user doesn't have one → allow access but show banner
  // (Dashboard handles showing setup banner for users without org)
  if (requireOrg && !profile?.org_id) {
    return { allowed: true, redirectTo: null };
  }

  // All checks passed
  return { allowed: true, redirectTo: null };
}
