/**
 * Newsletter Signup Component
 * Captures email addresses for blog content distribution
 */

import { useState, FormEvent } from 'react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'endOfArticle';
  context?: string; // For tracking where signup came from
}

export default function NewsletterSignup({ 
  variant = 'inline',
  context = 'blog'
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          source: context,
          variant 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Success! Check your email to confirm subscription.');
        setEmail('');
        
        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      console.error('Newsletter signup error:', error);
    }
  };

  if (variant === 'inline') {
    return (
      <div className="my-12 p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border-2 border-primary/20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-4">
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Want insights like this in your inbox?
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-6">
            Join 500+ AMC professionals getting weekly tips to grow their business. 
            No spam, unsubscribe anytime.
          </p>

          {/* Form */}
          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}

          {/* Error Message */}
          {status === 'error' && message && (
            <p className="mt-3 text-sm text-red-600">{message}</p>
          )}

          {/* Trust Badge */}
          <p className="mt-4 text-xs text-gray-500">
            ✨ Free forever • 📧 Weekly emails • 🚫 No spam
          </p>
        </div>
      </div>
    );
  }

  // End of article variant
  return (
    <div className="my-12 p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="max-w-xl mx-auto">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Never miss an update
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-6">
          Get notified when we publish new articles about AMC management, 
          field service optimization, and business growth strategies.
        </p>

        {/* Form */}
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              disabled={status === 'loading'}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap text-sm"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {/* Error Message */}
        {status === 'error' && message && (
          <p className="mt-2 text-xs text-red-600">{message}</p>
        )}

        {/* Trust Badge */}
        <p className="mt-3 text-xs text-gray-500">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}

