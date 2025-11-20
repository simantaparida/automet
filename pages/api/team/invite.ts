import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth, requireRole } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';
import type { Database } from '@/types/database';
import {
  generateInviteCode,
  generateInviteToken,
  generateInviteLink,
  getInviteExpiryDate,
} from '@/lib/invite';
import { sendEmail } from '@/lib/email';

type TypedClient = SupabaseClient<Database>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase } = authResult;

  // Handle DELETE: Revoke an invite
  if (req.method === 'DELETE') {
    // Only owners can revoke invites
    if (!requireRole(user, ['owner'], res)) {
      return;
    }

    const { inviteId } = req.query;

    if (!inviteId || typeof inviteId !== 'string') {
      return res.status(400).json({ error: 'Invite ID is required' });
    }

    try {
      const typed = supabase as unknown as TypedClient;

      const { error: deleteError } = await typed
        .from('user_invites')
        .delete()
        .eq('id', inviteId)
        .eq('org_id', user.org_id);

      if (deleteError) {
        throw deleteError;
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      logError('Error revoking invite:', error);
      return res.status(500).json({ error: 'Failed to revoke invite' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only owners and coordinators can invite
  if (!requireRole(user, ['owner', 'coordinator'], res)) {
    return;
  }

  const { email, name, role, contact_type = 'email' } = req.body;

  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['technician', 'coordinator'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const typed = supabase as unknown as TypedClient;

    // Check if user already exists
    const { data: existingUser } = await typed
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    // Check if pending invite exists
    const { data: existingInvite } = await typed
      .from('user_invites')
      .select('id')
      .eq('org_id', user.org_id)
      .eq('contact', email) // Assuming contact stores email for email invites
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return res
        .status(400)
        .json({ error: 'Pending invite already exists for this email' });
    }

    const inviteCode = generateInviteCode();
    const inviteToken = generateInviteToken();
    const expiresAt = getInviteExpiryDate();

    // Create invite record
    const { data: invite, error: insertError } = await typed
      .from('user_invites')
      .insert({
        org_id: user.org_id,
        invited_by: user.id,
        name,
        contact: email,
        contact_type, // 'email' or 'phone'
        role,
        invite_code: inviteCode,
        invite_token: inviteToken,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Send email
    const inviteLink = generateInviteLink(inviteToken);
    const emailSubject = `You've been invited to join Automet`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Automet!</h2>
        <p>Hi ${name},</p>
        <p>${user.full_name} has invited you to join their team on Automet as a <strong>${role}</strong>.</p>
        <p>Click the button below to accept the invitation and set up your account:</p>
        <a href="${inviteLink}" style="display: inline-block; background-color: #EF7722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Accept Invitation</a>
        <p>Or use this invite code if you're on mobile: <strong>${inviteCode}</strong></p>
        <p>This link will expire in 7 days.</p>
        <hr />
        <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: `You've been invited to join Automet by ${user.full_name}. Use code ${inviteCode} or visit: ${inviteLink}`,
    });

    return res.status(200).json({ success: true, invite });
  } catch (error) {
    logError('Error sending invite:', error);
    return res.status(500).json({ error: 'Failed to send invite' });
  }
}
