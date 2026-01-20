/**
 * Ethanol Concentration Calculator - SaMD Verification Tests
 *
 * Formula: Concentration (mg/dL) = (Grams × 1000) / (Weight × Vd × 10)
 * Where:
 *   - Grams of Alcohol = Volume (mL) × (ABV% / 100) × 0.789
 *   - Vd (Volume of Distribution): Male = 0.68 L/kg, Female = 0.55 L/kg
 *
 * Reference: Standard pharmacokinetic ethanol calculations
 *
 * Clinical Thresholds:
 *   - < 80 mg/dL: Below Legal Limit (success)
 *   - 80-299 mg/dL: Above Legal Limit (warning)
 *   - 300-399 mg/dL: Severe Intoxication (danger)
 *   - >= 400 mg/dL: Potentially Fatal (danger)
 */

import { calculateEthanolConcentration } from '../../calculators/ethanol-concentration/calculation.js';

describe('Ethanol Concentration Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    describe('Standard Calculations', () => {
        test('Should calculate correct concentration for Male (standard drink)', () => {
            // 1.5 fl oz (44.36 mL) of 40% ABV whiskey, 70 kg male
            // Grams = 44.36 * 0.4 * 0.789 = 14.0 g
            // Concentration = (14.0 * 1000) / (70 * 0.68 * 10) = 14000 / 476 = 29.4 mg/dL
            const result = calculateEthanolConcentration({
                'eth-amount': 44.36, // mL (after conversion from fl oz)
                'eth-abv': 40,
                'eth-weight': 70,
                'eth-gender': 'male'
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(1);
            expect(parseFloat(result![0].value as string)).toBeCloseTo(29, 0);
            expect(result![0].alertClass).toBe('success');
            expect(result![0].interpretation).toBe('Below Legal Limit');
        });

        test('Should calculate correct concentration for Female (higher concentration due to lower Vd)', () => {
            // Same drink, 70 kg female
            // Grams = 44.36 * 0.4 * 0.789 = 14.0 g
            // Concentration = (14.0 * 1000) / (70 * 0.55 * 10) = 14000 / 385 = 36.4 mg/dL
            const result = calculateEthanolConcentration({
                'eth-amount': 44.36,
                'eth-abv': 40,
                'eth-weight': 70,
                'eth-gender': 'female'
            });

            expect(result).not.toBeNull();
            expect(parseFloat(result![0].value as string)).toBeCloseTo(36, 0);
            expect(result![0].alertClass).toBe('success');
        });

        test('Should calculate concentration for beer (lower ABV)', () => {
            // 355 mL (12 oz) of 5% ABV beer, 70 kg male
            // Grams = 355 * 0.05 * 0.789 = 14.0 g
            // Concentration = (14.0 * 1000) / (70 * 0.68 * 10) = 14000 / 476 = 29.4 mg/dL
            const result = calculateEthanolConcentration({
                'eth-amount': 355,
                'eth-abv': 5,
                'eth-weight': 70,
                'eth-gender': 'male'
            });

            expect(result).not.toBeNull();
            expect(parseFloat(result![0].value as string)).toBeCloseTo(29, 0);
        });
    });

    // ===========================================
    // TC-002: Severity Classification Tests
    // ===========================================

    describe('Severity Classification', () => {
        test('Should identify "Above Legal Limit" (80-299 mg/dL)', () => {
            // High volume to exceed legal limit
            // 200 mL of 40% ABV, 50 kg male
            // Grams = 200 * 0.4 * 0.789 = 63.12 g
            // Concentration = (63.12 * 1000) / (50 * 0.68 * 10) = 63120 / 340 = 185.6 mg/dL
            const result = calculateEthanolConcentration({
                'eth-amount': 200,
                'eth-abv': 40,
                'eth-weight': 50,
                'eth-gender': 'male'
            });

            expect(result).not.toBeNull();
            const concentration = parseFloat(result![0].value as string);
            expect(concentration).toBeGreaterThanOrEqual(80);
            expect(concentration).toBeLessThan(300);
            expect(result![0].alertClass).toBe('warning');
            expect(result![0].interpretation).toBe('Above Legal Limit (0.08%)');
        });

        test('Should identify "Severe Intoxication" (300-399 mg/dL)', () => {
            // Very high volume
            // 400 mL of 40% ABV, 50 kg male
            // Grams = 400 * 0.4 * 0.789 = 126.24 g
            // Concentration = (126.24 * 1000) / (50 * 0.68 * 10) = 126240 / 340 = 371 mg/dL
            const result = calculateEthanolConcentration({
                'eth-amount': 400,
                'eth-abv': 40,
                'eth-weight': 50,
                'eth-gender': 'male'
            });

            expect(result).not.toBeNull();
            const concentration = parseFloat(result![0].value as string);
            expect(concentration).toBeGreaterThanOrEqual(300);
            expect(concentration).toBeLessThan(400);
            expect(result![0].alertClass).toBe('danger');
            expect(result![0].interpretation).toBe('Severe Intoxication');
        });

        test('Should identify "Potentially Fatal Level" (>= 400 mg/dL)', () => {
            // Extreme volume
            // 500 mL of 40% ABV, 40 kg female
            // Grams = 500 * 0.4 * 0.789 = 157.8 g
            // Concentration = (157.8 * 1000) / (40 * 0.55 * 10) = 157800 / 220 = 717 mg/dL
            const result = calculateEthanolConcentration({
                'eth-amount': 500,
                'eth-abv': 40,
                'eth-weight': 40,
                'eth-gender': 'female'
            });

            expect(result).not.toBeNull();
            const concentration = parseFloat(result![0].value as string);
            expect(concentration).toBeGreaterThanOrEqual(400);
            expect(result![0].alertClass).toBe('danger');
            expect(result![0].interpretation).toBe('Potentially Fatal Level');
        });
    });

    // ===========================================
    // TC-003: Boundary Value Tests
    // ===========================================

    describe('Boundary Values', () => {
        test('Should handle minimum valid inputs', () => {
            const result = calculateEthanolConcentration({
                'eth-amount': 1,
                'eth-abv': 1,
                'eth-weight': 1,
                'eth-gender': 'male'
            });

            expect(result).not.toBeNull();
            expect(parseFloat(result![0].value as string)).toBeGreaterThan(0);
        });

        test('Should handle boundary at legal limit (exactly 80 mg/dL)', () => {
            // Calculate inputs to get approximately 80 mg/dL
            // 80 = (V * 0.4 * 0.789 * 1000) / (70 * 0.68 * 10)
            // 80 = (V * 315.6) / 476
            // V = 80 * 476 / 315.6 = 120.6 mL
            const result = calculateEthanolConcentration({
                'eth-amount': 120.6,
                'eth-abv': 40,
                'eth-weight': 70,
                'eth-gender': 'male'
            });

            expect(result).not.toBeNull();
            const concentration = parseFloat(result![0].value as string);
            expect(concentration).toBeCloseTo(80, 0);
        });
    });

    // ===========================================
    // TC-004: Invalid Input Tests
    // ===========================================

    describe('Invalid Inputs', () => {
        test('Should return null for zero volume', () => {
            const result = calculateEthanolConcentration({
                'eth-amount': 0,
                'eth-abv': 40,
                'eth-weight': 70,
                'eth-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero ABV', () => {
            const result = calculateEthanolConcentration({
                'eth-amount': 100,
                'eth-abv': 0,
                'eth-weight': 70,
                'eth-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero weight', () => {
            const result = calculateEthanolConcentration({
                'eth-amount': 100,
                'eth-abv': 40,
                'eth-weight': 0,
                'eth-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for negative weight', () => {
            const result = calculateEthanolConcentration({
                'eth-amount': 100,
                'eth-abv': 40,
                'eth-weight': -70,
                'eth-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for missing inputs', () => {
            const result = calculateEthanolConcentration({
                'eth-amount': 100
            });

            expect(result).toBeNull();
        });
    });

    // ===========================================
    // TC-005: Golden Dataset Verification
    // ===========================================

    describe('Golden Dataset', () => {
        const goldenDataset = [
            // volume, abv, weight, gender, expectedConcentration
            { v: 44.36, abv: 40, w: 70, g: 'male', expected: 29 },
            { v: 44.36, abv: 40, w: 70, g: 'female', expected: 36 },
            { v: 355, abv: 5, w: 70, g: 'male', expected: 29 },
            { v: 710, abv: 5, w: 70, g: 'male', expected: 59 }, // 2 beers
            { v: 150, abv: 12, w: 60, g: 'female', expected: 43 } // wine
        ];

        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.v}mL @ ${data.abv}% for ${data.w}kg ${data.g}`, () => {
                const result = calculateEthanolConcentration({
                    'eth-amount': data.v,
                    'eth-abv': data.abv,
                    'eth-weight': data.w,
                    'eth-gender': data.g
                });

                expect(result).not.toBeNull();
                expect(parseFloat(result![0].value as string)).toBeCloseTo(data.expected, 0);
            });
        });
    });
});
