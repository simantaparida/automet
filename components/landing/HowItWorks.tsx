/**
 * How It Works Section
 * 3-step process to get started
 */

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Sign Up & Set Up',
      description: 'Create your account, add your team, clients, and existing assets. Takes just 30 minutes.',
      details: [
        'Import existing client data',
        'Add your technicians',
        'Configure your services',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'Create & Assign Jobs',
      description: 'Start creating jobs, assign them to technicians, and track everything in real-time.',
      details: [
        'Create jobs in seconds',
        'Assign to technicians instantly',
        'Get live status updates',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'Get Paid & Grow',
      description: 'Invoice automatically, accept payments online, and watch your business grow with clear insights.',
      details: [
        'Auto-generate invoices',
        'Accept UPI & card payments',
        'Track revenue & growth',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4 animate-slide-down">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
            Get started in 3 simple steps
          </h2>
          <p className="text-lg text-gray-600 animate-fade-in">
            From setup to your first job - you'll be up and running in no time.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent-pink/30" style={{ top: '6rem' }} />

            {/* Steps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
              {steps.map((step, index) => (
                <div key={index} className="relative animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                  {/* Step Card */}
                  <div className="bg-white rounded-xl border-2 border-primary/20 p-8 hover:border-primary/40 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                    {/* Step Number Badge */}
                    <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg animate-scale-in">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="text-primary mb-6 mt-4">
                      {step.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details List */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <svg
                            className="w-5 h-5 text-accent-pink mr-2 flex-shrink-0"
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
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arrow (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-24 -right-6 text-primary/30">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="inline-block bg-gradient-to-br from-primary/10 via-secondary/10 to-accent-pink/10 rounded-2xl p-8 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl">
              Join the waitlist now and be among the first to access Automet when we launch. Get early access benefits and priority onboarding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#pricing"
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                View Pricing
              </a>
              <a
                href="#faq"
                className="px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 border-2 border-primary/20 hover:border-primary/40"
              >
                Have Questions?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
