/**
 * Contact Page
 * Public page with office information and contact options
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/landing/Navigation';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';
import ContactSupportModal from '@/components/landing/ContactSupportModal';

const CONTACT_EMAIL = 'info@automet.app';
const CONTACT_PHONE = '+91 89087 12386';
const WHATSAPP_URL = 'https://wa.me/918908712386';

export default function ContactPage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Contact Automet | Speak with the Team</title>
        <meta
          name="description"
          content="Reach the Automet team for product questions, partnership enquiries, or support. Call, WhatsApp, email, or send us a message directly from this page."
        />
        <link rel="canonical" href="https://automet.in/contact" />
      </Head>

      <div className="min-h-screen bg-white">
        <Navigation />

        {/* Hero & Overview */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-gradient-to-b from-white via-primary/5 to-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 -left-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-16 -right-8 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm uppercase tracking-wide">
                Let&apos;s build reliable operations together
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Talk to the Automet team
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                Whether you&apos;re evaluating job tracking software or already on the waitlist, our founding team is hands-on.
                Expect honest guidance, local context, and fast follow-ups.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M5 5l14 14" />
                  </svg>
                  Avg. first response in under 1 business hour
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L15 12l-5.25-5" />
                  </svg>
                  100% team based in Bengaluru, India
                </div>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-base shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send us a message
                </button>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-green-500 text-white rounded-xl font-semibold text-base shadow-lg hover:bg-green-600 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4C2.897 2 2 2.897 2 4v16c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-5.189 13.59c-.234.667-1.354 1.273-1.919 1.353-.491.07-1.118.101-1.805-.114-3.172-1.012-5.23-4.015-5.391-4.205-.158-.19-1.286-1.712-1.286-3.266s.818-2.325 1.11-2.643c.292-.316.631-.395.842-.395.211 0 .421.002.606.011.195.009.456-.074.714.546.259.621.88 2.146.958 2.3.079.158.131.348.026.562-.105.216-.158.348-.316.537-.157.189-.332.424-.474.569-.157.157-.321.327-.138.642.186.316.833 1.368 1.788 2.214 1.231 1.099 2.269 1.44 2.585 1.597.316.158.502.131.684-.079.183-.211.788-.921.999-1.236.21-.316.421-.263.714-.158.296.105 1.87.882 2.188 1.038.316.158.525.237.6.369.079.131.079.751-.157 1.418z" />
                  </svg>
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Reach us directly</h2>
                  <p className="mt-3 text-lg text-gray-600">
                    Speak with founders, customer success, or implementation experts. We respond during business hours and monitor WhatsApp for urgent queries.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z" />
                      </svg>
                    </div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Call us</p>
                    <a
                      href="tel:+918908712386"
                      className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                    >
                      {CONTACT_PHONE}
                    </a>
                    <p className="mt-2 text-sm text-gray-500">Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                  </div>

                  <div className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4C2.897 2 2 2.897 2 4v16c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-5.189 13.59c-.234.667-1.354 1.273-1.919 1.353-.491.07-1.118.101-1.805-.114-3.172-1.012-5.23-4.015-5.391-4.205-.158-.19-1.286-1.712-1.286-3.266s.818-2.325 1.11-2.643c.292-.316.631-.395.842-.395.211 0 .421.002.606.011.195.009.456-.074.714.546.259.621.88 2.146.958 2.3.079.158.131.348.026.562-.105.216-.158.348-.316.537-.157.189-.332.424-.474.569-.157.157-.321.327-.138.642.186.316.833 1.368 1.788 2.214 1.231 1.099 2.269 1.44 2.585 1.597.316.158.502.131.684-.079.183-.211.788-.921.999-1.236.21-.316.421-.263.714-.158.296.105 1.87.882 2.188 1.038.316.158.525.237.6.369.079.131.079.751-.157 1.418z" />
                      </svg>
                    </div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">WhatsApp</p>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                    >
                      Chat on WhatsApp
                    </a>
                    <p className="mt-2 text-sm text-gray-500">Tap to open a secure WhatsApp chat</p>
                  </div>

                  <div className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7m4-3h-8" />
                      </svg>
                    </div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-lg font-semibold text-gray-900 break-all hover:text-primary transition-colors"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    <p className="mt-2 text-sm text-gray-500">We reply within one business day</p>
                  </div>

                  <div className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Registered office</p>
                    <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                      JP Nagar, Bengaluru<br />
                      Karnataka, India <span className="text-gray-500">560078</span>
                    </p>
                    <Link
                      href="https://maps.app.goo.gl/z4Do7Fs5iM5U6H5P8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80"
                    >
                      View on Google Maps
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5">
                  <h3 className="text-lg font-semibold text-gray-900">How we handle enquiries</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      We triage every message manually—no chatbots, no outsourcing.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      Product demos are currently 1:1 with a founder.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      Security or data concerns go straight to the engineering team.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Visit our office</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      We&apos;re available for scheduled meetings and pilot workshops. Call or WhatsApp us before dropping by so we can host you properly.
                    </p>
                  </div>
                  <iframe
                    title="Automet office location"
                    className="w-full h-72 border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=JP%20Nagar,%20Bengaluru,%20Karnataka,%20India,%20560078&output=embed"
                    allowFullScreen
                  />
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Support & availability</h3>
                  <dl className="mt-4 space-y-4 text-sm text-gray-600">
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-3">
                      <dt className="font-medium text-gray-900">Support hours</dt>
                      <dd>Monday – Saturday, 9:00 AM to 7:00 PM IST</dd>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-3">
                      <dt className="font-medium text-gray-900">Emergency coverage</dt>
                      <dd>On-call for critical outages 24/7</dd>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-3">
                      <dt className="font-medium text-gray-900">Response commitment</dt>
                      <dd>Initial acknowledgement in &lt; 60 minutes</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-900">Legal</dt>
                      <dd>Automet Technologies Pvt. Ltd. (pre-incorporation)</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-gray-400">
                    By contacting us, you agree to our{' '}
                    <Link href="/privacy-policy" className="text-primary font-semibold hover:text-primary/80">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms-of-service" className="text-primary font-semibold hover:text-primary/80">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center bg-white/70 backdrop-blur rounded-3xl border border-primary/20 p-10 shadow-xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Ready to modernise your field service operations?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Share a few details about your organisation and we&apos;ll set up a personalised walkthrough of Automet—tailored to your service workflows.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-base shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Book a discovery call
                </button>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-green-500 text-white rounded-xl font-semibold text-base shadow-lg hover:bg-green-600 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4C2.897 2 2 2.897 2 4v16c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-5.189 13.59c-.234.667-1.354 1.273-1.919 1.353-.491.07-1.118.101-1.805-.114-3.172-1.012-5.23-4.015-5.391-4.205-.158-.19-1.286-1.712-1.286-3.266s.818-2.325 1.11-2.643c.292-.316.631-.395.842-.395.211 0 .421.002.606.011.195.009.456-.074.714.546.259.621.88 2.146.958 2.3.079.158.131.348.026.562-.105.216-.158.348-.316.537-.157.189-.332.424-.474.569-.157.157-.321.327-.138.642.186.316.833 1.368 1.788 2.214 1.231 1.099 2.269 1.44 2.585 1.597.316.158.502.131.684-.079.183-.211.788-.921.999-1.236.21-.316.421-.263.714-.158.296.105 1.87.882 2.188 1.038.316.158.525.237.6.369.079.131.079.751-.157 1.418z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Need help fast? Call us at{' '}
                <a href="tel:+918908712386" className="text-primary font-semibold hover:text-primary/80">
                  {CONTACT_PHONE}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <Footer />

        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
        />

        <ContactSupportModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
        />
      </div>
    </>
  );
}


