/**
 * Privacy Policy Page
 * Comprehensive privacy policy compliant with Indian data protection laws
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';

export default function PrivacyPolicyPage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Privacy Policy - Automet</title>
        <meta
          name="description"
          content="Automet Privacy Policy - How we collect, use, and protect your data."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        <Navigation />

        <section className="pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Privacy Policy
                </h1>
                <p className="text-lg text-gray-600">
                  Last updated:{' '}
                  {new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="bg-gray-50 rounded-xl p-6 mb-8 border-l-4 border-primary">
                  <p className="text-gray-700 leading-relaxed mb-0">
                    <strong>Automet</strong> ("we," "our," or "us") is committed
                    to protecting your privacy. This Privacy Policy explains how
                    we collect, use, disclose, and safeguard your information
                    when you use our field service management platform.
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    1. Information We Collect
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        1.1 Account Information
                      </h3>
                      <p className="leading-relaxed">
                        When you create an account, we collect your name, email
                        address, phone number, organization name, and billing
                        information. This information is necessary to provide
                        our services and process payments.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        1.2 Service Data
                      </h3>
                      <p className="leading-relaxed">
                        We collect and store data you input into Automet,
                        including job information, technician details, client
                        information, inventory records, invoices, and payment
                        transactions. This data is stored securely on servers
                        located in India.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        1.3 Usage Information
                      </h3>
                      <p className="leading-relaxed">
                        We automatically collect information about how you use
                        Automet, including device information, IP address,
                        browser type, access times, and pages viewed. This helps
                        us improve our services and ensure security.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        1.4 Location Data
                      </h3>
                      <p className="leading-relaxed">
                        With your permission, we collect GPS location data when
                        technicians use the mobile app for job tracking and
                        check-in/check-out features. You can disable location
                        services at any time through your device settings.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    2. How We Use Your Information
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                    <li>To provide, maintain, and improve our services</li>
                    <li>To process payments and manage subscriptions</li>
                    <li>
                      To send you service-related notifications and updates
                    </li>
                    <li>
                      To respond to your inquiries and provide customer support
                    </li>
                    <li>
                      To detect, prevent, and address technical issues and
                      security threats
                    </li>
                    <li>
                      To comply with legal obligations and enforce our Terms of
                      Service
                    </li>
                    <li>
                      To analyze usage patterns and improve user experience
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    3. Data Storage and Security
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>Data Location:</strong> All your data is stored on
                      servers located in India, ensuring compliance with Indian
                      data localization requirements.
                    </p>
                    <p className="leading-relaxed">
                      <strong>Security Measures:</strong> We implement
                      industry-standard security measures including encryption
                      in transit (SSL/TLS) and at rest, secure authentication,
                      regular security audits, and access controls. However, no
                      method of transmission over the internet is 100% secure,
                      and we cannot guarantee absolute security.
                    </p>
                    <p className="leading-relaxed">
                      <strong>Data Retention:</strong> We retain your data for
                      as long as your account is active or as needed to provide
                      services. You can request deletion of your data at any
                      time by contacting us at{' '}
                      <a
                        href="mailto:support@automet.app"
                        className="text-primary hover:underline"
                      >
                        support@automet.app
                      </a>
                      .
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    4. Data Sharing and Disclosure
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      We do not sell your personal information. We may share
                      your information only in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Service Providers:</strong> With trusted
                        third-party service providers who assist us in operating
                        our platform (e.g., payment processors, cloud hosting
                        providers). These providers are contractually obligated
                        to protect your data.
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> When required by
                        law, court order, or government regulation, or to
                        protect our rights, property, or safety.
                      </li>
                      <li>
                        <strong>Business Transfers:</strong> In connection with
                        a merger, acquisition, or sale of assets, with notice to
                        affected users.
                      </li>
                      <li>
                        <strong>With Your Consent:</strong> When you explicitly
                        authorize us to share your information.
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5. Your Rights and Choices
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      Under applicable Indian laws, you have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Access:</strong> Request a copy of your personal
                        data
                      </li>
                      <li>
                        <strong>Correction:</strong> Update or correct
                        inaccurate information
                      </li>
                      <li>
                        <strong>Deletion:</strong> Request deletion of your data
                        (subject to legal and contractual obligations)
                      </li>
                      <li>
                        <strong>Data Portability:</strong> Export your data in a
                        machine-readable format
                      </li>
                      <li>
                        <strong>Opt-out:</strong> Unsubscribe from marketing
                        communications (service-related communications may still
                        be sent)
                      </li>
                    </ul>
                    <p className="leading-relaxed">
                      To exercise these rights, please contact us at{' '}
                      <a
                        href="mailto:support@automet.app"
                        className="text-primary hover:underline"
                      >
                        support@automet.app
                      </a>
                      .
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    6. Cookies and Tracking Technologies
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar tracking technologies to enhance
                    your experience, analyze usage, and improve our services.
                    You can control cookies through your browser settings.
                    However, disabling cookies may limit certain features of our
                    platform.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    7. Children's Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Automet is not intended for users under the age of 18. We do
                    not knowingly collect personal information from children. If
                    you believe we have collected information from a child,
                    please contact us immediately.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    8. Changes to This Privacy Policy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will
                    notify you of any material changes by posting the new policy
                    on this page and updating the "Last updated" date. Your
                    continued use of Automet after such changes constitutes
                    acceptance of the updated policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    9. Contact Us
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have questions, concerns, or requests regarding this
                    Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 mb-2">
                      <strong>Email:</strong>{' '}
                      <a
                        href="mailto:support@automet.app"
                        className="text-primary hover:underline"
                      >
                        support@automet.app
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> Automet, India
                    </p>
                  </div>
                </section>
              </div>

              {/* Back Link */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <Link
                  href="/"
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
        />
      </div>
    </>
  );
}
