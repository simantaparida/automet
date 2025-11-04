/**
 * ROI Calculator Export Component
 * Copy summary and download CSV functionality
 */

import { useState } from 'react';
import { ROIInputs, ROIResults, generateSummary, generateCSV } from './roiCalculatorUtils';

interface ROICalculatorExportProps {
  inputs: ROIInputs;
  results: ROIResults;
}

export default function ROICalculatorExport({ inputs, results }: ROICalculatorExportProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = async () => {
    const summary = generateSummary(inputs, results);
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleDownloadCSV = () => {
    const csv = generateCSV(inputs, results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automet-roi-calculator-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {/* Copy Summary Button */}
      <button
        onClick={handleCopySummary}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
      >
        {copiedSummary ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Summary
          </>
        )}
      </button>

      {/* Download CSV Button */}
      <button
        onClick={handleDownloadCSV}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all hover:border-gray-400"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download CSV
      </button>
    </div>
  );
}
