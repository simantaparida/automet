/**
 * Problem-Solution Section
 * Two-column visual storytelling layout
 */

export default function ProblemSolution() {
  const problems = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Paperwork Chaos',
      description: 'Job sheets scattered everywhere. Service reports in WhatsApp.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Technician Confusion',
      description: 'Where is Raju? Did Suresh complete the job? Endless calls.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Inventory Issues',
      description: 'Out of stock. No alerts. Jobs delayed unexpectedly.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Payment Delays',
      description: 'Manual invoices. Follow-ups taking days. Missing paperwork.',
    },
  ];

  const solutions = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Everything in One Place',
      description: 'Clients, sites, assets, jobs. All organized. Find anything in seconds.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Track Technicians Live',
      description: 'See who\'s where. Check-in/out tracking. Know status without calling.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Smart Inventory Alerts',
      description: 'Low stock alerts. Usage tracking. Never run out unexpectedly.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Get Paid Faster',
      description: 'Auto-generate invoices. Send payment links. Accept UPI, cards.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Problem Section - Two Column Layout */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              THE PROBLEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Running an AMC business shouldn't feel like chaos
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    {problem.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solution Section - Two Column Layout */}
        <div>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              THE SOLUTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              One platform. Everything organized. Finally.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Automet brings order to the chaos. Built specifically for Indian AMC vendors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition-all duration-300 hover:border-secondary animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {solution.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {solution.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
