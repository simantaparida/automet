/**
 * Pre-order Modal Component
 * Simplified waitlist signup form
 */

import { useState, FormEvent } from 'react';

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  contact_name: string;
  email: string;
  phone: string;
  org_name: string;
  tech_count: string;
  city: string;
  plan_interest: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function PreorderModal({ isOpen, onClose }: PreorderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    contact_name: '',
    email: '',
    phone: '',
    org_name: '',
    tech_count: '',
    city: '',
    plan_interest: 'starter',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email is required
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    // Phone is required
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }

    // Contact name is optional but if provided, must be valid
    if (formData.contact_name && formData.contact_name.length < 2) {
      newErrors.contact_name = 'Name must be at least 2 characters';
    }

    // Org name is optional but if provided, must be valid
    if (formData.org_name && formData.org_name.length < 2) {
      newErrors.org_name = 'Organization name must be at least 2 characters';
    }

    // Tech count is optional but if provided, must be valid
    if (
      formData.tech_count &&
      (isNaN(Number(formData.tech_count)) || Number(formData.tech_count) <= 0)
    ) {
      newErrors.tech_count = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Create waitlist entry
      const response = await fetch('/api/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: formData.contact_name || undefined,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          org_name: formData.org_name || undefined,
          tech_count: formData.tech_count
            ? Number(formData.tech_count)
            : undefined,
          city: formData.city || undefined,
          plan_interest: formData.plan_interest || undefined,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        // Use the detailed message if available, otherwise fall back to error
        const errorMessage =
          data.message || data.error || 'Failed to join waitlist';
        throw new Error(errorMessage);
      }

      // Success - redirect to success page
      window.location.href = `/preorder/success?email=${encodeURIComponent(formData.email)}`;
    } catch (error) {
      console.error('Waitlist submission error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      setSubmitError(errorMessage);
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle radio button changes
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header - Fixed 120px height */}
          <div className="bg-primary text-white rounded-t-2xl h-[120px] flex flex-col justify-center px-6 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white hover:text-white/80 transition-colors"
              aria-label="Close"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex items-center justify-center mb-2">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold border border-white/30">
                Early Access
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Join the Waitlist</h2>
            <p className="text-white/90 text-sm">
              Be among the first to access Automet when we launch
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="p-6"
          >
            {/* Error Alert */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            {/* Early Access Benefits - 2x2 Grid */}
            <div className="mb-5 p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
              <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wide text-center">
                Early Access Benefits
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-primary/20 shadow-sm">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-0.5">First Access</p>
                      <p className="text-xs text-gray-600 leading-tight">Try features early</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-primary/20 shadow-sm">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-0.5">Special Offers</p>
                      <p className="text-xs text-gray-600 leading-tight">Exclusive discounts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-primary/20 shadow-sm">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-0.5">Priority Support</p>
                      <p className="text-xs text-gray-600 leading-tight">Dedicated onboarding</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-primary/20 shadow-sm">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-0.5">Shape Product</p>
                      <p className="text-xs text-gray-600 leading-tight">Your feedback matters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email - Required */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="rajesh@kumarac.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone - Required */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+91-9876543210"
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Contact Name - Optional */}
              <div>
                <label
                  htmlFor="contact_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contact_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Rajesh Kumar"
                />
                {errors.contact_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contact_name}
                  </p>
                )}
              </div>

              {/* Organization Name - Optional */}
              <div>
                <label
                  htmlFor="org_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  id="org_name"
                  name="org_name"
                  value={formData.org_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.org_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kumar AC Services"
                />
                {errors.org_name && (
                  <p className="mt-1 text-xs text-red-500">{errors.org_name}</p>
                )}
              </div>

              {/* Number of Technicians */}
              <div>
                <label
                  htmlFor="tech_count"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Number of Technicians
                </label>
                <input
                  type="number"
                  id="tech_count"
                  name="tech_count"
                  value={formData.tech_count}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tech_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5"
                  min="1"
                />
                {errors.tech_count && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.tech_count}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mumbai"
                />
              </div>
            </div>

            {/* Plan Interest - Radio Buttons */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which plan are you interested in?
              </label>
              <div className="space-y-2">
                {/* Free Plan */}
                <label
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.plan_interest === 'free'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan_interest"
                    value="free"
                    checked={formData.plan_interest === 'free'}
                    onChange={handleRadioChange}
                    className="mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-0.5">Free</div>
                    <div className="text-sm text-gray-600">
                      ₹0/forever • 1 site, 3 users
                    </div>
                  </div>
                </label>

                {/* Starter Plan */}
                <label
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.plan_interest === 'starter'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan_interest"
                    value="starter"
                    checked={formData.plan_interest === 'starter'}
                    onChange={handleRadioChange}
                    className="mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900">Starter</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                        ⭐ MOST POPULAR
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      ₹999/mo • 5 sites, 10 techs
                    </div>
                  </div>
                </label>

                {/* Growth Plan */}
                <label
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.plan_interest === 'growth'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan_interest"
                    value="growth"
                    checked={formData.plan_interest === 'growth'}
                    onChange={handleRadioChange}
                    className="mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-0.5">Growth</div>
                    <div className="text-sm text-gray-600">
                      ₹2,999/mo • 20 sites, 50 techs
                    </div>
                  </div>
                </label>

                {/* Business Plan */}
                <label
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.plan_interest === 'business'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan_interest"
                    value="business"
                    checked={formData.plan_interest === 'business'}
                    onChange={handleRadioChange}
                    className="mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-0.5">Business</div>
                    <div className="text-sm text-gray-600">
                      ₹9,999/mo • Unlimited sites, 200 techs
                    </div>
                  </div>
                </label>

                {/* Enterprise Plan */}
                <label
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.plan_interest === 'enterprise'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan_interest"
                    value="enterprise"
                    checked={formData.plan_interest === 'enterprise'}
                    onChange={handleRadioChange}
                    className="mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-0.5">Enterprise</div>
                    <div className="text-sm text-gray-600">
                      Custom pricing • 200+ techs, dedicated support
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold text-base hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Joining Waitlist...' : 'Join Waitlist'}
              </button>
              <p className="mt-2 text-xs text-center text-gray-500">
                We&apos;ll notify you when Automet launches. No spam, we
                promise!
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
