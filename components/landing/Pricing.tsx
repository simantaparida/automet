/**
 * Pricing Section
 * Emphasizes Growth plan as most popular
 */

interface PricingProps {
  onPreorderClick: () => void;
}

export default function Pricing({ onPreorderClick }: PricingProps) {
  // 4 pricing tiers including Free
  const plans = [
    {
      name: 'Free',
      subtitle: 'Forever',
      price: '₹0',
      period: 'forever',
      description: 'Solo technicians / tiny vendors',
      features: ['1 site, 3 users max', '30 jobs per month', 'Basic job creation', 'Photo upload (500 MB)', '3 months data history'],
      cta: 'Join Waitlist',
      ctaAction: onPreorderClick,
      popular: false,
    },
    {
      name: 'Starter',
      subtitle: 'Small Teams',
      price: '₹999',
      period: 'per month',
      description: 'Small contractors (2-10 techs)',
      features: ['Up to 5 sites, 10 techs', 'Unlimited jobs', 'Offline mode & sync', 'Recurring jobs', 'Basic inventory tracking', 'Auto PDF reports'],
      cta: 'Join Waitlist',
      ctaAction: onPreorderClick,
      popular: true,
      badge: 'Most Popular',
    },
    {
      name: 'Growth',
      subtitle: 'Scaling Business',
      price: '₹2,999',
      period: 'per month',
      description: 'Growing FM vendors (10-50 techs)',
      features: ['Up to 20 sites, 50 techs', 'Full inventory tracking', 'SLA tracking & analytics', 'Priority email + chat', '10 GB storage', '3 years data retention'],
      cta: 'Join Waitlist',
      ctaAction: onPreorderClick,
      popular: false,
    },
    {
      name: 'Business',
      subtitle: 'Large Teams',
      price: '₹9,999',
      period: 'per month',
      description: 'Large FM partners (50-200 techs)',
      features: ['Unlimited sites, 200 techs', 'Multi-org / multi-branch', 'Custom branding', 'Advanced SLA & analytics', 'Full API access', 'Dedicated manager'],
      cta: 'Join Waitlist',
      ctaAction: onPreorderClick,
      popular: false,
    },
  ];


  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600">
            Simple pricing for teams of all sizes. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards - 4 Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl p-6 ${
                plan.popular
                  ? 'border-4 border-white shadow-2xl md:scale-105 z-10'
                  : 'border-2 border-white shadow-sm'
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
                <p className="text-xs text-gray-500 uppercase tracking-wide">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.price !== 'Custom' && (
                  <span className="text-gray-600 text-sm ml-1">/{plan.period}</span>
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
                      className={`w-5 h-5 ${
                        plan.popular ? 'text-primary' : 'text-primary'
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
                onClick={plan.ctaAction}
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

        {/* Footer Note */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-600 mb-4">
            Need an enterprise solution? <a href="mailto:support@automet.in" className="text-primary hover:text-primary/80 font-semibold">Contact us</a>
          </p>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
