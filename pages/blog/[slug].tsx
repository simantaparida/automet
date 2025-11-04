/**
 * Single Blog Post Page
 * Display full blog post content
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author_name: string;
  published_at: string;
  cover_image_url?: string;
  meta_title?: string;
  meta_description?: string;
}

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'product-updates': 'bg-primary/10 text-primary border-primary/20',
      'industry-insights': 'bg-secondary/10 text-secondary border-secondary/20',
      'best-practices': 'bg-accent-pink/10 text-accent-pink border-accent-pink/20',
      'case-studies': 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Simple markdown-to-HTML converter (basic support)
  const renderMarkdown = (markdown: string) => {
    // This is a simple implementation - in production, use a library like 'marked' or 'react-markdown'
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-gray-900 mb-4 mt-8">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-gray-900 mb-4 mt-8">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-gray-900 mb-4 mt-8">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-6 mb-2">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-6 mb-2">$1</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li.*<\/li>)/gim, '<ul class="list-disc space-y-2 mb-4">$1</ul>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">');
    html = `<p class="text-gray-700 leading-relaxed mb-4">${html}</p>`;

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">$1</blockquote>');

    return html;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <>
        <Head>
          <title>Post Not Found - Automet Blog</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-lg text-gray-600 mb-6">Blog post not found</p>
            <Link
              href="/blog"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{post.meta_title || post.title} - Automet Blog</title>
        <meta
          name="description"
          content={post.meta_description || post.excerpt}
        />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-6">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
                <svg
                  className="w-8 h-8 text-primary"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="32" height="32" rx="6" fill="currentColor" />
                  <path
                    d="M9 12L16 8L23 12V20L16 24L9 20V12Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 8V16M9 12L16 16L23 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Automet</span>
              </Link>
              <Link
                href="/blog"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                ← All Posts
              </Link>
            </div>
          </div>
        </header>

        {/* Article */}
        <article className="py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Category Badge */}
              <div className="mb-6">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getCategoryColor(
                    post.category
                  )}`}
                >
                  {formatCategory(post.category)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center text-gray-600 mb-8 pb-8 border-b border-gray-200">
                <span className="font-medium">{post.author_name}</span>
                <span className="mx-3">•</span>
                <span>{formatDate(post.published_at)}</span>
              </div>

              {/* Cover Image */}
              {post.cover_image_url && (
                <div className="mb-10">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent-pink/10 rounded-2xl border-2 border-primary/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready to transform your AMC business?
                </h3>
                <p className="text-gray-700 mb-6">
                  Join the waitlist and get early access to Automet when we launch.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Join Waitlist - Get Early Access
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
