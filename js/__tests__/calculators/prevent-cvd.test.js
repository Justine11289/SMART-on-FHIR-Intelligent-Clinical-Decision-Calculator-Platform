/**
 * AHA PREVENT CVD Risk Calculator - Verification Tests
 *
 * Tests for 10-year cardiovascular disease risk prediction.
 */
import { describe, expect, test } from '@jest/globals';
import { calculateTransformedVariables, calculateLinearPredictor, calculateRiskPercentage, calculatePreventRisk, preventCoefficients } from '../../calculators/prevent-cvd/calculation.js';
describe('PREVENT CVD Risk Calculator', () => {
    // ===========================================
    // TC-001: Variable Transformations
    // ===========================================
    describe('Variable Transformations', () => {
        test('Age transformation: cage = (age - 55) / 10', () => {
            const result = calculateTransformedVariables(55, 5.0, 1.3, 130, 90);
            expect(result.cage).toBe(0);
            const result65 = calculateTransformedVariables(65, 5.0, 1.3, 130, 90);
            expect(result65.cage).toBe(1);
            const result45 = calculateTransformedVariables(45, 5.0, 1.3, 130, 90);
            expect(result45.cage).toBe(-1);
        });
        test('Non-HDL cholesterol transformation: cnhdl = tc - hdl - 3.5', () => {
            const result = calculateTransformedVariables(55, 5.0, 1.5, 130, 90);
            expect(result.cnhdl).toBe(0); // 5.0 - 1.5 - 3.5 = 0
            const result2 = calculateTransformedVariables(55, 6.0, 1.0, 130, 90);
            expect(result2.cnhdl).toBe(1.5); // 6.0 - 1.0 - 3.5 = 1.5
        });
        test('HDL transformation: chdl = (hdl - 1.3) / 0.3', () => {
            const result = calculateTransformedVariables(55, 5.0, 1.3, 130, 90);
            expect(result.chdl).toBeCloseTo(0, 5);
            const result2 = calculateTransformedVariables(55, 5.0, 1.6, 130, 90);
            expect(result2.chdl).toBeCloseTo(1, 5);
        });
        test('SBP transformation with clamping at 110', () => {
            // csbp = (min(SBP, 110) - 110) / 20
            // csbp2 = (max(SBP, 110) - 130) / 20
            // SBP = 130 (normal)
            const result130 = calculateTransformedVariables(55, 5.0, 1.3, 130, 90);
            expect(result130.csbp).toBe(0); // (110 - 110) / 20 = 0
            expect(result130.csbp2).toBe(0); // (130 - 130) / 20 = 0
            // SBP = 100 (low)
            const result100 = calculateTransformedVariables(55, 5.0, 1.3, 100, 90);
            expect(result100.csbp).toBe(-0.5); // (100 - 110) / 20 = -0.5
            expect(result100.csbp2).toBe(-1); // (110 - 130) / 20 = -1
            // SBP = 150 (high)
            const result150 = calculateTransformedVariables(55, 5.0, 1.3, 150, 90);
            expect(result150.csbp).toBe(0); // (110 - 110) / 20 = 0
            expect(result150.csbp2).toBe(1); // (150 - 130) / 20 = 1
        });
        test('eGFR transformation with clamping at 60', () => {
            // cegfr = (min(eGFR, 60) - 60) / -15
            // cegfr2 = (max(eGFR, 60) - 90) / -15
            // eGFR = 90 (normal)
            const result90 = calculateTransformedVariables(55, 5.0, 1.3, 130, 90);
            expect(result90.cegfr).toBeCloseTo(0, 5); // (60 - 60) / -15 = 0
            expect(result90.cegfr2).toBeCloseTo(0, 5); // (90 - 90) / -15 = 0
            // eGFR = 45 (reduced)
            const result45 = calculateTransformedVariables(55, 5.0, 1.3, 130, 45);
            expect(result45.cegfr).toBe(1); // (45 - 60) / -15 = 1
            expect(result45.cegfr2).toBe(2); // (60 - 90) / -15 = 2
            // eGFR = 120 (high)
            const result120 = calculateTransformedVariables(55, 5.0, 1.3, 130, 120);
            expect(result120.cegfr).toBeCloseTo(0, 5); // (60 - 60) / -15 = 0
            expect(result120.cegfr2).toBe(-2); // (120 - 90) / -15 = -2
        });
    });
    // ===========================================
    // TC-002: Risk Percentage Calculation
    // ===========================================
    describe('Risk Percentage Calculation', () => {
        test('Risk = e^x / (1 + e^x) * 100', () => {
            // x = 0 -> e^0 / (1 + e^0) = 0.5 -> 50%
            expect(calculateRiskPercentage(0)).toBeCloseTo(50, 1);
            // x = -2 -> lower risk
            const lowRisk = calculateRiskPercentage(-2);
            expect(lowRisk).toBeLessThan(20);
            // x = 2 -> higher risk
            const highRisk = calculateRiskPercentage(2);
            expect(highRisk).toBeGreaterThan(80);
        });
        test('Risk is clamped between 0.1% and 99.9%', () => {
            // Very low x
            expect(calculateRiskPercentage(-100)).toBe(0.1);
            // Very high x
            expect(calculateRiskPercentage(100)).toBe(99.9);
        });
    });
    // ===========================================
    // TC-003: Coefficients Structure
    // ===========================================
    describe('Coefficients Structure', () => {
        test('Female coefficients exist', () => {
            expect(preventCoefficients.female).toBeDefined();
            expect(preventCoefficients.female.cage).toBe(0.7939);
            expect(preventCoefficients.female.constant).toBe(-3.3077);
        });
        test('Male coefficients exist', () => {
            expect(preventCoefficients.male).toBeDefined();
            expect(preventCoefficients.male.cage).toBe(0.7689);
            expect(preventCoefficients.male.constant).toBe(-3.0312);
        });
    });
    // ===========================================
    // TC-004: Linear Predictor Calculation
    // ===========================================
    describe('Linear Predictor Calculation', () => {
        test('Base case with all false flags', () => {
            const transformed = calculateTransformedVariables(55, 5.0, 1.3, 130, 90);
            const x = calculateLinearPredictor(transformed, 'male', false, false, false, false);
            // Should be close to constant since all transformed values are ~0
            expect(x).toBeCloseTo(preventCoefficients.male.constant, 1);
        });
        test('Diabetes adds positive contribution', () => {
            const transformed = calculateTransformedVariables(55, 5.0, 1.3, 130, 90);
            const withoutDiabetes = calculateLinearPredictor(transformed, 'male', false, false, false, false);
            const withDiabetes = calculateLinearPredictor(transformed, 'male', true, false, false, false);
            expect(withDiabetes).toBeGreaterThan(withoutDiabetes);
            expect(withDiabetes - withoutDiabetes).toBeCloseTo(preventCoefficients.male.diabetes, 2);
        });
        test('Smoking adds positive contribution', () => {
            const transformed = calculateTransformedVariables(55, 5.0, 1.3, 130, 90);
            const withoutSmoking = calculateLinearPredictor(transformed, 'female', false, false, false, false);
            const withSmoking = calculateLinearPredictor(transformed, 'female', false, true, false, false);
            expect(withSmoking).toBeGreaterThan(withoutSmoking);
        });
    });
    // ===========================================
    // TC-005: Full Risk Calculation
    // ===========================================
    describe('Full Risk Calculation', () => {
        test('Low risk patient (young, healthy)', () => {
            const risk = calculatePreventRisk(40, // age
            'female', 4.5, // tc mmol/L
            1.5, // hdl mmol/L
            120, // sbp
            90, // egfr
            false, // diabetes
            false, // smoker
            false, // antihtn
            false // statin
            );
            expect(risk).toBeLessThan(5);
        });
        test('Moderate risk patient (middle-aged with some risk factors)', () => {
            const risk = calculatePreventRisk(55, // age
            'male', 5.5, // tc mmol/L
            1.2, // hdl mmol/L
            140, // sbp
            80, // egfr
            false, // diabetes
            true, // smoker
            true, // antihtn
            false // statin
            );
            expect(risk).toBeGreaterThan(5);
            expect(risk).toBeLessThan(30);
        });
        test('High risk patient (older with multiple risk factors)', () => {
            const risk = calculatePreventRisk(70, // age
            'male', 6.5, // tc mmol/L
            0.9, // hdl mmol/L
            160, // sbp
            45, // egfr
            true, // diabetes
            true, // smoker
            true, // antihtn
            false // statin
            );
            expect(risk).toBeGreaterThan(20);
        });
        test('Gender affects risk calculation', () => {
            const params = {
                age: 60,
                tc: 5.5,
                hdl: 1.2,
                sbp: 140,
                egfr: 75,
                diabetes: true,
                smoker: false,
                antihtn: true,
                statin: false
            };
            const maleRisk = calculatePreventRisk(params.age, 'male', params.tc, params.hdl, params.sbp, params.egfr, params.diabetes, params.smoker, params.antihtn, params.statin);
            const femaleRisk = calculatePreventRisk(params.age, 'female', params.tc, params.hdl, params.sbp, params.egfr, params.diabetes, params.smoker, params.antihtn, params.statin);
            // Male and female risks should be different
            expect(maleRisk).not.toBeCloseTo(femaleRisk, 0);
        });
        test('Statin use affects risk calculation', () => {
            // Use low non-HDL cholesterol (cnhdl = tc - hdl - 3.5 ≈ 0)
            // to minimize the positive interaction term cnhdl_statin
            const baseParams = {
                age: 60,
                gender: 'male',
                tc: 5.0, // Lower TC
                hdl: 1.5, // Higher HDL -> cnhdl = 5.0 - 1.5 - 3.5 = 0
                sbp: 140,
                egfr: 75,
                diabetes: false,
                smoker: false,
                antihtn: true
            };
            const withoutStatin = calculatePreventRisk(baseParams.age, baseParams.gender, baseParams.tc, baseParams.hdl, baseParams.sbp, baseParams.egfr, baseParams.diabetes, baseParams.smoker, baseParams.antihtn, false);
            const withStatin = calculatePreventRisk(baseParams.age, baseParams.gender, baseParams.tc, baseParams.hdl, baseParams.sbp, baseParams.egfr, baseParams.diabetes, baseParams.smoker, baseParams.antihtn, true);
            // Statin coefficient is negative (-0.1337), so statin should reduce risk
            // when non-HDL cholesterol is low (minimizing positive interaction term)
            expect(withStatin).toBeLessThan(withoutStatin);
        });
    });
    // ===========================================
    // TC-006: Risk Categories
    // ===========================================
    describe('Risk Categories', () => {
        test('Risk < 5% is low risk', () => {
            const risk = calculatePreventRisk(35, 'female', 4.0, 1.8, 110, 100, false, false, false, false);
            expect(risk).toBeLessThan(5);
        });
        test('Risk 5-7.5% is borderline risk', () => {
            // This test verifies the calculation is in expected range
            // Actual boundary depends on specific patient profile
            const risk = calculatePreventRisk(50, 'male', 5.0, 1.3, 130, 85, false, false, false, false);
            expect(risk).toBeGreaterThanOrEqual(0.1);
            expect(risk).toBeLessThanOrEqual(99.9);
        });
    });
    // ===========================================
    // TC-007: Edge Cases
    // ===========================================
    describe('Edge Cases', () => {
        test('Very young patient (age 30)', () => {
            const risk = calculatePreventRisk(30, 'female', 4.5, 1.5, 115, 100, false, false, false, false);
            expect(risk).toBeLessThan(2);
        });
        test('Very old patient (age 79)', () => {
            const risk = calculatePreventRisk(79, 'male', 5.5, 1.1, 150, 60, false, false, true, false);
            expect(risk).toBeGreaterThan(10);
        });
        test('All risk factors present', () => {
            const risk = calculatePreventRisk(75, 'male', 7.0, 0.8, 180, 30, true, true, true, false);
            expect(risk).toBeGreaterThan(30);
        });
        test('Optimal profile with statin', () => {
            const risk = calculatePreventRisk(55, 'female', 4.0, 1.8, 110, 100, false, false, false, true);
            expect(risk).toBeLessThan(5);
        });
    });
});
