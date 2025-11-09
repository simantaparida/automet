import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle landing-only mode
 * Blocks access to app pages when NEXT_PUBLIC_LANDING_ONLY=true
 */
export function middleware(request: NextRequest) {
  const isLandingOnly = process.env.NEXT_PUBLIC_LANDING_ONLY === 'true';
  
  // If not in landing-only mode, allow all requests
  if (!isLandingOnly) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Define landing pages (allowed in landing-only mode)
  const landingPages = [
    '/',
    '/pricing',
    '/features',
    '/roi-calculator',
    '/blog',
    '/terms-of-service',
    '/privacy-policy',
    '/about',
    '/preorder/success',
    '/preorder/confirm',
    '/admin/waitlist', // Admin waitlist viewer
  ];

  // Define landing API routes (allowed in landing-only mode)
  const landingApiRoutes = [
    '/api/preorder',
    '/api/contact',
    '/api/blog',
    '/api/admin/waitlist',
    '/api/health',
  ];

  // Allow static files, _next, and public assets FIRST
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') // Files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Check if current path is a landing page
  const isLandingPage =
    landingPages.some((page) => pathname === page || pathname.startsWith(`${page}/`)) ||
    landingApiRoutes.some((route) => pathname.startsWith(route));

  // If not a landing page in landing-only mode, redirect to home
  if (!isLandingPage) {
    // Prevent infinite redirect loop - if already at home, just continue
    if (pathname === '/') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

