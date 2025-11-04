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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-green-600"
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pre-order Submitted!
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Thank you for your interest in Automet. We've sent a confirmation email to{' '}
              <span className="font-semibold text-blue-600">{email}</span>.
            </p>

            {/* What's Next */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What happens next?</h2>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Check your email</p>
                    <p className="text-sm text-gray-600">
                      Click the confirmation link we sent to verify your email address
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">We'll be in touch</p>
                    <p className="text-sm text-gray-600">
                      Our team will contact you within 48 hours with onboarding details
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Get early access</p>
                    <p className="text-sm text-gray-600">
                      You'll be among the first to access Automet when we launch
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">50% Off Pro Plan</p>
                  <p className="text-xs text-gray-600">First 3 months (save ₹4,500)</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Priority Onboarding</p>
                  <p className="text-xs text-gray-600">Dedicated support team</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Lifetime Priority</p>
                  <p className="text-xs text-gray-600">Feature requests & support</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
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
                Didn't receive the email?{' '}
                <a
                  href="mailto:support@automet.in"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Join 100+ businesses already on the waitlist
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
