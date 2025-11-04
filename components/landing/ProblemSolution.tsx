/**
 * Problem-Solution Section
 * Storytelling highlighting pain points of Indian AMC vendors
 */

export default function ProblemSolution() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Problem Statement */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
              THE PROBLEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Running an AMC business shouldn't feel like chaos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every day, thousands of Indian AMC vendors struggle with the same problems.
              Sound familiar?
            </p>
          </div>

          {/* Pain Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pain Point 1 */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Lost in Paperwork
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Job sheets scattered everywhere. Service reports in WhatsApp. Client data in Excel.
                    Finding anything takes forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Technician Chaos
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "Where is Raju?" "Did Suresh complete the AC job?" Endless calls.
                    No real-time updates. Pure guesswork.
                  </p>
                </div>
              </div>
            </div>

            {/* Pain Point 3 */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Inventory Nightmares
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "We're out of compressors!" Spare parts running low. No alerts.
                    Jobs delayed because you didn't know stock was empty.
                  </p>
                </div>
              </div>
            </div>

            {/* Pain Point 4 */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Payment Delays
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Manual invoices. Follow-ups taking days. Clients saying "I'll pay next week"
                    because paperwork is missing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Statement */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              THE SOLUTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              One platform. Everything organized. Finally.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Automet brings order to the chaos. Built specifically for Indian AMC vendors
              who are tired of juggling multiple systems.
            </p>
          </div>

          {/* Solution Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Everything in One Place
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Clients, sites, assets, jobs, inventory. All organized.
                Find anything in seconds, not hours.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Technicians Live
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                See who's where. Check-in/out tracking. Know job status
                without making a single call.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Paid Faster
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Auto-generate invoices. Send payment links instantly.
                Accept UPI, cards, everything.
              </p>
            </div>
          </div>

          {/* Testimonial/Quote */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-start">
              <svg className="w-10 h-10 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <div className="ml-6">
                <p className="text-lg text-gray-700 italic mb-4 leading-relaxed">
                  "Before Automet, I was spending 3-4 hours daily just managing paperwork and coordinating
                  with technicians. Now everything is automated. I can focus on growing my business instead
                  of putting out fires."
                </p>
                <div>
                  <p className="font-semibold text-gray-900">Rajesh Kumar</p>
                  <p className="text-sm text-gray-600">Owner, Kumar AC Services, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
