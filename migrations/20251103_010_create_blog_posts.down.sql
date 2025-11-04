-- Rollback: Remove blog_posts table
-- Created: 2025-11-03

BEGIN;

-- Drop indexes
DROP INDEX IF EXISTS idx_blog_posts_published_at;
DROP INDEX IF EXISTS idx_blog_posts_category;
DROP INDEX IF EXISTS idx_blog_posts_published;
DROP INDEX IF EXISTS idx_blog_posts_slug;

-- Drop table
DROP TABLE IF EXISTS blog_posts;

COMMIT;
