/**
 * Email Confirmation API endpoint
 * GET /api/preorder/confirm?token=xxx - Verify email confirmation token
 *
 * @security Token validation
 * @security Expiry check (7 days)
 * @security One-time use (sets email_confirmed=true)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { confirmationSchema } from '@/lib/validations/preorder';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate token query parameter
    const validationResult = confirmationSchema.safeParse({
      token: req.query.token,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid confirmation token',
        message: 'The confirmation link is invalid or malformed.',
      });
    }

    const { token } = validationResult.data;

    // Get admin client (required for this operation)
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Admin client not available. Check SUPABASE_SERVICE_ROLE_KEY.',
      });
    }

    // Find pre-order by confirmation token
    const { data: preorder, error: fetchError } = await supabaseAdmin
      .from('preorders')
      .select(
        'id, email, contact_name, email_confirmed, token_expires_at, org_name'
      )
      .eq('confirmation_token', token)
      .single();

    if (fetchError || !preorder) {
      return res.status(404).json({
        error: 'Invalid token',
        message: 'This confirmation link is invalid or has already been used.',
      });
    }

    // Type assertion for preorder data
    const preorderData = preorder as {
      id: string;
      email: string;
      contact_name?: string | null;
      email_confirmed: boolean;
      token_expires_at: string;
      org_name?: string | null;
    };

    // Check if already confirmed
    if (preorderData.email_confirmed) {
      return res.status(200).json({
        success: true,
        message: 'Email already confirmed',
        preorder: {
          email: preorderData.email,
          contact_name: preorderData.contact_name,
          org_name: preorderData.org_name,
        },
      });
    }

    // Check token expiry
    const expiresAt = new Date(preorderData.token_expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return res.status(410).json({
        error: 'Token expired',
        message:
          'This confirmation link has expired. Please request a new confirmation email.',
      });
    }

    // Mark email as confirmed
    const { error: updateError } = await supabaseAdmin
      .from('preorders')
      // @ts-ignore - Supabase type inference issue with update
      .update({
        email_confirmed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preorderData.id);

    if (updateError) {
      console.error('Failed to confirm email:', updateError);
      return res.status(500).json({
        error: 'Confirmation failed',
        message: 'Failed to confirm your email. Please try again.',
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email confirmed successfully!',
      preorder: {
        email: preorderData.email,
        contact_name: preorderData.contact_name,
        org_name: preorderData.org_name,
      },
    });
  } catch (error) {
    console.error('Confirmation API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.',
    });
  }
}
