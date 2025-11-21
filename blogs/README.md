# Blog Content Workflow

This folder contains all blog posts in various stages of production.

## Folder Structure

```
blogs/
├── drafts/              # Markdown files being written
├── ready-to-upload/     # SQL seed files ready to load into database
├── uploaded/            # Archive of uploaded blogs (for reference)
└── README.md           # This file
```

## Workflow

### Step 1: Write Blog (Drafts)
Create a markdown file in `drafts/` with frontmatter:

```markdown
---
slug: your-url-slug
title: Your Blog Title
excerpt: Short summary (max 500 chars)
category: industry-insights  # or product-updates, best-practices, case-studies
tags: [keyword1, keyword2, keyword3]
meta_title: SEO Title (50-60 chars)
meta_description: SEO description (150-160 chars)
author_name: Automet Team
---

# Your Blog Title

Your markdown content here...
```

### Step 2: Convert to SQL (Ready to Upload)
Run the conversion script:

```bash
node scripts/convert-blog-to-sql.js blogs/drafts/your-blog.md
```

This creates a SQL file in `blogs/ready-to-upload/`

### Step 3: Upload to Database
When ready to publish, load all SQL files:

```bash
./scripts/upload-blogs.sh
```

Or load individually via Supabase SQL Editor.

### Step 4: Archive
After uploading, move to `uploaded/` for reference.

## Blog Naming Convention

**Draft files:** Use descriptive names with date prefix
- `2025-01-15-field-service-management-guide.md`
- `2025-01-16-preventive-maintenance-guide.md`

**SQL files:** Auto-generated from slug
- `field-service-management-guide.sql`
- `preventive-maintenance-guide.sql`

## Categories

- `product-updates` - New features, announcements, roadmap
- `industry-insights` - Industry trends, challenges, market analysis
- `best-practices` - How-to guides, tips, strategies
- `case-studies` - Customer stories, success stories, ROI

## Tags Best Practices

- Use 5-10 tags per post
- Include primary keyword
- Add related keywords
- Use lowercase
- Separate with commas in array format

## SEO Checklist

- [ ] Meta title: 50-60 characters
- [ ] Meta description: 150-160 characters
- [ ] Slug: keyword-rich, lowercase, hyphens
- [ ] Primary keyword in title
- [ ] Primary keyword in first paragraph
- [ ] Headers (H2, H3) with keywords
- [ ] Internal links to other blog posts
- [ ] 1,500+ words for pillar content
- [ ] Clear CTA at the end
