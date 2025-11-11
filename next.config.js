const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Only exclude middleware manifest, don't interfere with other manifests
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  
  // Allow build to proceed even with ESLint errors
  // TODO: Fix ESLint errors and remove this
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Allow build to proceed even with TypeScript errors
  // TODO: Fix TypeScript errors and remove this
  typescript: {
    ignoreBuildErrors: false, // Keep this false - we want TS errors to fail
  },

  // Image optimization
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile photos
      'supabase.co', // Supabase Storage
      'automet.in', // Automet domain
      'chatgpt.com', // ChatGPT backend (temporary for blog images)
    ],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
