/**
 * Blog Posts API endpoint (Public - No Authentication Required)
 * GET /api/blog - List published blog posts
 *
 * @public This endpoint is public and does not require authentication
 * @security Uses anon key with RLS policies allowing public read of published posts
 *         Or service role key to bypass RLS (for public blog content)
 * @returns Array of blog posts with excerpt (not full content)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '10', category } = req.query;

    // Validate environment variables (support both naming conventions)
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Blog API: Missing Supabase configuration', {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        checkedVars: [
          'SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_URL',
          'SUPABASE_ANON_KEY',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ],
      });
      return res.status(500).json({
        error: 'Server configuration error',
        details: process.env.NODE_ENV === 'development'
          ? 'Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY'
          : undefined
      });
    }

    // Prefer admin client if available (bypasses RLS for public blog content)
    // Otherwise use server client with anon key (respects RLS)
    const hasServiceRoleKey = serviceRoleKey.length > 0;
    const client = hasServiceRoleKey ? supabaseAdmin : supabaseServer;

    // Log configuration (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Blog API] Configuration:', {
        usingClient: hasServiceRoleKey ? 'supabaseAdmin (bypasses RLS)' : 'supabaseServer (respects RLS)',
        hasServiceRoleKey,
        hasSupabaseUrl: !!supabaseUrl,
      });
    }

    // If not using admin client, create a client with anon key
    const supabase = hasServiceRoleKey 
      ? client 
      : createClient<Database>(supabaseUrl, supabaseAnonKey);

    let query = supabase
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
      console.error('[Blog API] Fetch error:', error);
      console.error('[Blog API] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        usingClient: hasServiceRoleKey ? 'supabaseAdmin' : 'supabaseServer',
      });

      // Provide helpful error messages
      if (error.code === 'PGRST116') {
        // No rows returned - this is okay, just return empty array
        return res.status(200).json([]);
      }

      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return res.status(500).json({
          error: 'Blog posts table not found. Please run database migrations.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      // If RLS error and using server client, suggest using service role key
      if (error.code === '42501' && !hasServiceRoleKey) {
        console.error('[Blog API] RLS permission denied. Consider using SUPABASE_SERVICE_ROLE_KEY to bypass RLS for public blog posts.');
      }

      return res.status(500).json({
        error: 'Failed to fetch blog posts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Return data (even if empty array)
    return res.status(200).json(data || []);

  } catch (error) {
    console.error('Blog API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
