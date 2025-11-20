import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploaderProps {
    currentPhoto?: string | null;
    onPhotoChange: (photoDataUrl: string | null) => void;
    disabled?: boolean;
}

export default function PhotoUploader({
    currentPhoto,
    onPhotoChange,
    disabled = false,
}: PhotoUploaderProps) {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Please upload a JPG, PNG, or WebP image';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'Image must be less than 2MB';
        }
        return null;
    };

    const processFile = (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            onPhotoChange(result);
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onPhotoChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="space-y-4">
            {/* Preview or Upload Area */}
            <div className="flex justify-center">
                {preview ? (
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={handleClick}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${dragActive
                                ? 'border-primary bg-orange-50'
                                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ImageIcon size={32} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 text-center px-2">
                            Click or drag
                        </span>
                    </div>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden"
            />

            {/* Upload Instructions */}
            {!preview && (
                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleClick}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary border-2 border-primary/20 rounded-lg text-sm font-semibold hover:bg-orange-50 hover:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload size={16} />
                        Upload Photo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG or WebP. Max 2MB.
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="text-center">
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}
