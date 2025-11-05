/**
 * Blog Listing Page
 * Display all published blog posts
 * Redesigned to match landing page consistency
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';

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

// Calculate reading time from excerpt (estimate)
const calculateReadingTime = (excerpt: string) => {
  const words = excerpt.split(/\s+/).length;
  // Estimate: excerpt is typically 20-30% of full content
  // So multiply by 3-4 to get approximate full reading time
  const estimatedFullWords = words * 3.5;
  const minutes = Math.ceil(estimatedFullWords / 200);
  return Math.max(minutes, 1); // Minimum 1 minute
};

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Show relative date for recent posts
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    // For older posts, show full date but compact
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'product-updates': 'bg-primary/10 text-primary border-primary/20',
      'industry-insights': 'bg-primary/10 text-primary border-primary/20',
      'best-practices': 'bg-secondary/10 text-secondary border-secondary/20',
      'case-studies': 'bg-secondary/10 text-secondary border-secondary/20',
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

  // Filter and sort posts
  const filteredAndSortedPosts = posts
    .filter((post) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      }
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: cat.value === 'all' ? posts.length : posts.filter((p) => p.category === cat.value).length,
  }));

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

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              {/* Badge */}
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                BLOG
              </span>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Automet Blog
              </h1>

              {/* Sub-heading */}
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
                Industry insights, best practices, and product updates to help you grow your{' '}
                <span className="text-primary font-semibold">AMC business</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="bg-gray-50 border-b border-gray-200 py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-2xl mx-auto">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search articles by title, content, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter and Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {categoryCounts.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        // Clear search when changing category
                        if (searchQuery) setSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
                        selectedCategory === cat.value
                          ? 'bg-primary text-white shadow-md hover:bg-primary/90'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline">{cat.label}</span>
                      <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                      {cat.count > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${
                          selectedCategory === cat.value ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          {cat.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              {!loading && (
                <div className="mt-4 text-center sm:text-left">
                  <p className="text-sm text-gray-600">
                    {searchQuery ? (
                      <>
                        Found <span className="font-semibold text-gray-900">{filteredAndSortedPosts.length}</span> article{filteredAndSortedPosts.length !== 1 ? 's' : ''} matching "{searchQuery}"
                      </>
                    ) : (
                      <>
                        Showing <span className="font-semibold text-gray-900">{filteredAndSortedPosts.length}</span> article{filteredAndSortedPosts.length !== 1 ? 's' : ''}
                        {selectedCategory !== 'all' && ` in ${categories.find((c) => c.value === selectedCategory)?.label}`}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[16/9] bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="inline-block p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-600 font-semibold mb-2">Error loading posts</p>
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              </div>
            ) : filteredAndSortedPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No articles found' : 'No posts in this category'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery
                      ? `Try adjusting your search terms or browse all categories.`
                      : `Check back later for new articles or browse other categories.`}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                {filteredAndSortedPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Cover Image - Smaller aspect ratio */}
                    <div className="aspect-[16/9] bg-primary/10 relative overflow-hidden">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-primary/30"
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

                    {/* Content - More compact */}
                    <div className="p-4">
                      {/* Category Badge - Smaller */}
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${getCategoryColor(
                          post.category
                        )}`}
                      >
                        {formatCategory(post.category)}
                      </span>

                      {/* Title - Smaller */}
                      <h2 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
                        {post.title}
                      </h2>

                      {/* Excerpt - Compact */}
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Tags - Show first 2 tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="px-2 py-0.5 text-gray-500 text-[10px]">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta - Compact with Reading Time */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2 flex-wrap gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="truncate max-w-[80px]">{post.author_name}</span>
                          <span>•</span>
                          <span className="flex items-center whitespace-nowrap">
                            <svg className="w-3 h-3 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {calculateReadingTime(post.excerpt)} min read
                          </span>
                        </div>
                        <span className="whitespace-nowrap">{formatDate(post.published_at)}</span>
                      </div>

                      {/* Read More Link - Smaller */}
                      <div className="flex items-center text-primary font-semibold text-xs group-hover:text-primary/80 transition-colors duration-300">
                        Read Article
                        <svg
                          className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300"
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
        </section>

        {/* Footer */}
        <Footer />

        {/* Pre-order Modal */}
        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
        />
      </div>
    </>
  );
}
