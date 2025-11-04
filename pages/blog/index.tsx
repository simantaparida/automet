/**
 * Blog Listing Page
 * Display all published blog posts
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author_name: string;
  published_at: string;
  cover_image_url?: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const url =
          selectedCategory === 'all'
            ? '/api/blog?limit=100'
            : `/api/blog?limit=100&category=${selectedCategory}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          setPosts(data);
          if (!data || data.length === 0) {
            setError('No blog posts found. Check back later!');
          }
        } else {
          setError(data.error || 'Failed to load blog posts');
          console.error('Blog API error:', data);
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [selectedCategory]);

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

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'product-updates', label: 'Product Updates' },
    { value: 'industry-insights', label: 'Industry Insights' },
    { value: 'best-practices', label: 'Best Practices' },
    { value: 'case-studies', label: 'Case Studies' },
  ];

  return (
    <>
      <Head>
        <title>Blog - Automet | Industry Insights & Best Practices</title>
        <meta
          name="description"
          content="Explore industry insights, best practices, and product updates for field service management and AMC operations."
        />
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
                href="/"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Automet Blog</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Industry insights, best practices, and product updates to help you grow your AMC
              business.
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-600 font-semibold mb-2">Error loading posts</p>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No posts found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-blue-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {formatCategory(post.category)}
                    </span>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.author_name}</span>
                      <span>{formatDate(post.published_at)}</span>
                    </div>

                    {/* Read More Link */}
                    <div className="mt-4 flex items-center text-primary font-semibold text-sm group-hover:text-secondary transition-colors duration-300">
                      Read Article
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
