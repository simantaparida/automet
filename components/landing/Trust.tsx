/**
 * Trust Section
 * Testimonials and India badge
 */

export default function Trust() {
  const testimonials = [
    {
      quote:
        'Before Automet, I was spending 3-4 hours daily just managing paperwork and coordinating with technicians. Now everything is automated. I can focus on growing my business instead of putting out fires.',
      author: 'Rajesh Kumar',
      role: 'Owner, Kumar AC Services',
      location: 'Mumbai',
    },
    {
      quote:
        "The real-time technician tracking is a game-changer. I know exactly where my team is and what they're working on without making endless calls.",
      author: 'Priya Sharma',
      role: 'Operations Manager, TechCare Solutions',
      location: 'Delhi',
    },
    {
      quote:
        "Automet's inventory alerts saved us from multiple stock-outs. We can now plan better and never disappoint our clients.",
      author: 'Amit Patel',
      role: 'Founder, Precision Maintenance',
      location: 'Ahmedabad',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* India Badge */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-5 py-2.5 bg-primary/10 rounded-full border-2 border-primary/20">
            <svg
              className="w-5 h-5 text-primary mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-primary font-bold text-sm">
              Built in India for Indian businesses
            </span>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Trusted by Indian AMC vendors
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              See what business owners like you are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <svg
                  className="w-7 h-7 text-primary/30 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="border-t border-gray-200 pt-3">
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-600 text-xs">{testimonial.role}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
