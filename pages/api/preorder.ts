/**
 * Pre-order API endpoint
 * POST /api/preorder - Create new pre-order with email confirmation
 *
 * @security Server-side validation with Zod
 * @security Duplicate email check
 * @security Sanitized inputs before DB insert
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';
import { preorderSchema } from '@/lib/validations/preorder';
import { sendPreorderConfirmation } from '@/lib/email';
import { nanoid } from 'nanoid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body with Zod
    const validationResult = preorderSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const data = validationResult.data;

    // Check for duplicate email
    const { data: existingPreorder } = await supabaseAdmin
      .from('preorders')
      .select('id, email, email_confirmed')
      .eq('email', data.email)
      .single();

    if (existingPreorder) {
      // If email exists but not confirmed, resend confirmation
      if (!existingPreorder.email_confirmed) {
        return res.status(409).json({
          error: 'Email already registered',
          message: 'Please check your inbox for the confirmation email. Check spam folder if you don\'t see it.',
          resend: true,
        });
      }

      return res.status(409).json({
        error: 'Email already registered',
        message: 'This email has already been confirmed for early access.',
      });
    }

    // Generate confirmation token (secure random string)
    const confirmationToken = nanoid(32);
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // 7 days expiry

    // Insert pre-order into database
    const { data: preorder, error: insertError } = await supabaseAdmin
      .from('preorders')
      .insert({
        org_name: data.org_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone || null,
        tech_count: data.tech_count || null,
        city: data.city || null,
        plan_interest: data.plan_interest || 'pro',
        payment_status: 'pending',
        amount_paid: 0,
        email_confirmed: false,
        confirmation_token: confirmationToken,
        token_expires_at: tokenExpiresAt.toISOString(),
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        referrer: data.referrer || null,
      })
      .select('id, email, contact_name')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({
        error: 'Failed to create pre-order',
        message: 'Please try again or contact support.',
      });
    }

    // Send confirmation email
    const emailSent = await sendPreorderConfirmation(
      preorder.email,
      preorder.contact_name,
      confirmationToken
    );

    if (!emailSent) {
      console.error('Failed to send confirmation email to:', preorder.email);
      // Don't fail the request - user can request resend later
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Pre-order created successfully! Please check your email to confirm.',
      preorder: {
        id: preorder.id,
        email: preorder.email,
      },
    });
  } catch (error) {
    console.error('Pre-order API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.',
    });
  }
}
