/**
 * Gupta MICA Calculator - SaMD Verification Tests
 *
 * Formula: Cardiac risk, % = [1/(1+e^-x)] × 100
 * x = -5.25 + sum of selected variables
 */

import { calculateGuptaMica } from '../../calculators/gupta-mica/calculation';

describe('Gupta MICA Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    // Case 1: Low Risk
    // Age 40 (+0.8 -> 40*0.02)
    // Independent (0)
    // ASA 1 (-6.17) (Default in calculation.ts is -6.17 if not provided?)
    // Note: inputs use value attribute for calculation.
    // 'mica-asa': '-6.17'
    // 'mica-status': '0'
    // 'mica-procedure': '0' (Hernia)
    // Creatinine 1.0 (Normal -> 0)

    // x = -5.25 + 0.8 + 0 + (-6.17) + 0 + 0 = -10.62
    // Risk = 1 / (1 + e^10.62) = small
    // Test says default ASA is -6.17 if empty? calculation.ts:
    // const asaClass = parseFloat((values['mica-asa'] as string) || '-6.17');

    test('Low Risk Case', () => {
        const result = calculateGuptaMica({
            'mica-age': '40',
            'mica-status': '0',
            'mica-asa': '-6.17',
            'mica-creat': '1.0',
            'mica-procedure': '0'
        });

        expect(result).not.toBeNull();
        const riskItem = result!.find(r => r.label === 'Cardiac Risk');
        expect(riskItem).toBeDefined();
        const risk = parseFloat(riskItem!.value as string);
        // x approx -10.62
        // Risk approx 0.002%
        expect(risk).toBeLessThan(0.1);
        expect(riskItem!.interpretation).toBe('Low Risk');
    });

    // Case 2: High Risk
    // Age 80 (+1.6 -> 80*0.02)
    // Totally Dependent (+1.03)
    // ASA 4 (+4.29)
    // Creatinine 2.0 (+0.61)
    // Procedure Aortic (+1.60)

    // x = -5.25 + 1.6 + 1.03 + 4.29 + 0.61 + 1.60
    // x = 3.88

    // Risk = 1 / (1 + e^-3.88) * 100
    // e^-3.88 = 0.02065
    // 1 / 1.02065 = 0.9797 -> 97.97%

    test('High Risk Case', () => {
        const result = calculateGuptaMica({
            'mica-age': '80',
            'mica-status': '1.03',
            'mica-asa': '4.29',
            'mica-creat': '2.0',
            'mica-procedure': '1.60'
        });

        expect(result).not.toBeNull();
        const riskItem = result!.find(r => r.label === 'Cardiac Risk');
        const risk = parseFloat(riskItem!.value as string);
        expect(risk).toBeGreaterThan(90);
        expect(riskItem!.interpretation).toBe('High Risk');
    });

    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should return empty for missing age/creatinine', () => {
        const result = calculateGuptaMica({
            'mica-age': '50'
            // Missing creat
        });
        expect(result).toHaveLength(0);
    });
});
