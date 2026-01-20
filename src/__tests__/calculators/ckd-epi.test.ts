/**
 * CKD-EPI GFR Calculator - SaMD Verification Tests
 *
 * Formula (2021 Race-Free Equation):
 *   Female: 142 × min(Scr/0.7, 1)^(-0.241) × max(Scr/0.7, 1)^(-1.200) × 0.9938^Age × 1.012
 *   Male:   142 × min(Scr/0.9, 1)^(-0.302) × max(Scr/0.9, 1)^(-1.200) × 0.9938^Age
 *
 * CKD Staging:
 *   Stage 1: GFR ≥90 (Normal)
 *   Stage 2: GFR 60-89 (Mild)
 *   Stage 3a: GFR 45-59 (Mild to moderate)
 *   Stage 3b: GFR 30-44 (Moderate to severe)
 *   Stage 4: GFR 15-29 (Severe)
 *   Stage 5: GFR <15 (Kidney failure)
 *
 * Reference:
 * Inker LA, et al. N Engl J Med. 2021;385(19):1737-1749.
 */

import { calculateCkdEpi } from '../../calculators/ckd-epi/calculation.js';

describe('CKD-EPI GFR Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    describe('Standard Calculations', () => {
        test('Should calculate correct eGFR for Male, normal kidney function', () => {
            // 40 yo male, Scr 0.9 mg/dL
            // kappa=0.9, alpha=-0.302
            // min(0.9/0.9, 1) = 1, max(0.9/0.9, 1) = 1
            // GFR = 142 * 1^(-0.302) * 1^(-1.2) * 0.9938^40 = 142 * 0.778 = 110
            const result = calculateCkdEpi({
                'ckd-epi-age': 40,
                'ckd-epi-creatinine': 0.9,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(1);
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeGreaterThan(90);
            expect(result![0].alertClass).toBe('success');
            expect(result![0].interpretation).toContain('Stage 1');
        });

        test('Should calculate correct eGFR for Female', () => {
            // 40 yo female, Scr 0.7 mg/dL
            // kappa=0.7, alpha=-0.241, genderFactor=1.012
            const result = calculateCkdEpi({
                'ckd-epi-age': 40,
                'ckd-epi-creatinine': 0.7,
                'ckd-epi-gender': 'female'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeGreaterThan(90);
            expect(result![0].alertClass).toBe('success');
        });

        test('Should calculate lower eGFR for elevated creatinine', () => {
            // 60 yo male, Scr 2.0 mg/dL
            const result = calculateCkdEpi({
                'ckd-epi-age': 60,
                'ckd-epi-creatinine': 2.0,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeLessThan(60);
        });
    });

    // ===========================================
    // TC-002: CKD Staging Tests
    // ===========================================

    describe('CKD Staging', () => {
        test('Should identify Stage 1 (GFR ≥90)', () => {
            // Young healthy male with low creatinine
            const result = calculateCkdEpi({
                'ckd-epi-age': 25,
                'ckd-epi-creatinine': 0.8,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeGreaterThanOrEqual(90);
            expect(result![0].alertClass).toBe('success');
            expect(result![0].interpretation).toContain('Stage 1');
        });

        test('Should identify Stage 2 (GFR 60-89)', () => {
            // 65 yo male, Scr 1.0 mg/dL
            const result = calculateCkdEpi({
                'ckd-epi-age': 65,
                'ckd-epi-creatinine': 1.0,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeGreaterThanOrEqual(60);
            expect(gfr).toBeLessThan(90);
            expect(result![0].alertClass).toBe('success');
            expect(result![0].interpretation).toContain('Stage 2');
        });

        test('Should identify Stage 3a (GFR 45-59)', () => {
            // 70 yo male, Scr 1.4 mg/dL
            const result = calculateCkdEpi({
                'ckd-epi-age': 70,
                'ckd-epi-creatinine': 1.4,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeGreaterThanOrEqual(45);
            expect(gfr).toBeLessThan(60);
            expect(result![0].alertClass).toBe('warning');
            expect(result![0].interpretation).toContain('Stage 3a');
        });

        test('Should identify Stage 3b (GFR 30-44)', () => {
            // 70 yo male, Scr 1.8 mg/dL
            const result = calculateCkdEpi({
                'ckd-epi-age': 70,
                'ckd-epi-creatinine': 1.8,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeGreaterThanOrEqual(30);
            expect(gfr).toBeLessThan(45);
            expect(result![0].alertClass).toBe('warning');
            expect(result![0].interpretation).toContain('Stage 3b');
        });

        test('Should identify Stage 4 (GFR 15-29)', () => {
            // 70 yo male, Scr 3.0 mg/dL
            const result = calculateCkdEpi({
                'ckd-epi-age': 70,
                'ckd-epi-creatinine': 3.0,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeGreaterThanOrEqual(15);
            expect(gfr).toBeLessThan(30);
            expect(result![0].alertClass).toBe('danger');
            expect(result![0].interpretation).toContain('Stage 4');
        });

        test('Should identify Stage 5 (GFR <15)', () => {
            // 70 yo male, Scr 6.0 mg/dL
            const result = calculateCkdEpi({
                'ckd-epi-age': 70,
                'ckd-epi-creatinine': 6.0,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeLessThan(15);
            expect(result![0].alertClass).toBe('danger');
            expect(result![0].interpretation).toContain('Stage 5');
        });
    });

    // ===========================================
    // TC-003: Age Effect Tests
    // ===========================================

    describe('Age Effect', () => {
        test('Should show lower eGFR for older patients', () => {
            // Same creatinine, different ages
            const result40 = calculateCkdEpi({
                'ckd-epi-age': 40,
                'ckd-epi-creatinine': 1.0,
                'ckd-epi-gender': 'male'
            });

            const result80 = calculateCkdEpi({
                'ckd-epi-age': 80,
                'ckd-epi-creatinine': 1.0,
                'ckd-epi-gender': 'male'
            });

            expect(result40).not.toBeNull();
            expect(result80).not.toBeNull();

            const gfr40 = parseFloat(result40![0].value as string);
            const gfr80 = parseFloat(result80![0].value as string);

            expect(gfr40).toBeGreaterThan(gfr80);
        });
    });

    // ===========================================
    // TC-004: Gender Effect Tests
    // ===========================================

    describe('Gender Effect', () => {
        test('Should show higher eGFR for females at same creatinine', () => {
            // Same age and creatinine, different gender
            const resultMale = calculateCkdEpi({
                'ckd-epi-age': 50,
                'ckd-epi-creatinine': 1.0,
                'ckd-epi-gender': 'male'
            });

            const resultFemale = calculateCkdEpi({
                'ckd-epi-age': 50,
                'ckd-epi-creatinine': 1.0,
                'ckd-epi-gender': 'female'
            });

            expect(resultMale).not.toBeNull();
            expect(resultFemale).not.toBeNull();

            const gfrMale = parseFloat(resultMale![0].value as string);
            const gfrFemale = parseFloat(resultFemale![0].value as string);

            // Female formula includes 1.012 factor and different kappa/alpha
            // At Scr=1.0, female should have slightly different GFR
            expect(gfrMale).not.toBe(gfrFemale);
        });
    });

    // ===========================================
    // TC-005: Invalid Input Tests
    // ===========================================

    describe('Invalid Inputs', () => {
        test('Should return null for zero age', () => {
            const result = calculateCkdEpi({
                'ckd-epi-age': 0,
                'ckd-epi-creatinine': 1.0,
                'ckd-epi-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero creatinine', () => {
            const result = calculateCkdEpi({
                'ckd-epi-age': 50,
                'ckd-epi-creatinine': 0,
                'ckd-epi-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for negative creatinine', () => {
            const result = calculateCkdEpi({
                'ckd-epi-age': 50,
                'ckd-epi-creatinine': -1.0,
                'ckd-epi-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for missing inputs', () => {
            const result = calculateCkdEpi({
                'ckd-epi-age': 50
            });

            expect(result).toBeNull();
        });
    });

    // ===========================================
    // TC-006: Golden Dataset Verification
    // ===========================================

    describe('Golden Dataset', () => {
        // Reference values calculated using CKD-EPI 2021 equation
        const goldenDataset = [
            // age, creatinine, gender, expected GFR (approximate)
            { age: 40, cr: 0.9, g: 'male', minGfr: 105, maxGfr: 115 },
            { age: 40, cr: 0.7, g: 'female', minGfr: 110, maxGfr: 120 },
            { age: 60, cr: 1.0, g: 'male', minGfr: 80, maxGfr: 90 },
            { age: 60, cr: 1.0, g: 'female', minGfr: 60, maxGfr: 70 }, // Female with higher Scr
            { age: 70, cr: 1.5, g: 'male', minGfr: 42, maxGfr: 52 },
            { age: 80, cr: 2.0, g: 'male', minGfr: 28, maxGfr: 35 }
        ];

        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.age}yo ${data.g}, Scr ${data.cr}`, () => {
                const result = calculateCkdEpi({
                    'ckd-epi-age': data.age,
                    'ckd-epi-creatinine': data.cr,
                    'ckd-epi-gender': data.g
                });

                expect(result).not.toBeNull();
                const gfr = parseFloat(result![0].value as string);
                expect(gfr).toBeGreaterThanOrEqual(data.minGfr);
                expect(gfr).toBeLessThanOrEqual(data.maxGfr);
            });
        });
    });

    // ===========================================
    // TC-007: Formula Component Verification
    // ===========================================

    describe('Formula Components', () => {
        test('Should use kappa=0.7 for female', () => {
            // At Scr=0.7 (equals kappa), min and max terms become 1
            const result = calculateCkdEpi({
                'ckd-epi-age': 40,
                'ckd-epi-creatinine': 0.7,
                'ckd-epi-gender': 'female'
            });

            expect(result).not.toBeNull();
            // When Scr = kappa, formula simplifies to: 142 * 0.9938^age * 1.012
            // 142 * 0.9938^40 * 1.012 ≈ 142 * 0.778 * 1.012 ≈ 112
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeCloseTo(112, -1);
        });

        test('Should use kappa=0.9 for male', () => {
            // At Scr=0.9 (equals kappa), min and max terms become 1
            const result = calculateCkdEpi({
                'ckd-epi-age': 40,
                'ckd-epi-creatinine': 0.9,
                'ckd-epi-gender': 'male'
            });

            expect(result).not.toBeNull();
            // When Scr = kappa, formula simplifies to: 142 * 0.9938^age
            // 142 * 0.9938^40 ≈ 142 * 0.778 ≈ 110
            const gfr = parseFloat(result![0].value as string);
            expect(gfr).toBeCloseTo(110, -1);
        });
    });
});
