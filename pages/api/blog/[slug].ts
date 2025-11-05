/**
 * Single Blog Post API endpoint (Public - No Authentication Required)
 * GET /api/blog/[slug] - Get a single blog post by slug
 *
 * @public This endpoint is public and does not require authentication
 * @security Uses anon key with RLS policies allowing public read of published posts
 * @returns Full blog post with content
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

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

    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Blog API: Missing Supabase configuration');
      return res.status(500).json({
        error: 'Server configuration error',
        details: process.env.NODE_ENV === 'development'
          ? 'Missing SUPABASE_URL or SUPABASE_ANON_KEY'
          : undefined
      });
    }

    // Create public client (uses anon key, respects RLS)
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return res.status(404).json({
          error: 'Blog post not found',
          details: process.env.NODE_ENV === 'development' ? `No post with slug: ${slug}` : undefined
        });
      }

      console.error('Blog post fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch blog post',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (!data) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Blog post API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
