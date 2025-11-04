/**
 * ROI Calculator Input Component
 * Reusable input field with slider and tooltip
 */

import { useState } from 'react';

interface ROICalculatorInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip: string;
  unit?: string;
  prefix?: string;
}

export default function ROICalculatorInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
  unit = '',
  prefix = '',
}: ROICalculatorInputProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="space-y-2">
      {/* Label with Tooltip */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          {label}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Help"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                <div className="absolute -top-1.5 left-3 w-3 h-3 bg-gray-900 transform rotate-45"></div>
                {tooltip}
              </div>
            )}
          </div>
        </label>

        {/* Number Input */}
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm font-medium text-gray-600">{prefix}</span>}
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="w-20 px-2 py-1 text-right border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-gray-900"
          />
          {unit && <span className="text-sm text-gray-600">{unit}</span>}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((value - min) / (max - min)) * 100
            }%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
          }}
        />
        {/* Min/Max Labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {prefix}
            {min}
            {unit}
          </span>
          <span className="text-xs text-gray-500">
            {prefix}
            {max}
            {unit}
          </span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
}
