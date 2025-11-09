-- Migration: Add view_count to blog_posts table
-- Created: 2025-11-07
-- Description: Track article views for popularity metrics and social proof

BEGIN;

-- Add view_count column
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 CHECK (view_count >= 0);

-- Create index for performance (sorting by popularity)
CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count ON blog_posts(view_count DESC);

-- Add comment
COMMENT ON COLUMN blog_posts.view_count IS 'Number of times this blog post has been viewed (for popularity ranking and social proof)';

COMMIT;

