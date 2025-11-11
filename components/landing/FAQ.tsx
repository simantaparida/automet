/**
 * FAQ Section
 * Simplified FAQs with 6 high-impact questions
 */

import { useState } from 'react';

interface FAQProps {
  onContactClick?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ({ onContactClick }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'What is Automet?',
      answer:
        'Automet is a complete field service management platform built for Indian AMC vendors. It helps you manage technicians, track jobs in real-time, handle billing & payments, and control inventory - all from one mobile-first dashboard.',
    },
    {
      question: 'Who should use Automet?',
      answer:
        'Any business with field technicians: AC service centers, elevator maintenance, equipment servicing, plumbing, electrical. Perfect for teams from 1 to 200+ technicians.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'Free forever for solo technicians (1 site, 3 users). Paid plans start at ₹999/month for teams up to 10 technicians. Check our pricing page for complete details and annual discounts.',
    },
    {
      question: 'Does it work offline?',
      answer:
        'Yes! Technicians can work fully offline on the mobile app. All data syncs automatically when internet connection returns. Perfect for areas with poor 2G/3G coverage.',
    },
    {
      question: 'When does Automet launch?',
      answer:
        'Q1 2026. Join our waitlist now to get early access, priority onboarding, and an exclusive 50% discount for the first 3 months.',
    },
    {
      question: 'How do I get paid faster with Automet?',
      answer:
        'Auto-generate invoices instantly after job completion and send payment links via SMS/WhatsApp. Customers pay via UPI, cards, or net banking - money hits your account in minutes, not days.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold mb-3">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Got questions? We&apos;ve got answers.{' '}
            <a
              href="mailto:support@automet.app"
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
                className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white transition-colors duration-200"
                >
                  <span className="text-base font-semibold text-gray-900 pr-4 flex-1">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ease-in-out ${
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
                  <div className="px-6 pb-4 text-gray-700 text-sm leading-relaxed bg-white border-t border-gray-200 pt-4">
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
              Didn&apos;t find your answer?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Chat with our team or email{' '}
              <a
                href="mailto:support@automet.app"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                support@automet.app
              </a>
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
