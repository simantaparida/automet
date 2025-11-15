import type { NextApiRequest, NextApiResponse } from 'next';
import { withOnboardedAuth } from '@/lib/auth-middleware';

/**
 * GET /api/user/profile
 * Get the current authenticated user's profile including role, full_name, profile_photo_url, created_at
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase } = authResult;

  try {
    // Fetch full user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, org_id, role, full_name, profile_photo_url, created_at')
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
      profile_photo_url: null,
      created_at: null,
    });
  }
}

