/**
 * Migration: Blog Posts RLS Policy
 * Adds Row Level Security policy to allow public reads of published blog posts
 *
 * Run in Supabase SQL Editor
 */

-- Enable RLS on blog_posts table (if not already enabled)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public to view published posts
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Verification query (should return 3 demo posts)
SELECT id, slug, title, published FROM blog_posts WHERE published = true;
