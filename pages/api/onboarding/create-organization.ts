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

    const { organizationName, industry, teamSize, phone } = req.body;

    if (!organizationName || !industry || !teamSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique slug
    const baseSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let attempts = 0;

    // Check if slug exists, add number if needed
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) break;

      attempts++;
      slug = `${baseSlug}-${attempts}`;
    }

    // Create organization (this should work with RLS policy)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: slug,
        settings: {
          industry,
          team_size: teamSize,
        },
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation error:', orgError);
      return res.status(500).json({ error: orgError.message });
    }

    // Create user profile using service_role (bypass RLS)
    // This is needed because RLS policies check for existing user record
    // but this is the first time we're creating it
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { error: userError } = await serviceRoleSupabase.from('users').insert({
      id: session.user.id,
      email: session.user.email!,
      org_id: org.id,
      role: 'owner',
      phone: phone || null,
    });

    if (userError) {
      console.error('User creation error:', userError);
      // Rollback organization
      await supabase.from('organizations').delete().eq('id', org.id);
      return res.status(500).json({ error: userError.message });
    }

    return res.status(200).json({
      success: true,
      organization: org,
    });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
