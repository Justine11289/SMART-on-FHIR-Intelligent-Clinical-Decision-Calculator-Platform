/**
 * Intraoperative Fluid Calculator - SaMD Verification Tests
 *
 * Formulas:
 *   - Maintenance Rate (4-2-1 Rule):
 *     > 20kg: weight + 40 mL/hr
 *     10-20kg: 40 + (weight - 10) × 2 mL/hr
 *     <= 10kg: weight × 4 mL/hr
 *
 *   - NPO Deficit = Maintenance Rate × NPO Hours
 *   - Trauma Loss = Trauma Level × Weight
 *
 *   - 1st Hour = 50% Deficit + Maintenance + Trauma
 *   - 2nd Hour = 25% Deficit + Maintenance + Trauma
 *   - 3rd Hour = 25% Deficit + Maintenance + Trauma
 *   - 4th+ Hour = Maintenance + Trauma
 *
 * Trauma Levels:
 *   - Minimal: 4 mL/kg/hr
 *   - Moderate: 6 mL/kg/hr
 *   - Severe: 8 mL/kg/hr
 *
 * Reference: Standard perioperative fluid management guidelines
 */
import { calculateIntraopFluid } from '../../calculators/intraop-fluid/calculation.js';
describe('Intraoperative Fluid Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    describe('Standard Calculations', () => {
        test('Should calculate correct fluids for 70kg adult, 8hr NPO, minimal trauma', () => {
            // Maintenance = 70 + 40 = 110 mL/hr
            // NPO Deficit = 110 * 8 = 880 mL
            // Trauma Loss = 4 * 70 = 280 mL/hr
            // 1st Hour = 880/2 + 110 + 280 = 440 + 110 + 280 = 830 mL
            // 2nd Hour = 880/4 + 110 + 280 = 220 + 110 + 280 = 610 mL
            // 3rd Hour = 880/4 + 110 + 280 = 220 + 110 + 280 = 610 mL
            // 4th Hour = 110 + 280 = 390 mL
            const result = calculateIntraopFluid({
                'ifd-weight': 70,
                'ifd-npo': 8,
                'ifd-trauma': 4 // Minimal
            });
            expect(result).not.toBeNull();
            expect(result).toHaveLength(6);
            expect(result[0].label).toBe('Hourly Maintenance Fluid');
            expect(result[0].value).toBe('110');
            expect(result[1].label).toBe('NPO Fluid Deficit');
            expect(result[1].value).toBe('880');
            expect(result[2].label).toBe('1st Hour Fluids');
            expect(result[2].value).toBe('830');
            expect(result[3].label).toBe('2nd Hour Fluids');
            expect(result[3].value).toBe('610');
            expect(result[4].label).toBe('3rd Hour Fluids');
            expect(result[4].value).toBe('610');
            expect(result[5].label).toBe('4th Hour & Beyond');
            expect(result[5].value).toBe('390');
        });
        test('Should calculate correct fluids for 60kg adult, moderate trauma', () => {
            // Maintenance = 60 + 40 = 100 mL/hr
            // NPO Deficit = 100 * 6 = 600 mL
            // Trauma Loss = 6 * 60 = 360 mL/hr
            // 1st Hour = 600/2 + 100 + 360 = 760 mL
            // 4th Hour = 100 + 360 = 460 mL
            const result = calculateIntraopFluid({
                'ifd-weight': 60,
                'ifd-npo': 6,
                'ifd-trauma': 6 // Moderate
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('100'); // Maintenance
            expect(result[1].value).toBe('600'); // NPO Deficit
            expect(result[2].value).toBe('760'); // 1st Hour
            expect(result[5].value).toBe('460'); // 4th Hour
        });
        test('Should calculate correct fluids for severe trauma surgery', () => {
            // Maintenance = 80 + 40 = 120 mL/hr
            // NPO Deficit = 120 * 12 = 1440 mL
            // Trauma Loss = 8 * 80 = 640 mL/hr
            // 1st Hour = 1440/2 + 120 + 640 = 1480 mL
            const result = calculateIntraopFluid({
                'ifd-weight': 80,
                'ifd-npo': 12,
                'ifd-trauma': 8 // Severe
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('120'); // Maintenance
            expect(result[1].value).toBe('1440'); // NPO Deficit
            expect(result[2].value).toBe('1480'); // 1st Hour (720 + 120 + 640)
        });
    });
    // ===========================================
    // TC-002: Maintenance Rate (4-2-1 Rule) Tests
    // ===========================================
    describe('Maintenance Rate (4-2-1 Rule)', () => {
        test('Should calculate maintenance for weight > 20kg', () => {
            // For 70kg: 70 + 40 = 110 mL/hr
            const result = calculateIntraopFluid({
                'ifd-weight': 70,
                'ifd-npo': 1,
                'ifd-trauma': 4
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('110');
        });
        test('Should calculate maintenance for weight 10-20kg', () => {
            // For 15kg: 40 + (15-10) * 2 = 40 + 10 = 50 mL/hr
            const result = calculateIntraopFluid({
                'ifd-weight': 15,
                'ifd-npo': 1,
                'ifd-trauma': 4
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('50');
        });
        test('Should calculate maintenance for exactly 20kg', () => {
            // For 20kg: 40 + (20-10) * 2 = 40 + 20 = 60 mL/hr
            const result = calculateIntraopFluid({
                'ifd-weight': 20,
                'ifd-npo': 1,
                'ifd-trauma': 4
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('60');
        });
        test('Should calculate maintenance for exactly 21kg', () => {
            // For 21kg: 21 + 40 = 61 mL/hr (using > 20kg formula)
            const result = calculateIntraopFluid({
                'ifd-weight': 21,
                'ifd-npo': 1,
                'ifd-trauma': 4
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('61');
        });
    });
    // ===========================================
    // TC-003: Boundary Value Tests
    // ===========================================
    describe('Boundary Values', () => {
        test('Should return null for weight <= 10kg (calculator limitation)', () => {
            const result = calculateIntraopFluid({
                'ifd-weight': 10,
                'ifd-npo': 8,
                'ifd-trauma': 4
            });
            expect(result).toBeNull();
        });
        test('Should work for weight = 11kg (just above minimum)', () => {
            // For 11kg: 40 + (11-10) * 2 = 42 mL/hr
            const result = calculateIntraopFluid({
                'ifd-weight': 11,
                'ifd-npo': 1,
                'ifd-trauma': 4
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('42');
        });
        test('Should handle minimum NPO hours (1 hour)', () => {
            const result = calculateIntraopFluid({
                'ifd-weight': 70,
                'ifd-npo': 1,
                'ifd-trauma': 4
            });
            expect(result).not.toBeNull();
            expect(result[1].value).toBe('110'); // NPO Deficit = 110 * 1
        });
    });
    // ===========================================
    // TC-004: Invalid Input Tests
    // ===========================================
    describe('Invalid Inputs', () => {
        test('Should return null for zero weight', () => {
            const result = calculateIntraopFluid({
                'ifd-weight': 0,
                'ifd-npo': 8,
                'ifd-trauma': 4
            });
            expect(result).toBeNull();
        });
        test('Should return null for zero NPO hours', () => {
            const result = calculateIntraopFluid({
                'ifd-weight': 70,
                'ifd-npo': 0,
                'ifd-trauma': 4
            });
            expect(result).toBeNull();
        });
        test('Should return null for zero trauma level', () => {
            const result = calculateIntraopFluid({
                'ifd-weight': 70,
                'ifd-npo': 8,
                'ifd-trauma': 0
            });
            expect(result).toBeNull();
        });
        test('Should return null for missing inputs', () => {
            const result = calculateIntraopFluid({
                'ifd-weight': 70
            });
            expect(result).toBeNull();
        });
    });
    // ===========================================
    // TC-005: Fluid Distribution Tests
    // ===========================================
    describe('Fluid Distribution', () => {
        test('Should correctly distribute NPO deficit (50%, 25%, 25%, 0%)', () => {
            // Use simple numbers for easy verification
            // 100kg, 4hr NPO, minimal trauma (4)
            // Maintenance = 100 + 40 = 140 mL/hr
            // NPO Deficit = 140 * 4 = 560 mL
            // Trauma = 4 * 100 = 400 mL/hr
            const result = calculateIntraopFluid({
                'ifd-weight': 100,
                'ifd-npo': 4,
                'ifd-trauma': 4
            });
            expect(result).not.toBeNull();
            const maintenance = 140;
            const npoDeficit = 560;
            const trauma = 400;
            // 1st Hour: 50% deficit + maintenance + trauma
            expect(result[2].value).toBe((npoDeficit / 2 + maintenance + trauma).toFixed(0));
            // 2nd Hour: 25% deficit + maintenance + trauma
            expect(result[3].value).toBe((npoDeficit / 4 + maintenance + trauma).toFixed(0));
            // 3rd Hour: 25% deficit + maintenance + trauma
            expect(result[4].value).toBe((npoDeficit / 4 + maintenance + trauma).toFixed(0));
            // 4th Hour: 0% deficit + maintenance + trauma
            expect(result[5].value).toBe((maintenance + trauma).toFixed(0));
        });
    });
    // ===========================================
    // TC-006: Golden Dataset Verification
    // ===========================================
    describe('Golden Dataset', () => {
        const goldenDataset = [
            // weight, npo, trauma, expectedMaint, expectedDeficit, expected1stHour
            { w: 70, npo: 8, t: 4, maint: 110, deficit: 880, h1: 830 },
            { w: 60, npo: 6, t: 6, maint: 100, deficit: 600, h1: 760 },
            { w: 80, npo: 12, t: 8, maint: 120, deficit: 1440, h1: 1480 },
            { w: 50, npo: 10, t: 4, maint: 90, deficit: 900, h1: 740 },
            { w: 15, npo: 4, t: 4, maint: 50, deficit: 200, h1: 210 }
        ];
        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.w}kg, ${data.npo}hr NPO, trauma ${data.t}`, () => {
                const result = calculateIntraopFluid({
                    'ifd-weight': data.w,
                    'ifd-npo': data.npo,
                    'ifd-trauma': data.t
                });
                expect(result).not.toBeNull();
                expect(result[0].value).toBe(data.maint.toString());
                expect(result[1].value).toBe(data.deficit.toString());
                expect(result[2].value).toBe(data.h1.toString());
            });
        });
    });
});
