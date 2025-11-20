/**
 * Landing Page Navigation
 * Sticky header with logo and navigation links
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add/remove overlay when mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      // Create overlay element
      const overlay = document.createElement('div');
      overlay.id = 'mobile-menu-overlay';
      overlay.className =
        'fixed left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-40';
      overlay.style.top = '80px';
      overlay.onclick = () => setMobileMenuOpen(false);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
    } else {
      // Remove overlay
      const overlay = document.getElementById('mobile-menu-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
      document.body.style.overflow = '';
    }

    return () => {
      const overlay = document.getElementById('mobile-menu-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/roi-calculator', label: 'ROI Calculator' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm ${
        scrolled
          ? 'bg-white/95 shadow-lg py-3 border-b border-primary/10'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-2xl font-bold group transition-all duration-300"
          >
            <svg
              className="w-8 h-8 text-primary group-hover:text-secondary transition-colors duration-300"
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
            <span className="text-primary group-hover:text-primary/80 transition-all duration-300">
              Automet
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith('/');
              const Component = isExternal ? Link : 'a';
              const props = isExternal
                ? { href: link.href }
                : { href: link.href };

              return (
                <Component
                  key={link.href}
                  {...props}
                  className={`text-sm font-medium transition-all duration-300 hover:text-primary relative group ${
                    scrolled ? 'text-gray-700' : 'text-gray-900'
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </Component>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/onboarding/welcome"
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 inline-block"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute left-0 right-0 top-full border-t border-primary/20 bg-white shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen
              ? 'max-h-[500px] opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex flex-col space-y-4 px-4 py-4">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith('/');
              const Component = isExternal ? Link : 'a';
              const props = isExternal
                ? { href: link.href, onClick: () => setMobileMenuOpen(false) }
                : {
                    href: link.href,
                    onClick: () => setMobileMenuOpen(false),
                  };

              return (
                <Component
                  key={link.href}
                  {...props}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-300"
                >
                  {link.label}
                </Component>
              );
            })}
            <Link
              href="/onboarding/welcome"
              onClick={() => setMobileMenuOpen(false)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 text-center shadow-md block"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
