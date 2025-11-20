/**
 * Landing Page Footer
 * Footer with links and copyright
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleEmailClick = async () => {
    const email = 'info@automet.app';

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(email);
        setToastVisible(true);
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(
          () => setToastVisible(false),
          2000
        );
        return;
      } catch (error) {
        // Fallback to mailto below
      }
    }

    window.location.href = `mailto:${email}`;
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-primary/20">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 animate-fade-in">
            <div className="flex items-center space-x-2 text-white mb-4">
              <svg
                className="w-8 h-8 text-primary animate-bounce-subtle"
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
              <span className="text-xl font-bold text-primary">Automet</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Field job management made simple for Indian AMC vendors.
            </p>
          </div>

          {/* Product */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/features"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/roi-calculator"
                  className="hover:text-primary transition-colors duration-300"
                >
                  ROI Calculator
                </Link>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-primary transition-colors duration-300"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Blog
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleEmailClick}
                  className="hover:text-primary transition-colors duration-300"
                >
                  Support
                </button>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {currentYear} Automet. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex space-x-6">
              <button
                type="button"
                onClick={handleEmailClick}
                className="text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"
                aria-label="Copy email address"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <a
                href="https://www.linkedin.com/company/automethq/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://x.com/Automet359944"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"
                aria-label="X (Twitter)"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 3.5h2.695l-5.9 6.747 6.955 10.253h-5.445l-3.808-5.575-4.357 5.575H5.688l6.308-7.189L5.34 3.5h5.58l3.454 4.983L18.244 3.5Zm-.945 14.994h1.495L7.14 5.678H5.53l11.769 12.816Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/automet.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 3C4.239 3 2 5.239 2 8v8c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V8c0-2.761-2.239-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v8c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V8c0-1.654 1.346-3 3-3zm5 2.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm6.25-2.75a1 1 0 110 2 1 1 0 010-2z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/people/Automet/61583698070965/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12.073C22 6.49 17.523 2 12 2S2 6.49 2 12.073C2 17.096 5.657 21.245 10.438 22v-6.999H7.898v-2.928h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.776-1.63 1.571v1.888h2.773l-.443 2.928h-2.33V22C18.343 21.245 22 17.096 22 12.073" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`pointer-events-none fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 rounded-xl bg-gray-900/95 px-4 py-3 text-sm text-white shadow-xl border border-primary/40">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Email copied to clipboard</span>
        </div>
      </div>
    </footer>
  );
}
