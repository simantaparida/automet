/**
 * Unit tests for ROI Calculator
 */

import { calculateROI, ROIInputs, formatCurrency } from '../lib/roiCalculator';

describe('ROI Calculator', () => {
  describe('calculateROI', () => {
    it('should calculate ROI for small 5-tech company', () => {
      const inputs: ROIInputs = {
        technicians: 5,
        jobsPerTechnicianPerMonth: 25,
        avgRevenuePerJobINR: 1000,
        adminHoursPerWeekAllStaff: 10,
        monthlyPlanCostINR: 999, // Starter plan
      };

      const result = calculateROI(inputs);

      // Basic calculations
      expect(result.jobsPerMonth).toBe(125); // 5 × 25
      expect(result.monthlyRevenueINR).toBe(125000); // 125 × 1000

      // Admin time calculations
      expect(result.currentAdminMinutesPerJob).toBeCloseTo(20.8, 1); // (10 × 60) / (125 / 4.33)
      expect(result.minutesSavedPerJob).toBeCloseTo(10.4, 1); // 50% of current

      // Time savings
      expect(result.timeSavedHoursPerMonth).toBeCloseTo(21.7, 1); // (125 × 10.4) / 60
      expect(result.timeSavingsValueINR).toBeCloseTo(4333, -1); // 21.7 × 200

      // Revenue gains
      expect(result.recoveredRevenueINR).toBe(2500); // 2% of 125000
      expect(result.cashflowGainINR).toBe(1250); // 1% of 125000

      // Total calculations
      expect(result.totalGainINR).toBeCloseTo(8083, -1); // sum of above
      expect(result.netMonthlyBenefitINR).toBeCloseTo(7084, -1); // 8083 - 999
      expect(result.netAnnualBenefitINR).toBeCloseTo(85008, -1); // 7084 × 12

      // ROI metrics
      expect(result.roiPercent).toBeGreaterThan(700); // Should be ~709%
      expect(result.paybackMonths).toBeLessThan(3); // Should recover quickly
    });

    it('should calculate ROI for mid 20-tech company', () => {
      const inputs: ROIInputs = {
        technicians: 20,
        jobsPerTechnicianPerMonth: 30,
        avgRevenuePerJobINR: 1200,
        adminHoursPerWeekAllStaff: 35,
        monthlyPlanCostINR: 2999, // Growth plan
      };

      const result = calculateROI(inputs);

      // Basic calculations
      expect(result.jobsPerMonth).toBe(600); // 20 × 30
      expect(result.monthlyRevenueINR).toBe(720000); // 600 × 1200

      // Admin time calculations
      expect(result.currentAdminMinutesPerJob).toBeCloseTo(15.2, 1); // (35 × 60) / (600 / 4.33)
      expect(result.minutesSavedPerJob).toBeCloseTo(7.6, 1); // 50% of current

      // Time savings
      expect(result.timeSavedHoursPerMonth).toBeCloseTo(76, 0); // (600 × 7.6) / 60
      expect(result.timeSavingsValueINR).toBeCloseTo(15200, -1); // 76 × 200

      // Revenue gains
      expect(result.recoveredRevenueINR).toBe(14400); // 2% of 720000
      expect(result.cashflowGainINR).toBe(7200); // 1% of 720000

      // Total calculations
      expect(result.totalGainINR).toBeCloseTo(36800, -1); // sum of above
      expect(result.netMonthlyBenefitINR).toBeCloseTo(33801, -1); // 36800 - 2999
      expect(result.netAnnualBenefitINR).toBeCloseTo(405612, -1); // 33801 × 12

      // ROI metrics
      expect(result.roiPercent).toBeGreaterThan(1100); // Should be ~1128%
      expect(result.paybackMonths).toBeLessThan(1); // Should recover in less than a month
    });

    it('should calculate ROI for large 50-tech company', () => {
      const inputs: ROIInputs = {
        technicians: 50,
        jobsPerTechnicianPerMonth: 35,
        avgRevenuePerJobINR: 1500,
        adminHoursPerWeekAllStaff: 80,
        monthlyPlanCostINR: 9999, // Business plan
      };

      const result = calculateROI(inputs);

      // Basic calculations
      expect(result.jobsPerMonth).toBe(1750); // 50 × 35
      expect(result.monthlyRevenueINR).toBe(2625000); // 1750 × 1500

      // Admin time calculations
      expect(result.currentAdminMinutesPerJob).toBeCloseTo(11.9, 1); // (80 × 60) / (1750 / 4.33)
      expect(result.minutesSavedPerJob).toBeCloseTo(5.9, 1); // 50% of current

      // Time savings
      expect(result.timeSavedHoursPerMonth).toBeCloseTo(172.1, 1); // (1750 × 5.9) / 60
      expect(result.timeSavingsValueINR).toBeCloseTo(34417, -1); // 172.1 × 200

      // Revenue gains
      expect(result.recoveredRevenueINR).toBe(52500); // 2% of 2625000
      expect(result.cashflowGainINR).toBe(26250); // 1% of 2625000

      // Total calculations
      expect(result.totalGainINR).toBeCloseTo(113167, -1); // sum of above
      expect(result.netMonthlyBenefitINR).toBeCloseTo(103168, -1); // 113167 - 9999
      expect(result.netAnnualBenefitINR).toBeCloseTo(1238016, -1); // 103168 × 12

      // ROI metrics
      expect(result.roiPercent).toBeGreaterThan(1000); // Should be ~1032%
      expect(result.paybackMonths).toBeLessThan(0.5); // Should recover very quickly
    });

    it('should handle edge case with zero jobs', () => {
      const inputs: ROIInputs = {
        technicians: 0,
        jobsPerTechnicianPerMonth: 30,
        avgRevenuePerJobINR: 1200,
        adminHoursPerWeekAllStaff: 20,
        monthlyPlanCostINR: 2999,
      };

      const result = calculateROI(inputs);

      expect(result.jobsPerMonth).toBe(0);
      expect(result.monthlyRevenueINR).toBe(0);
      expect(result.timeSavingsValueINR).toBe(0);
      expect(result.netMonthlyBenefitINR).toBe(-2999); // Only cost, no benefit
      expect(result.roiPercent).toBe(-100); // Complete loss
    });

    it('should handle free plan correctly', () => {
      const inputs: ROIInputs = {
        technicians: 10,
        jobsPerTechnicianPerMonth: 30,
        avgRevenuePerJobINR: 1200,
        adminHoursPerWeekAllStaff: 20,
        monthlyPlanCostINR: 0, // Free plan
      };

      const result = calculateROI(inputs);

      expect(result.planCost).toBe(0);
      expect(result.netMonthlyBenefitINR).toBe(result.totalGainINR); // All gain, no cost
      expect(result.roiPercent).toBe(0); // Can't divide by zero, returns 0
      expect(result.paybackMonths).toBe(0); // No cost to recover
    });

    it('should have realistic rupee values for typical SMB', () => {
      const inputs: ROIInputs = {
        technicians: 10,
        jobsPerTechnicianPerMonth: 30,
        avgRevenuePerJobINR: 1200,
        adminHoursPerWeekAllStaff: 20,
        monthlyPlanCostINR: 2999,
      };

      const result = calculateROI(inputs);

      // Revenue should be realistic
      expect(result.monthlyRevenueINR).toBe(360000); // ₹3.6 lakhs

      // Gains should be reasonable
      expect(result.timeSavingsValueINR).toBeGreaterThan(5000);
      expect(result.timeSavingsValueINR).toBeLessThan(20000);
      expect(result.recoveredRevenueINR).toBe(7200); // 2% of revenue
      expect(result.cashflowGainINR).toBe(3600); // 1% of revenue

      // Net benefit should be positive and significant
      expect(result.netMonthlyBenefitINR).toBeGreaterThan(10000);

      // ROI should be very attractive
      expect(result.roiPercent).toBeGreaterThan(400); // At least 400% ROI
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts in Indian format', () => {
      expect(formatCurrency(1234567)).toBe('₹12,34,567');
      expect(formatCurrency(100000)).toBe('₹1,00,000');
      expect(formatCurrency(1000)).toBe('₹1,000');
    });

    it('should format negative amounts', () => {
      expect(formatCurrency(-5000)).toBe('-₹5,000');
      expect(formatCurrency(-123456)).toBe('-₹1,23,456');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('should round to nearest whole number', () => {
      expect(formatCurrency(1234.56)).toBe('₹1,235');
      expect(formatCurrency(1234.44)).toBe('₹1,234');
    });
  });
});
