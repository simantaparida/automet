/**
 * Invite utility functions
 * Generate invite codes and tokens for team member invitations
 */

import crypto from 'crypto';

/**
 * Generate a 6-digit numeric invite code
 * Used for manual entry on mobile devices
 * @returns 6-digit string (e.g., "123456")
 */
export function generateInviteCode(): string {
  // Generate random number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * Generate a unique invite token (UUID v4)
 * Used for one-click invite link acceptance
 * @returns UUID string (e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
 */
export function generateInviteToken(): string {
  return crypto.randomUUID();
}

/**
 * Generate full invite link URL
 * @param token - The invite token
 * @param baseUrl - Base URL of the application (optional, defaults to env var)
 * @returns Full invite URL
 */
export function generateInviteLink(token: string, baseUrl?: string): string {
  const url =
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${url}/join/${token}`;
}

/**
 * Calculate expiry date for invite (7 days from now)
 * @returns ISO 8601 datetime string
 */
export function getInviteExpiryDate(): string {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  return expiryDate.toISOString();
}

/**
 * Check if an invite is expired
 * @param expiresAt - ISO 8601 datetime string
 * @returns true if expired, false otherwise
 */
export function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Format invite message for SMS/WhatsApp
 * @param params - Message parameters
 * @returns Formatted message string
 */
export function formatInviteMessage(params: {
  companyName: string;
  inviteCode: string;
  inviteLink: string;
  inviterName: string;
  role: 'technician' | 'coordinator';
}): string {
  const roleDisplay =
    params.role === 'technician' ? 'Technician' : 'Coordinator';

  return `You've been invited to join ${params.companyName} on Automet.

Tap to join: ${params.inviteLink}
or use code: ${params.inviteCode}

Invited by: ${params.inviterName}
Role: ${roleDisplay}`;
}

/**
 * Validate invite code format (6 digits)
 * @param code - Code to validate
 * @returns true if valid, false otherwise
 */
export function isValidInviteCode(code: string): boolean {
  return /^[0-9]{6}$/.test(code);
}

/**
 * Validate invite token format (UUID v4)
 * @param token - Token to validate
 * @returns true if valid, false otherwise
 */
export function isValidInviteToken(token: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}
