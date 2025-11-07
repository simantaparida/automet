/**
 * Exit-Intent Popup Component
 * Captures emails when user is about to leave the page
 */

import { useState, useEffect, FormEvent } from 'react';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen/dismissed the popup in this session
    const dismissed = sessionStorage.getItem('exit_popup_dismissed');
    if (dismissed) return;

    // Check if user has already subscribed
    const subscribed = localStorage.getItem('newsletter_subscribed');
    if (subscribed) return;

    // Track mouse movement to detect exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      // If mouse moves to top of screen (likely to close tab/navigate away)
      if (e.clientY <= 10 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Show popup after 30 seconds of inactivity (backup trigger)
    const inactivityTimer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(inactivityTimer);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('exit_popup_dismissed', 'true');
  };

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
          source: 'blog-exit-intent',
          variant: 'exit-popup'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Success! Check your email to confirm.');
        localStorage.setItem('newsletter_subscribed', 'true');
        
        // Close popup after 3 seconds
        setTimeout(() => {
          handleClose();
        }, 3000);
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

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative pointer-events-auto animate-slide-up-fade"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Content */}
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            Wait! Don't miss out 🚀
          </h3>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            Get exclusive AMC management insights delivered to your inbox. 
            <span className="font-semibold text-gray-900"> Join 500+ professionals</span> already subscribed.
          </p>

          {status === 'success' ? (
            <div className="flex items-center gap-3 text-green-600 font-medium py-4">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{message}</span>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status === 'loading'}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {status === 'loading' ? 'Subscribing...' : 'Get Free Tips'}
                  </button>
                </div>

                {status === 'error' && message && (
                  <p className="mt-3 text-sm text-red-600">{message}</p>
                )}
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No spam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </>
          )}

          {/* No Thanks Link */}
          {status !== 'success' && (
            <button
              onClick={handleClose}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
            >
              No thanks, I'll miss out
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.4s ease-out;
        }
      `}</style>
    </>
  );
}

