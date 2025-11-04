/**
 * Pre-order API endpoint (Waitlist signup)
 * POST /api/preorder - Create new waitlist entry
 *
 * @security Server-side validation with Zod
 * @security Duplicate email check
 * @security Sanitized inputs before DB insert
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase-server';
import { preorderSchema } from '@/lib/validations/preorder';

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

    // Use service role if properly configured, otherwise use anon key with public RLS policy
    // The public RLS policy allows INSERT for anonymous users
    const useServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY && 
                          process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20;
    const supabase = useServiceRole ? supabaseAdmin : supabaseServer;

    if (!useServiceRole) {
      console.log('Using anon key with public RLS policy (service role not configured)');
    }

    // Check for duplicate email
    const { data: existingPreorder, error: checkError } = await supabase
      .from('preorders')
      .select('id, email')
      .eq('email', data.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected for new emails
      console.error('Error checking duplicate email:', checkError);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check existing entries. Please try again.',
        details: process.env.NODE_ENV === 'development' ? checkError : undefined,
      });
    }

    if (existingPreorder) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'This email is already on the waitlist. We\'ll notify you when we launch!',
      });
    }

    // Insert waitlist entry into database
    // Using public RLS policy - works with anon key
    const { data: preorder, error: insertError } = await supabase
      .from('preorders')
      .insert({
        org_name: data.org_name || null,
        contact_name: data.contact_name || null,
        email: data.email,
        phone: data.phone,
        tech_count: data.tech_count || null,
        city: data.city || null,
        plan_interest: data.plan_interest || null,
        payment_status: 'pending', // No payment required for waitlist
        amount_paid: 0,
        email_confirmed: true, // Auto-confirm for waitlist (no email confirmation needed)
        confirmation_token: null, // No confirmation token needed
        token_expires_at: null,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        referrer: data.referrer || null,
      })
      .select('id, email, contact_name')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      
      // Return more detailed error message for debugging
      return res.status(500).json({
        error: 'Failed to join waitlist',
        message: insertError.message || 'Please try again or contact support.',
        details: process.env.NODE_ENV === 'development' ? {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        } : undefined,
      });
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Successfully joined the waitlist! We\'ll notify you when Automet launches.',
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
