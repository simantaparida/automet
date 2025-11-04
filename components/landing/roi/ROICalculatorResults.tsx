/**
 * ROI Calculator Results Component
 * Display calculated results with animated cards
 */

import { useEffect, useState } from 'react';
import { ROIResults, formatCurrency, formatNumber } from './roiCalculatorUtils';

interface ROICalculatorResultsProps {
  results: ROIResults;
}

interface AnimatedNumberProps {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
}

function AnimatedNumber({ value, formatter = (v) => v.toString(), duration = 500 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
}

export default function ROICalculatorResults({ results }: ROICalculatorResultsProps) {
  const isPositiveROI = results.grossMonthlySavings > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ✨ Your Savings With Automet
        </h3>
        <p className="text-gray-600 text-sm">
          Based on {results.totalJobs} jobs per month
        </p>
      </div>

      {/* Top 3 Metrics - Primary Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Time Saved */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-medium text-green-700 mb-1 uppercase tracking-wide">Time Saved</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            <AnimatedNumber value={results.timeSavedHours} formatter={(v) => Math.round(v).toString()} />
            <span className="text-lg text-gray-600"> hrs/mo</span>
          </p>
          <p className="text-sm font-semibold text-green-600">
            <AnimatedNumber value={results.timeSavingsValue} formatter={formatCurrency} />
          </p>
        </div>

        {/* Revenue Recovered */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-medium text-blue-700 mb-1 uppercase tracking-wide">Revenue Recovered</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            <AnimatedNumber value={results.recoveredRevenue} formatter={formatCurrency} />
          </p>
          <p className="text-sm text-gray-600">Missed billings captured</p>
        </div>

        {/* Net Monthly Benefit */}
        <div className={`bg-gradient-to-br rounded-xl p-5 border-2 hover:shadow-lg transition-all ${
          isPositiveROI
            ? 'from-emerald-50 to-green-50 border-emerald-300'
            : 'from-red-50 to-rose-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isPositiveROI ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className={`text-xs font-medium mb-1 uppercase tracking-wide ${
            isPositiveROI ? 'text-emerald-700' : 'text-red-700'
          }`}>Monthly Savings</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            <AnimatedNumber value={results.grossMonthlySavings} formatter={formatCurrency} />
          </p>
          <p className="text-sm text-gray-600">Gross value</p>
        </div>
      </div>

      {/* Secondary Metrics - Annual & ROI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Annual Savings */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Annual Savings</p>
          <p className="text-2xl font-bold text-gray-900">
            <AnimatedNumber value={results.grossAnnualSavings} formatter={formatCurrency} />
          </p>
          <p className="text-xs text-gray-500 mt-1">Gross value</p>
        </div>

        {/* ROI */}
        <div className={`rounded-lg p-4 border-2 hover:shadow-md transition-all ${
          results.roi > 100
            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300'
            : 'bg-white border-gray-200'
        }`}>
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">ROI (1-year)</p>
          <p className={`text-2xl font-bold ${results.roi > 100 ? 'text-purple-600' : 'text-gray-900'}`}>
            <AnimatedNumber value={results.roi} formatter={(v) => `${Math.round(v)}%`} />
          </p>
          <p className="text-xs text-gray-500 mt-1">Return on investment</p>
        </div>

        {/* Payback Period */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Payback Period</p>
          <p className="text-2xl font-bold text-gray-900">
            <AnimatedNumber value={results.paybackMonths} formatter={(v) => v.toFixed(1)} />
            <span className="text-sm text-gray-600"> mo</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Investment recovered in</p>
        </div>

        {/* Invoice Benefit */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
          <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Cash Flow Boost</p>
          <p className="text-2xl font-bold text-gray-900">
            <AnimatedNumber value={results.invoiceCashBenefit} formatter={formatCurrency} />
          </p>
          <p className="text-xs text-gray-500 mt-1">Faster invoicing benefit</p>
        </div>
      </div>

      {/* Payback Visual Progress */}
      {isPositiveROI && results.paybackMonths <= 12 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Payback Timeline</p>
            <p className="text-sm font-bold text-blue-600">
              {results.paybackMonths.toFixed(1)} months
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min((results.paybackMonths / 12) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">0 months</span>
            <span className="text-xs text-gray-600">12 months</span>
          </div>
        </div>
      )}

      {/* Warning for negative ROI */}
      {!isPositiveROI && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                With current inputs, the plan cost exceeds calculated savings. Try adjusting parameters or consider a lower-tier plan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
