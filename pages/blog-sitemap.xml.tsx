/**
 * Blog XML Sitemap
 * Route: /blog-sitemap.xml
 * 
 * This page generates an XML sitemap for all published blog posts.
 * It runs on the server side (getServerSideProps) to generate dynamic content.
 */

import { GetServerSideProps } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

interface BlogPost {
  slug: string;
  published_at: string;
}

// This component never renders - sitemap is returned directly
export default function BlogSitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    // Fetch all published blog posts
    const { data: posts, error } = await supabaseServer
      .from('blog_posts')
      .select('slug, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts for sitemap:', error);
      // Return empty sitemap on error
      res.setHeader('Content-Type', 'application/xml');
      res.write(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://automet.in/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`);
      res.end();
      return { props: {} };
    }

    const baseUrl = 'https://automet.in';
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Blog Home Page -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Blog Posts -->
${(posts as BlogPost[] || [])
  .map((post) => {
    const lastmod = new Date(post.published_at).toISOString();
    return `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    // Set headers and send XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Return minimal sitemap on error
    res.setHeader('Content-Type', 'application/xml');
    res.write(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://automet.in/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`);
    res.end();
    
    return { props: {} };
  }
};

