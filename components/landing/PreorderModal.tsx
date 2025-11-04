/**
 * Pre-order Modal Component
 * Form with validation and Razorpay payment integration
 */

import { useState, FormEvent } from 'react';

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  tech_count: string;
  city: string;
  plan_interest: string;
}

interface FormErrors {
  [key: string]: string;
}

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PreorderModal({ isOpen, onClose }: PreorderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    org_name: '',
    contact_name: '',
    email: '',
    phone: '',
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

    if (!formData.org_name.trim() || formData.org_name.length < 2) {
      newErrors.org_name = 'Organization name is required (min 2 characters)';
    }

    if (!formData.contact_name.trim() || formData.contact_name.length < 2) {
      newErrors.contact_name = 'Contact name is required (min 2 characters)';
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (formData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.tech_count && (isNaN(Number(formData.tech_count)) || Number(formData.tech_count) <= 0)) {
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
      // Create pre-order
      const response = await fetch('/api/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tech_count: formData.tech_count ? Number(formData.tech_count) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create pre-order');
      }

      // Success - redirect to success page with preorder ID
      window.location.href = `/preorder/success?email=${encodeURIComponent(formData.email)}`;
    } catch (error: any) {
      console.error('Pre-order submission error:', error);
      setSubmitError(error.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl">
            <div className="flex items-center justify-center mb-3">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold border border-white/30">
                👑 Founding Partner Program
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Claim Your Exclusive Spot</h2>
            <p className="text-blue-100">
              Only ₹499 • Limited to first 100 slots • Unlimited pre-orders after
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Error Alert */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            {/* Founding Partner Benefits */}
            <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide">👑 Founding Partner Benefits</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                  <p className="font-bold text-gray-900 text-sm mb-1">💰 50% OFF</p>
                  <p className="text-xs text-gray-600">All paid plans for 3 months after launch</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                  <p className="font-bold text-gray-900 text-sm mb-1">🎯 Beta Access</p>
                  <p className="text-xs text-gray-600">Test features before everyone else</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                  <p className="font-bold text-gray-900 text-sm mb-1">👑 Special Badge</p>
                  <p className="text-xs text-gray-600">Recognition forever in your profile</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                  <p className="font-bold text-gray-900 text-sm mb-1">🚀 Priority Support</p>
                  <p className="text-xs text-gray-600">Dedicated onboarding & setup help</p>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-blue-700 font-medium">
                ₹499 is a deposit towards your first subscription + discount voucher
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div>
                <label htmlFor="org_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
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

              {/* Contact Name */}
              <div>
                <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
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
                  <p className="mt-1 text-xs text-red-500">{errors.contact_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
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
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Number of Technicians */}
              <div>
                <label htmlFor="tech_count" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <p className="mt-1 text-xs text-red-500">{errors.tech_count}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Plan Interest */}
            <div className="mt-6">
              <label htmlFor="plan_interest" className="block text-sm font-medium text-gray-700 mb-2">
                Which plan are you interested in?
              </label>
              <select
                id="plan_interest"
                name="plan_interest"
                value={formData.plan_interest}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="free">Free - ₹0/forever (1 site, 3 users)</option>
                <option value="starter">Starter - ₹999/mo (5 sites, 10 techs) ⭐ MOST POPULAR</option>
                <option value="growth">Growth - ₹2,999/mo (20 sites, 50 techs)</option>
                <option value="business">Business - ₹9,999/mo (unlimited sites, 200 techs)</option>
                <option value="enterprise">Enterprise - Custom pricing (200+ techs)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Submit Pre-order'}
              </button>
              <p className="mt-3 text-xs text-center text-gray-500">
                You'll receive a confirmation email with next steps.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
