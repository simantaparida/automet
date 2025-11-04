/**
 * Single Blog Post API endpoint
 * GET /api/blog/[slug] - Get a single blog post by slug
 *
 * @returns Full blog post with content
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug is required' });
    }

    // Use admin client if service role key is available, otherwise use server client (which respects RLS)
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const client = hasServiceRoleKey ? supabaseAdmin : supabaseServer;

    const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !data) {
      console.error('Blog post fetch error:', error);
      return res.status(404).json({ error: 'Blog post not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Blog post API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
