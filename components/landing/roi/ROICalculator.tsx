/**
 * ROI Calculator Component - Plan-Driven with Sliders
 * Compact UI with Before/After toggle
 */

import { useState, useEffect } from 'react';
import { calculateROI, ROIInputs, ROIResult, formatCurrency } from '@/lib/roiCalculator';

// Plan presets based on pricing tiers
interface PlanPreset {
  id: string;
  name: string;
  price: number;
  maxTechs: number;
  suggestedValues: {
    technicians: number;
    jobsPerTechnicianPerMonth: number;
    avgRevenuePerJobINR: number;
    adminHoursPerWeekAllStaff: number;
  };
}

const PLAN_PRESETS: PlanPreset[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    maxTechs: 3,
    suggestedValues: {
      technicians: 3,
      jobsPerTechnicianPerMonth: 20,
      avgRevenuePerJobINR: 1000,
      adminHoursPerWeekAllStaff: 10,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 999,
    maxTechs: 10,
    suggestedValues: {
      technicians: 10,
      jobsPerTechnicianPerMonth: 25,
      avgRevenuePerJobINR: 1200,
      adminHoursPerWeekAllStaff: 20,
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 2999,
    maxTechs: 50,
    suggestedValues: {
      technicians: 25,
      jobsPerTechnicianPerMonth: 30,
      avgRevenuePerJobINR: 1200,
      adminHoursPerWeekAllStaff: 35,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 9999,
    maxTechs: 200,
    suggestedValues: {
      technicians: 75,
      jobsPerTechnicianPerMonth: 35,
      avgRevenuePerJobINR: 1500,
      adminHoursPerWeekAllStaff: 80,
    },
  },
];

export default function ROICalculator() {
  const [selectedPlan, setSelectedPlan] = useState<PlanPreset>(PLAN_PRESETS[2]); // Default: Growth
  const [showTooltip, setShowTooltip] = useState(false);
  const [showWithAutomet, setShowWithAutomet] = useState(true); // Toggle state

  // Calculate admin hours automatically based on technicians and jobs
  const calculateAdminHours = (techs: number, jobsPerTech: number): number => {
    // Formula: Base admin time increases with scale
    // More technicians and jobs = more admin work needed
    const baseHours = 5; // Minimum admin hours
    const scaleFactor = techs * jobsPerTech * 0.15; // 0.15 hours per job per technician
    return Math.min(Math.max(Math.round(baseHours + scaleFactor), 5), 100);
  };

  const getInitialInputs = (plan: PlanPreset): ROIInputs => {
    const adminHours = calculateAdminHours(plan.suggestedValues.technicians, plan.suggestedValues.jobsPerTechnicianPerMonth);
    return {
      technicians: plan.suggestedValues.technicians,
      jobsPerTechnicianPerMonth: plan.suggestedValues.jobsPerTechnicianPerMonth,
      avgRevenuePerJobINR: plan.suggestedValues.avgRevenuePerJobINR,
      adminHoursPerWeekAllStaff: adminHours,
      monthlyPlanCostINR: plan.price,
    };
  };

  const [inputs, setInputs] = useState<ROIInputs>(getInitialInputs(selectedPlan));

  // Calculate admin hours based on current inputs
  const currentAdminHours = calculateAdminHours(inputs.technicians, inputs.jobsPerTechnicianPerMonth);
  const inputsWithAdminHours = {
    ...inputs,
    adminHoursPerWeekAllStaff: currentAdminHours,
  };

  const [results, setResults] = useState<ROIResult>(() => calculateROI(inputsWithAdminHours));

  // Recalculate when inputs change
  useEffect(() => {
    const adminHours = calculateAdminHours(inputs.technicians, inputs.jobsPerTechnicianPerMonth);
    const updatedInputs = {
      ...inputs,
      adminHoursPerWeekAllStaff: adminHours,
    };
    const newResults = calculateROI(updatedInputs);
    setResults(newResults);
  }, [inputs.technicians, inputs.jobsPerTechnicianPerMonth, inputs.avgRevenuePerJobINR, inputs.monthlyPlanCostINR]);

  // Handle plan selection - populate all sliders with presets
  const handlePlanChange = (planId: string) => {
    const plan = PLAN_PRESETS.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setInputs(getInitialInputs(plan));
    }
  };

  // Handle individual slider changes
  const handleSliderChange = (field: keyof Omit<ROIInputs, 'monthlyPlanCostINR'>, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Reset to current plan defaults
  const handleReset = () => {
    setInputs(getInitialInputs(selectedPlan));
  };

  return (
    <section id="roi-calculator" className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-2">
            ROI CALCULATOR
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Calculate Your Savings
          </h2>
          <p className="text-sm text-gray-600">
            Select plan, customize, see real ROI
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT - Inputs */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
              <h3 className="text-base font-bold text-gray-900">Your Business</h3>
              <button
                onClick={handleReset}
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* Plan Selector - Radio Buttons */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Select Your Plan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PLAN_PRESETS.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex flex-col items-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPlan.id === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={selectedPlan.id === plan.id}
                        onChange={(e) => handlePlanChange(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 mb-1.5"
                      />
                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-900 mb-0.5">{plan.name}</div>
                        <div className="text-[10px] font-medium text-gray-600">
                          ₹{plan.price.toLocaleString('en-IN')}/mo
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Technicians Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-700">Technicians</label>
                  <span className="text-sm font-bold text-blue-600">{inputs.technicians}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={selectedPlan.maxTechs}
                  step="1"
                  value={inputs.technicians}
                  onChange={(e) => handleSliderChange('technicians', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>1</span>
                  <span>{selectedPlan.maxTechs}</span>
                </div>
              </div>

              {/* Jobs per Tech Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-700">Jobs/Tech/Month</label>
                  <span className="text-sm font-bold text-blue-600">{inputs.jobsPerTechnicianPerMonth}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={inputs.jobsPerTechnicianPerMonth}
                  onChange={(e) => handleSliderChange('jobsPerTechnicianPerMonth', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>10</span>
                  <span>50</span>
                </div>
              </div>

              {/* Revenue per Job Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-700">Avg Revenue/Job</label>
                  <span className="text-sm font-bold text-blue-600">
                    ₹{inputs.avgRevenuePerJobINR.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={inputs.avgRevenuePerJobINR}
                  onChange={(e) => handleSliderChange('avgRevenuePerJobINR', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>₹500</span>
                  <span>₹5k</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT - Results */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4">
            {/* Header with Title, Toggle, and Info Button */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
              <h3 className="text-base font-bold text-gray-900">Your Results</h3>
              
              {/* Toggle Switch */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium whitespace-nowrap ${!showWithAutomet ? 'text-gray-900' : 'text-gray-500'}`}>
                  Without
                </span>
                <button
                  onClick={() => setShowWithAutomet(!showWithAutomet)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                    showWithAutomet ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      showWithAutomet ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-medium whitespace-nowrap ${showWithAutomet ? 'text-gray-900' : 'text-gray-500'}`}>
                  With
                </span>
              </div>

              {/* Tooltip Button */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How?
                </button>

                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl p-3 z-50">
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-blue-300 mb-0.5">Time Saved:</p>
                        <p className="text-gray-300">50% reduction in admin time via automation at ₹200/hour.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-300 mb-0.5">Recovered Revenue (5%):</p>
                        <p className="text-gray-300">Better tracking prevents missed billing.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-300 mb-0.5">Cashflow Gain (5%):</p>
                        <p className="text-gray-300">Faster invoicing = earlier payments.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-300 mb-0.5">ROI:</p>
                        <p className="text-gray-300">Annual benefit ÷ annual cost × 100.</p>
                      </div>
                    </div>
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>

            {showWithAutomet ? (
              // WITH AUTOMET - Show Benefits
              <div className="space-y-3">
                {/* Compact 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Jobs/Month */}
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] font-medium text-gray-600 mb-0.5">Jobs/Month</p>
                    <p className="text-base font-bold text-gray-900">{results.jobsPerMonth}</p>
                  </div>
                  
                  {/* Monthly Revenue */}
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-[10px] font-medium text-green-700 mb-0.5">Monthly Revenue</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(results.monthlyRevenueINR)}</p>
                    <p className="text-[9px] text-green-600">With Automet</p>
                  </div>

                  {/* Time Saved */}
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <p className="text-[10px] font-medium text-blue-700 mb-0.5">Time Saved</p>
                    <p className="text-sm font-bold text-gray-900">{results.timeSavedHoursPerMonth}h</p>
                    <p className="text-[9px] text-blue-600">{formatCurrency(results.timeSavingsValueINR)}</p>
                  </div>

                  {/* Recovered Revenue */}
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-[10px] font-medium text-green-700 mb-0.5">Recovered</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(results.recoveredRevenueINR)}</p>
                    <p className="text-[9px] text-green-600">5%</p>
                  </div>
                </div>

                {/* Cashflow & ROI - 2x2 Grid Row 2 */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Cashflow */}
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-[10px] font-medium text-green-700 mb-0.5">Cashflow</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(results.cashflowGainINR)}</p>
                    <p className="text-[9px] text-green-600">5%</p>
                  </div>

                  {/* 1-Year ROI */}
                  <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                    <p className="text-[10px] font-medium text-purple-700 mb-0.5">1-Year ROI</p>
                    <p className="text-lg font-bold text-gray-900">{results.roiPercent}%</p>
                  </div>
                </div>

                {/* Net Monthly Benefit - Full Width */}
                <div className={`rounded-lg p-2.5 border-2 ${results.netMonthlyBenefitINR > 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                  <p className={`text-xs font-medium mb-0.5 ${results.netMonthlyBenefitINR > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    Net Monthly Benefit
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.netMonthlyBenefitINR)}</p>
                  <p className={`text-[9px] ${results.netMonthlyBenefitINR > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    After ₹{selectedPlan.price.toLocaleString('en-IN')} plan cost
                  </p>
                </div>
              </div>
            ) : (
              // WITHOUT AUTOMET - Current State
              <div className="space-y-3">
                {/* Jobs & Revenue - SHOWING LOST REVENUE */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] font-medium text-gray-600 mb-0.5">Jobs/Month</p>
                    <p className="text-base font-bold text-gray-900">{results.jobsPerMonth}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                    <p className="text-[10px] font-medium text-red-700 mb-0.5">Current Revenue</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(results.monthlyRevenueINR - results.recoveredRevenueINR - results.cashflowGainINR)}
                    </p>
                    <p className="text-[9px] text-red-600">Losing {formatCurrency(results.recoveredRevenueINR + results.cashflowGainINR)}/mo</p>
                  </div>
                </div>

                {/* Current Problems */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-xs font-semibold text-red-700 mb-2">Current Challenges:</p>
                  <ul className="space-y-1.5 text-[10px] text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-1.5">✗</span>
                      <span>Spending <strong>{currentAdminHours}h/week</strong> on manual admin work</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-1.5">✗</span>
                      <span>Losing <strong>{formatCurrency(results.recoveredRevenueINR)}/month</strong> from missed billing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-1.5">✗</span>
                      <span>Slow invoicing delays <strong>{formatCurrency(results.cashflowGainINR)}/month</strong> in cashflow</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-1.5">✗</span>
                      <span>Wasting <strong>{formatCurrency(results.timeSavingsValueINR)}/month</strong> in manual labor</span>
                    </li>
                  </ul>
                </div>

                {/* Total Cost of NOT Using Automet */}
                <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-300">
                  <p className="text-xs font-medium text-orange-700 mb-1">Total Monthly Loss:</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.totalGainINR)}</p>
                  <p className="text-[9px] text-orange-600 mt-1">
                    What you're losing by NOT using Automet
                  </p>
                </div>

                {/* CTA */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowWithAutomet(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    See Benefits With Automet →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 text-center">
          <p className="text-[9px] text-gray-500">
            * Based on ₹200/hr labor, 50% admin reduction, 5% revenue recovery, 5% cashflow gain
          </p>
        </div>
      </div>
    </section>
  );
}
