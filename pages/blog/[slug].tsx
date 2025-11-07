/**
 * Single Blog Post Page
 * Display full blog post content
 * Redesigned to match landing page consistency
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';
import NewsletterSignup from '@/components/blog/NewsletterSignup';
import AuthorBio from '@/components/blog/AuthorBio';

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
  updated_at?: string;
  cover_image_url?: string;
  meta_title?: string;
  meta_description?: string;
}

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Scroll progress indicator and scroll-to-top button
  useEffect(() => {
    if (!post) return;

    const updateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
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
          
          // Fetch related articles
          fetchRelatedPosts(data);
        } else {
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
      }
    }

    fetchPost();
  }, [slug]);

  // Fetch related articles based on category and tags
  const fetchRelatedPosts = async (currentPost: BlogPost) => {
    try {
      // Fetch posts from the same category
      const response = await fetch(`/api/blog?limit=10&category=${currentPost.category}`);
      if (response.ok) {
        const data = await response.json();
        
        // Filter out current post and calculate relevance scores
        const scoredPosts = data
          .filter((p: BlogPost) => p.slug !== currentPost.slug)
          .map((p: BlogPost) => {
            let score = 0;
            
            // Same category: +2 points
            if (p.category === currentPost.category) score += 2;
            
            // Matching tags: +3 points per tag
            const matchingTags = p.tags.filter((tag: string) => 
              currentPost.tags.includes(tag)
            );
            score += matchingTags.length * 3;
            
            // Recent posts: +1 point if published within 90 days
            const daysSincePublished = Math.floor(
              (new Date().getTime() - new Date(p.published_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSincePublished <= 90) score += 1;
            
            return { ...p, score };
          })
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 3); // Top 3 related posts
        
        setRelatedPosts(scoredPosts);
      }
    } catch (err) {
      console.error('Failed to fetch related posts:', err);
    }
  };

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

  // Custom renderers for better styling
  // Create a function that returns components with access to post
  const getMarkdownComponents = (): Partial<Components> => ({
    // Headers - Professional spacing and typography
    // Skip first H1 if it matches the post title (already shown in header)
    h1: ({ children, ...props }: any) => {
      const headingText =
        typeof children === 'string'
          ? children
          : Array.isArray(children)
            ? children.map((c) => (typeof c === 'string' ? c : '')).join('')
            : String(children);

      // If this H1 matches the post title, don't render it
      if (
        post &&
        headingText.toLowerCase().trim() === post.title.toLowerCase().trim()
      ) {
        return null;
      }

      return (
        <h1
          className="text-3xl md:text-4xl font-bold text-gray-900 mt-10 mb-4 leading-tight tracking-tight"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: any) => (
      <h2
        className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-3 leading-tight tracking-tight"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3
        className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-2.5 leading-snug tracking-tight"
        {...props}
      >
        {children}
      </h3>
    ),
    // Paragraphs - Professional spacing and readability
    p: ({ children, ...props }: any) => (
      <p
        className="text-base md:text-lg text-gray-700 leading-7 mb-5 font-normal"
        {...props}
      >
        {children}
      </p>
    ),
    // Lists - Better spacing and alignment
    ul: ({ children, ...props }: any) => (
      <ul
        className="list-disc list-outside ml-5 mb-5 space-y-1.5 text-gray-700 pl-1"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol
        className="list-decimal list-outside ml-5 mb-5 space-y-1.5 text-gray-700 pl-1"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="pl-2 leading-7 text-base md:text-lg" {...props}>
        {children}
      </li>
    ),
    // Blockquotes - Refined styling
    blockquote: ({ children, ...props }: any) => (
      <blockquote
        className="border-l-4 border-primary/60 pl-5 py-3 my-6 bg-primary/5 rounded-r-lg italic text-gray-700 text-base md:text-lg leading-7"
        {...props}
      >
        {children}
      </blockquote>
    ),
    // Tables - Professional styling with better visual hierarchy
    table: ({ children, ...props }: any) => (
      <div className="my-8 overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-xl rounded-lg border-2 border-gray-300 bg-white">
            <table
              className="min-w-full divide-y divide-gray-200 bg-white m-0"
              {...props}
            >
              {children}
            </table>
          </div>
        </div>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-50" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="divide-y divide-gray-200 bg-white" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr
        className="hover:bg-gray-50 transition-colors duration-150"
        {...props}
      >
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th
        className="px-4 py-2.5 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-50 whitespace-nowrap align-middle"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => {
      // Convert children to string for checking
      const content =
        typeof children === 'string'
          ? children
          : Array.isArray(children)
            ? children.map((c) => (typeof c === 'string' ? c : '')).join('')
            : String(children);

      const hasCheckmark = content.includes('✅') || content.includes('✓');
      const hasX =
        content.includes('❌') ||
        content.includes('✗') ||
        content.includes('×');

      // Determine alignment - center for icons, left for text
      const isIconOnly =
        hasCheckmark || hasX || content.trim().match(/^[❌✅✗×]$/);
      const alignClass = isIconOnly ? 'text-center' : 'text-left';

      return (
        <td
          className={`px-4 py-2.5 text-sm ${alignClass} border-b border-gray-200 align-middle ${
            hasCheckmark
              ? 'text-green-600 font-semibold'
              : hasX
                ? 'text-red-600 font-semibold'
                : 'text-gray-700'
          }`}
          {...props}
        >
          <span className="inline-block leading-tight">{children}</span>
        </td>
      );
    },
    // Links
    a: ({ href, children, ...props }: any) => (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline font-medium transition-colors"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    ),
    // Strong
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-gray-900" {...props}>
        {children}
      </strong>
    ),
    // Code
    code: ({
      className,
      children,
      ...props
    }: {
      className?: string;
      children: React.ReactNode;
    } & any) => {
      const isInline = !className;
      return isInline ? (
        <code
          className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Pre for code blocks
    pre: ({ children, ...props }: any) => (
      <pre
        className="bg-gray-900 text-gray-100 p-5 rounded-lg overflow-x-auto mb-5 shadow-lg text-sm leading-6"
        {...props}
      >
        {children}
      </pre>
    ),
    // Horizontal rule
    hr: () => <hr className="my-8 border-t border-gray-200" />,
  });

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
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
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://automet.in/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://automet.in/blog/${post.slug}`} />
        <meta property="og:site_name" content="Automet" />
        <meta property="og:locale" content="en_IN" />
        {post.cover_image_url && (
          <meta property="og:image" content={post.cover_image_url} />
        )}
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.author_name} />
        <meta property="article:section" content={formatCategory(post.category)} />
        {post.tags && post.tags.map((tag) => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@automet" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.cover_image_url && (
          <meta name="twitter:image" content={post.cover_image_url} />
        )}
        
        <link rel="icon" href="/favicon.ico" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              image: post.cover_image_url || 'https://automet.in/og-image.png',
              datePublished: post.published_at,
              dateModified: post.updated_at || post.published_at,
              author: {
                '@type': 'Person',
                name: post.author_name,
                url: 'https://automet.in/about',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Automet',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://automet.in/logo.png',
                },
              },
              description: post.excerpt,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://automet.in/blog/${post.slug}`,
              },
              articleSection: formatCategory(post.category),
              keywords: post.tags ? post.tags.join(', ') : '',
              wordCount: post.content.split(/\s+/).length,
            }),
          }}
        />
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
                    <Link
                      href="/"
                      className="hover:text-primary transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link
                      href="/blog"
                      className="hover:text-primary transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-gray-900 truncate max-w-xs">
                    {post.title}
                  </li>
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
                <span>
                  {formatDate(post.published_at)}
                  {post.updated_at && post.updated_at !== post.published_at && (
                    <span className="text-gray-500 ml-2">
                      (Updated: {formatDate(post.updated_at)})
                    </span>
                  )}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
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
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share Article
                    </>
                  )}
                </button>
              </div>

              {/* Cover Image */}
              {post.cover_image_url && (
                <div className="mb-10 -mx-4 sm:mx-0">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full rounded-xl shadow-xl object-cover"
                    style={{ maxHeight: '500px' }}
                    onError={(e) => {
                      // Hide broken images
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Content - Professional Markdown Rendering */}
              <div className="blog-content max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={getMarkdownComponents()}
                  skipHtml={false}
                  rehypePlugins={[]}
                >
                  {(() => {
                    const processedContent = post.content
                      // Fix table spacing
                      .replace(/\n\n\|/g, '\n|')
                      .replace(/\|\n\n\|/g, '|\n|')
                      // Remove meta description from visible content (more comprehensive pattern)
                      .replace(/\*\*Meta Description:\*\*\s*\n\n[^\n]+/gi, '')
                      .replace(/\*\*Meta Description:\*\*\s*[^\n]+/gi, '')
                      .replace(/Meta Description:\s*[^\n]+/gi, '')
                      // Remove the first H1 if it matches the post title (to avoid duplicate title)
                      .replace(/^#\s+([^\n]+)\n\n/, (match, title) => {
                        // Check if this H1 matches the post title (case-insensitive)
                        const normalizedTitle = title.toLowerCase().trim();
                        const normalizedPostTitle = post.title
                          .toLowerCase()
                          .trim();
                        if (normalizedTitle === normalizedPostTitle) {
                          return ''; // Remove the H1
                        }
                        return match; // Keep it if it's different
                      });
                    return processedContent;
                  })()}
                </ReactMarkdown>
              </div>

              {/* Custom Styles for Markdown Elements */}
              <style jsx global>{`
                .blog-content {
                  max-width: 100%;
                  font-family:
                    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
                    'Helvetica Neue', sans-serif;
                  color: #374151;
                }

                /* Typography improvements */
                .blog-content p {
                  margin-bottom: 1.25rem;
                  line-height: 1.75;
                  font-size: 1.0625rem;
                }

                .blog-content h1,
                .blog-content h2,
                .blog-content h3,
                .blog-content h4,
                .blog-content h5,
                .blog-content h6 {
                  font-weight: 700;
                  line-height: 1.25;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  color: #111827;
                }

                .blog-content h1:first-child,
                .blog-content h2:first-child,
                .blog-content h3:first-child {
                  margin-top: 0;
                }

                .blog-content h1 {
                  font-size: 2.25rem;
                  margin-top: 2.5rem;
                }

                .blog-content h2 {
                  font-size: 1.875rem;
                  margin-top: 2rem;
                }

                .blog-content h3 {
                  font-size: 1.5rem;
                  margin-top: 1.75rem;
                }

                /* Lists - Professional spacing */
                .blog-content ul,
                .blog-content ol {
                  margin-bottom: 1.25rem;
                  padding-left: 1.5rem;
                }

                .blog-content li {
                  margin-bottom: 0.5rem;
                  line-height: 1.75;
                  font-size: 1.0625rem;
                }

                .blog-content ul li::marker {
                  color: #f97316;
                }

                .blog-content ol li::marker {
                  color: #f97316;
                  font-weight: 600;
                }

                /* Blockquotes */
                .blog-content blockquote {
                  margin: 1.5rem 0;
                  padding: 1rem 1.25rem;
                  border-left: 4px solid #f97316;
                  background-color: #fff7ed;
                  border-radius: 0 0.5rem 0.5rem 0;
                  font-style: italic;
                  color: #4b5563;
                }

                /* Code blocks */
                .blog-content pre {
                  margin: 1.5rem 0;
                  padding: 1.25rem;
                  background-color: #1f2937;
                  color: #f9fafb;
                  border-radius: 0.5rem;
                  overflow-x: auto;
                  font-size: 0.875rem;
                  line-height: 1.6;
                }

                .blog-content code {
                  font-family:
                    'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono',
                    'Source Code Pro', monospace;
                  font-size: 0.875em;
                }

                .blog-content pre code {
                  background: transparent;
                  padding: 0;
                  color: inherit;
                  font-size: inherit;
                }

                /* Links */
                .blog-content a {
                  color: #ea580c;
                  text-decoration: underline;
                  text-underline-offset: 2px;
                  transition: color 0.2s ease;
                }

                .blog-content a:hover {
                  color: #c2410c;
                }

                /* Images */
                .blog-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  box-shadow:
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06);
                  margin: 2rem 0;
                  display: block;
                }

                /* Horizontal rules */
                .blog-content hr {
                  margin: 2.5rem 0;
                  border: none;
                  border-top: 1px solid #e5e7eb;
                }

                /* Professional table styling */
                .blog-content table {
                  display: table !important;
                  width: 100% !important;
                  font-size: 0.9375rem;
                  border-collapse: collapse !important;
                  border-spacing: 0;
                  margin: 2rem 0 !important;
                  background: white;
                }

                .blog-content thead {
                  display: table-header-group !important;
                  background: #f9fafb !important;
                }

                .blog-content tbody {
                  display: table-row-group !important;
                }

                .blog-content tr {
                  display: table-row !important;
                }

                .blog-content th,
                .blog-content td {
                  display: table-cell !important;
                  border: 1px solid #e5e7eb !important;
                  padding: 0.75rem 1rem !important;
                  vertical-align: middle !important;
                }

                .blog-content th {
                  font-weight: 700;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                  letter-spacing: 0.05em;
                  color: #111827;
                  background-color: #f9fafb;
                  border-bottom: 2px solid #d1d5db;
                }

                .blog-content td {
                  color: #374151;
                  line-height: 1.6;
                }

                .blog-content table td:first-child,
                .blog-content table th:first-child {
                  font-weight: 600;
                  color: #1f2937;
                }

                .blog-content table tbody tr:nth-child(even) {
                  background-color: #f9fafb;
                }

                .blog-content table tbody tr:hover {
                  background-color: #f3f4f6;
                }

                /* Remove extra spacing from cell content */
                .blog-content table td span,
                .blog-content table th span {
                  display: inline-block;
                  vertical-align: middle;
                  line-height: 1.5;
                }

                /* Nested lists */
                .blog-content ul ul,
                .blog-content ol ol,
                .blog-content ul ol,
                .blog-content ol ul {
                  margin-top: 0.5rem;
                  margin-bottom: 0.5rem;
                  margin-left: 1.5rem;
                }

                /* Mobile responsive */
                @media (max-width: 640px) {
                  .blog-content {
                    font-size: 1rem;
                  }

                  .blog-content h1 {
                    font-size: 1.875rem;
                  }

                  .blog-content h2 {
                    font-size: 1.5rem;
                  }

                  .blog-content h3 {
                    font-size: 1.25rem;
                  }

                  .blog-content table td,
                  .blog-content table th {
                    padding: 0.5rem 0.75rem !important;
                    font-size: 0.875rem;
                  }
                }
              `}</style>

              {/* Newsletter Signup - End of Article */}
              <NewsletterSignup variant="endOfArticle" context={`blog-${post.category}`} />

              {/* Author Bio */}
              <AuthorBio authorName={post.author_name} />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Tags
                  </h3>
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

              {/* Related Articles */}
              {relatedPosts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Related Articles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="group bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300"
                      >
                        {/* Cover Image */}
                        <div className="aspect-[16/9] bg-primary/10 relative overflow-hidden">
                          {relatedPost.cover_image_url ? (
                            <img
                              src={relatedPost.cover_image_url}
                              alt={relatedPost.title}
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

                        {/* Content */}
                        <div className="p-4">
                          {/* Category Badge */}
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${getCategoryColor(
                              relatedPost.category
                            )}`}
                          >
                            {formatCategory(relatedPost.category)}
                          </span>

                          {/* Title */}
                          <h4 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
                            {relatedPost.title}
                          </h4>

                          {/* Excerpt */}
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                            {relatedPost.excerpt}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center text-[10px] text-gray-500">
                            <span className="flex items-center">
                              <svg
                                className="w-3 h-3 mr-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {calculateReadingTime(relatedPost.content)} min read
                            </span>
                            <span className="mx-1">•</span>
                            <span>{formatDate(relatedPost.published_at)}</span>
                          </div>
                        </div>
                      </Link>
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
                  Join the waitlist and get early access to Automet when we
                  launch.
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
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
