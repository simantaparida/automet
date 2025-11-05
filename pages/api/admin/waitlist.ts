/**
 * Admin API endpoint to fetch all waitlist entries
 * GET /api/admin/waitlist - List all preorders
 *
 * @security Admin access required (uses service role key)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for admin secret
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(500).json({
      error: 'Admin secret not configured',
      message: 'ADMIN_SECRET environment variable is required.',
    });
  }

  // Verify admin secret from header
  const providedSecret = req.headers['x-admin-secret'] || req.query.secret;
  if (!providedSecret || providedSecret !== adminSecret) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid admin secret. Access denied.',
    });
  }

  try {
    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({
        error: 'Admin access required',
        message:
          'Service role key not configured. This endpoint requires admin access.',
      });
    }

    // Fetch all preorders, ordered by most recent first
    const { data: preorders, error } = await adminClient
      .from('preorders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch waitlist:', error);
      return res.status(500).json({
        error: 'Failed to fetch waitlist',
        message: error.message,
      });
    }

    // Get summary statistics
    const total = preorders?.length || 0;
    const confirmed = preorders?.filter((p) => p.email_confirmed).length || 0;
    const paid =
      preorders?.filter((p) => p.payment_status === 'paid').length || 0;

    return res.status(200).json({
      success: true,
      data: preorders || [],
      stats: {
        total,
        confirmed,
        paid,
      },
    });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.',
    });
  }
}
