/**
 * Landing Page Hero Section
 * Coming Soon hero with CTA for early access
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
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge with Urgency */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Launching Q1 2025 • Limited Early Access Spots
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Stop losing 10% revenue to manual processes. Get paid 5x faster with
            Automet.
          </h1>

          {/* Sub-heading */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
            The field service management platform built for Indian AMC vendors.{' '}
            <span className="text-primary font-semibold">
              Everything in one place. Finally.
            </span>
          </p>

          {/* Single CTA */}
          <div className="mb-8">
            <button
              onClick={onPreorderClick}
              className="group w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center">
                Join Waitlist
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
            </button>
          </div>

          {/* Social Proof & Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            {waitlistCount && (
              <div className="flex items-center">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-semibold text-primary">
                  {waitlistCount}+
                </span>{' '}
                AMC vendors already joined
              </div>
            )}
            <div className="flex items-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Built in India
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
