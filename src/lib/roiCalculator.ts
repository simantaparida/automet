/**
 * ROI Calculator - Automet vs Manual Operations
 *
 * This calculator estimates the financial impact of switching from manual
 * operations to using Automet for field service management.
 */

/**
 * Input parameters for ROI calculation
 */
export interface ROIInputs {
  /** Number of field technicians */
  technicians: number;
  /** Average jobs completed per technician per month */
  jobsPerTechnicianPerMonth: number;
  /** Average revenue per job in Indian Rupees */
  avgRevenuePerJobINR: number;
  /** Total admin hours per week across all staff */
  adminHoursPerWeekAllStaff: number;
  /** Monthly subscription cost for Automet in Indian Rupees */
  monthlyPlanCostINR: number;
}

/**
 * Result of ROI calculation with all financial metrics
 */
export interface ROIResult {
  /** Total jobs completed per month */
  jobsPerMonth: number;
  /** Total monthly revenue in INR */
  monthlyRevenueINR: number;
  /** Current admin time spent per job (minutes) */
  currentAdminMinutesPerJob: number;
  /** Minutes saved per job with Automet (50% reduction) */
  minutesSavedPerJob: number;
  /** Total hours saved per month */
  timeSavedHoursPerMonth: number;
  /** Monetary value of time saved (@ ₹200/hour) */
  timeSavingsValueINR: number;
  /** Revenue recovered from better tracking (5% of revenue) */
  recoveredRevenueINR: number;
  /** Cashflow gain from faster invoicing (5% of revenue) */
  cashflowGainINR: number;
  /** Total gain from switching to Automet */
  totalGainINR: number;
  /** Net monthly benefit (gain - plan cost) */
  netMonthlyBenefitINR: number;
  /** Net annual benefit */
  netAnnualBenefitINR: number;
  /** Return on Investment as percentage */
  roiPercent: number;
  /** Months to recover investment */
  paybackMonths: number;
}

/**
 * Constants used in ROI calculations
 */
const CONSTANTS = {
  /** Average weeks per month */
  WEEKS_PER_MONTH: 4.33,
  /** Average hourly cost for technician/admin work in INR */
  HOURLY_COST_INR: 200,
  /** Percentage reduction in admin time with Automet */
  ADMIN_TIME_REDUCTION: 0.5,
  /** Percentage of revenue recovered from better tracking */
  RECOVERED_REVENUE_PERCENT: 0.05,
  /** Percentage of revenue gained from faster invoicing */
  CASHFLOW_GAIN_PERCENT: 0.05,
} as const;

/**
 * Calculate ROI for switching from manual operations to Automet
 *
 * @param inputs - Business parameters and subscription cost
 * @returns Detailed financial metrics showing impact of switching to Automet
 *
 * @example
 * ```typescript
 * const result = calculateROI({
 *   technicians: 10,
 *   jobsPerTechnicianPerMonth: 30,
 *   avgRevenuePerJobINR: 1200,
 *   adminHoursPerWeekAllStaff: 20,
 *   monthlyPlanCostINR: 2999
 * });
 * console.log(`Net monthly benefit: ₹${result.netMonthlyBenefitINR}`);
 * console.log(`ROI: ${result.roiPercent}%`);
 * ```
 */
export function calculateROI(inputs: ROIInputs): ROIResult {
  // 1. Calculate total jobs per month
  // Formula: technicians × jobs per technician
  const jobsPerMonth = inputs.technicians * inputs.jobsPerTechnicianPerMonth;

  // 2. Calculate total monthly revenue
  // Formula: total jobs × average revenue per job
  const monthlyRevenueINR = jobsPerMonth * inputs.avgRevenuePerJobINR;

  // 3. Calculate current admin time per job (in minutes)
  // Formula: (weekly admin hours × 60) ÷ (jobs per month ÷ weeks per month)
  // This spreads the weekly admin burden across all jobs in a week
  const jobsPerWeek = jobsPerMonth / CONSTANTS.WEEKS_PER_MONTH;
  const currentAdminMinutesPerJob = jobsPerWeek > 0
    ? (inputs.adminHoursPerWeekAllStaff * 60) / jobsPerWeek
    : 0;

  // 4. Calculate minutes saved per job with Automet
  // Formula: current admin time × 50% reduction
  // Automet reduces admin overhead by half through automation
  const minutesSavedPerJob = currentAdminMinutesPerJob * CONSTANTS.ADMIN_TIME_REDUCTION;

  // 5. Calculate total time saved per month (in hours)
  // Formula: (jobs per month × minutes saved per job) ÷ 60
  const timeSavedHoursPerMonth = (jobsPerMonth * minutesSavedPerJob) / 60;

  // 6. Calculate monetary value of time saved
  // Formula: hours saved × ₹200/hour
  // Using ₹200/hour as average cost for technician/admin time
  const timeSavingsValueINR = Math.round(
    timeSavedHoursPerMonth * CONSTANTS.HOURLY_COST_INR
  );

  // 7. Calculate revenue recovered from better tracking
  // Formula: monthly revenue × 5%
  // Automet prevents missed billing and forgotten charges
  const recoveredRevenueINR = Math.round(
    monthlyRevenueINR * CONSTANTS.RECOVERED_REVENUE_PERCENT
  );

  // 8. Calculate cashflow gain from faster invoicing
  // Formula: monthly revenue × 5%
  // Faster invoicing improves working capital position
  const cashflowGainINR = Math.round(
    monthlyRevenueINR * CONSTANTS.CASHFLOW_GAIN_PERCENT
  );

  // 9. Calculate total gain from switching to Automet
  // Formula: time savings + recovered revenue + cashflow gain
  const totalGainINR = timeSavingsValueINR + recoveredRevenueINR + cashflowGainINR;

  // 10. Calculate net monthly benefit
  // Formula: total gain - monthly plan cost
  const netMonthlyBenefitINR = totalGainINR - inputs.monthlyPlanCostINR;

  // 11. Calculate net annual benefit
  // Formula: net monthly benefit × 12
  const netAnnualBenefitINR = netMonthlyBenefitINR * 12;

  // 12. Calculate ROI percentage
  // Formula: (annual benefit ÷ annual cost) × 100
  const annualCost = inputs.monthlyPlanCostINR * 12;
  const roiPercent = annualCost > 0
    ? Math.round((netAnnualBenefitINR / annualCost) * 100)
    : 0;

  // 13. Calculate payback period in months
  // Formula: plan cost ÷ (monthly time savings ÷ 12)
  // Note: Using time savings value as the primary benefit driver
  const monthlyTimeSavings = timeSavingsValueINR / 12;
  const paybackMonths = monthlyTimeSavings > 0
    ? Math.round((inputs.monthlyPlanCostINR / monthlyTimeSavings) * 10) / 10
    : 0;

  return {
    jobsPerMonth: Math.round(jobsPerMonth),
    monthlyRevenueINR: Math.round(monthlyRevenueINR),
    currentAdminMinutesPerJob: Math.round(currentAdminMinutesPerJob * 10) / 10,
    minutesSavedPerJob: Math.round(minutesSavedPerJob * 10) / 10,
    timeSavedHoursPerMonth: Math.round(timeSavedHoursPerMonth * 10) / 10,
    timeSavingsValueINR,
    recoveredRevenueINR,
    cashflowGainINR,
    totalGainINR: Math.round(totalGainINR),
    netMonthlyBenefitINR: Math.round(netMonthlyBenefitINR),
    netAnnualBenefitINR: Math.round(netAnnualBenefitINR),
    roiPercent,
    paybackMonths,
  };
}

/**
 * Format a number as Indian currency
 * @param amount - Amount in INR
 * @returns Formatted string (e.g., "₹12,34,567")
 */
export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
