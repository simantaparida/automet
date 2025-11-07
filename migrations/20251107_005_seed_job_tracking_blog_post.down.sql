-- Rollback: Remove seeded blog post (Job Tracking 2026)
-- Created: 2025-11-07

BEGIN;

DELETE FROM public.blog_posts
WHERE slug = 'why-service-companies-in-india-need-job-tracking-software-2026';

COMMIT;


