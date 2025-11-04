/**
 * Email Confirmation Page
 * Verifies email confirmation token from the link sent via email
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error' | 'expired';

interface PreorderData {
  email: string;
  contact_name: string;
  org_name: string;
}

export default function EmailConfirmPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<Status>('loading');
  const [preorderData, setPreorderData] = useState<PreorderData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || !router.isReady) return;

    async function verifyToken() {
      try {
        const response = await fetch(`/api/preorder/confirm?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setPreorderData(data.preorder);
        } else if (response.status === 410) {
          setStatus('expired');
          setErrorMessage(data.message || 'Confirmation link has expired');
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Failed to confirm email');
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    }

    verifyToken();
  }, [token, router.isReady]);

  // Loading state
  if (status === 'loading') {
    return (
      <>
        <Head>
          <title>Confirming Email - Automet</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-lg text-gray-700">Confirming your email...</p>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (status === 'success' && preorderData) {
    return (
      <>
        <Head>
          <title>Email Confirmed - Automet</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
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
                Email Confirmed!
              </h1>

              {/* Message */}
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Thank you, <span className="font-semibold">{preorderData.contact_name}</span>!
                Your email has been successfully confirmed.
              </p>

              {/* Details */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Pre-order Details:</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Organization:</span>
                    <span className="font-semibold text-gray-900">{preorderData.org_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{preorderData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-3">What's Next?</h2>
                <p className="text-blue-100 text-sm mb-4">
                  Our team will reach out to you within 48 hours with:
                </p>
                <ul className="text-left text-sm space-y-2 text-blue-50">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Onboarding schedule and next steps
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Access credentials when we launch
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Your early access benefits activation
                  </li>
                </ul>
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
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error states
  return (
    <>
      <Head>
        <title>{status === 'expired' ? 'Link Expired' : 'Confirmation Error'} - Automet</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {status === 'expired' ? 'Link Expired' : 'Confirmation Failed'}
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">{errorMessage}</p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Back to Home
              </Link>
              <a
                href="mailto:support@automet.in"
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-200"
              >
                Contact Support
              </a>
            </div>

            {/* Help Text */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a
                  href="mailto:support@automet.in"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  support@automet.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
