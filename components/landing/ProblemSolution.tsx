/**
 * Problem-Solution Section
 * Compact side-by-side 2-column comparison layout
 */

interface ProblemSolutionProps {
  onPreorderClick?: () => void;
}

export default function ProblemSolution({
  onPreorderClick,
}: ProblemSolutionProps) {
  // Reduced to 3 key pain points (most impactful)
  const comparisons = [
    {
      problem: {
        title: 'Paperwork Chaos',
        description:
          'Job sheets scattered everywhere. Service reports in WhatsApp. No central record.',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      },
      solution: {
        title: 'Everything in One Place',
        description:
          'All jobs, clients, and reports organized in one dashboard. Find anything in seconds.',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    },
    {
      problem: {
        title: 'Technician Confusion',
        description:
          'Where is Raju? Did Suresh complete the job? Endless calls and WhatsApp messages.',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
      solution: {
        title: 'Track Technicians Live',
        description:
          "See who's where, what they're working on, and job status in real-time. No more guessing.",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
      },
    },
    {
      problem: {
        title: 'Payment Delays',
        description:
          'Manual invoices. Follow-ups taking days. Missing paperwork. 5% revenue lost to slow collections.',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      solution: {
        title: 'Get Paid 5x Faster',
        description:
          'Auto-generate invoices instantly. Send payment links via SMS. Accept UPI, cards, net banking.',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-3">
            PROBLEM VS SOLUTION
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Stop losing revenue. Start growing faster.
          </h2>
          <p className="text-base text-gray-600">
            See how Automet solves the biggest pain points for Indian AMC
            vendors
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="max-w-5xl mx-auto space-y-4">
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className="grid md:grid-cols-2 gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Problem Card */}
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-md flex items-center justify-center text-red-600 mt-0.5">
                    {comparison.problem.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-block px-2 py-0.5 bg-red-200 text-red-800 text-xs font-bold rounded uppercase">
                        Problem
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">
                      {comparison.problem.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-snug">
                      {comparison.problem.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Solution Card */}
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-md flex items-center justify-center text-green-600 mt-0.5">
                    {comparison.solution.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-block px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded uppercase">
                        Solution
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">
                      {comparison.solution.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-snug">
                      {comparison.solution.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-600 mb-3">
            Ready to solve these problems?
          </p>
          <button
            onClick={() => {
              if (onPreorderClick) {
                onPreorderClick();
              } else {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </section>
  );
}
