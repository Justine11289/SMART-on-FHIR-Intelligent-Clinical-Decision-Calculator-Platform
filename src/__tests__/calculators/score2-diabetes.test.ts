/**
 * SCORE2-Diabetes Calculator - SaMD Verification Tests
 *
 * Formula: SCORE2-Diabetes 10-year CVD Risk
 */

import { calculateScore2Diabetes } from '../../calculators/score2-diabetes/calculation';

describe('SCORE2-Diabetes Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    describe('Standard Calculations', () => {
        // Validation Case based on provided coefficients (Low Risk Region, Male)
        // Age: 50, SBP: 140, TChol: 200 (mg/dL -> 5.17 mmol/L), HDL: 50 (1.29), HbA1c: 7.0 (53 mmol/mol)
        // eGFR: 90, Smoking: No (0)

        // Coeffs (Low Male):
        // Age(0.0652), SBP(0.0139), TChol(0.2079), HDL(-0.4485), HbA1c(0.0211), eGFR(-0.0076)
        // Smoking(0.3838), S0(0.9765), MeanX(4.9664)

        // Values:
        // Age: 50
        // SBP: 140
        // TChol: 5.172
        // HDL: 1.293
        // HbA1c: (7*10.93 - 23.5) = 53.01
        // eGFR: 90

        // IndX = 0.0652*50 + 0.0139*140 + 0.2079*5.172 + (-0.4485)*1.293 + 0.0211*53.01 + (-0.0076)*90 + 0
        //      = 3.26 + 1.946 + 1.075 - 0.58 + 1.118 - 0.684
        //      = 6.135

        // (IndX - MeanX) = 6.135 - 4.9664 = 1.1686
        // exp(1.1686) = 3.217
        // Risk = 1 - 0.9765^3.217 = 1 - 0.926 = 0.074 -> 7.4%

        test('Should calculate correct risk for standard male case', () => {
            const result = calculateScore2Diabetes({
                'score2d-region': 'low',
                'score2d-sex': 'male',
                'score2d-age': '50',
                'score2d-sbp': '140',
                'score2d-tchol': '200',
                'score2d-hdl': '50',
                'score2d-hba1c': '7.0',
                'score2d-egfr': '90',
                'score2d-smoking': '0'
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(1);
            const val = parseFloat(result![0].value as string);
            // Expect around 7.4%
            expect(val).toBeGreaterThan(6.0);
            expect(val).toBeLessThan(8.5);
            expect(result![0].interpretation).toBe('Moderate Risk');
        });
    });

    // ===========================================
    // TC-002: Region Sensitivity
    // ===========================================
    describe('Region Sensitivity', () => {
        test('Risk should increase from Low to Very High region', () => {
            const baseInput = {
                'score2d-sex': 'male',
                'score2d-age': '50',
                'score2d-sbp': '140',
                'score2d-tchol': '200',
                'score2d-hdl': '50',
                'score2d-hba1c': '7.0',
                'score2d-egfr': '90',
                'score2d-smoking': '0'
            };

            const low = calculateScore2Diabetes({ ...baseInput, 'score2d-region': 'low' });
            const veryHigh = calculateScore2Diabetes({
                ...baseInput,
                'score2d-region': 'very_high'
            });

            const vLow = parseFloat(low![0].value as string);
            const vHigh = parseFloat(veryHigh![0].value as string);

            expect(vHigh).toBeGreaterThan(vLow);
        });
    });

    // ===========================================
    // TC-003: Parameter Sensitivity
    // ===========================================
    describe('Parameter Sensitivity', () => {
        test('Smoking should increase risk', () => {
            const baseInput = {
                'score2d-region': 'low',
                'score2d-sex': 'male',
                'score2d-age': '50',
                'score2d-sbp': '140',
                'score2d-tchol': '200',
                'score2d-hdl': '50',
                'score2d-hba1c': '7.0',
                'score2d-egfr': '90'
            };

            const noSmoke = calculateScore2Diabetes({ ...baseInput, 'score2d-smoking': '0' });
            const smoke = calculateScore2Diabetes({ ...baseInput, 'score2d-smoking': '1' });

            const vNo = parseFloat(noSmoke![0].value as string);
            const vYes = parseFloat(smoke![0].value as string);

            expect(vYes).toBeGreaterThan(vNo);
        });

        test('Higher HbA1c should increase risk', () => {
            const baseInput = {
                'score2d-region': 'low',
                'score2d-sex': 'male',
                'score2d-age': '50',
                'score2d-sbp': '140',
                'score2d-tchol': '200',
                'score2d-hdl': '50',
                'score2d-egfr': '90',
                'score2d-smoking': '0'
            };

            const lower = calculateScore2Diabetes({ ...baseInput, 'score2d-hba1c': '7.0' });
            const higher = calculateScore2Diabetes({ ...baseInput, 'score2d-hba1c': '10.0' });

            const vLow = parseFloat(lower![0].value as string);
            const vHigh = parseFloat(higher![0].value as string);

            expect(vHigh).toBeGreaterThan(vLow);
        });
    });

    // ===========================================
    // TC-004: Validation
    // ===========================================
    describe('Input Validation', () => {
        test('Should return empty for age out of range (<40)', () => {
            const result = calculateScore2Diabetes({
                'score2d-region': 'low',
                'score2d-sex': 'male',
                'score2d-age': '30', // Invalid
                'score2d-sbp': '140',
                'score2d-tchol': '200',
                'score2d-hdl': '50',
                'score2d-hba1c': '7.0',
                'score2d-egfr': '90',
                'score2d-smoking': '0'
            });
            expect(result).toHaveLength(0);
        });

        test('Should return empty for missing inputs', () => {
            const result = calculateScore2Diabetes({});
            expect(result).toHaveLength(0);
        });
    });
});
