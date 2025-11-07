/**
 * Admin Navigation Component
 * Shared navigation for all admin pages
 */

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminNav() {
  const router = useRouter();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/waitlist', label: 'Waitlist', icon: '📝' },
    { href: '/admin/contact-messages', label: 'Messages', icon: '💬' },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <svg
              className="w-7 h-7"
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
            <span>Automet Admin</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isActive(item.href)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Back to Site */}
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            ← Back to Site
          </Link>
        </div>
      </div>
    </nav>
  );
}

