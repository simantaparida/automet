/**
 * FAQ Section
 * Frequently Asked Questions
 */

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Automet and who is it for?',
      answer:
        'Automet is a complete field service management platform built specifically for Indian AMC (Annual Maintenance Contract) vendors. It helps you manage technicians, track jobs, handle inventory, and accept payments - all in one place. Perfect for AC service providers, elevator maintenance companies, equipment servicing businesses, and any field service operation.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'We have 4 pricing tiers: Free (forever, 1 site, 3 users), Starter (₹999/mo for 5 sites, 10 techs), Growth (₹2,999/mo for 20 sites, 50 techs), and Business (₹9,999/mo for unlimited sites, 200 techs). All paid plans include 20% discount on annual billing. Early access members get 50% off for 3 months after launch.',
    },
    {
      question: 'What does the ₹499 early access booking include?',
      answer:
        'The ₹499 is a one-time deposit towards your first subscription after launch. As a Founding Partner, you get: (1) 50% discount on ALL paid plans for 3 months after launch, (2) Exclusive beta access to test features early, (3) Founding Partner badge and recognition, (4) Priority onboarding with dedicated support, and (5) Discount voucher applicable to your subscription. Limited to first 100 slots only!',
    },
    {
      question: 'Can I change plans mid-month or downgrade?',
      answer:
        'Yes! You can upgrade your plan anytime and the changes take effect immediately. For downgrades, the change will be applied at the end of your current billing cycle. Your data is safe - we keep your data based on your plan\'s retention period (Free: 3 months, Starter: 1 year, Growth: 3 years, Business: 5 years).',
    },
    {
      question: 'What happens after the first 100 early access slots?',
      answer:
        'The first 100 slots are reserved for Founding Partners who get all the exclusive benefits (₹499 deposit + 50% off + beta access + special badge). After that, we accept unlimited pre-orders, but without the Founding Partner benefits. These customers will still be added to the launch waitlist and get standard early access.',
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer:
        'Yes! Starter plan subscribers get a 14-day Growth trial so you can test advanced features like SLA tracking and full inventory management before committing. You can also start with the Free plan forever and upgrade only when you need more sites or technicians.',
    },
    {
      question: 'Do I need technical knowledge to use Automet?',
      answer:
        'Not at all! Automet is designed to be simple and intuitive. If you can use WhatsApp, you can use Automet. We also provide step-by-step onboarding and video tutorials. Our support team is always available to help you get started.',
    },
    {
      question: 'Can I import my existing client data?',
      answer:
        'Yes! We provide easy data import from Excel/CSV files. You can upload your existing client list, sites, assets, and other data during setup. Our onboarding team will help you with this process.',
    },
    {
      question: 'How does the mobile app work?',
      answer:
        'Technicians get a dedicated mobile app (Android & iOS) where they can view assigned jobs, check in/out, update job status, upload photos, add notes, and mark jobs as complete. Everything syncs in real-time with the main dashboard.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use bank-grade encryption (256-bit SSL) for all data transmission and storage. Your data is backed up daily and stored in secure data centers in India. We are compliant with industry security standards and will never share your data with third parties.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'For subscription payments, we accept UPI, credit/debit cards, net banking, and wallets. For the ₹499 early access booking, we use Razorpay - a trusted Indian payment gateway that supports all major payment methods.',
    },
    {
      question: 'Can I try before committing to a paid plan?',
      answer:
        'Yes! Our Free plan is available forever with no credit card required. You can start with the Free plan and upgrade to Pro anytime when you need more features or want to add more technicians.',
    },
    {
      question: 'What if I\'m not satisfied?',
      answer:
        'We offer a 30-day money-back guarantee. If you\'re not happy with Automet within the first 30 days of your Pro subscription, we\'ll refund your payment - no questions asked. Your early access booking fee of ₹499 is also refundable within 14 days.',
    },
    {
      question: 'When will Automet launch?',
      answer:
        'We\'re launching in Q1 2025! Early access members will get priority onboarding and will be among the first to use the platform. We\'ll notify you via email when we\'re ready to onboard you.',
    },
    {
      question: 'Do you offer training and support?',
      answer:
        'Yes! All customers get access to video tutorials, help documentation, and email support. Pro plan customers get priority support with faster response times. Early access members get dedicated onboarding calls with our team.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We've got answers. Can't find what you're looking for?{' '}
            <a href="mailto:support@automet.in" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact us
            </a>
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform ${
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
                {openIndex === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-12">
          <div className="inline-block bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-4">
              We're here to help. Reach out to our team.
            </p>
            <a
              href="mailto:support@automet.in"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
