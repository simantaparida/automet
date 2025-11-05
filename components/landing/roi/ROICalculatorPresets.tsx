/**
 * ROI Calculator Presets Component
 * Quick preset buttons for common scenarios
 */

import { PRESET_SCENARIOS, ROIInputs } from './roiCalculatorUtils';

interface ROICalculatorPresetsProps {
  onLoadPreset: (values: ROIInputs) => void;
}

export default function ROICalculatorPresets({
  onLoadPreset,
}: ROICalculatorPresetsProps) {
  return (
    <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
      <p className="text-sm font-semibold text-gray-900 mb-3">
        Quick Start - Load Example:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(PRESET_SCENARIOS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onLoadPreset(preset.values)}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">
              {preset.icon}
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">{preset.label}</p>
              <p className="text-xs text-gray-600">{preset.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
