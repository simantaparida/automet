/**
 * FAQ Section
 * Simplified FAQs with tabs and expand indicators
 */

import { useState } from 'react';

interface FAQProps {
  onContactClick?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  fullAnswer?: string; // Optional expanded explanation
}

interface FAQCategory {
  name: string;
  faqs: FAQItem[];
}

export default function FAQ({ onContactClick }: FAQProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqCategories: FAQCategory[] = [
    {
      name: 'Product Basics',
      faqs: [
        {
          question: 'What is Automet?',
          answer:
            'Automet is a mobile app for Indian AC service, elevator maintenance, and field service companies to track technicians, send invoices via SMS, and get paid instantly via UPI.',
        },
        {
          question: 'Who should use Automet?',
          answer:
            'Any business with field technicians: AC service centers, elevator maintenance, equipment servicing, plumbing, electrical. From solo technicians to 200+ tech teams.',
        },
        {
          question: 'How much does it cost?',
          answer:
            'Free forever for solo technicians. Paid plans start at ₹999/month. See our pricing page for details and annual discounts.',
        },
      ],
    },
    {
      name: 'Technical',
      faqs: [
        {
          question: 'Does it work offline?',
          answer:
            'Yes. Technicians can work fully offline on mobile app. All data syncs automatically when internet returns. Perfect for poor 2G/3G areas.',
        },
        {
          question: 'How secure is my customer data?',
          answer:
            'Bank-level encryption. All data stored on servers in India. You own your data and can export it anytime.',
        },
      ],
    },
    {
      name: 'Payment & Data',
      faqs: [
        {
          question: 'What payment methods does Automet support?',
          answer:
            'Customers can pay via UPI, credit/debit cards, or net banking. Money reaches your account within minutes (not days like bank transfer).',
        },
        {
          question: 'Can I import my existing customer data?',
          answer:
            "Yes. We'll help you import customers and historical data during onboarding at no extra cost.",
        },
      ],
    },
    {
      name: 'Launch & Access',
      faqs: [
        {
          question: 'When does Automet launch?',
          answer:
            'Q1 2025. Early access members get priority onboarding and 50% discount for 3 months.',
        },
      ],
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const currentFAQs = faqCategories[activeTab].faqs;

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

        {/* Tabs */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200">
            {faqCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(index);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                  activeTab === index
                    ? 'text-primary border-primary'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {currentFAQs.map((faq, index) => (
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {openIndex !== index && (
                      <span className="text-xs text-gray-400 italic">(expand)</span>
                    )}
                    <svg
                      className={`w-5 h-5 text-primary transition-transform duration-300 ease-in-out ${
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
                  </div>
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
              Didn&apos;t find your answer?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Chat with our team or email{' '}
              <a
                href="mailto:support@automet.in"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                support@automet.in
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
