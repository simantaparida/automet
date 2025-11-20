import type { NextApiRequest, NextApiResponse } from 'next';
import { withOnboardedAuth } from '@/lib/auth-middleware';

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
async function handleGetProfile(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase } = authResult;

  try {
    // Fetch full user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, org_id, role, full_name, contact_phone, profile_photo_url, created_at')
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
      id: (userProfile as any).id,
      email: (userProfile as any).email,
      org_id: (userProfile as any).org_id,
      role: (userProfile as any).role,
      full_name: (userProfile as any).full_name || null,
      contact_phone: (userProfile as any).contact_phone || null,
      profile_photo_url: (userProfile as any).profile_photo_url || null,
      created_at: (userProfile as any).created_at || null,
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
async function handleUpdateProfile(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase } = authResult;

  try {
    const { full_name, contact_phone, profile_photo_url } = req.body;

    // Validate inputs
    if (full_name !== undefined && typeof full_name !== 'string') {
      return res.status(400).json({ error: 'Invalid full_name format' });
    }

    if (contact_phone !== undefined && typeof contact_phone !== 'string') {
      return res.status(400).json({ error: 'Invalid contact_phone format' });
    }

    if (profile_photo_url !== undefined && typeof profile_photo_url !== 'string') {
      return res.status(400).json({ error: 'Invalid profile_photo_url format' });
    }

    // Validate phone number format if provided
    if (contact_phone && contact_phone.trim() !== '') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(contact_phone) || contact_phone.length > 20) {
        return res.status(400).json({ error: 'Invalid phone number format. Max 20 characters.' });
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) {
      updateData.full_name = full_name.trim() || null;
    }

    if (contact_phone !== undefined) {
      updateData.contact_phone = contact_phone.trim() || null;
    }

    if (profile_photo_url !== undefined) {
      updateData.profile_photo_url = profile_photo_url.trim() || null;
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id, email, org_id, role, full_name, contact_phone, profile_photo_url, created_at')
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    return res.status(200).json({
      id: (updatedProfile as any).id,
      email: (updatedProfile as any).email,
      org_id: (updatedProfile as any).org_id,
      role: (updatedProfile as any).role,
      full_name: (updatedProfile as any).full_name || null,
      contact_phone: (updatedProfile as any).contact_phone || null,
      profile_photo_url: (updatedProfile as any).profile_photo_url || null,
      created_at: (updatedProfile as any).created_at || null,
    });
  } catch (error) {
    console.error('Error in update profile API:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

