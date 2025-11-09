/**
 * ROI Calculator Utilities - SIMPLE VERSION
 * Built from scratch with only essential inputs and calculations
 */

// Plan tiers with fixed pricing
export const PLAN_TIERS = [
  { id: 0, name: 'Free', price: 0 },
  { id: 1, name: 'Starter', price: 999 },
  { id: 2, name: 'Growth', price: 2999 },
  { id: 3, name: 'Business', price: 9999 },
] as const;

// User inputs - 5 simple fields
export interface UserInputs {
  technicians: number;
  jobsPerTech: number;
  revenuePerJob: number;
  minutesSavedPerJob: number;
  planTier: number; // 0-3 index into PLAN_TIERS
}

export interface ROIResults {
  // Basic calculations
  totalJobsPerMonth: number;
  monthlyRevenue: number;

  // Time savings
  timeSavedHours: number;
  timeSavingsValue: number;

  // Financial metrics
  planCost: number;
  netMonthlyBenefit: number;
  paybackMonths: number;
  roi1Year: number;
}

// Default user inputs
export const DEFAULT_USER_INPUTS: UserInputs = {
  technicians: 10,
  jobsPerTech: 30,
  revenuePerJob: 1200,
  minutesSavedPerJob: 10,
  planTier: 2, // Growth plan
};

/**
 * Calculate ROI - SIMPLE AND ACCURATE
 */
export function calculateROI(inputs: UserInputs): ROIResults {
  const planTier = PLAN_TIERS[inputs.planTier];
  if (!planTier) {
    throw new Error(`Invalid plan tier: ${inputs.planTier}`);
  }
  const planCost = planTier.price;

  // 1. Jobs per month
  const totalJobsPerMonth = inputs.technicians * inputs.jobsPerTech;

  // 2. Monthly revenue
  const monthlyRevenue = totalJobsPerMonth * inputs.revenuePerJob;

  // 3. Time saved per month (hours)
  const timeSavedHours = (totalJobsPerMonth * inputs.minutesSavedPerJob) / 60;

  // 4. Time savings value (using ₹200/hour assumed rate)
  const HOURLY_RATE = 200;
  const timeSavingsValue = timeSavedHours * HOURLY_RATE;

  // 5. Net monthly benefit = time savings value - plan cost
  const netMonthlyBenefit = timeSavingsValue - planCost;

  // 6. Payback period (months) = plan cost / net monthly benefit
  const paybackMonths =
    netMonthlyBenefit > 0 ? planCost / netMonthlyBenefit : 0;

  // 7. ROI (1-year) = (net annual benefit) / (annual cost)
  const netAnnualBenefit = netMonthlyBenefit * 12;
  const annualCost = planCost * 12;
  const roi1Year = annualCost > 0 ? (netAnnualBenefit / annualCost) * 100 : 0;

  return {
    totalJobsPerMonth: Math.round(totalJobsPerMonth),
    monthlyRevenue: Math.round(monthlyRevenue),
    timeSavedHours: Math.round(timeSavedHours),
    timeSavingsValue: Math.round(timeSavingsValue),
    planCost,
    netMonthlyBenefit: Math.round(netMonthlyBenefit),
    paybackMonths: paybackMonths > 0 ? Math.round(paybackMonths * 10) / 10 : 0,
    roi1Year: Math.round(roi1Year),
  };
}

/**
 * Format number as Indian currency (₹1,23,456)
 */
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const isNegative = value < 0;

  const formatted = absValue.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Generate text summary for copy/paste
 */
export function generateSummary(
  results: ROIResults,
  inputs: UserInputs
): string {
  return `🎯 Your ROI with Automet

📊 Your Business:
• ${inputs.technicians} technicians
• ${results.totalJobsPerMonth} jobs/month
• Monthly revenue: ${formatCurrency(results.monthlyRevenue)}

⏱️ Time Savings:
• ${results.timeSavedHours} hours saved/month
• Value: ${formatCurrency(results.timeSavingsValue)} (@ ₹200/hour)

💰 Net Benefit:
• Plan cost: ${formatCurrency(results.planCost)}/month
• Net monthly benefit: ${formatCurrency(results.netMonthlyBenefit)}
• Payback period: ${results.paybackMonths} months
• 1-year ROI: ${results.roi1Year}%

🚀 Start saving: https://automet.in`;
}

/**
 * Generate CSV data for download
 */
export function generateCSV(results: ROIResults, inputs: UserInputs): string {
  const rows = [
    ['Metric', 'Value', 'Unit'],
    ['Technicians', inputs.technicians, 'count'],
    ['Jobs per Technician', inputs.jobsPerTech, 'per month'],
    ['Total Jobs per Month', results.totalJobsPerMonth, 'jobs'],
    ['Average Revenue per Job', inputs.revenuePerJob, '₹'],
    ['Monthly Revenue', results.monthlyRevenue, '₹'],
    ['', '', ''],
    ['Minutes Saved per Job', inputs.minutesSavedPerJob, 'minutes'],
    ['Time Saved per Month', results.timeSavedHours, 'hours'],
    ['Time Savings Value', results.timeSavingsValue, '₹/month'],
    ['', '', ''],
    ['Plan Cost', results.planCost, '₹/month'],
    ['Net Monthly Benefit', results.netMonthlyBenefit, '₹/month'],
    ['Payback Period', results.paybackMonths, 'months'],
    ['ROI (1-year)', results.roi1Year, '%'],
  ];

  return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Validation rules for inputs
 */
export const VALIDATION_RULES = {
  technicians: { min: 1, max: 500, step: 1 },
  jobsPerTech: { min: 1, max: 200, step: 1 },
  revenuePerJob: { min: 100, max: 100000, step: 100 },
  minutesSavedPerJob: { min: 1, max: 60, step: 1 },
};

/**
 * Tooltip text for each input field
 */
export const TOOLTIP_TEXT = {
  technicians: 'Total number of field technicians in your team',
  jobsPerTech: 'Average jobs each technician completes per month',
  revenuePerJob: 'Average billable amount per job',
  minutesSavedPerJob: 'Time saved on admin/coordination per job with Automet',
};
