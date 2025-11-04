-- Migration: Create blog_posts table for landing page blog section
-- Created: 2025-11-03
-- Description: Store blog posts with Markdown content for landing page

BEGIN;

-- ============================================================================
-- BLOG_POSTS TABLE
-- ============================================================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9-]+$'),
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  excerpt TEXT CHECK (char_length(excerpt) <= 500),
  content TEXT NOT NULL, -- Markdown format
  cover_image_url TEXT,

  -- Metadata
  author_name TEXT DEFAULT 'Automet Team',
  category TEXT CHECK (category IN ('product-updates', 'industry-insights', 'best-practices', 'case-studies')),
  tags TEXT[],

  -- Publishing
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category) WHERE published = TRUE;
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC) WHERE published = TRUE;

-- Comments for documentation
COMMENT ON TABLE blog_posts IS 'Blog posts for landing page with Markdown content';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly unique identifier for blog post';
COMMENT ON COLUMN blog_posts.content IS 'Blog post content in Markdown format';
COMMENT ON COLUMN blog_posts.published IS 'Whether post is visible to public';
COMMENT ON COLUMN blog_posts.published_at IS 'When post was published (can be scheduled)';

COMMIT;
