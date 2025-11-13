/**
 * Features Page
 * Comprehensive feature showcase with detailed explanations, use cases, and benefits
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';
import ContactSupportModal from '@/components/landing/ContactSupportModal';

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  useCases: string[];
  icon: JSX.Element;
  color: string;
  bgColor: string;
}

export default function FeaturesPage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://automet.in';
  const pageUrl = `${siteUrl}/features`;

  const features: Feature[] = [
    {
      id: 'job-management',
      title: 'Job Management',
      subtitle: 'Complete control over every job',
      description:
        'Create, assign, and track jobs from start to finish. Never lose track of a service request again.',
      benefits: [
        'Create jobs in seconds with templates',
        'Assign jobs to technicians instantly',
        'Real-time status updates (Scheduled > In Progress > Completed)',
        'Photo and document attachments',
        'Recurring job scheduling',
        'Job history and audit trail',
      ],
      useCases: [
        'Schedule monthly AC maintenance automatically',
        'Track emergency service calls',
        'Manage annual equipment audits',
        'Handle one-time service requests',
      ],
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'technician-tracking',
      title: 'Technician Tracking',
      subtitle: 'Know where your team is, always',
      description:
        'Real-time location tracking, job assignments, and status updates. No more guessing where your technicians are.',
      benefits: [
        'GPS-based location tracking',
        'Check-in/check-out at job sites',
        'Live job status updates',
        'Technician availability dashboard',
        'Route optimization suggestions',
        'Time tracking and attendance',
      ],
      useCases: [
        'Find nearest technician for emergency calls',
        'Monitor field team productivity',
        'Track attendance and work hours',
        'Optimize technician routes',
      ],
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'billing-payments',
      title: 'Billing & Payments',
      subtitle: 'Get paid 5x faster',
      description:
        'Automated invoicing, instant payment links, and integrated payment gateway. Recover 5% of lost revenue.',
      benefits: [
        'Auto-generate invoices from completed jobs',
        'Send payment links via SMS/WhatsApp',
        'Accept UPI, cards, net banking',
        'Track payment status in real-time',
        'Payment reminders and follow-ups',
        'Revenue analytics and reports',
      ],
      useCases: [
        'Invoice clients immediately after service',
        'Collect payments via UPI on-site',
        'Track outstanding payments',
        'Generate monthly revenue reports',
      ],
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'inventory-control',
      title: 'Inventory Control',
      subtitle: 'Never run out of spare parts',
      description:
        'Track spare parts, set low-stock alerts, and manage inventory across multiple locations.',
      benefits: [
        'Real-time inventory tracking',
        'Low-stock alerts and notifications',
        'Multi-location inventory management',
        'Issue tracking and consumption reports',
        'Purchase order management',
        'Inventory audit and reconciliation',
      ],
      useCases: [
        'Track AC compressor spare parts',
        'Monitor filter stock levels',
        'Manage tool inventory across sites',
        'Generate purchase orders automatically',
      ],
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const additionalFeatures = [
    {
      title: 'Offline Mode',
      description:
        'Work without internet. Sync automatically when connection is restored.',
      icon: '📱',
    },
    {
      title: 'Mobile App',
      description:
        'Native mobile apps for technicians to manage jobs on the go.',
      icon: '📲',
    },
    {
      title: 'Multi-site Support',
      description:
        'Manage multiple client sites and locations from one dashboard.',
      icon: '🏢',
    },
    {
      title: 'SLA Tracking',
      description:
        'Track response times, resolution times, and meet service commitments.',
      icon: '⏱️',
    },
    {
      title: 'Analytics Dashboard',
      description:
        'Real-time insights into jobs, revenue, technician performance, and more.',
      icon: '📊',
    },
    {
      title: 'Custom Reports',
      description: 'Generate PDF reports for clients with your branding.',
      icon: '📄',
    },
  ];

  return (
    <>
      <Head>
        <title>Features - Automet | Complete Field Service Management</title>
        <meta
          name="description"
          content="Discover all features of Automet: Job management, technician tracking, billing & payments, inventory control. Built specifically for Indian AMC vendors."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={pageUrl} />
        <meta
          property="og:title"
          content="Features - Automet | Complete Field Service Management"
        />
        <meta
          property="og:description"
          content="Discover all features of Automet: Job management, technician tracking, billing & payments, inventory control. Built specifically for Indian AMC vendors."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Features - Automet | Complete Field Service Management"
        />
        <meta
          name="twitter:description"
          content="Discover all features of Automet: Job management, technician tracking, billing & payments, inventory control. Built specifically for Indian AMC vendors."
        />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
              POWERFUL FEATURES
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Everything you need to{' '}
              <span className="text-primary">run your AMC business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Four powerful modules working together seamlessly. Built
              specifically for Indian AMC vendors who want to grow faster.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-primary mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Mobile-first design
              </div>
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-primary mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Works offline
              </div>
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-primary mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Real-time updates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features - Detailed */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-8 items-center`}
              >
                {/* Left: Content */}
                <div className="flex-1">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-xl mb-6`}
                  >
                    <div className={feature.color}>{feature.icon}</div>
                  </div>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">
                    {feature.subtitle.toUpperCase()}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Key Benefits:
                    </h3>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-sm text-gray-700"
                        >
                          <svg
                            className={`w-5 h-5 ${feature.color} mr-2 flex-shrink-0 mt-0.5`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Perfect For:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {feature.useCases.map((useCase, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Visual Placeholder */}
                <div className="flex-1">
                  <div
                    className={`${feature.bgColor} rounded-2xl p-8 border-2 border-gray-200 relative overflow-hidden`}
                  >
                    {/* Coming Soon Badge - Diagonal Ribbon */}
                    <div className="absolute top-6 -right-12 transform rotate-45 z-10">
                      <div className="bg-gradient-to-r from-primary to-secondary px-16 py-2 shadow-lg">
                        <span className="text-white text-xs font-bold uppercase tracking-wider">
                          Revealing Soon
                        </span>
                      </div>
                    </div>

                    {/* Floating Badge - Top Left */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-primary to-secondary text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg flex items-center gap-1.5 animate-pulse">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Coming Soon
                        </div>
                      </div>
                    </div>

                    <div className="aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center relative overflow-hidden">
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      
                      <div className="text-center relative z-10">
                        <div className={`text-6xl mb-4 ${feature.color} opacity-30`}>
                          {feature.icon}
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                          {feature.title} Dashboard
                        </p>
                        <p className="text-xs text-gray-400 mt-2 max-w-[200px] mx-auto">
                          Sneak peek launching Q1 2026
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              And So Much More
            </h2>
            <p className="text-lg text-gray-600">
              Additional features to make your operations seamless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                BEFORE VS AFTER
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                See the transformation
              </h2>
              <p className="text-lg text-gray-600">
                How Automet solves your biggest pain points
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="inline-block px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded uppercase mr-3">
                    Before
                  </span>
                  Without Automet
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-red-500 mr-2 mt-0.5">✗</span>
                    <span>Job sheets scattered in WhatsApp</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-red-500 mr-2 mt-0.5">✗</span>
                    <span>No visibility into technician locations</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-red-500 mr-2 mt-0.5">✗</span>
                    <span>Manual invoicing takes hours</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-red-500 mr-2 mt-0.5">✗</span>
                    <span>5% revenue lost to billing delays</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-red-500 mr-2 mt-0.5">✗</span>
                    <span>Running out of spare parts unexpectedly</span>
                  </li>
                </ul>
              </div>

              {/* After */}
              <div className="bg-primary/5 rounded-xl p-6 border-l-4 border-primary">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded uppercase mr-3">
                    After
                  </span>
                  With Automet
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-primary mr-2 mt-0.5">✓</span>
                    <span>All jobs organized in one dashboard</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-primary mr-2 mt-0.5">✓</span>
                    <span>Real-time technician tracking and status</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-primary mr-2 mt-0.5">✓</span>
                    <span>Auto-generate invoices in seconds</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-primary mr-2 mt-0.5">✓</span>
                    <span>Get paid 5x faster with payment links</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-700">
                    <span className="text-primary mr-2 mt-0.5">✓</span>
                    <span>Smart alerts prevent stockouts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to streamline your operations?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of AMC vendors on the waitlist. Launching Q1 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setPreorderModalOpen(true)}
                className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join the Waitlist
              </button>
              <Link
                href="/roi-calculator"
                className="px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Calculate Your ROI
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Free to join
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {preorderModalOpen && (
        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
        />
      )}
      {contactModalOpen && (
        <ContactSupportModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
        />
      )}
    </>
  );
}
