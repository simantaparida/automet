-- Migration: Add updated_at field to blog_posts table
-- Created: 2025-11-07
-- Description: Track when blog posts are last updated for SEO and UX

BEGIN;

-- Add updated_at column if it doesn't exist
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Set initial values: updated_at = published_at for existing posts
UPDATE blog_posts 
SET updated_at = published_at 
WHERE updated_at IS NULL;

-- Make it NOT NULL after setting initial values
ALTER TABLE blog_posts 
ALTER COLUMN updated_at SET NOT NULL;

-- Create trigger to auto-update the timestamp
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON COLUMN blog_posts.updated_at IS 'Timestamp when the blog post was last updated (for SEO dateModified)';

COMMIT;

