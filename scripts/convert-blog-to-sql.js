#!/usr/bin/env node
/**
 * Convert Markdown blog with frontmatter to SQL seed file
 * Usage: node scripts/convert-blog-to-sql.js blogs/drafts/your-blog.md
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: No input file specified');
  console.log('\nUsage:');
  console.log('  node scripts/convert-blog-to-sql.js blogs/drafts/your-blog.md');
  console.log('\nExample:');
  console.log('  node scripts/convert-blog-to-sql.js blogs/drafts/2025-01-15-field-service-guide.md');
  process.exit(1);
}

const inputFile = args[0];

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: File not found: ${inputFile}`);
  process.exit(1);
}

// Read the markdown file
const content = fs.readFileSync(inputFile, 'utf-8');

// Parse frontmatter (YAML between ---)
const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
const match = content.match(frontmatterRegex);

if (!match) {
  console.error('❌ Error: No frontmatter found in file');
  console.log('\nYour markdown file should start with:');
  console.log('---');
  console.log('slug: your-slug');
  console.log('title: Your Title');
  console.log('...');
  console.log('---');
  process.exit(1);
}

// Parse YAML frontmatter (simple parser)
const yamlContent = match[1];
const markdownContent = match[2].trim();

const frontmatter = {};
yamlContent.split('\n').forEach(line => {
  const colonIndex = line.indexOf(':');
  if (colonIndex > 0) {
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Handle arrays [tag1, tag2, tag3]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/['"]/g, ''));
    }

    // Handle booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;

    frontmatter[key] = value;
  }
});

// Validate required fields
const required = ['slug', 'title', 'category'];
const missing = required.filter(field => !frontmatter[field]);

if (missing.length > 0) {
  console.error(`❌ Error: Missing required fields: ${missing.join(', ')}`);
  console.log('\nRequired frontmatter fields:');
  console.log('  - slug: URL-friendly identifier');
  console.log('  - title: Blog post title');
  console.log('  - category: industry-insights, product-updates, best-practices, or case-studies');
  process.exit(1);
}

// Default values
const blogPost = {
  slug: frontmatter.slug,
  title: frontmatter.title,
  excerpt: frontmatter.excerpt || null,
  content: markdownContent,
  category: frontmatter.category,
  tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
  author_name: frontmatter.author_name || 'Automet Team',
  published: frontmatter.published !== false, // default true
  meta_title: frontmatter.meta_title || null,
  meta_description: frontmatter.meta_description || null,
  cover_image_url: frontmatter.cover_image_url || null,
};

// Generate SQL with dollar-quoting (handles all special characters)
const tagsArray = blogPost.tags.length > 0
  ? `ARRAY['${blogPost.tags.join("', '")}']`
  : 'ARRAY[]::text[]';

const sql = `-- Blog Post: ${blogPost.title}
-- Generated: ${new Date().toISOString().split('T')[0]}
-- Source: ${path.basename(inputFile)}

INSERT INTO blog_posts (
  slug,
  title,
  excerpt,
  content,
  author_name,
  category,
  tags,
  published,
  published_at,
  meta_title,
  meta_description,
  cover_image_url
) VALUES (
  '${blogPost.slug}',
  '${blogPost.title.replace(/'/g, "''")}',
  ${blogPost.excerpt ? `'${blogPost.excerpt.replace(/'/g, "''")}'` : 'NULL'},
  $$${blogPost.content}$$,
  '${blogPost.author_name}',
  '${blogPost.category}',
  ${tagsArray},
  ${blogPost.published},
  NOW(),
  ${blogPost.meta_title ? `'${blogPost.meta_title.replace(/'/g, "''")}'` : 'NULL'},
  ${blogPost.meta_description ? `'${blogPost.meta_description.replace(/'/g, "''")}'` : 'NULL'},
  ${blogPost.cover_image_url ? `'${blogPost.cover_image_url}'` : 'NULL'}
);

-- Verification query
SELECT
  slug,
  title,
  category,
  array_length(tags, 1) as tag_count,
  length(content) as content_length,
  published
FROM blog_posts
WHERE slug = '${blogPost.slug}';
`;

// Determine output filename
const outputDir = path.join(process.cwd(), 'blogs', 'ready-to-upload');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `${blogPost.slug}.sql`);

// Write SQL file
fs.writeFileSync(outputFile, sql);

console.log('\n✅ Blog post converted successfully!\n');
console.log('📄 Input:  ', inputFile);
console.log('📄 Output: ', outputFile);
console.log('\n📊 Blog Details:');
console.log('   Slug:     ', blogPost.slug);
console.log('   Title:    ', blogPost.title);
console.log('   Category: ', blogPost.category);
console.log('   Tags:     ', blogPost.tags.join(', '));
console.log('   Words:    ', markdownContent.split(/\s+/).length);
console.log('   Published:', blogPost.published);
console.log('\n📋 Next Steps:');
console.log('   1. Review the generated SQL file');
console.log('   2. Move to seeds/ folder if ready');
console.log('   3. Upload via: ./load-blog-posts.sh');
console.log('   4. Or paste in Supabase SQL Editor\n');
