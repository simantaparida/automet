# Blog Posts to Upload

Place your blog post files here.

## File Format

Each blog post should be a `.md` (Markdown) file with frontmatter:

```markdown
---
title: Your Blog Post Title
excerpt: Short summary that appears on the listing page
category: industry-insights
tags: [AMC, field-service, automation]
slug: your-url-friendly-slug
published: true
published_at: 2025-01-15T10:00:00Z
meta_title: SEO Meta Title
meta_description: SEO meta description for search engines
cover_image_url: https://example.com/image.jpg
author_name: Automet Team
---

# Your Blog Post Title

Your blog content in Markdown format goes here...

## Section 1

Content...

## Section 2

More content...
```

## Categories

Choose one:
- `product-updates`
- `industry-insights`
- `best-practices`
- `case-studies`

## How to Upload

### Option 1: Use the Script
```bash
node scripts/upload-blog.js blogs-to-upload/your-blog.md
```

This will generate SQL that you can run in Supabase.

### Option 2: Share with Me
Just paste your blog content in the chat and I'll help format it!

### Option 3: Direct SQL
Copy the generated SQL and run it in Supabase SQL Editor.

## Tips

- **Slug**: URL-friendly, lowercase, hyphens only (e.g., `amc-management-tips`)
- **Title**: 5-200 characters
- **Excerpt**: Max 500 characters (shown on blog listing)
- **Content**: Full Markdown format
- **Tags**: Array of relevant keywords
- **Published**: Set to `true` to make it visible

