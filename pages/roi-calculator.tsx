/**
 * ROI Calculator Page
 * Interactive ROI calculator with detailed explanations and visualizations
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';
import ROICalculator from '@/components/landing/roi/ROICalculator';

export default function ROICalculatorPage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>ROI Calculator - Automet | Calculate Your Savings</title>
        <meta
          name="description"
          content="Calculate how much you can save with Automet. See your ROI, time savings, and recovered revenue. Free interactive calculator for AMC vendors."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation onPreorderClick={() => setPreorderModalOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
              ROI CALCULATOR
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              See how much you can{' '}
              <span className="text-primary">save with Automet</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Calculate your ROI, time savings, and recovered revenue. See the
              real impact Automet can have on your business.
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
                Free calculator
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
                No signup required
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
                Instant results
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-6 h-6 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                How to Use This Calculator
              </h3>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                <li>
                  Select your plan (Free, Starter, Growth, or Business) based on
                  your team size
                </li>
                <li>
                  Adjust the sliders to match your current business metrics
                </li>
                <li>
                  Toggle between &quot;With Automet&quot; and &quot;Without
                  Automet&quot; to see the difference
                </li>
                <li>See your potential savings, ROI, and recovered revenue</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  50%
                </div>
                <div className="text-xs text-gray-600">
                  Reduction in admin time
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700 mb-1">5%</div>
                <div className="text-xs text-gray-600">
                  Revenue recovery from better tracking
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700 mb-1">5%</div>
                <div className="text-xs text-gray-600">
                  Cashflow gain from faster invoicing
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Component */}
      <section className="py-12 bg-gray-50">
        <ROICalculator />
      </section>

      {/* Understanding the Results */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Understanding Your Results
              </h2>
              <p className="text-lg text-gray-600">
                Here&apos;s what each metric means for your business
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-primary"
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
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Time Saved
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  The hours you&apos;ll save each month by automating admin
                  tasks. At ₹200/hour, this translates to significant cost
                  savings.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Recovered Revenue
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Revenue you&apos;re currently losing due to missed billing,
                  incomplete records, or delayed invoicing. Automet helps you
                  recover this.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Cashflow Gain
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Faster invoicing and payment collection means money in your
                  account sooner. This improves your cashflow and working
                  capital.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">ROI %</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Your return on investment as a percentage. Calculated as:
                  (Annual Benefits ÷ Annual Cost) × 100. Most businesses see ROI
                  of 200-500%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Real-World Examples
              </h2>
              <p className="text-lg text-gray-600">
                See how Automet helps businesses like yours
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Small Team (10 Technicians)
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      AC service provider with 10 technicians, 250 jobs/month,
                      ₹1,200 average revenue per job
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Monthly Savings
                        </div>
                        <div className="text-primary text-lg font-bold">
                          ₹18,000+
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">ROI</div>
                        <div className="text-primary text-lg font-bold">
                          350%+
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Growing Business (25 Technicians)
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Elevator maintenance company with 25 technicians, 750
                      jobs/month, ₹1,500 average revenue per job
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Monthly Savings
                        </div>
                        <div className="text-primary text-lg font-bold">
                          ₹65,000+
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">ROI</div>
                        <div className="text-primary text-lg font-bold">
                          420%+
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Large Team (75 Technicians)
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Equipment servicing business with 75 technicians, 2,625
                      jobs/month, ₹1,500 average revenue per job
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Monthly Savings
                        </div>
                        <div className="text-primary text-lg font-bold">
                          ₹2,00,000+
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">ROI</div>
                        <div className="text-primary text-lg font-bold">
                          500%+
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              Convinced? Join the waitlist today
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of AMC vendors who are already on the waitlist.
              Launching Q1 2025.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setPreorderModalOpen(true)}
                className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join the Waitlist
              </button>
              <Link
                href="/features"
                className="px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore Features
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Free to join
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modal */}
      {preorderModalOpen && (
        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
        />
      )}
    </>
  );
}
