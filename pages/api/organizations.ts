import type { NextApiRequest, NextApiResponse } from 'next';
import { withOnboardedAuth } from '@/lib/auth-middleware';

/**
 * GET /api/organizations
 * Get the current authenticated user's organization details
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
    // Fetch organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, created_at')
      .eq('id', user.org_id)
      .single();

    if (orgError) {
      console.error('Error fetching organization:', orgError);
      return res.status(500).json({ 
        error: 'Failed to fetch organization',
        message: orgError.message,
      });
    }

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.status(200).json(organization);
  } catch (error) {
    console.error('Error in organizations API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

