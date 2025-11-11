/**
 * About Page
 * Company story, mission, vision, and values
 */

import { useState } from 'react';
import Head from 'next/head';
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
        <svg
          className="w-8 h-8"
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
      ),
      title: 'Built for India',
      description:
        'We understand the unique challenges of Indian AMC vendors. Every feature is designed with local context in mind.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: 'Fast & Reliable',
      description:
        'Built on modern technology stack. Fast loading, offline support, and 99.9% uptime guarantee.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'Mobile-First',
      description:
        'Your technicians work in the field. We built Automet mobile-first so they can access everything on their phones.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: 'Customer-Centric',
      description:
        'Your feedback shapes our product. We listen, learn, and iterate based on what you actually need.',
    },
  ];

  const stats = [
    { label: 'Launch Date', value: 'Q1 2026' },
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
                Built for Indian AMC vendors, by people who understand your
                challenges
              </h1>

              {/* Sub-heading */}
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
                We&apos;re on a mission to transform how field service
                businesses operate in India.{' '}
                <span className="text-primary font-semibold">
                  No more Excel, WhatsApp, or manual chaos.
                </span>
              </p>

              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
                <span className="uppercase tracking-wide text-xs font-semibold text-gray-400">
                  Connect with us
                </span>
                <a
                  href="https://www.linkedin.com/company/automethq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://x.com/Automet359944"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 3.5h2.695l-5.9 6.747 6.955 10.253h-5.445l-3.808-5.575-4.357 5.575H5.688l6.308-7.189L5.34 3.5h5.58l3.454 4.983L18.244 3.5Zm-.945 14.994h1.495L7.14 5.678H5.53l11.769 12.816Z" />
                  </svg>
                  X
                </a>
                <a
                  href="https://www.instagram.com/automet.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 3C4.239 3 2 5.239 2 8v8c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V8c0-2.761-2.239-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v8c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V8c0-1.654 1.346-3 3-3zm5 2.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm6.25-2.75a1 1 0 110 2 1 1 0 010-2z" />
                  </svg>
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/people/Automet/61583698070965/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12.073C22 6.49 17.523 2 12 2S2 6.49 2 12.073C2 17.096 5.657 21.245 10.438 22v-6.999H7.898v-2.928h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.776-1.63 1.571v1.888h2.773l-.443 2.928h-2.33V22C18.343 21.245 22 17.096 22 12.073" />
                  </svg>
                  Facebook
                </a>
                <a
                  href="mailto:info@automet.app"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@automet.app
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Our Story
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  How we&apos;re solving the problems we&apos;ve seen firsthand
                </p>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="bg-gray-50 rounded-xl p-8 mb-8 border-l-4 border-primary">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    After years of working with AMC vendors across India, we
                    noticed a pattern: field service businesses were losing
                    money and time to manual processes. Excel sheets scattered
                    across WhatsApp groups, technicians calling in constantly,
                    inventory running out unexpectedly, and payment delays
                    causing cash flow issues.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We realized that existing solutions were either too
                    expensive, too complex, or built for Western markets that
                    don&apos;t understand Indian business realities. UPI
                    payments, offline-first operations, and mobile-friendly
                    interfaces weren&apos;t priorities for them.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    That&apos;s why we built <strong>Automet</strong> - a
                    platform designed from the ground up for Indian AMC vendors.
                    We&apos;re not just another SaaS tool. We&apos;re your
                    partner in growing your business.
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
                    <svg
                      className="w-8 h-8"
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Our Mission
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    To empower Indian AMC vendors with technology that
                    simplifies operations, reduces costs, and accelerates
                    growth. We believe every field service business deserves
                    tools that work for them, not against them.
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary mb-6">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Our Vision
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    To become the go-to platform for field service management in
                    India. We envision a future where every AMC vendor can run
                    their business efficiently, scale effortlessly, and focus on
                    what matters most - serving their clients.
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
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Why Automet?
                </h2>
                <p className="text-lg text-gray-600">
                  We&apos;re different because we understand your business
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Made in India, for India
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Built by people who understand Indian business culture,
                      payment methods (UPI, cards, net banking), and operational
                      challenges.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg
                        className="w-6 h-6"
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
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Affordable Pricing
                    </h4>
                    <p className="text-gray-600 text-sm">
                      No hidden fees, transparent pricing. Start free, pay as
                      you grow. Designed for businesses of all sizes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Offline-First
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Works even when internet is spotty. Your technicians can
                      complete jobs offline and sync when connected.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <svg
                        className="w-6 h-6"
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
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Fast Setup</h4>
                    <p className="text-gray-600 text-sm">
                      Get started in minutes, not weeks. No complex training
                      required. Intuitive interface designed for field
                      technicians.
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
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Our Values
                </h2>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
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
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
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
                Join hundreds of AMC vendors already on the waitlist. Get early
                access and exclusive benefits.
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
