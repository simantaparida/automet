import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Save } from 'lucide-react';

export default function NewClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const client = await response.json();
        router.push(`/clients/${client.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Error creating client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white font-sans">
        {/* Desktop Sidebar */}
        <Sidebar activeTab="clients" />

        {/* Desktop Top Header with Glassmorphism */}
        <div className="desktop-header fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/80 border-b border-primary/10">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Main Content */}
        <main className="ml-0 md:ml-[260px] pt-16 md:pt-20 pb-20 md:pb-8 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Clients</span>
            </button>

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Client</h1>
              <p className="text-[15px] text-gray-500">
                Add a new client to your organization
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-[13px] text-red-900">
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-md text-[14px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="e.g., ABC Corporation"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
                    <Mail size={14} className="text-gray-500" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-[14px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="contact@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
                    <Phone size={14} className="text-gray-500" />
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-[14px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
                    <MapPin size={14} className="text-gray-500" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-[14px] outline-none resize-y transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Complete address..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
                    <FileText size={14} className="text-gray-500" />
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-[14px] outline-none resize-y transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Additional information about the client..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 sm:flex-initial sm:min-w-[140px] bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-4 py-2.5 text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5 hover:enabled:shadow-md hover:enabled:shadow-primary/35"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Create Client</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={saving}
                    className="flex-1 sm:flex-initial sm:min-w-[140px] bg-white text-gray-700 border-2 border-gray-300 rounded-md px-4 py-2.5 text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:border-primary hover:enabled:text-primary"
                  >
                    <ArrowLeft size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Help Text */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-[13px] text-gray-600 leading-relaxed">
                <strong className="text-gray-700">Tip:</strong> Make sure to enter accurate contact details.
                This information will be used when creating jobs and sending notifications.
              </p>
            </div>
          </div>
        </main>

        {/* Bottom Navigation - Only visible on mobile */}
        <BottomNav activeTab="clients" />
      </div>
    </ProtectedRoute>
  );
}
