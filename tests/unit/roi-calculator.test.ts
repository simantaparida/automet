import { calculateROI, formatCurrency } from '@/lib/roiCalculator';

describe('ROI calculator', () => {
  it('computes expected financial metrics', () => {
    const result = calculateROI({
      technicians: 12,
      jobsPerTechnicianPerMonth: 28,
      avgRevenuePerJobINR: 1500,
      adminHoursPerWeekAllStaff: 24,
      monthlyPlanCostINR: 4999,
    });

    expect(result.jobsPerMonth).toBe(336);
    expect(result.monthlyRevenueINR).toBe(504000);
    expect(result.netMonthlyBenefitINR).toBeGreaterThan(0);
    expect(result.netAnnualBenefitINR).toEqual(
      result.netMonthlyBenefitINR * 12
    );
    expect(result.roiPercent).toBeGreaterThan(0);
    expect(result.paybackMonths).toBeGreaterThan(0);
  });

  it('formats Indian currency strings correctly', () => {
    expect(formatCurrency(1234567)).toBe('₹12,34,567');
    expect(formatCurrency(-98765)).toBe('-₹98,765');
  });
});
