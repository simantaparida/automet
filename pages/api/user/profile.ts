import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';

/**
 * GET /api/user/profile
 * Get the current authenticated user's profile including role, full_name, profile_photo_url, created_at
 *
 * PATCH /api/user/profile
 * Update the current authenticated user's profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGetProfile(req, res);
  } else if (req.method === 'PATCH') {
    return handleUpdateProfile(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET handler
 */
async function handleGetProfile(req: NextApiRequest, res: NextApiResponse) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase: untypedSupabase } = authResult;
  const supabase = untypedSupabase as unknown as SupabaseClient<Database>;

  try {
    // Fetch full user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(
        'id, email, org_id, role, full_name, phone, profile_photo_url, created_at'
      )
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Fallback to basic user data
      return res.status(200).json({
        id: user.id,
        email: user.email,
        org_id: user.org_id,
        role: user.role,
        full_name: null,
        contact_phone: null,
        profile_photo_url: null,
        created_at: null,
      });
    }

    // Return user profile with all available data
    return res.status(200).json({
      id: userProfile.id,
      email: userProfile.email,
      org_id: userProfile.org_id,
      role: userProfile.role,
      full_name: userProfile.full_name || null,
      contact_phone: userProfile.phone || null, // Map phone to contact_phone
      profile_photo_url: userProfile.profile_photo_url || null,
      created_at: userProfile.created_at || null,
    });
  } catch (error) {
    console.error('Error in user profile API:', error);
    // Fallback to basic user data
    return res.status(200).json({
      id: user.id,
      email: user.email,
      org_id: user.org_id,
      role: user.role,
      full_name: null,
      contact_phone: null,
      profile_photo_url: null,
      created_at: null,
    });
  }
}

/**
 * PATCH handler - Update user profile
 */
async function handleUpdateProfile(req: NextApiRequest, res: NextApiResponse) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase: untypedSupabase } = authResult;
  const supabase = untypedSupabase as unknown as SupabaseClient<Database>;

  try {
    const { full_name, contact_phone, profile_photo_url } = req.body;

    // Validate inputs
    if (full_name !== undefined && typeof full_name !== 'string') {
      return res.status(400).json({ error: 'Invalid full_name format' });
    }

    if (contact_phone !== undefined && typeof contact_phone !== 'string') {
      return res.status(400).json({ error: 'Invalid contact_phone format' });
    }

    if (
      profile_photo_url !== undefined &&
      typeof profile_photo_url !== 'string'
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid profile_photo_url format' });
    }

    // Validate phone number format if provided
    if (contact_phone && contact_phone.trim() !== '') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(contact_phone) || contact_phone.length > 20) {
        return res
          .status(400)
          .json({ error: 'Invalid phone number format. Max 20 characters.' });
      }
    }

    // Build update object with only provided fields
    const updateData: Database['public']['Tables']['users']['Update'] = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) {
      updateData.full_name = full_name.trim() || null; // full_name is not nullable in DB but logic handles it? Wait, DB says full_name is string.
    }

    if (contact_phone !== undefined) {
      updateData.phone = contact_phone.trim() || null;
    }

    if (profile_photo_url !== undefined) {
      updateData.profile_photo_url = profile_photo_url.trim() || null;
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select(
        'id, email, org_id, role, full_name, phone, profile_photo_url, created_at'
      )
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    return res.status(200).json({
      id: updatedProfile.id,
      email: updatedProfile.email,
      org_id: updatedProfile.org_id,
      role: updatedProfile.role,
      full_name: updatedProfile.full_name || null,
      contact_phone: updatedProfile.phone || null,
      profile_photo_url: updatedProfile.profile_photo_url || null,
      created_at: updatedProfile.created_at || null,
    });
  } catch (error) {
    console.error('Error in update profile API:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}
