/**
 * Terms of Service Page
 * Comprehensive terms of service for Automet platform
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';

export default function TermsOfServicePage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Terms of Service - Automet</title>
        <meta
          name="description"
          content="Automet Terms of Service - Terms and conditions for using our platform."
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
                  Terms of Service
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
                    Please read these Terms of Service ("Terms") carefully
                    before using Automet ("Service," "Platform," or "we"). By
                    accessing or using Automet, you agree to be bound by these
                    Terms. If you disagree with any part of these Terms, you may
                    not access the Service.
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    By creating an account, accessing, or using Automet, you
                    acknowledge that you have read, understood, and agree to be
                    bound by these Terms and our Privacy Policy. These Terms
                    constitute a legally binding agreement between you and
                    Automet.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    2. Description of Service
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Automet is a field service management platform designed for
                    Indian AMC vendors and field service businesses. The Service
                    includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Job and task management</li>
                    <li>Technician tracking and GPS location services</li>
                    <li>Inventory management</li>
                    <li>Invoice generation and payment processing</li>
                    <li>Client and asset management</li>
                    <li>Reporting and analytics</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    3. Account Registration and Eligibility
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>3.1 Eligibility:</strong> You must be at least 18
                      years old and have the legal capacity to enter into
                      contracts to use Automet. By using the Service, you
                      represent and warrant that you meet these requirements.
                    </p>
                    <p className="leading-relaxed">
                      <strong>3.2 Account Creation:</strong> You are responsible
                      for maintaining the confidentiality of your account
                      credentials. You agree to provide accurate, current, and
                      complete information during registration and to update
                      such information as necessary.
                    </p>
                    <p className="leading-relaxed">
                      <strong>3.3 Account Security:</strong> You are responsible
                      for all activities that occur under your account. You must
                      immediately notify us of any unauthorized use of your
                      account or any other breach of security.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    4. Subscription and Payment Terms
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>4.1 Subscription Plans:</strong> Automet offers
                      various subscription plans with different features and
                      limits. Pricing and plan details are available on our
                      pricing page. We reserve the right to modify pricing with
                      30 days' notice.
                    </p>
                    <p className="leading-relaxed">
                      <strong>4.2 Payment:</strong> Subscription fees are billed
                      in advance on a monthly or annual basis. Payments are
                      processed through secure third-party payment gateways. You
                      authorize us to charge your payment method for all fees.
                    </p>
                    <p className="leading-relaxed">
                      <strong>4.3 Refunds:</strong> Refund policies vary by
                      plan. Free plans may be cancelled at any time. Paid
                      subscriptions may be eligible for prorated refunds within
                      the first 14 days of subscription, subject to our refund
                      policy.
                    </p>
                    <p className="leading-relaxed">
                      <strong>4.4 Renewal:</strong> Subscriptions automatically
                      renew unless cancelled before the renewal date. You can
                      cancel your subscription at any time through your account
                      settings or by contacting support.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5. Acceptable Use
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      You agree not to use Automet to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Violate any applicable laws, regulations, or third-party
                        rights
                      </li>
                      <li>
                        Transmit any harmful, offensive, or illegal content
                      </li>
                      <li>
                        Attempt to gain unauthorized access to the Service or
                        other accounts
                      </li>
                      <li>Interfere with or disrupt the Service or servers</li>
                      <li>
                        Use automated systems to access the Service without
                        authorization
                      </li>
                      <li>
                        Reverse engineer, decompile, or disassemble any part of
                        the Service
                      </li>
                      <li>
                        Resell, sublicense, or redistribute the Service without
                        permission
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    6. Intellectual Property
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>6.1 Our Rights:</strong> Automet and all content,
                      features, and functionality are owned by us and protected
                      by Indian and international copyright, trademark, and
                      other intellectual property laws.
                    </p>
                    <p className="leading-relaxed">
                      <strong>6.2 Your Data:</strong> You retain all ownership
                      rights to your data. By using Automet, you grant us a
                      limited license to use, store, and process your data
                      solely to provide and improve the Service.
                    </p>
                    <p className="leading-relaxed">
                      <strong>6.3 Feedback:</strong> Any feedback, suggestions,
                      or ideas you provide about Automet may be used by us
                      without obligation or compensation to you.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    7. Data and Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Your use of Automet is also governed by our Privacy Policy.
                    We implement reasonable security measures to protect your
                    data, but we cannot guarantee absolute security. You are
                    responsible for backing up your data. We are not liable for
                    any loss or corruption of your data.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    8. Service Availability and Modifications
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>8.1 Availability:</strong> We strive to maintain
                      high service availability but do not guarantee
                      uninterrupted or error-free service. The Service may be
                      temporarily unavailable due to maintenance, updates, or
                      unforeseen circumstances.
                    </p>
                    <p className="leading-relaxed">
                      <strong>8.2 Modifications:</strong> We reserve the right
                      to modify, suspend, or discontinue any part of the Service
                      at any time, with or without notice. We will provide
                      reasonable notice for material changes that adversely
                      affect your use of the Service.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    9. Limitation of Liability
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To the maximum extent permitted by law:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      Automet is provided "as is" and "as available" without
                      warranties of any kind, express or implied
                    </li>
                    <li>
                      We are not liable for any indirect, incidental, special,
                      consequential, or punitive damages arising from your use
                      of the Service
                    </li>
                    <li>
                      Our total liability for any claims shall not exceed the
                      amount you paid us in the 12 months preceding the claim
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    10. Indemnification
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    You agree to indemnify and hold harmless Automet, its
                    officers, directors, employees, and agents from any claims,
                    damages, losses, liabilities, and expenses (including legal
                    fees) arising from your use of the Service, violation of
                    these Terms, or infringement of any rights of another party.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    11. Termination
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>11.1 By You:</strong> You may terminate your
                      account at any time by contacting us or using account
                      deletion features in the Service.
                    </p>
                    <p className="leading-relaxed">
                      <strong>11.2 By Us:</strong> We may suspend or terminate
                      your account immediately if you violate these Terms,
                      engage in fraudulent activity, or fail to pay subscription
                      fees.
                    </p>
                    <p className="leading-relaxed">
                      <strong>11.3 Effect of Termination:</strong> Upon
                      termination, your right to use the Service ceases
                      immediately. We may delete your account and data after a
                      reasonable retention period, subject to legal
                      requirements.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    12. Governing Law and Dispute Resolution
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>12.1 Governing Law:</strong> These Terms are
                      governed by the laws of India, without regard to conflict
                      of law principles.
                    </p>
                    <p className="leading-relaxed">
                      <strong>12.2 Dispute Resolution:</strong> Any disputes
                      arising from these Terms or your use of Automet shall be
                      resolved through good faith negotiation. If negotiation
                      fails, disputes shall be subject to the exclusive
                      jurisdiction of courts in India.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    13. Changes to Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these Terms at any time.
                    Material changes will be notified via email or through the
                    Service. Your continued use of Automet after such changes
                    constitutes acceptance of the modified Terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    14. Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have questions about these Terms, please contact us:
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
