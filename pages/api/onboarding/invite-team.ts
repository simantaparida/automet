/**
 * API Route: Invite Team Members
 * POST /api/onboarding/invite-team
 *
 * Sends invites to team members via SMS or email
 * Creates invite records with 6-digit codes and one-click links
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { sendSMS } from '@/lib/sms';
import { sendEmail } from '@/lib/email';
import {
  generateInviteCode,
  generateInviteToken,
  generateInviteLink,
  getInviteExpiryDate,
  formatInviteMessage,
} from '@/lib/invite';

interface InviteRequest {
  name: string;
  contact: string;
  contactType: 'phone' | 'email';
  role: 'technician' | 'coordinator';
}

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

    const { invites } = req.body as { invites: InviteRequest[] };

    if (!invites || !Array.isArray(invites) || invites.length === 0) {
      return res.status(400).json({ error: 'Invalid invites data' });
    }

    // Validate invites
    for (const invite of invites) {
      if (
        !invite.name ||
        !invite.contact ||
        !invite.contactType ||
        !invite.role
      ) {
        return res
          .status(400)
          .json({ error: 'Missing required invite fields' });
      }

      if (!['phone', 'email'].includes(invite.contactType)) {
        return res.status(400).json({ error: 'Invalid contact type' });
      }

      if (!['technician', 'coordinator'].includes(invite.role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }

    // Use service role client to avoid cache issues during onboarding
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

    // Get user's org_id and organization details using service role (fresh data, no cache)
    const userResult = await serviceRoleSupabase
      .from('users')
      .select('org_id, full_name, organizations(name)')
      .eq('id', session.user.id)
      .maybeSingle();

    const userData = userResult.data as {
      org_id: string | null;
      full_name: string;
      organizations: { name: string } | null;
    } | null;
    const userError = userResult.error;

    if (userError || !userData?.org_id) {
      console.error('User org check failed:', {
        userError,
        userData,
        userId: session.user.id,
      });
      return res.status(400).json({ error: 'User not part of organization' });
    }

    const inviteDetails = [];
    const invitesFailed = [];

    for (const invite of invites) {
      try {
        const inviteCode = generateInviteCode();
        const inviteToken = generateInviteToken();
        const expiresAt = getInviteExpiryDate();
        const inviteLink = generateInviteLink(inviteToken);

        // Check if contact already exists (as user or pending invite)
        const { data: existingUser } = await serviceRoleSupabase
          .from('users')
          .select('id, email')
          .or(`email.eq.${invite.contact},phone.eq.${invite.contact}`)
          .maybeSingle();

        if (existingUser) {
          invitesFailed.push({
            contact: invite.contact,
            reason: 'User already exists with this contact',
          });
          continue;
        }

        const { data: existingInvite } = await serviceRoleSupabase
          .from('user_invites')
          .select('id')
          .eq('org_id', userData.org_id)
          .eq('contact', invite.contact)
          .eq('status', 'pending')
          .maybeSingle();

        if (existingInvite) {
          invitesFailed.push({
            contact: invite.contact,
            reason: 'Invite already sent to this contact',
          });
          continue;
        }

        // Create invite record
        const { data: inviteRecord, error: inviteError } =
          await serviceRoleSupabase
            .from('user_invites')
            .insert({
              org_id: userData.org_id,
              invited_by: session.user.id,
              name: invite.name,
              contact: invite.contact,
              contact_type: invite.contactType,
              role: invite.role,
              invite_code: inviteCode,
              invite_token: inviteToken,
              expires_at: expiresAt,
            })
            .select()
            .single();

        if (inviteError) {
          console.error('Invite creation error:', inviteError);
          invitesFailed.push({
            contact: invite.contact,
            reason: inviteError.message,
          });
          continue;
        }

        // Format invite message
        const message = formatInviteMessage({
          companyName: userData.organizations?.name || 'your team',
          inviteCode,
          inviteLink,
          inviterName: userData.full_name || 'Your manager',
          role: invite.role,
        });

        // Send invite via SMS or email
        let sent = false;
        if (invite.contactType === 'phone') {
          sent = await sendSMS({ to: invite.contact, message });
        } else {
          sent = await sendEmail({
            to: invite.contact,
            subject: `You're invited to join ${userData.organizations?.name} on Automet`,
            html: `<pre>${message}</pre>`,
            text: message,
          });
        }

        if (!sent) {
          console.warn('Failed to send invite message to:', invite.contact);
          // Don't fail the invite creation, just log warning
        }

        inviteDetails.push({
          id: inviteRecord.id,
          name: invite.name,
          contact: invite.contact,
          role: invite.role,
          inviteCode,
          inviteLink,
          expiresAt,
        });
      } catch (error) {
        console.error('Invite processing error:', error);
        invitesFailed.push({
          contact: invite.contact,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return res.status(200).json({
      success: true,
      invitesSent: inviteDetails.length,
      inviteDetails,
      invitesFailed,
    });
  } catch (error) {
    console.error('Error processing invites:', error);
    return res.status(500).json({
      error: 'Failed to process invites',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
