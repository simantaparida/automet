/**
 * Migration: Blog Posts RLS Policy
 * Adds Row Level Security policy to allow public reads of published blog posts
 *
 * Run in Supabase SQL Editor
 */

-- Enable RLS on blog_posts table (if not already enabled)
ALTER TABLE IF EXISTS blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for re-running migration)
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;

-- Allow anonymous and authenticated users to view published posts
-- This policy allows public (unauthenticated) access to published blog posts
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);

-- Verification query (should return published posts)
SELECT id, slug, title, published FROM blog_posts WHERE published = true;
