/**
 * Public API endpoint to get waitlist count
 * GET /api/admin/waitlist-count - Get total waitlist signups count
 * 
 * @security Public endpoint (no authentication required)
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

  try {
    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      // If admin client not available, return a default count
      return res.status(200).json({ count: 500 });
    }

    // Get total count of preorders
    const { count, error } = await adminClient
      .from('preorders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Failed to fetch waitlist count:', error);
      // Return default count on error
      return res.status(200).json({ count: 500 });
    }

    // Round to nearest 50 for social proof (e.g., 523 -> 500, 547 -> 550)
    const roundedCount = Math.round((count || 500) / 50) * 50;

    return res.status(200).json({ count: roundedCount });
  } catch (error) {
    console.error('Waitlist count API error:', error);
    // Return default count on error
    return res.status(200).json({ count: 500 });
  }
}

