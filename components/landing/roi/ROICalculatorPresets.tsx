/**
 * ROI Calculator Presets Component
 * Quick preset buttons for common scenarios
 */

import { UserInputs } from './roiCalculatorUtils';

interface ROICalculatorPresetsProps {
  onLoadPreset: (values: UserInputs) => void;
}

// Preset scenarios for quick start
const PRESET_SCENARIOS = {
  small: {
    label: 'Small Team',
    description: '5 techs, 20 jobs/month',
    icon: '👷',
    values: {
      technicians: 5,
      jobsPerTech: 20,
      revenuePerJob: 1000,
      minutesSavedPerJob: 8,
      planTier: 1, // Starter
    } as UserInputs,
  },
  medium: {
    label: 'Medium Team',
    description: '15 techs, 30 jobs/month',
    icon: '🏢',
    values: {
      technicians: 15,
      jobsPerTech: 30,
      revenuePerJob: 1500,
      minutesSavedPerJob: 10,
      planTier: 2, // Growth
    } as UserInputs,
  },
  large: {
    label: 'Large Team',
    description: '50 techs, 40 jobs/month',
    icon: '🏭',
    values: {
      technicians: 50,
      jobsPerTech: 40,
      revenuePerJob: 2000,
      minutesSavedPerJob: 12,
      planTier: 3, // Business
    } as UserInputs,
  },
};

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
