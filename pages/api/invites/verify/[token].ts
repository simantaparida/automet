/**
 * API Route: Verify Invite
 * GET /api/invites/verify/:token
 *
 * Gets invite details before acceptance
 * Does not require authentication (public endpoint)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { isValidInviteToken, isInviteExpired } from '@/lib/invite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid token parameter' });
    }

    // Validate token format
    if (!isValidInviteToken(token)) {
      return res.status(400).json({ error: 'Invalid invite token format' });
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Find invite with organization and inviter details
    const { data: invite, error } = await supabase
      .from('user_invites')
      .select(`
        id,
        name,
        role,
        expires_at,
        status,
        organizations(name),
        users!invited_by(full_name)
      `)
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invite) {
      return res.status(404).json({
        success: false,
        error: 'Invite not found or has been used',
      });
    }

    const expired = isInviteExpired(invite.expires_at);

    // If expired, mark it in database
    if (expired) {
      await supabase
        .from('user_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);
    }

    return res.status(200).json({
      success: true,
      invite: {
        name: invite.name,
        organizationName: invite.organizations?.name,
        role: invite.role,
        invitedBy: invite.users?.full_name || 'Your manager',
        expiresAt: invite.expires_at,
        isExpired: expired,
      },
    });
  } catch (error: any) {
    console.error('Verify invite API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
