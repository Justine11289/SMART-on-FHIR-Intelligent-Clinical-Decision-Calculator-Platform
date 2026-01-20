/**
 * tPA (Alteplase) Dosing Calculator - SaMD Verification Tests
 *
 * Formula:
 *   Total Dose = 0.9 mg/kg (Maximum 90 mg)
 *   Bolus Dose = 10% of total dose
 *   Infusion Dose = 90% of total dose
 *
 * Constraints:
 *   - Maximum total dose is 90 mg (weight capped at 100 kg)
 *
 * Reference:
 * NINDS rt-PA Stroke Study Group. N Engl J Med. 1995;333(24):1581-1587.
 */

import { calculateTpaDosing } from '../../calculators/tpa-dosing/calculation.js';

describe('tPA (Alteplase) Dosing Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    describe('Standard Calculations', () => {
        test('Should calculate correct doses for 70 kg patient', () => {
            // Total = 70 * 0.9 = 63 mg
            // Bolus = 63 * 0.1 = 6.3 mg
            // Infusion = 63 * 0.9 = 56.7 mg
            const result = calculateTpaDosing({
                'tpa-weight': 70
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);

            expect(result![0].label).toBe('Total Dose');
            expect(result![0].value).toBe('63.00');
            expect(result![0].unit).toBe('mg');

            expect(result![1].label).toBe('Bolus Dose (10%)');
            expect(result![1].value).toBe('6.30');

            expect(result![2].label).toBe('Infusion Dose (90%)');
            expect(result![2].value).toBe('56.70');
        });

        test('Should calculate correct doses for 50 kg patient', () => {
            // Total = 50 * 0.9 = 45 mg
            // Bolus = 45 * 0.1 = 4.5 mg
            // Infusion = 45 * 0.9 = 40.5 mg
            const result = calculateTpaDosing({
                'tpa-weight': 50
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('45.00');
            expect(result![1].value).toBe('4.50');
            expect(result![2].value).toBe('40.50');
        });

        test('Should calculate correct doses for 100 kg patient (at max)', () => {
            // Total = 100 * 0.9 = 90 mg (max)
            // Bolus = 90 * 0.1 = 9 mg
            // Infusion = 90 * 0.9 = 81 mg
            const result = calculateTpaDosing({
                'tpa-weight': 100
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('90.00');
            expect(result![1].value).toBe('9.00');
            expect(result![2].value).toBe('81.00');
        });
    });

    // ===========================================
    // TC-002: Maximum Dose Cap Tests
    // ===========================================

    describe('Maximum Dose Cap', () => {
        test('Should cap total dose at 90 mg for weight > 100 kg', () => {
            // 120 kg patient should be capped
            // Total = 90 mg (not 108 mg)
            const result = calculateTpaDosing({
                'tpa-weight': 120
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('90.00');
            expect(result![0].interpretation).toContain('Capped');
            expect(result![0].alertClass).toBe('warning');
        });

        test('Should cap for very heavy patient (150 kg)', () => {
            const result = calculateTpaDosing({
                'tpa-weight': 150
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('90.00');
            expect(result![1].value).toBe('9.00');
            expect(result![2].value).toBe('81.00');
        });

        test('Should not show cap warning for weight <= 100 kg', () => {
            const result = calculateTpaDosing({
                'tpa-weight': 100
            });

            expect(result).not.toBeNull();
            expect(result![0].interpretation || '').not.toContain('Capped');
        });

        test('Should not show cap warning for weight < 100 kg', () => {
            const result = calculateTpaDosing({
                'tpa-weight': 80
            });

            expect(result).not.toBeNull();
            expect(result![0].interpretation || '').not.toContain('Capped');
        });
    });

    // ===========================================
    // TC-003: Dose Ratio Tests
    // ===========================================

    describe('Dose Ratios', () => {
        test('Bolus should be exactly 10% of total', () => {
            const weights = [50, 60, 70, 80, 90];

            weights.forEach(weight => {
                const result = calculateTpaDosing({ 'tpa-weight': weight });
                expect(result).not.toBeNull();

                const total = parseFloat(result![0].value as string);
                const bolus = parseFloat(result![1].value as string);

                expect(bolus).toBeCloseTo(total * 0.1, 2);
            });
        });

        test('Infusion should be exactly 90% of total', () => {
            const weights = [50, 60, 70, 80, 90];

            weights.forEach(weight => {
                const result = calculateTpaDosing({ 'tpa-weight': weight });
                expect(result).not.toBeNull();

                const total = parseFloat(result![0].value as string);
                const infusion = parseFloat(result![2].value as string);

                expect(infusion).toBeCloseTo(total * 0.9, 2);
            });
        });

        test('Bolus + Infusion should equal Total', () => {
            const result = calculateTpaDosing({ 'tpa-weight': 75 });
            expect(result).not.toBeNull();

            const total = parseFloat(result![0].value as string);
            const bolus = parseFloat(result![1].value as string);
            const infusion = parseFloat(result![2].value as string);

            expect(bolus + infusion).toBeCloseTo(total, 2);
        });
    });

    // ===========================================
    // TC-004: Boundary Value Tests
    // ===========================================

    describe('Boundary Values', () => {
        test('Should work for minimum reasonable weight (30 kg)', () => {
            const result = calculateTpaDosing({
                'tpa-weight': 30
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('27.00');
        });

        test('Should work at exactly 100 kg boundary', () => {
            const result = calculateTpaDosing({
                'tpa-weight': 100
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('90.00');
            // Should NOT be marked as capped since it's exactly at the limit
        });

        test('Should cap at 100.1 kg', () => {
            const result = calculateTpaDosing({
                'tpa-weight': 100.1
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('90.00');
            expect(result![0].interpretation).toContain('Capped');
        });
    });

    // ===========================================
    // TC-005: Invalid Input Tests
    // ===========================================

    describe('Invalid Inputs', () => {
        test('Should return null for zero weight', () => {
            const result = calculateTpaDosing({
                'tpa-weight': 0
            });

            expect(result).toBeNull();
        });

        test('Should return null for negative weight', () => {
            const result = calculateTpaDosing({
                'tpa-weight': -70
            });

            expect(result).toBeNull();
        });

        test('Should return null for missing weight', () => {
            const result = calculateTpaDosing({});

            expect(result).toBeNull();
        });

        test('Should return null for NaN weight', () => {
            const result = calculateTpaDosing({
                'tpa-weight': NaN
            });

            expect(result).toBeNull();
        });
    });

    // ===========================================
    // TC-006: Golden Dataset Verification
    // ===========================================

    describe('Golden Dataset', () => {
        const goldenDataset = [
            // weight, expectedTotal, expectedBolus, expectedInfusion
            { w: 50, total: 45.0, bolus: 4.5, infusion: 40.5 },
            { w: 60, total: 54.0, bolus: 5.4, infusion: 48.6 },
            { w: 70, total: 63.0, bolus: 6.3, infusion: 56.7 },
            { w: 80, total: 72.0, bolus: 7.2, infusion: 64.8 },
            { w: 90, total: 81.0, bolus: 8.1, infusion: 72.9 },
            { w: 100, total: 90.0, bolus: 9.0, infusion: 81.0 },
            { w: 110, total: 90.0, bolus: 9.0, infusion: 81.0 }, // Capped
            { w: 120, total: 90.0, bolus: 9.0, infusion: 81.0 } // Capped
        ];

        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.w} kg`, () => {
                const result = calculateTpaDosing({ 'tpa-weight': data.w });

                expect(result).not.toBeNull();
                expect(parseFloat(result![0].value as string)).toBeCloseTo(data.total, 2);
                expect(parseFloat(result![1].value as string)).toBeCloseTo(data.bolus, 2);
                expect(parseFloat(result![2].value as string)).toBeCloseTo(data.infusion, 2);
            });
        });
    });

    // ===========================================
    // TC-007: Clinical Context Tests
    // ===========================================

    describe('Clinical Context', () => {
        test('Should include administration instructions', () => {
            const result = calculateTpaDosing({ 'tpa-weight': 70 });

            expect(result).not.toBeNull();
            expect(result![1].interpretation).toContain('1 minute');
            expect(result![2].interpretation).toContain('60 minutes');
        });
    });
});
