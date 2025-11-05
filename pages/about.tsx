/**
 * About Page
 * Company story, mission, vision, and values
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';
import ContactSupportModal from '@/components/landing/ContactSupportModal';

export default function AboutPage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Built for India',
      description: 'We understand the unique challenges of Indian AMC vendors. Every feature is designed with local context in mind.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Fast & Reliable',
      description: 'Built on modern technology stack. Fast loading, offline support, and 99.9% uptime guarantee.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Mobile-First',
      description: 'Your technicians work in the field. We built Automet mobile-first so they can access everything on their phones.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Customer-Centric',
      description: 'Your feedback shapes our product. We listen, learn, and iterate based on what you actually need.',
    },
  ];

  const stats = [
    { label: 'Launch Date', value: 'Q1 2025' },
    { label: 'Built In', value: 'India' },
    { label: 'Target Market', value: 'AMC Vendors' },
    { label: 'Focus', value: 'Field Service' },
  ];

  return (
    <>
      <Head>
        <title>About Us - Automet | Built for Indian AMC Vendors</title>
        <meta
          name="description"
          content="Learn about Automet - the field service management platform built specifically for Indian AMC vendors. Our mission, vision, and commitment to transforming AMC operations."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              {/* Badge */}
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                ABOUT AUTOMET
              </span>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Built for Indian AMC vendors, by people who understand your challenges
              </h1>

              {/* Sub-heading */}
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
                We're on a mission to transform how field service businesses operate in India.{' '}
                <span className="text-primary font-semibold">No more Excel, WhatsApp, or manual chaos.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  How we're solving the problems we've seen firsthand
                </p>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="bg-gray-50 rounded-xl p-8 mb-8 border-l-4 border-primary">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    After years of working with AMC vendors across India, we noticed a pattern: field service businesses were losing money and time to manual processes. Excel sheets scattered across WhatsApp groups, technicians calling in constantly, inventory running out unexpectedly, and payment delays causing cash flow issues.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We realized that existing solutions were either too expensive, too complex, or built for Western markets that don't understand Indian business realities. UPI payments, offline-first operations, and mobile-friendly interfaces weren't priorities for them.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    That's why we built <strong>Automet</strong> - a platform designed from the ground up for Indian AMC vendors. We're not just another SaaS tool. We're your partner in growing your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Mission */}
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To empower Indian AMC vendors with technology that simplifies operations, reduces costs, and accelerates growth. We believe every field service business deserves tools that work for them, not against them.
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To become the go-to platform for field service management in India. We envision a future where every AMC vendor can run their business efficiently, scale effortlessly, and focus on what matters most - serving their clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Automet */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Automet?</h2>
                <p className="text-lg text-gray-600">
                  We're different because we understand your business
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Made in India, for India</h4>
                    <p className="text-gray-600 text-sm">
                      Built by people who understand Indian business culture, payment methods (UPI, cards, net banking), and operational challenges.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Affordable Pricing</h4>
                    <p className="text-gray-600 text-sm">
                      No hidden fees, transparent pricing. Start free, pay as you grow. Designed for businesses of all sizes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Offline-First</h4>
                    <p className="text-gray-600 text-sm">
                      Works even when internet is spotty. Your technicians can complete jobs offline and sync when connected.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Fast Setup</h4>
                    <p className="text-gray-600 text-sm">
                      Get started in minutes, not weeks. No complex training required. Intuitive interface designed for field technicians.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
                <p className="text-lg text-gray-600">
                  What drives us every day
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Ready to transform your AMC business?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join hundreds of AMC vendors already on the waitlist. Get early access and exclusive benefits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setPreorderModalOpen(true)}
                  className="px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Join Waitlist
                </button>
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* Pre-order Modal */}
        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
        />

        {/* Contact Support Modal */}
        <ContactSupportModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
        />
      </div>
    </>
  );
}

