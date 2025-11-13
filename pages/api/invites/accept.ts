/**
 * API Route: Accept Team Invite
 * POST /api/invites/accept
 *
 * Accepts an invite using either 6-digit code or invite token
 * Updates user record with org_id and role
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { isValidInviteCode, isValidInviteToken } from '@/lib/invite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerClient<Database>({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { code, token } = req.body;

    // Must provide either code or token
    if (!code && !token) {
      return res.status(400).json({ error: 'Must provide either code or token' });
    }

    // Validate format
    if (code && !isValidInviteCode(code)) {
      return res.status(400).json({ error: 'Invalid invite code format' });
    }

    if (token && !isValidInviteToken(token)) {
      return res.status(400).json({ error: 'Invalid invite token format' });
    }

    const serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Find invite
    let query = serviceRoleSupabase
      .from('user_invites')
      .select('*, organizations(id, name)')
      .eq('status', 'pending');

    if (code) {
      query = query.eq('invite_code', code);
    } else {
      query = query.eq('invite_token', token);
    }

    const { data: invite, error: inviteError } = await query.single();

    if (inviteError || !invite) {
      return res.status(404).json({ error: 'Invite not found or already used' });
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      // Mark as expired
      await serviceRoleSupabase
        .from('user_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);

      return res.status(400).json({ error: 'Invite has expired' });
    }

    // Check if user already has an organization
    const { data: existingUser } = await serviceRoleSupabase
      .from('users')
      .select('org_id')
      .eq('id', session.user.id)
      .maybeSingle();

    if (existingUser?.org_id) {
      return res.status(400).json({
        error: 'You are already part of an organization. Contact support to switch organizations.',
      });
    }

    // Update user with org_id and role
    const { error: userError } = await serviceRoleSupabase
      .from('users')
      .update({
        org_id: invite.org_id,
        role: invite.role,
      })
      .eq('id', session.user.id);

    if (userError) {
      console.error('User update error:', userError);
      return res.status(500).json({ error: 'Failed to accept invite: ' + userError.message });
    }

    // Mark invite as accepted
    const now = new Date().toISOString();
    await serviceRoleSupabase
      .from('user_invites')
      .update({
        status: 'accepted',
        accepted_at: now,
        accepted_by: session.user.id,
      })
      .eq('id', invite.id);

    return res.status(200).json({
      success: true,
      organization: {
        id: invite.organizations?.id,
        name: invite.organizations?.name,
      },
      role: invite.role,
      redirectTo: '/dashboard',
    });
  } catch (error: any) {
    console.error('Accept invite API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
