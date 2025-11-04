/**
 * Rollback: Blog Posts RLS Policy
 * Removes public read policy from blog_posts
 */

-- Drop the public read policy
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;

-- Note: We don't disable RLS entirely as it may have been enabled before this migration
-- If you need to disable RLS completely, run manually:
-- ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
