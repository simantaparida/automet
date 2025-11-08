/**
 * Blog Post View Tracking API
 * Increments view count for analytics and social proof
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { logError, logWarn } from '@/lib/logger';

interface BlogPostRow {
  id: string;
  view_count: number | null;
}

const isSlug = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { slug } = req.query;

    if (!isSlug(slug)) {
      return res.status(400).json({ success: false, message: 'Invalid slug' });
    }

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      logWarn('Supabase admin client not available');
      return res.status(200).json({ success: true, view_count: 0 });
    }

    const { data: post, error: fetchError } = await adminClient
      .from<BlogPostRow>('blog_posts')
      .select('id, view_count')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle<BlogPostRow>();

    if (fetchError || !post) {
      logWarn('Error fetching post for view tracking:', fetchError);
      return res.status(200).json({ success: true, view_count: 0 });
    }

    const newCount = (post.view_count ?? 0) + 1;

    const { error: updateError } = await adminClient
      .from<BlogPostRow>('blog_posts')
      .update({ view_count: newCount })
      .eq('id', post.id);

    if (updateError) {
      logWarn('Error incrementing view count:', updateError);
      return res.status(200).json({
        success: true,
        view_count: post.view_count ?? 0,
      });
    }

    return res.status(200).json({
      success: true,
      view_count: newCount,
    });
  } catch (error) {
    logError('View tracking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
