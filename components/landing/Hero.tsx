/**
 * Landing Page Hero Section
 * Coming Soon hero with CTA for early access
 */

interface HeroProps {
  onPreorderClick: () => void;
}

export default function Hero({ onPreorderClick }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold mb-6 shadow-lg border-2 border-blue-400">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            🔥 Founding Partner Slots: Only 100 Available
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Field Job Management,{' '}
            <span className="text-blue-600">Finally Made Simple</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Built for Indian AMC vendors. Manage technicians, track jobs, handle inventory,
            and get paid faster - all from one powerful platform.
          </p>

          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm sm:text-base">
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No paperwork chaos</span>
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Built for India</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onPreorderClick}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                Claim Founding Partner Spot - ₹499
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-gray-300"
            >
              View Pricing Plans
            </a>
          </div>

          {/* Urgency Note */}
          <p className="mt-6 text-sm text-gray-600 font-medium">
            ⏰ Only <span className="text-blue-600 font-bold">100 Founding Partner slots</span> available • Unlimited pre-orders after
          </p>

          {/* Founding Partner Benefits */}
          <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border-2 border-blue-200 max-w-3xl mx-auto">
            <p className="text-sm font-bold text-blue-700 mb-4 uppercase tracking-wide">👑 Founding Partner Benefits</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                <p className="font-bold text-gray-900 text-sm mb-1">💰 50% OFF</p>
                <p className="text-xs text-gray-600">All plans for 3 months</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                <p className="font-bold text-gray-900 text-sm mb-1">🎯 Beta Access</p>
                <p className="text-xs text-gray-600">Test features early</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                <p className="font-bold text-gray-900 text-sm mb-1">👑 Special Badge</p>
                <p className="text-xs text-gray-600">Recognition forever</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                <p className="font-bold text-gray-900 text-sm mb-1">🚀 Priority Support</p>
                <p className="text-xs text-gray-600">Dedicated onboarding</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <p className="mt-8 text-sm text-gray-500">
            Join 100+ businesses already on the waitlist
          </p>
        </div>
      </div>
    </section>
  );
}
