/**
 * Pricing Section
 * Pricing tiers preview for the landing page
 */

interface PricingProps {
  onPreorderClick: () => void;
}

export default function Pricing({ onPreorderClick }: PricingProps) {
  const plans = [
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
        'Self-help docs',
      ],
      cta: 'Start Free',
      popular: false,
      comingSoon: false,
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
        'Email support',
        '1 year data retention',
      ],
      cta: 'Book Early Access',
      popular: true,
      discount: '50% off for 3 months',
      comingSoon: false,
      trial: '14-day Growth trial',
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
        'Optional API/integrations',
      ],
      cta: 'Book Early Access',
      popular: false,
      discount: '50% off for 3 months',
      comingSoon: false,
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
      cta: 'Book Early Access',
      popular: false,
      discount: '50% off for 3 months',
      comingSoon: false,
    },
    {
      name: 'Enterprise',
      subtitle: 'Custom Solution',
      price: 'Custom',
      period: 'contact us',
      description: '200+ technicians & custom needs',
      features: [
        'Everything in Business',
        'Unlimited technicians',
        'White-label solution',
        'Custom integrations',
        'SLA guarantees',
        'On-premise deployment option',
      ],
      cta: 'Contact Sales',
      popular: false,
      comingSoon: false,
      enterprise: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600">
            Start free, upgrade as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Early Access Banner */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white shadow-xl border-4 border-blue-400">
            <div className="flex items-center justify-center mb-3">
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <p className="text-sm font-bold uppercase tracking-wide">🔥 Founding Partner Offer - Only 100 Slots</p>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Book Early Access - Only ₹499
            </h3>
            <p className="text-blue-100 text-base sm:text-lg max-w-3xl mx-auto mb-6 leading-relaxed">
              One-time deposit towards your first subscription + Exclusive founding partner benefits
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl mb-2">💰</div>
                <p className="font-semibold text-sm mb-1">50% OFF</p>
                <p className="text-xs text-blue-100">All paid plans for 3 months after launch</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl mb-2">🎯</div>
                <p className="font-semibold text-sm mb-1">Beta Access</p>
                <p className="text-xs text-blue-100">Test features before everyone else</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl mb-2">👑</div>
                <p className="font-semibold text-sm mb-1">Founding Partner</p>
                <p className="text-xs text-blue-100">Exclusive badge & recognition</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl mb-2">🚀</div>
                <p className="font-semibold text-sm mb-1">Priority Support</p>
                <p className="text-xs text-blue-100">Dedicated onboarding & setup help</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={onPreorderClick}
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Claim Your Spot Now →
              </button>
              <p className="text-xs text-blue-200 mt-3">
                ⏰ Limited to first 100 slots • Unlimited pre-orders accepted after that
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[1400px] mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg ${
                plan.popular ? 'border-4 border-blue-500' : 'border-2 border-gray-200'
              } transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Trial Badge */}
              {plan.trial && (
                <div className="absolute -top-4 right-4">
                  <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md">
                    {plan.trial}
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Name & Subtitle */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {!plan.enterprise && (
                    <span className="text-gray-600 text-sm ml-1">/{plan.period}</span>
                  )}
                  {plan.enterprise && (
                    <span className="text-gray-600 text-sm ml-1">/month</span>
                  )}
                </div>

                {/* Discount Badge */}
                {plan.discount && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {plan.discount}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 mb-6 text-xs leading-relaxed">
                  {plan.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-xs">
                      <svg
                        className={`w-4 h-4 ${
                          plan.popular ? 'text-blue-500' : 'text-green-500'
                        } mr-2 flex-shrink-0 mt-0.5`}
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
                  onClick={plan.discount ? onPreorderClick : undefined}
                  disabled={plan.comingSoon}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                    plan.popular || plan.discount
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                      : plan.enterprise
                      ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                      : plan.comingSoon
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">
            Have questions about pricing?
          </p>
          <a
            href="#faq"
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Check our FAQ →
          </a>
        </div>

        {/* Money Back Guarantee */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            30-Day Money Back Guarantee
          </h3>
          <p className="text-gray-600 text-sm">
            Not satisfied? Get a full refund within 30 days. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}
