/**
 * Growth Chart Calculator - Verification Tests
 *
 * Tests for pediatric growth calculations.
 */

import { describe, expect, test } from '@jest/globals';
import {
    calculateZScore,
    estimatePercentile,
    calculateBmiData,
    calculateVelocity,
    formatAge,
    GrowthDataPoint
} from '../../calculators/growth-chart/calculation.js';

describe('Growth Chart Calculator', () => {
    // ===========================================
    // TC-001: Z-Score Calculation
    // ===========================================

    describe('Z-Score Calculation', () => {
        test('Should return null for empty data array', () => {
            const result = calculateZScore(12, 75, []);
            expect(result).toBeNull();
        });

        test('Should return null for null/undefined data', () => {
            const result = calculateZScore(12, 75, null as any);
            expect(result).toBeNull();
        });

        test('Should return null when age is too far from reference point', () => {
            const cdcData = [{ Agemos: 24, P5: 80, P50: 86, P95: 92 }] as any[];
            const result = calculateZScore(12, 75, cdcData);
            expect(result).toBeNull();
        });

        test('Should calculate Z-score using LMS method when available', () => {
            const cdcData = [
                {
                    Agemos: 12,
                    L: 1,
                    M: 75,
                    S: 0.04,
                    P5: 70,
                    P50: 75,
                    P95: 80
                }
            ] as any[];
            const result = calculateZScore(12, 75, cdcData);
            expect(result).toBe(0); // At median
        });

        test('Should calculate Z-score using percentile fallback', () => {
            const cdcData = [
                {
                    Agemos: 12,
                    P5: 70,
                    P50: 75,
                    P95: 80
                }
            ] as any[];
            const result = calculateZScore(12, 75, cdcData);
            expect(result).toBeCloseTo(0, 1); // At P50, Z-score ≈ 0
        });

        test('Should return null for value <= 0 with LMS method', () => {
            const cdcData = [
                {
                    Agemos: 12,
                    L: 1,
                    M: 75,
                    S: 0.04,
                    P5: 70,
                    P50: 75,
                    P95: 80
                }
            ] as any[];
            const result = calculateZScore(12, 0, cdcData);
            expect(result).toBeNull();

            const resultNegative = calculateZScore(12, -5, cdcData);
            expect(resultNegative).toBeNull();
        });

        test('Should use log formula when L is close to 0', () => {
            const cdcData = [
                {
                    Agemos: 12,
                    L: 0.001, // Very close to 0
                    M: 75,
                    S: 0.04,
                    P5: 70,
                    P50: 75,
                    P95: 80
                }
            ] as any[];
            const result = calculateZScore(12, 75, cdcData);
            // When L ≈ 0, Z = log(value/M) / S = log(75/75) / 0.04 = 0
            expect(result).toBeCloseTo(0, 1);
        });

        test('Should calculate positive Z-score for above median value', () => {
            const cdcData = [
                {
                    Agemos: 12,
                    L: 1,
                    M: 75,
                    S: 0.04,
                    P5: 70,
                    P50: 75,
                    P95: 80
                }
            ] as any[];
            const result = calculateZScore(12, 80, cdcData);
            expect(result).toBeGreaterThan(0);
        });

        test('Should calculate negative Z-score for below median value', () => {
            const cdcData = [
                {
                    Agemos: 12,
                    L: 1,
                    M: 75,
                    S: 0.04,
                    P5: 70,
                    P50: 75,
                    P95: 80
                }
            ] as any[];
            const result = calculateZScore(12, 70, cdcData);
            expect(result).toBeLessThan(0);
        });

        test('Should return null when P50/P5/P95 are missing for fallback', () => {
            const cdcData = [
                {
                    Agemos: 12
                    // No L, M, S and no P values
                }
            ] as any[];
            const result = calculateZScore(12, 75, cdcData);
            expect(result).toBeNull();
        });

        test('Should find closest age point in CDC data', () => {
            const cdcData = [
                { Agemos: 10, L: 1, M: 73, S: 0.04 },
                { Agemos: 12, L: 1, M: 75, S: 0.04 },
                { Agemos: 14, L: 1, M: 77, S: 0.04 }
            ] as any[];
            // Age 12.5 should match to 12
            const result = calculateZScore(12.5, 75, cdcData);
            expect(result).toBeCloseTo(0, 1);
        });
    });

    // ===========================================
    // TC-002: Percentile Estimation
    // ===========================================

    describe('Percentile Estimation', () => {
        test('Should return empty string for null Z-score', () => {
            expect(estimatePercentile(null)).toBe('');
        });

        test('Z-score 0 = 50th percentile', () => {
            expect(estimatePercentile(0)).toBe('50');
        });

        test('Z-score -2.5 = 3rd percentile', () => {
            expect(estimatePercentile(-2.5)).toBe('3');
        });

        test('Z-score 2.5 = >97th percentile', () => {
            expect(estimatePercentile(2.5)).toBe('>97');
        });

        test('Z-score -1.645 = 5th percentile', () => {
            expect(estimatePercentile(-1.645)).toBe('5');
        });

        test('Z-score 1.645 = 95th percentile', () => {
            expect(estimatePercentile(1.645)).toBe('95');
        });

        test('Z-score -1.28 = 10th percentile', () => {
            expect(estimatePercentile(-1.28)).toBe('10');
        });

        test('Z-score -0.674 = 25th percentile', () => {
            expect(estimatePercentile(-0.674)).toBe('25');
        });

        test('Z-score 0.674 = 75th percentile', () => {
            expect(estimatePercentile(0.674)).toBe('75');
        });

        test('Z-score 1.28 = 90th percentile', () => {
            expect(estimatePercentile(1.28)).toBe('90');
        });

        test('Z-score 2.33 = 97th percentile', () => {
            expect(estimatePercentile(2.33)).toBe('97');
        });

        test('Z-score between boundaries returns correct percentile', () => {
            expect(estimatePercentile(-2.0)).toBe('5'); // Between -2.33 and -1.645
            expect(estimatePercentile(0.3)).toBe('75'); // Between 0 and 0.674
            expect(estimatePercentile(2.0)).toBe('97'); // Between 1.645 and 2.33
        });
    });

    // ===========================================
    // TC-003: BMI Data Calculation
    // ===========================================

    describe('BMI Data Calculation', () => {
        test('Should return empty array for empty inputs', () => {
            expect(calculateBmiData([], [])).toEqual([]);
            expect(calculateBmiData([{ ageMonths: 12, value: 75 }], [])).toEqual([]);
            expect(calculateBmiData([], [{ ageMonths: 12, value: 10 }])).toEqual([]);
        });

        test('Should calculate BMI correctly', () => {
            const heightData: GrowthDataPoint[] = [{ ageMonths: 24, value: 86 }]; // 86 cm
            const weightData: GrowthDataPoint[] = [{ ageMonths: 24, value: 12 }]; // 12 kg

            const bmiData = calculateBmiData(heightData, weightData);

            expect(bmiData.length).toBe(1);
            // BMI = 12 / (0.86)^2 = 12 / 0.7396 = 16.22
            expect(bmiData[0].value).toBeCloseTo(16.22, 1);
        });

        test('Should match closest height measurement', () => {
            const heightData: GrowthDataPoint[] = [
                { ageMonths: 12, value: 75 },
                { ageMonths: 24, value: 86 }
            ];
            const weightData: GrowthDataPoint[] = [{ ageMonths: 23.8, value: 12 }];

            const bmiData = calculateBmiData(heightData, weightData);
            expect(bmiData.length).toBe(1);
        });

        test('Should skip BMI when height and weight ages are too far apart', () => {
            const heightData: GrowthDataPoint[] = [{ ageMonths: 12, value: 75 }];
            const weightData: GrowthDataPoint[] = [{ ageMonths: 24, value: 12 }];

            const bmiData = calculateBmiData(heightData, weightData);
            expect(bmiData.length).toBe(0); // Age difference > 0.5 months
        });

        test('Should calculate multiple BMI points', () => {
            const heightData: GrowthDataPoint[] = [
                { ageMonths: 12, value: 75 },
                { ageMonths: 24, value: 86 },
                { ageMonths: 36, value: 95 }
            ];
            const weightData: GrowthDataPoint[] = [
                { ageMonths: 12, value: 10 },
                { ageMonths: 24, value: 12 },
                { ageMonths: 36, value: 14 }
            ];

            const bmiData = calculateBmiData(heightData, weightData);
            expect(bmiData.length).toBe(3);
        });

        test('Should handle zero height gracefully', () => {
            const heightData: GrowthDataPoint[] = [{ ageMonths: 12, value: 0 }];
            const weightData: GrowthDataPoint[] = [{ ageMonths: 12, value: 10 }];

            const bmiData = calculateBmiData(heightData, weightData);
            expect(bmiData.length).toBe(0); // Division by zero avoided
        });
    });

    // ===========================================
    // TC-004: Velocity Calculation
    // ===========================================

    describe('Growth Velocity Calculation', () => {
        test('Should return empty string for insufficient data', () => {
            expect(calculateVelocity('Height', [], 'cm/month')).toBe('');
            expect(calculateVelocity('Height', [{ ageMonths: 12, value: 75 }], 'cm/month')).toBe(
                ''
            );
        });

        test('Should calculate positive velocity', () => {
            const measurements: GrowthDataPoint[] = [
                { ageMonths: 12, value: 75 },
                { ageMonths: 18, value: 81 }
            ];

            const result = calculateVelocity('Height', measurements, 'cm/month');

            expect(result).toContain('Height Velocity');
            expect(result).toContain('+'); // Positive growth
            expect(result).toContain('months'); // Time period
        });

        test('Should calculate negative velocity (weight loss)', () => {
            const measurements: GrowthDataPoint[] = [
                { ageMonths: 12, value: 10 },
                { ageMonths: 14, value: 9.5 }
            ];

            const result = calculateVelocity('Weight', measurements, 'kg/month');

            expect(result).toContain('Weight Velocity');
            expect(result).toContain('text-danger'); // Negative growth shown in danger color
        });

        test('Should use singular "month" for short time periods', () => {
            const measurements: GrowthDataPoint[] = [
                { ageMonths: 12, value: 75 },
                { ageMonths: 13, value: 76 }
            ];

            const result = calculateVelocity('Height', measurements, 'cm/month');
            expect(result).toContain('month');
        });

        test('Should return empty for zero time difference', () => {
            const measurements: GrowthDataPoint[] = [
                { ageMonths: 12, value: 75 },
                { ageMonths: 12, value: 76 }
            ];

            const result = calculateVelocity('Height', measurements, 'cm/month');
            expect(result).toBe('');
        });

        test('Should return empty for negative time difference', () => {
            const measurements: GrowthDataPoint[] = [
                { ageMonths: 14, value: 75 },
                { ageMonths: 12, value: 76 }
            ];

            const result = calculateVelocity('Height', measurements, 'cm/month');
            expect(result).toBe('');
        });

        test('Should apply multiplier correctly', () => {
            const measurements: GrowthDataPoint[] = [
                { ageMonths: 12, value: 10 },
                { ageMonths: 14, value: 11 }
            ];

            // Using multiplier 1000 to convert kg to g
            const result = calculateVelocity('Weight', measurements, 'g/month', 1000);
            expect(result).toContain('500.0'); // (11-10)*1000 / 2 months = 500 g/month
        });

        test('Should only use last two measurements', () => {
            const measurements: GrowthDataPoint[] = [
                { ageMonths: 6, value: 68 },
                { ageMonths: 12, value: 75 },
                { ageMonths: 18, value: 81 }
            ];

            const result = calculateVelocity('Height', measurements, 'cm/month');
            // Should calculate from 12-18 months, not 6-18
            expect(result).toContain('6.0 months'); // 18-12 = 6 months
        });
    });

    // ===========================================
    // TC-005: Age Formatting
    // ===========================================

    describe('Age Formatting', () => {
        test('Should format months only', () => {
            expect(formatAge(5)).toBe('5m');
            expect(formatAge(11)).toBe('11m');
        });

        test('Should format years and months', () => {
            expect(formatAge(24)).toBe('2y 0m');
            expect(formatAge(30)).toBe('2y 6m');
            expect(formatAge(36)).toBe('3y 0m');
        });

        test('Should handle edge cases', () => {
            expect(formatAge(0)).toBe('0m');
            expect(formatAge(12)).toBe('1y 0m');
        });
    });
});
