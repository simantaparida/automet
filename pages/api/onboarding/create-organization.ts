/**
 * API Route: Create Organization & User Profile
 * POST /api/onboarding/create-organization
 *
 * This uses service_role to bypass RLS during initial onboarding
 * since the user doesn't have a profile yet to satisfy RLS policies
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient<Database>({ req, res });

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { organizationName, industry, workingHours, currency } = req.body;

    if (!organizationName || !industry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate working hours if provided
    if (workingHours) {
      if (!workingHours.from || !workingHours.to) {
        return res.status(400).json({ error: 'Invalid working hours format' });
      }
    }

    // Use service role client for both operations to bypass RLS completely
    // This is necessary during onboarding before the user profile exists
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate unique slug
    const baseSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let attempts = 0;

    // Check if slug exists, add number if needed
    while (attempts < 10) {
      const { data: existing } = await serviceRoleSupabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!existing) break;

      attempts++;
      slug = `${baseSlug}-${attempts}`;
    }

    // Creating organization with slug

    // Create organization using service role
    const { data: org, error: orgError } = await serviceRoleSupabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: slug,
        settings: {
          industry,
          working_hours: workingHours || { from: '09:00', to: '18:00' },
          currency: currency || 'INR',
        },
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation error:', orgError);
      return res.status(500).json({ error: orgError.message });
    }

    console.log('Organization created:', org.id);
    console.log('Creating/updating user profile:', {
      userId: session.user.id,
      orgId: org.id,
    });

    // Create or update user profile using service role
    // Use UPSERT because user might already exist from:
    // - Previous onboarding attempts
    // - Auth triggers
    // - Database seeds
    const fullName =
      session.user.user_metadata?.full_name ||
      session.user.email?.split('@')[0] ||
      'User';

    const { data: insertedUser, error: userError } = await serviceRoleSupabase
      .from('users')
      .upsert(
        {
          id: session.user.id,
          email: session.user.email!,
          full_name: fullName,
          phone: session.user.user_metadata?.phone || null,
          org_id: org.id,
          role: 'owner',
        },
        {
          onConflict: 'id', // Update on conflict with existing user ID
        }
      )
      .select()
      .single();

    console.log('User upsert result:', { insertedUser, userError });

    if (userError) {
      console.error('User creation error:', userError);
      // Rollback organization
      await serviceRoleSupabase.from('organizations').delete().eq('id', org.id);
      return res.status(500).json({ error: userError.message });
    }

    return res.status(200).json({
      success: true,
      organization: org,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json({
      error: 'Failed to create organization',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
