/**
 * Single Blog Post Page
 * Display full blog post content
 * Redesigned to match landing page consistency
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Scroll progress indicator and scroll-to-top button
  useEffect(() => {
    if (!post) return;

    const updateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const progress = (scrollTop / documentHeight) * 100;
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
      }
      // Show scroll-to-top button after scrolling 300px
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, [post]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  // Share functionality
  const handleShare = async () => {
    if (!post) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred - silently handle
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard');
      }
    }
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
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
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

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Scroll Progress Indicator */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-40">
          <div
            id="scroll-progress"
            className="h-full bg-primary transition-all duration-150"
            style={{ width: '0%' }}
          />
        </div>

        {/* Back Button */}
        <div className="pt-24 pb-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition-colors duration-300 mb-6 group"
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Blog
              </Link>
            </div>
          </div>
        </div>

        {/* Article */}
        <article className="pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="mb-6 text-sm text-gray-600">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link href="/" className="hover:text-primary transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link href="/blog" className="hover:text-primary transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-gray-900 truncate max-w-xs">{post.title}</li>
                </ol>
              </nav>

              {/* Category Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                    post.category
                  )}`}
                >
                  {formatCategory(post.category)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Meta with Reading Time */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                <span className="font-medium">{post.author_name}</span>
                <span>•</span>
                <span>{formatDate(post.published_at)}</span>
                <span>•</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {calculateReadingTime(post.content)} min read
                </span>
              </div>

              {/* Share Button */}
              <div className="mb-8">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors duration-300 text-sm"
                >
                  {shareCopied ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Article
                    </>
                  )}
                </button>
              </div>

              {/* Cover Image */}
              {post.cover_image_url && (
                <div className="mb-8">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* Content - Better Typography */}
              <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-12 p-8 bg-primary/10 rounded-xl border-2 border-primary/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready to transform your AMC business?
                </h3>
                <p className="text-gray-700 mb-6">
                  Join the waitlist and get early access to Automet when we launch.
                </p>
                <button
                  onClick={() => setPreorderModalOpen(true)}
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

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
