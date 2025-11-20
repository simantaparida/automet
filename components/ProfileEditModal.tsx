import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import toast from 'react-hot-toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    full_name: string | null;
    contact_phone: string | null;
    profile_photo_url: string | null;
  };
  onSave: (updatedProfile: {
    full_name: string;
    contact_phone: string;
    profile_photo_url: string | null;
  }) => Promise<void>;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  currentProfile,
  onSave,
}: ProfileEditModalProps) {
  const [fullName, setFullName] = useState(currentProfile.full_name || '');
  const [contactPhone, setContactPhone] = useState(
    currentProfile.contact_phone || ''
  );
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    currentProfile.profile_photo_url || null
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    contactPhone?: string;
  }>({});

  // Update form when profile changes
  useEffect(() => {
    if (isOpen) {
      setFullName(currentProfile.full_name || '');
      setContactPhone(currentProfile.contact_phone || '');
      setProfilePhoto(currentProfile.profile_photo_url || null);
      setErrors({});
    }
  }, [isOpen, currentProfile]);

  const validate = (): boolean => {
    const newErrors: { fullName?: string; contactPhone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }

    if (contactPhone.trim() && !/^[\d\s\-\+\(\)]+$/.test(contactPhone)) {
      newErrors.contactPhone = 'Invalid phone number format';
    }

    if (contactPhone.trim() && contactPhone.length > 20) {
      newErrors.contactPhone = 'Phone number must be less than 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        full_name: fullName.trim(),
        contact_phone: contactPhone.trim(),
        profile_photo_url: profilePhoto,
      });
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button
              onClick={handleClose}
              disabled={saving}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Profile Photo
            </label>
            <PhotoUploader
              currentPhoto={profilePhoto}
              onPhotoChange={setProfilePhoto}
              disabled={saving}
            />
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </div>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={saving}
                placeholder="Enter your full name"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.fullName
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="contactPhone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={18} />
              </div>
              <input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                disabled={saving}
                placeholder="+91-9876543210"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.contactPhone
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Optional. Format: +91-9876543210 or 9876543210
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
