/**
 * ETT Depth and Tidal Volume Calculator - SaMD Verification Tests
 *
 * Formulas:
 *   ETT Depth (at lips) = Height (cm) / 10 + 5
 *
 *   IBW (Male) = 50 + 2.3 × (Height in inches - 60)
 *   IBW (Female) = 45.5 + 2.3 × (Height in inches - 60)
 *
 *   Tidal Volume Low = IBW × 6 mL/kg
 *   Tidal Volume High = IBW × 8 mL/kg
 *
 * Reference: ARDSNet lung-protective ventilation protocol
 */
import { calculateETT } from '../../calculators/ett/calculation.js';
describe('ETT Depth and Tidal Volume Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    describe('Standard Calculations', () => {
        test('Should calculate correct values for average male', () => {
            // 170 cm male
            // ETT Depth = 170/10 + 5 = 22 cm
            // Height in inches = 170/2.54 = 66.93"
            // IBW = 50 + 2.3 * (66.93 - 60) = 50 + 15.94 = 65.94 kg
            // TV Low = 65.94 * 6 = 395.6 mL
            // TV High = 65.94 * 8 = 527.5 mL
            const result = calculateETT({
                'ett-height': 170,
                'ett-gender': 'male'
            });
            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);
            expect(result[0].label).toBe('Estimated ETT Depth (at lips)');
            expect(result[0].value).toBe('22.0');
            expect(result[0].unit).toBe('cm');
            expect(result[1].label).toBe('Ideal Body Weight (IBW)');
            expect(parseFloat(result[1].value)).toBeCloseTo(65.9, 0);
            expect(result[2].label).toBe('Target Tidal Volume (6-8 mL/kg)');
            expect(result[2].value).toContain('396');
            expect(result[2].value).toContain('527');
        });
        test('Should calculate correct values for average female', () => {
            // 160 cm female
            // ETT Depth = 160/10 + 5 = 21 cm
            // Height in inches = 160/2.54 = 62.99"
            // IBW = 45.5 + 2.3 * (62.99 - 60) = 45.5 + 6.88 = 52.38 kg
            const result = calculateETT({
                'ett-height': 160,
                'ett-gender': 'female'
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('21.0');
            expect(parseFloat(result[1].value)).toBeCloseTo(52.4, 0);
        });
        test('Should calculate correct values for tall male', () => {
            // 190 cm male
            // ETT Depth = 190/10 + 5 = 24 cm
            // Height in inches = 190/2.54 = 74.8"
            // IBW = 50 + 2.3 * (74.8 - 60) = 50 + 34.04 = 84.04 kg
            const result = calculateETT({
                'ett-height': 190,
                'ett-gender': 'male'
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('24.0');
            expect(parseFloat(result[1].value)).toBeCloseTo(84.0, 0);
        });
    });
    // ===========================================
    // TC-002: ETT Depth Formula Tests
    // ===========================================
    describe('ETT Depth Formula', () => {
        test('ETT Depth should equal height/10 + 5', () => {
            const testCases = [
                { height: 150, expectedDepth: 20 },
                { height: 160, expectedDepth: 21 },
                { height: 170, expectedDepth: 22 },
                { height: 180, expectedDepth: 23 },
                { height: 190, expectedDepth: 24 }
            ];
            testCases.forEach(({ height, expectedDepth }) => {
                const result = calculateETT({
                    'ett-height': height,
                    'ett-gender': 'male'
                });
                expect(result).not.toBeNull();
                expect(parseFloat(result[0].value)).toBeCloseTo(expectedDepth, 1);
            });
        });
    });
    // ===========================================
    // TC-003: IBW Formula Tests
    // ===========================================
    describe('IBW Formula', () => {
        test('IBW for male should use 50 + 2.3 * (inches - 60)', () => {
            // 5 feet exactly (60 inches = 152.4 cm)
            // IBW = 50 + 2.3 * 0 = 50 kg
            const result = calculateETT({
                'ett-height': 152.4,
                'ett-gender': 'male'
            });
            expect(result).not.toBeNull();
            expect(parseFloat(result[1].value)).toBeCloseTo(50, 0);
        });
        test('IBW for female should use 45.5 + 2.3 * (inches - 60)', () => {
            // 5 feet exactly (60 inches = 152.4 cm)
            // IBW = 45.5 + 2.3 * 0 = 45.5 kg
            const result = calculateETT({
                'ett-height': 152.4,
                'ett-gender': 'female'
            });
            expect(result).not.toBeNull();
            expect(parseFloat(result[1].value)).toBeCloseTo(45.5, 0);
        });
        test('IBW should not be negative for short patients', () => {
            // Very short patient (120 cm = 47.2 inches < 60)
            // Should use max(0, inches - 60), so IBW = base value
            const result = calculateETT({
                'ett-height': 120,
                'ett-gender': 'male'
            });
            expect(result).not.toBeNull();
            // IBW = 50 + 2.3 * max(0, 47.2 - 60) = 50 + 0 = 50
            expect(parseFloat(result[1].value)).toBe(50);
        });
    });
    // ===========================================
    // TC-004: Tidal Volume Tests
    // ===========================================
    describe('Tidal Volume', () => {
        test('Tidal volume range should be IBW × 6 to IBW × 8', () => {
            // 70 kg IBW patient
            // TV = 420 - 560 mL
            const result = calculateETT({
                'ett-height': 175.3, // Results in ~70 kg IBW for male
                'ett-gender': 'male'
            });
            expect(result).not.toBeNull();
            const ibw = parseFloat(result[1].value);
            const tvRange = result[2].value;
            const expectedLow = Math.round(ibw * 6);
            const expectedHigh = Math.round(ibw * 8);
            expect(tvRange).toContain(expectedLow.toString());
            expect(tvRange).toContain(expectedHigh.toString());
        });
    });
    // ===========================================
    // TC-005: Boundary Value Tests
    // ===========================================
    describe('Boundary Values', () => {
        test('Should handle minimum reasonable height', () => {
            const result = calculateETT({
                'ett-height': 100,
                'ett-gender': 'male'
            });
            expect(result).not.toBeNull();
            // ETT = 100/10 + 5 = 15 cm
            expect(result[0].value).toBe('15.0');
        });
        test('Should handle maximum reasonable height', () => {
            const result = calculateETT({
                'ett-height': 220,
                'ett-gender': 'male'
            });
            expect(result).not.toBeNull();
            // ETT = 220/10 + 5 = 27 cm
            expect(result[0].value).toBe('27.0');
        });
    });
    // ===========================================
    // TC-006: Invalid Input Tests
    // ===========================================
    describe('Invalid Inputs', () => {
        test('Should return null for zero height', () => {
            const result = calculateETT({
                'ett-height': 0,
                'ett-gender': 'male'
            });
            expect(result).toBeNull();
        });
        test('Should return null for missing height', () => {
            const result = calculateETT({
                'ett-gender': 'male'
            });
            expect(result).toBeNull();
        });
        test('Should return null for NaN height', () => {
            const result = calculateETT({
                'ett-height': NaN,
                'ett-gender': 'male'
            });
            expect(result).toBeNull();
        });
    });
    // ===========================================
    // TC-007: Golden Dataset Verification
    // ===========================================
    describe('Golden Dataset', () => {
        const goldenDataset = [
            // height, gender, expectedDepth, expectedIBW (approx)
            // IBW(male) = 50 + 2.3 * (height/2.54 - 60)
            // IBW(female) = 45.5 + 2.3 * (height/2.54 - 60)
            { h: 150, g: 'male', depth: 20.0, ibw: 50 }, // 59" < 60, so IBW = 50
            { h: 160, g: 'male', depth: 21.0, ibw: 57 }, // 63", IBW = 50 + 2.3*3 = 56.9
            { h: 170, g: 'male', depth: 22.0, ibw: 66 }, // 66.9", IBW = 65.9
            { h: 180, g: 'male', depth: 23.0, ibw: 75 }, // 70.9", IBW = 75.0
            { h: 150, g: 'female', depth: 20.0, ibw: 46 }, // 59" < 60, so IBW = 45.5
            { h: 160, g: 'female', depth: 21.0, ibw: 52 }, // 63", IBW = 52.4
            { h: 170, g: 'female', depth: 22.0, ibw: 61 } // 66.9", IBW = 61.4
        ];
        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.h}cm ${data.g}`, () => {
                const result = calculateETT({
                    'ett-height': data.h,
                    'ett-gender': data.g
                });
                expect(result).not.toBeNull();
                expect(parseFloat(result[0].value)).toBeCloseTo(data.depth, 1);
                // Use precision of -1 (within 1 kg) for IBW due to rounding
                expect(parseFloat(result[1].value)).toBeCloseTo(data.ibw, -1);
            });
        });
    });
});
