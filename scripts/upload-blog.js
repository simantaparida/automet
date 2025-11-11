/**
 * Blog Upload Script
 * 
 * This script helps you upload blog posts to the database.
 * 
 * Usage:
 *   1. Create blog files in blogs-to-upload/ folder
 *   2. Use the format shown in BLOG_UPLOAD_GUIDE.md
 *   3. Run: node scripts/upload-blog.js <blog-file.md>
 * 
 * Or use the interactive mode:
 *   node scripts/upload-blog.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Blog post template
const blogTemplate = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'industry-insights', // Default category
  tags: [],
  author_name: 'Automet Team',
  published: true,
  published_at: new Date().toISOString(),
  meta_title: '',
  meta_description: '',
  cover_image_url: null,
};

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Parse markdown file with frontmatter
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for frontmatter (YAML between ---)
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  let frontmatter = {};
  let markdownContent = content;
  
  if (match) {
    // Parse YAML frontmatter (simple parser)
    const yamlContent = match[1];
    yamlContent.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        }
        
        // Handle booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        frontmatter[key] = value;
      }
    });
    
    markdownContent = match[2];
  } else {
    // No frontmatter, use filename as title
    const filename = path.basename(filePath, '.md');
    frontmatter.title = filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return {
    ...blogTemplate,
    ...frontmatter,
    content: markdownContent.trim(),
    slug: frontmatter.slug || generateSlug(frontmatter.title || 'untitled'),
  };
}

// Generate SQL INSERT statement
function generateSQL(blog) {
  const sql = `
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
  '${blog.slug.replace(/'/g, "''")}',
  '${blog.title.replace(/'/g, "''")}',
  ${blog.excerpt ? `'${blog.excerpt.replace(/'/g, "''")}'` : 'NULL'},
  '${blog.content.replace(/'/g, "''")}',
  '${blog.category}',
  ARRAY[${blog.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}],
  '${blog.author_name}',
  ${blog.published},
  '${blog.published_at}',
  ${blog.meta_title ? `'${blog.meta_title.replace(/'/g, "''")}'` : 'NULL'},
  ${blog.meta_description ? `'${blog.meta_description.replace(/'/g, "''")}'` : 'NULL'},
  ${blog.cover_image_url ? `'${blog.cover_image_url}'` : 'NULL'}
);
  `.trim();
  
  return sql;
}

// Interactive mode
async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  console.log('\n📝 Blog Post Upload Helper\n');
  console.log('Enter your blog post details:\n');

  const blog = { ...blogTemplate };

  blog.title = await question('Title: ');
  blog.slug = await question(`Slug [${generateSlug(blog.title)}]: `) || generateSlug(blog.title);
  blog.excerpt = await question('Excerpt (optional): ') || null;
  blog.category = await question('Category [industry-insights]: ') || 'industry-insights';
  blog.tags = (await question('Tags (comma-separated): ') || '').split(',').map(t => t.trim()).filter(t => t);
  blog.author_name = await question('Author [Automet Team]: ') || 'Automet Team';
  blog.meta_title = await question('Meta Title (optional): ') || null;
  blog.meta_description = await question('Meta Description (optional): ') || null;
  blog.cover_image_url = await question('Cover Image URL (optional): ') || null;

  console.log('\n---\n');
  console.log('Paste your blog content (Markdown format).');
  console.log('Type "END" on a new line when done:\n');

  let contentLines = [];
  let line;
  while ((line = await question('')) !== 'END') {
    contentLines.push(line);
  }

  blog.content = contentLines.join('\n');
  blog.published_at = new Date().toISOString();

  rl.close();

  console.log('\n\n📄 Generated SQL:\n');
  console.log(generateSQL(blog));
  console.log('\n\n✅ Copy this SQL and run it in your Supabase SQL editor!\n');
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Interactive mode
    await interactiveMode();
  } else {
    // File mode
    const filePath = args[0];
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const blog = parseMarkdownFile(filePath);
    console.log('\n📄 Generated SQL:\n');
    console.log(generateSQL(blog));
    console.log('\n✅ Copy this SQL and run it in your Supabase SQL editor!\n');
  }
}

main().catch(console.error);

