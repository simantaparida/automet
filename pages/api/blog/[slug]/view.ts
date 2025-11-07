/**
 * Blog Post View Tracking API
 * Increments view count for analytics and social proof
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid slug' });
    }

    // Increment view count
    const { data, error } = await supabaseServer
      .from('blog_posts')
      .update({ view_count: supabaseServer.sql`view_count + 1` })
      .eq('slug', slug)
      .eq('published', true)
      .select('view_count')
      .single();

    if (error) {
      console.error('Error incrementing view count:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to track view' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      view_count: data?.view_count || 0 
    });

  } catch (error) {
    console.error('View tracking error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

