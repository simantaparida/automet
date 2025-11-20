/**
 * Pre-order API endpoint (Waitlist signup)
 * POST /api/preorder - Create new waitlist entry
 *
 * @security Server-side validation with Zod
 * @security Duplicate email check
 * @security Sanitized inputs before DB insert
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import { getSupabaseAdmin, supabaseServer } from '@/lib/supabase-server';
import { preorderSchema } from '@/lib/validations/preorder';
import { sendWaitlistWelcomeEmail } from '@/lib/email';

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

    // Get admin client lazily (ensures fresh env vars are used)
    // Always use admin client if available (bypasses RLS completely)
    const adminClient = getSupabaseAdmin();
    const supabase = adminClient || supabaseServer;
    const useServiceRole = adminClient !== null;

    if (!useServiceRole) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
      console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY issue detected:');
      console.error(
        '   - Service Role Key:',
        serviceRoleKey ? `Set (${serviceRoleKey.length} chars)` : 'NOT SET'
      );
      console.error('   - Supabase URL:', supabaseUrl || 'NOT SET');
      console.error(
        '   - Admin Client:',
        'NULL - falling back to server client'
      );
      console.error('⚠️ Using anon key - may encounter RLS permission issues.');
      console.error(
        '⚠️ Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS'
      );
    }

    // Try to check for duplicate email, but don't fail if check fails
    // We'll rely on database unique constraint if check fails
    let existingPreorder = null;
    try {
      const { data: existingData, error: checkError } = await supabase
        .from('preorders')
        .select('id, email')
        .eq('email', data.email.toLowerCase())
        .maybeSingle();

      if (checkError) {
        // Log error but continue - database unique constraint will catch duplicates
        console.warn(
          'Duplicate check failed (will rely on DB constraint):',
          checkError.code,
          checkError.message
        );
        // If it's a permission error and we don't have service role, log warning
        if (checkError.code === '42501' && !useServiceRole) {
          console.warn(
            '⚠️ RLS permission denied. Consider setting SUPABASE_SERVICE_ROLE_KEY in .env.local'
          );
        }
      } else {
        existingPreorder = existingData;
      }
    } catch (err) {
      // Catch any unexpected errors during duplicate check
      console.warn(
        'Duplicate check threw exception (will rely on DB constraint):',
        err
      );
    }

    // If we found a duplicate, return early
    if (existingPreorder) {
      return res.status(409).json({
        error: 'Email already registered',
        message:
          "This email is already on the waitlist. We'll notify you when we launch!",
      });
    }

    // Insert waitlist entry into database
    // Using admin client if available (bypasses RLS), otherwise using public RLS policy
    const preorderInsert: Database['public']['Tables']['preorders']['Insert'] =
      {
        org_name: data.org_name || null,
        contact_name: data.contact_name || null,
        email: data.email.toLowerCase(),
        phone: data.phone,
        tech_count: data.tech_count ?? null,
        city: data.city ?? null,
        plan_interest: data.plan_interest ?? null,
        payment_status: 'pending',
        amount_paid: 0,
        email_confirmed: true,
        confirmation_token: null,
        token_expires_at: null,
        utm_source: data.utm_source ?? null,
        utm_medium: data.utm_medium ?? null,
        utm_campaign: data.utm_campaign ?? null,
        referrer: data.referrer ?? null,
      };

    const { data: preorder, error: insertError } = await supabase
      .from('preorders')
      .insert(preorderInsert)
      .select('id, email, contact_name')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      console.error(
        'Using client:',
        useServiceRole ? 'Admin (should bypass RLS)' : 'Server (respects RLS)'
      );

      // Handle permission denied errors
      if (
        insertError.code === '42501' ||
        insertError.message?.includes('permission denied')
      ) {
        console.error('❌ RLS Permission Denied Error!');
        console.error(
          '   This means the admin client is not working properly.'
        );
        console.error('   Check: SUPABASE_SERVICE_ROLE_KEY in .env.local');
        return res.status(500).json({
          error: 'Permission denied',
          message:
            'Database permission error. Please check server configuration.',
          details:
            process.env.NODE_ENV === 'development'
              ? {
                  code: insertError.code,
                  message: insertError.message,
                  hint: 'Make sure SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local',
                }
              : undefined,
        });
      }

      // Handle duplicate email error from database unique constraint
      if (
        insertError.code === '23505' ||
        insertError.message?.includes('duplicate') ||
        insertError.message?.includes('unique')
      ) {
        return res.status(409).json({
          error: 'Email already registered',
          message:
            "This email is already on the waitlist. We'll notify you when we launch!",
        });
      }

      // Return more detailed error message for debugging
      return res.status(500).json({
        error: 'Failed to join waitlist',
        message: insertError.message || 'Please try again or contact support.',
        details:
          process.env.NODE_ENV === 'development'
            ? {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
              }
            : undefined,
      });
    }

    // Send welcome email (don't fail if email fails)
    try {
      const preorderData = preorder as {
        email: string;
        contact_name?: string | null;
      } | null;
      if (preorderData) {
        await sendWaitlistWelcomeEmail(
          preorderData.email,
          preorderData.contact_name || 'there'
        );
      }
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails - user is still added to waitlist
    }

    // Return success response
    const preorderResponse = preorder as { id: string; email: string } | null;
    return res.status(201).json({
      success: true,
      message:
        "Successfully joined the waitlist! We'll notify you when Automet launches.",
      preorder: preorderResponse
        ? {
            id: preorderResponse.id,
            email: preorderResponse.email,
          }
        : {
            id: 'unknown',
            email: data.email,
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
