/**
 * Table of Contents Component
 * Auto-generates navigation from article headings
 * Shows for articles > 1500 words
 */

import { useState, useEffect } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  minWords?: number;
  variant?: 'both' | 'mobile' | 'desktop';
}

export default function TableOfContents({
  content,
  minWords = 1500,
  variant = 'both',
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // Extract headings from markdown content
  useEffect(() => {
    const wordCount = content.split(/\s+/).length;
    
    // Only show ToC for long articles
    if (wordCount < minWords) return;

    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    const extractedHeadings: TOCItem[] = matches
      .filter((match) => match[1] && match[2]) // Ensure capture groups exist
      .map((match) => {
        const level = match[1]!.length; // ## = 2, ### = 3
        const text = match[2]!.trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        return { id, text, level };
      });

    setHeadings(extractedHeadings);
  }, [content, minWords]);

  // Track scroll position to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
      setIsOpen(false); // Close mobile menu after click
    }
  };

  const showDesktop = variant === 'both' || variant === 'desktop';
  const showMobile = variant === 'both' || variant === 'mobile';

  return (
    <>
      {showDesktop && (
        <div className="hidden lg:block sticky top-24 w-64 flex-shrink-0">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
              Table of Contents
            </h3>
            <nav>
              <ul className="space-y-2">
                {headings.map(({ id, text, level }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToHeading(id)}
                      className={`text-left w-full text-sm transition-all duration-200 hover:text-primary ${
                        level === 3 ? 'pl-4' : ''
                      } ${
                        activeId === id
                          ? 'text-primary font-semibold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Reading Progress</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((headings.findIndex((h) => h.id === activeId) + 1) /
                        headings.length) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showMobile && (
        <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Table of Contents
            </span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <nav className="px-4 py-3 bg-gray-50 border-t border-gray-200 max-h-[350px] overflow-y-auto">
              <ul className="space-y-2">
                {headings.map(({ id, text, level }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToHeading(id)}
                      className={`text-left w-full text-sm py-1 transition-colors ${
                        level === 3 ? 'pl-4' : ''
                      } ${
                        activeId === id
                          ? 'text-primary font-semibold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

