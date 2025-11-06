/**
 * Landing Page Footer
 * Footer with links and copyright
 */

import Link from 'next/link';

export default function Footer() {
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
                  href="#how-it-works"
                  className="hover:text-primary transition-colors duration-300"
                >
                  How It Works
                </a>
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
                <a
                  href="mailto:support@automet.in"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@automet.in"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@automet.in"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@automet.in?subject=Privacy Policy"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@automet.in?subject=Terms of Service"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Terms of Service
                </a>
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
              <a
                href="mailto:support@automet.in"
                className="text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"
                aria-label="Email"
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
              </a>
              <a
                href="mailto:support@automet.in"
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
