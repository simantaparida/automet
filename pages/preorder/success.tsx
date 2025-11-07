/**
 * Pre-order Success Page
 * Shown after successful pre-order form submission
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function PreorderSuccessPage() {
  const router = useRouter();
  const { email } = router.query;

  useEffect(() => {
    // If no email in query params, redirect to home
    if (!email && router.isReady) {
      router.push('/');
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Pre-order Successful - Automet</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-primary"
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
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              You're on the Waitlist! 🎉
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Thank you for joining! We've added{' '}
              <span className="font-semibold text-primary">{email}</span> to our
              waitlist.
            </p>

            {/* Email Notice */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong className="text-primary">📧 Check your email!</strong>{' '}
                We've sent a welcome email to{' '}
                <span className="font-semibold">{email}</span> with details
                about your waitlist status.
              </p>
            </div>

            {/* What's Next */}
            <div className="bg-primary/10 rounded-xl p-6 mb-8 text-left border border-primary/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                What happens next?
              </h2>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      We'll notify you when we launch
                    </p>
                    <p className="text-sm text-gray-600">
                      You'll be among the first to know when Automet is ready
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Get early access
                    </p>
                    <p className="text-sm text-gray-600">
                      You'll be among the first to access Automet when we launch
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Exclusive benefits
                    </p>
                    <p className="text-sm text-gray-600">
                      Special offers and priority support for early users
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Benefits Reminder */}
            <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-3">
                YOUR EARLY ACCESS BENEFITS:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    🎯 First Access
                  </p>
                  <p className="text-xs text-gray-600">
                    Try features before public launch
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    💰 Special Offers
                  </p>
                  <p className="text-xs text-gray-600">
                    Exclusive discounts for early users
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    🚀 Priority Support
                  </p>
                  <p className="text-xs text-gray-600">
                    Dedicated onboarding & setup help
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    📢 Shape the Product
                  </p>
                  <p className="text-xs text-gray-600">
                    Your feedback helps us build better
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                Back to Home
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-200"
              >
                Read Our Blog
              </Link>
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Questions?{' '}
                <a
                  href="mailto:support@automet.app"
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  Contact us
                </a>
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Join businesses already on the waitlist
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
