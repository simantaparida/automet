/**
 * API Route: Create First Customer
 * POST /api/onboarding/create-customer
 *
 * Creates the first customer during onboarding
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
    const supabase = createPagesServerClient<Database>({ req, res });
    const serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, address, contactPerson, phone } = req.body;

    if (!name || !address) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: name and address' });
    }

    // Validate name length
    if (name.length < 2 || name.length > 200) {
      return res
        .status(400)
        .json({ error: 'Customer name must be 2-200 characters' });
    }

    // Get user's org_id using service role (fresh data, no cache)
    const userResult = await serviceRoleSupabase
      .from('users')
      .select('org_id, role')
      .eq('id', session.user.id)
      .maybeSingle();

    const userData = userResult.data as {
      org_id: string | null;
      role: string | null;
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

    // Check user has permission (owner or coordinator)
    if (!['owner', 'coordinator'].includes(userData.role || '')) {
      return res
        .status(403)
        .json({ error: 'Only owners and coordinators can create customers' });
    }

    // Create customer (client) using service role to bypass RLS
    const { data: customer, error: customerError } = await serviceRoleSupabase
      .from('clients')
      .insert({
        org_id: userData.org_id,
        name,
        address,
        contact_email: contactPerson || null, // Using contact_email field for contact person name temporarily
        contact_phone: phone || null,
      })
      .select()
      .single();

    if (customerError) {
      console.error('Customer creation error:', customerError);
      return res.status(500).json({ error: customerError.message });
    }

    return res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        address: customer.address,
        contactPerson: customer.contact_email,
        phone: customer.contact_phone,
        createdAt: customer.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({
      error: 'Failed to create customer',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
