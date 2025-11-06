# Blog Upload Guide

This guide will help you upload your SEO blog posts to Automet.

## Blog Post Structure

Each blog post needs the following information:

### Required Fields:
- **slug**: URL-friendly identifier (e.g., `how-to-manage-amc-vendors`)
  - Only lowercase letters, numbers, and hyphens
  - Must be unique
- **title**: Blog post title (5-200 characters)
- **content**: Full blog content in **Markdown format**

### Optional Fields:
- **excerpt**: Short summary (max 500 characters) - shown on blog listing page
- **cover_image_url**: URL to cover image
- **author_name**: Author name (defaults to "Automet Team")
- **category**: One of:
  - `product-updates`
  - `industry-insights`
  - `best-practices`
  - `case-studies`
- **tags**: Array of strings (e.g., `["AMC", "field-service", "automation"]`)
- **meta_title**: SEO meta title (for search engines)
- **meta_description**: SEO meta description (for search engines)
- **published**: Set to `true` to make it visible
- **published_at**: Publication date (ISO format)

## How to Upload Blogs

### Option 1: Share with Me (Recommended for First Time)

I can help you create the database entries. Share your blogs in one of these ways:

**Method A: Paste in Chat**
- Paste one blog at a time
- Include: title, content, and any other details
- I'll format it and create the SQL/API call

**Method B: Create a File**
- Create a folder: `blogs-to-upload/`
- Save each blog as a separate file (`.md` or `.txt`)
- Include metadata at the top, like:
  ```markdown
  ---
  title: Your Blog Title
  excerpt: Short summary here
  category: industry-insights
  tags: [AMC, field-service, automation]
  cover_image_url: https://example.com/image.jpg
  slug: your-url-friendly-slug
  published: true
  published_at: 2025-01-15T10:00:00Z
  ---
  
  Your blog content here in Markdown format...
  ```

### Option 2: Direct Database Insert

If you have SQL access, you can insert directly:

```sql
INSERT INTO blog_posts (
  slug,
  title,
  excerpt,
  content,
  category,
  tags,
  author_name,
  published,
  published_at,
  meta_title,
  meta_description,
  cover_image_url
) VALUES (
  'your-blog-slug',
  'Your Blog Title',
  'Short excerpt that appears on the listing page...',
  'Your full blog content in Markdown format...',
  'industry-insights', -- or 'product-updates', 'best-practices', 'case-studies'
  ARRAY['tag1', 'tag2', 'tag3'],
  'Automet Team',
  true,
  NOW(),
  'SEO Meta Title',
  'SEO meta description for search engines',
  'https://example.com/cover-image.jpg'
);
```

### Option 3: Create Admin API Script

I can create a script that reads markdown files and uploads them automatically.

## Blog Content Format

Your blog content should be in **Markdown format**. Supported features:

- **Headers**: `# H1`, `## H2`, `### H3`
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Lists**: 
  - Unordered: `- item`
  - Ordered: `1. item`
- **Links**: `[text](https://url.com)`
- **Images**: `![alt](https://image-url.com)`
- **Code**: `` `inline code` ``
- **Code blocks**: 
  ````
  ```
  code block
  ```
  ````

## SEO Best Practices

For better SEO, include:

1. **Meta Title**: 50-60 characters, include main keyword
2. **Meta Description**: 150-160 characters, compelling summary
3. **Slug**: Use keywords (e.g., `amc-field-service-management-tips`)
4. **Tags**: Include relevant keywords
5. **Category**: Choose the most relevant category
6. **Cover Image**: Use high-quality images (1200x630px recommended)

## Example Blog Post

```markdown
---
title: Top 5 Field Service Management Tips for AMC Vendors
excerpt: Learn how to streamline your AMC operations with these proven field service management strategies.
category: best-practices
tags: [AMC, field-service, tips, productivity]
slug: top-5-field-service-management-tips-amc-vendors
published: true
published_at: 2025-01-15T10:00:00Z
meta_title: Top 5 Field Service Management Tips for AMC Vendors | Automet
meta_description: Discover 5 proven strategies to improve your AMC field service operations. Learn from industry experts and boost productivity.
cover_image_url: https://example.com/field-service-tips.jpg
---

# Top 5 Field Service Management Tips for AMC Vendors

Managing field service operations for AMC (Annual Maintenance Contract) vendors can be challenging. Here are 5 proven tips to help you streamline your operations...

## 1. Automate Job Scheduling

Automated scheduling can save you hours each week...

## 2. Use Mobile Apps for Technicians

Mobile apps enable real-time updates...

[Continue with your content...]
```

## Ready to Upload?

Share your blogs with me and I'll:
1. Format them correctly
2. Create the database entries
3. Ensure SEO optimization
4. Set proper categories and tags

Just paste your blog content here or share the files!

