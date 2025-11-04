/**
 * Blog Posts API endpoint
 * GET /api/blog - List published blog posts
 *
 * @returns Array of blog posts with excerpt (not full content)
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
    const { limit = '10', category } = req.query;

    // Check environment variables
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0;
    const hasAnonKey = !!process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.length > 0;
    const hasSupabaseUrl = !!process.env.SUPABASE_URL && process.env.SUPABASE_URL.length > 0;

    if (!hasSupabaseUrl) {
      console.error('SUPABASE_URL is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Use admin client if service role key is available, otherwise use server client (which respects RLS)
    const client = hasServiceRoleKey ? supabaseAdmin : supabaseServer;
    
    console.log('Blog API - Using client:', hasServiceRoleKey ? 'supabaseAdmin' : 'supabaseServer');
    console.log('Blog API - Has service role key:', hasServiceRoleKey);
    console.log('Blog API - Has anon key:', hasAnonKey);
    
    if (!hasServiceRoleKey && !hasAnonKey) {
      console.error('Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let query = client
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
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return res.status(500).json({ 
        error: 'Failed to fetch blog posts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (!data || data.length === 0) {
      console.warn('No blog posts found. Published count:', data?.length || 0);
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
