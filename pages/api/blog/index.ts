/**
 * Blog Posts API endpoint
 * GET /api/blog - List published blog posts
 *
 * @returns Array of blog posts with excerpt (not full content)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '10', category } = req.query;

    let query = supabaseAdmin
      .from('blog_posts')
      .select('id, slug, title, excerpt, category, tags, author_name, published_at, cover_image_url')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(parseInt(limit as string));

    // Filter by category if provided
    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Blog fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch blog posts' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
