/**
 * MAGGIC Risk Score Calculator - SaMD Verification Tests
 *
 * Formula involves linear predictor and survival probability.
 */
import { calculateMaggic } from '../../calculators/maggic/calculation';
describe('MAGGIC Risk Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    // Case 1: Low Risk
    // Age 50 (+4 pts -> 50*0.08 = 4), Female (0), BMI 27 (0), Smoker No (0)
    // EF 50 (-2.5 pts -> 50*-0.05), SBP 120 (-2.4 pts -> 120*-0.02), Creatinine 0.8 (0)
    // NYHA I (0), Diabetes No (0), COPD No (0), HF<18m No (0), BB Yes (0), ACEi Yes (0)
    // Score sum: 4 + (-2.5) + (-2.4) + 0 = -0.9
    // Linear Predictor = 0.047 * (-0.9 - 21.6) = 0.047 * -22.5 = -1.0575
    // Prob 1yr = 1 - 0.92^exp(-1.0575) = 1 - 0.92^0.347
    //          = 1 - 0.971 = 0.029 -> 2.9%
    test('Low Risk Female Case', () => {
        const result = calculateMaggic({
            'maggic-age': '50',
            'maggic-gender': '0',
            'maggic-bmi': '27',
            'maggic-smoker': '0',
            'maggic-ef': '50',
            'maggic-sbp': '120',
            'maggic-creatinine': '0.8',
            'maggic-nyha': '0',
            'maggic-diabetes': '0',
            'maggic-copd': '0',
            'maggic-hfdx': '0',
            'maggic-bb': '0',
            'maggic-acei': '0'
        });
        expect(result).not.toBeNull();
        expect(result).toHaveLength(3);
        const points = parseFloat(result[0].value);
        // -0.9 might be approximate due to floating point
        expect(points).toBeCloseTo(-0.9, 1);
        const prob1 = parseFloat(result[1].value);
        // Expect around 2.9%
        expect(prob1).toBeLessThan(5.0);
    });
    // Case 2: High Risk
    // Age 70 (+5.6 -> 70*0.08), Male (+1)
    // BMI 32 (-1), Smoker Yes (+1)
    // EF 25 (-1.25), SBP 100 (-2.0)
    // Creatinine 1.5 (+1 from categories? Wait, logic:
    // Creatinine logic:
    // <=0.9: 0
    // 0.9-1.3: 1
    // 1.3-2.2: 3   <-- 1.5 falls here
    // >2.2: 5
    // So 1.5 -> +3 points
    // NYHA IV (+8)
    // Diabetes Yes (+3)
    // COPD Yes (+2)
    // HF>=18m Yes (+2)
    // No BB (+3)
    // No ACEi (+1)
    // Sum:
    // Age: 5.6
    // Male: 1
    // BMI: -1
    // Smoker: 1
    // EF: -1.25
    // SBP: -2
    // Creatinine: 3
    // NYHA: 8
    // Diabetes: 3
    // COPD: 2
    // HF: 2
    // No BB: 3
    // No ACEi: 1
    // Total: 5.6 + 1 - 1 + 1 - 1.25 - 2 + 3 + 8 + 3 + 2 + 2 + 3 + 1
    // = 26.35
    // LP = 0.047 * (26.35 - 21.6) = 0.047 * 4.75 = 0.22325
    // Prob 1yr = 1 - 0.92^exp(0.223) = 1 - 0.92^1.25
    // = 1 - 0.90 = ~10%
    test('High Risk Male Case', () => {
        const result = calculateMaggic({
            'maggic-age': '70',
            'maggic-gender': '1',
            'maggic-bmi': '32',
            'maggic-smoker': '1',
            'maggic-ef': '25',
            'maggic-sbp': '100',
            'maggic-creatinine': '1.5',
            'maggic-nyha': '8',
            'maggic-diabetes': '3',
            'maggic-copd': '2',
            'maggic-hfdx': '2',
            'maggic-bb': '3',
            'maggic-acei': '1'
        });
        const points = parseFloat(result[0].value);
        expect(points).toBeCloseTo(25.35, 1);
        const prob1 = parseFloat(result[1].value);
        expect(prob1).toBeGreaterThan(9.0);
    });
    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should return empty for missing inputs', () => {
        const result = calculateMaggic({});
        expect(result).toHaveLength(0);
    });
});
