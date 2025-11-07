/**
 * Blog Post View Tracking API
 * Increments view count for analytics and social proof
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

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

    // Get admin client to bypass RLS
    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      console.error('Supabase admin client not available');
      return res.status(200).json({ success: true, view_count: 0 });
    }

    // Our Supabase client types currently do not include blog_posts (needs generated types).
    // Cast to any to avoid build-time failures while keeping runtime logic intact.
    // TODO: Replace with typed client once Supabase types are generated.
    const supabase = adminClient as any;

    // Fetch current post
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('view_count')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (fetchError || !post) {
      console.error('Error fetching post:', fetchError);
      // Silently fail for analytics - don't block user
      return res.status(200).json({ success: true, view_count: 0 });
    }

    // Increment view count
    const newCount = ((post?.view_count as number | null) || 0) + 1;
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ view_count: newCount })
      .eq('slug', slug)
      .eq('published', true);

    if (updateError) {
      console.error('Error incrementing view count:', updateError);
      // Silently fail for analytics - don't block user
      return res.status(200).json({ success: true, view_count: post.view_count || 0 });
    }

    return res.status(200).json({ 
      success: true, 
      view_count: newCount 
    });

  } catch (error) {
    console.error('View tracking error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

