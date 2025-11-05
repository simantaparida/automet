/**
 * FAQ Section
 * 6 most important FAQs with compact, smooth animations
 */

import { useState } from 'react';

interface FAQProps {
  onContactClick?: () => void;
}

export default function FAQ({ onContactClick }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Reduced to 4 most important FAQs
  const faqs = [
    {
      question: 'What is Automet and who is it for?',
      answer:
        'Automet is a complete field service management platform built specifically for Indian AMC (Annual Maintenance Contract) vendors. It helps you manage technicians, track jobs, handle inventory, and accept payments - all in one place. Perfect for AC service providers, elevator maintenance companies, equipment servicing businesses, and any field service operation.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'We have 4 pricing tiers: Free (forever, 1 site, 3 users), Starter (₹999/mo for 5 sites, 10 techs), Growth (₹2,999/mo for 20 sites, 50 techs), and Business (₹9,999/mo for unlimited sites, 200 techs). All paid plans include 20% discount on annual billing. Early access members get 50% off for 3 months after launch. Need an enterprise solution? Contact us.',
    },
    {
      question: 'What are the early access benefits?',
      answer:
        'By joining the waitlist, you get: (1) First access to Automet when we launch, (2) Exclusive early access benefits and special offers, (3) Priority onboarding with dedicated support, (4) Your feedback helps shape the product, and (5) Be among the first to streamline your AMC operations. No payment required - just join the waitlist!',
    },
    {
      question: 'When will Automet launch?',
      answer:
        "We're launching in Q1 2025! Early access members will get priority onboarding and will be among the first to use the platform. We'll notify you via email when we're ready to onboard you.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We&apos;ve got answers.{' '}
            <a
              href="mailto:support@automet.in"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Contact us
            </a>
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary/40 transition-all duration-300"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-base font-semibold text-gray-900 pr-4 flex-1">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ease-in-out ${
                      openIndex === index ? 'transform rotate-180' : ''
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

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
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

        {/* Still have questions CTA */}
        <div className="text-center mt-12">
          <div className="inline-block bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              We&apos;re here to help. Reach out to our team.
            </p>
            <button
              onClick={onContactClick}
              className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
