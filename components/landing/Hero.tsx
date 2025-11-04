/**
 * Landing Page Hero Section
 * Coming Soon hero with CTA for early access
 */

interface HeroProps {
  onPreorderClick: () => void;
}

export default function Hero({ onPreorderClick }: HeroProps) {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Launching Soon
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Tired of juggling jobs, payments, and technicians across WhatsApp and Excel?
          </h1>

          {/* Sub-heading */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
            Automet brings it all under one roof —{' '}
            <span className="text-primary font-semibold">built for Indian AMC vendors</span>.
          </p>

          {/* Single CTA */}
          <div className="mb-8">
            <button
              onClick={onPreorderClick}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-bold text-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center">
                Join Early Access – Get 3 Months Free
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-accent-pink mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-accent-pink mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Built in India
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
