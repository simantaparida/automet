-- Rollback: Remove view_count from blog_posts table
-- Created: 2025-11-07

BEGIN;

-- Drop index
DROP INDEX IF EXISTS idx_blog_posts_view_count;

-- Remove column
ALTER TABLE blog_posts DROP COLUMN IF EXISTS view_count;

COMMIT;

