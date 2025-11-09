/**
 * Pricing Page
 * Comprehensive pricing page with detailed plans, comparison table, and FAQs
 */

import { useState } from 'react';
import Head from 'next/head';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';
import ContactSupportModal from '@/components/landing/ContactSupportModal';

interface PricingPlan {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge?: string;
}

export default function PricingPage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://automet.in';
  const pageUrl = `${siteUrl}/pricing`;

  const plans: PricingPlan[] = [
    {
      name: 'Free',
      subtitle: 'Forever',
      price: '₹0',
      period: 'forever',
      description: 'Solo technicians / tiny vendors',
      features: [
        '1 site, 3 users max',
        '30 jobs per month',
        'Basic job creation',
        'Photo upload (500 MB)',
        '3 months data history',
      ],
      cta: 'Join Waitlist',
      popular: false,
    },
    {
      name: 'Starter',
      subtitle: 'Small Teams',
      price: '₹999',
      period: 'per month',
      description: 'Small contractors (2-10 techs)',
      features: [
        'Up to 5 sites, 10 techs',
        'Unlimited jobs',
        'Offline mode & sync',
        'Recurring jobs',
        'Basic inventory tracking',
        'Auto PDF reports',
      ],
      cta: 'Join Waitlist',
      popular: true,
      badge: 'Most Popular',
    },
    {
      name: 'Growth',
      subtitle: 'Scaling Business',
      price: '₹2,999',
      period: 'per month',
      description: 'Growing FM vendors (10-50 techs)',
      features: [
        'Up to 20 sites, 50 techs',
        'Full inventory tracking',
        'SLA tracking & analytics',
        'Priority email + chat',
        '10 GB storage',
        '3 years data retention',
      ],
      cta: 'Join Waitlist',
      popular: false,
    },
    {
      name: 'Business',
      subtitle: 'Large Teams',
      price: '₹9,999',
      period: 'per month',
      description: 'Large FM partners (50-200 techs)',
      features: [
        'Unlimited sites, 200 techs',
        'Multi-org / multi-branch',
        'Custom branding',
        'Advanced SLA & analytics',
        'Full API access',
        'Dedicated manager',
      ],
      cta: 'Join Waitlist',
      popular: false,
    },
  ];

  const comparisonFeatures = [
    {
      feature: 'Sites',
      free: '1',
      starter: '5',
      growth: '20',
      business: 'Unlimited',
    },
    {
      feature: 'Users/Technicians',
      free: '3',
      starter: '10',
      growth: '50',
      business: '200',
    },
    {
      feature: 'Jobs per month',
      free: '30',
      starter: 'Unlimited',
      growth: 'Unlimited',
      business: 'Unlimited',
    },
    {
      feature: 'Storage',
      free: '500 MB',
      starter: '2 GB',
      growth: '10 GB',
      business: '50 GB',
    },
    {
      feature: 'Data retention',
      free: '3 months',
      starter: '1 year',
      growth: '3 years',
      business: 'Unlimited',
    },
    {
      feature: 'Offline mode',
      free: '❌',
      starter: '✅',
      growth: '✅',
      business: '✅',
    },
    {
      feature: 'Recurring jobs',
      free: '❌',
      starter: '✅',
      growth: '✅',
      business: '✅',
    },
    {
      feature: 'Inventory tracking',
      free: 'Basic',
      starter: 'Basic',
      growth: 'Full',
      business: 'Full',
    },
    {
      feature: 'SLA tracking',
      free: '❌',
      starter: '❌',
      growth: '✅',
      business: 'Advanced',
    },
    {
      feature: 'Analytics',
      free: 'Basic',
      starter: 'Basic',
      growth: 'Advanced',
      business: 'Advanced',
    },
    {
      feature: 'Auto PDF reports',
      free: '❌',
      starter: '✅',
      growth: '✅',
      business: '✅',
    },
    {
      feature: 'Multi-org support',
      free: '❌',
      starter: '❌',
      growth: '❌',
      business: '✅',
    },
    {
      feature: 'Custom branding',
      free: '❌',
      starter: '❌',
      growth: '❌',
      business: '✅',
    },
    {
      feature: 'API access',
      free: '❌',
      starter: '❌',
      growth: '❌',
      business: '✅',
    },
    {
      feature: 'Support',
      free: 'Email',
      starter: 'Email',
      growth: 'Priority',
      business: 'Dedicated',
    },
  ];

  const pricingFAQs = [
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, debit cards, UPI, and net banking. All payments are processed securely through Razorpay.',
    },
    {
      question: 'Can I change plans later?',
      answer:
        'Yes, absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate the charges.',
    },
    {
      question: 'Do you offer annual billing discounts?',
      answer:
        'Yes! All paid plans include a 20% discount when you choose annual billing. Early access members get an additional 50% off for the first 3 months after launch.',
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer:
        'We will notify you when you approach your limits. You can upgrade your plan at any time. For Business plan users, we can discuss custom limits based on your needs.',
    },
    {
      question: 'Is there a setup fee?',
      answer:
        'No setup fees! All plans include free onboarding and setup assistance. We want to make it easy for you to get started.',
    },
    {
      question: 'What is your refund policy?',
      answer:
        'We offer a 30-day money-back guarantee on all paid plans. If you are not satisfied, contact us within 30 days for a full refund, no questions asked.',
    },
    {
      question: 'Do you offer enterprise plans?',
      answer:
        'Yes! For organizations needing more than 200 technicians or custom features, we offer enterprise plans with custom pricing, dedicated support, and tailored solutions. Contact us for details.',
    },
    {
      question: 'When will I be charged?',
      answer:
        'For early access members, you will be charged when you activate your account after launch. We will notify you via email before any charges occur.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>Pricing - Automet | Field Service Management</title>
        <meta
          name="description"
          content="Simple, transparent pricing for Automet. Choose the plan that fits your team size. Free tier available. 30-day money-back guarantee."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Pricing - Automet | Field Service Management" />
        <meta property="og:description" content="Simple, transparent pricing for Automet. Choose the plan that fits your team size. Free tier available. 30-day money-back guarantee." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing - Automet | Field Service Management" />
        <meta name="twitter:description" content="Simple, transparent pricing for Automet. Choose the plan that fits your team size. Free tier available. 30-day money-back guarantee." />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation onPreorderClick={() => setPreorderModalOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
              SIMPLE PRICING
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Choose the plan that{' '}
              <span className="text-primary">fits your business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transparent pricing with no hidden fees. Start free, scale as you
              grow. All plans include a 30-day money-back guarantee.
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
                No credit card required
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
                30-day money-back guarantee
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
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-xl p-6 ${
                  plan.popular
                    ? 'border-4 border-primary shadow-2xl md:scale-105 z-10'
                    : 'border-2 border-gray-200 shadow-sm'
                } transition-all duration-300 hover:shadow-lg`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Name & Subtitle */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {plan.subtitle}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-600 text-sm ml-1">
                      /{plan.period}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {plan.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6 min-h-[200px]">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <svg
                        className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5"
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
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    setSelectedPlan(plan.name.toLowerCase());
                    setPreorderModalOpen(true);
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : plan.name === 'Free'
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Annual Billing Note */}
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="inline-block bg-primary/5 border border-primary/20 rounded-lg px-6 py-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-primary">
                  Save 20% with annual billing
                </span>{' '}
                on all paid plans. Early access members get an additional{' '}
                <span className="font-semibold text-primary">50% off</span> for
                the first 3 months!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-gray-600">
              See exactly what&apos;s included in each plan
            </p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Free
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Starter
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Growth
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Business
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparisonFeatures.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {row.feature}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                          {row.free}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                          {row.starter}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                          {row.growth}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                          {row.business}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              30-Day Money Back Guarantee
            </h3>
            <p className="text-gray-600 mb-6">
              Not satisfied? Get a full refund within 30 days. No questions
              asked. We&apos;re confident you&apos;ll love Automet, but if you
              don&apos;t, we&apos;ll make it right.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pricing Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-3">
              {pricingFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary/40 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-base font-semibold text-gray-900 pr-4 flex-1">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ease-in-out ${
                        openFAQ === index ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFAQ === index
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-block bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We&apos;re here to help. Reach out to our team.
              </p>
              <button
                onClick={() => setContactModalOpen(true)}
                className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to streamline your operations?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of AMC vendors who are already on the waitlist.
              Launching Q1 2026.
            </p>
            <button
              onClick={() => setPreorderModalOpen(true)}
              className="inline-block px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Join the Waitlist
            </button>
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
          defaultPlan={selectedPlan}
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
