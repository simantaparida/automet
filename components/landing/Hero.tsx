/**
 * Landing Page Hero Section
 * Conversion-optimized hero with clear value proposition and urgency
 */

import { useEffect, useState } from 'react';

interface HeroProps {
  onPreorderClick: () => void;
}

export default function Hero({ onPreorderClick }: HeroProps) {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch waitlist count
    fetch('/api/admin/waitlist-count')
      .then((res) => res.json())
      .then((data: { count?: number }) => {
        if (data.count) {
          setWaitlistCount(data.count);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch waitlist count:', err);
        // Set default if API fails
        setWaitlistCount(500);
      });
  }, []);

  return (
    <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left px-2 sm:px-6 lg:px-0">
              {/* Urgency Badge */}
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold mb-6 animate-pulse">
                <svg
                  className="w-3 h-3 mr-1.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Only 47 Early Access Spots Left • Closes Dec 31
              </div>

              {/* Main Headline - Pain + Promise */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
                Stop losing{' '}
                <span className="text-red-600 relative">
                  up to ₹50,000+/month
                  <svg
                    className="absolute -bottom-2 left-0 right-0 h-3 text-red-600 opacity-50"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 10"
                  >
                    <path
                      d="M0,8 Q25,2 50,8 T100,8"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </span>{' '}
                to manual chaos
              </h1>

              {/* Sub-headline with Benefit */}
              <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed font-medium">
                Join{' '}
                <span className="text-primary font-bold">500+ AMC vendors</span>{' '}
                who are{' '}
                <span className="text-primary font-bold">
                  getting paid 5x faster
                </span>{' '}
                and{' '}
                <span className="text-primary font-bold">
                  recovering 10% lost revenue
                </span>{' '}
                with Automet
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button
                  onClick={onPreorderClick}
                  className="group relative px-6 py-3 bg-gradient-to-r from-primary to-orange-600 text-white rounded-lg font-bold text-base hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 overflow-hidden whitespace-nowrap"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Claim Your Early Access Spot
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <a
                  href="#roi-calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('roi-calculator');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg font-bold text-base hover:bg-primary hover:text-white transition-all duration-300 shadow-md whitespace-nowrap"
                >
                  Calculate Your Savings
                </a>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mb-8 text-center sm:text-left">
                * Based on average metrics. Actual results vary by business
                size.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs">
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Free to join</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">No credit card</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">50% off first 3 months</span>
                </div>
              </div>
            </div>

            {/* Right: Visual/Social Proof */}
            <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
              {/* Social Proof Card */}
              <div className="relative bg-white rounded-xl p-5 border-2 border-primary/20 shadow-xl w-full max-w-sm">
                <div className="flex items-center mb-3">
                  <div className="flex -space-x-2 mr-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white flex items-center justify-center text-lg">
                      🤖
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-white flex items-center justify-center text-lg">
                      👨‍💼
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 border-2 border-white flex items-center justify-center text-lg">
                      👩‍💻
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 border-2 border-white flex items-center justify-center text-lg">
                      🧑‍🔧
                    </div>
                  </div>
                  <div>
                    {waitlistCount && (
                      <div className="text-xl font-bold text-gray-900">
                        {waitlistCount}+
                      </div>
                    )}
                    <div className="text-xs text-gray-600">
                      AMC vendors joined
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="border-l-4 border-primary pl-3 mb-3">
                  <p className="text-sm text-gray-700 italic mb-2">
                    &quot;We were losing ₹40,000/month in missed billing.
                    Automet helped us recover it all. Best decision we
                    made.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/20 mr-2"></div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">
                        Rajesh Kumar
                      </div>
                      <div className="text-[10px] text-gray-500">
                        AC Service, Mumbai
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-base font-bold text-primary">
                      ₹2.5L+
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Avg Revenue Saved
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-primary">
                      15hrs
                    </div>
                    <div className="text-[10px] text-gray-600">Saved/Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-primary">
                      4.8/5
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Satisfaction
                    </div>
                  </div>
                </div>

                {/* ₹50K+ Badge - positioned at bottom-left of card, moved further left to avoid overlap */}
                <div
                  className="absolute -bottom-3 -left-8 bg-green-50 rounded-lg p-1.5 border-2 border-green-200 animate-bounce-subtle z-10 shadow-md"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="text-[10px] font-bold text-green-700 leading-none">
                    ₹50K+
                  </div>
                  <div className="text-[8px] text-green-600 leading-tight">
                    Saved/Month
                  </div>
                </div>
              </div>

              {/* Floating Rocket Icon */}
              <div className="absolute -top-3 -right-3 bg-primary/10 rounded-lg p-2 border-2 border-primary/20 animate-bounce-subtle z-10">
                <div className="text-lg">🚀</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
