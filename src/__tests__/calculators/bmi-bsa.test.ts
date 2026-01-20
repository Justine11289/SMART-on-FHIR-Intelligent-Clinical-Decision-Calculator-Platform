import { bmiBsaCalculation } from '../../calculators/bmi-bsa/calculation.js';

describe('Body Surface Area (BSA) & BMI Calculator (SaMD Protocol Verification)', () => {
    // Phase 2: Technical Verification (Golden Dataset & Boundary Analysis)

    test('TC-001: Standard Calculation (Normal Physiological Values)', () => {
        // Source: Manual Calculation / Golden Dataset
        // Weight: 70kg, Height: 175cm
        // BMI: 70 / (1.75^2) = 70 / 3.0625 = 22.857... -> 22.9
        // BSA (Du Bois): 0.007184 * 70^0.425 * 175^0.725
        // 70^0.425 = 6.080
        // 175^0.725 = 42.317
        // BSA = 0.007184 * 6.080 * 42.317 = 1.848 -> 1.85 m2

        const result = bmiBsaCalculation({
            'bmi-bsa-weight': 70,
            'bmi-bsa-height': 175
        });

        expect(result).toHaveLength(2);

        // BMI Check
        expect(result[0].label).toBe('Body Mass Index (BMI)');
        expect(result[0].value).toBe(22.9);
        expect(result[0].interpretation).toBe('Normal weight');
        expect(result[0].alertClass).toBe('success');

        // BSA Check
        expect(result[1].label).toBe('Body Surface Area (BSA)');
        expect(result[1].value).toBe(1.85);
        expect(result[1].unit).toBe('m²');
    });

    test('TC-003: Zero/Negative Input (Boundary Analysis)', () => {
        // Scenario: Zero Height
        const resultZero = bmiBsaCalculation({
            'bmi-bsa-weight': 70,
            'bmi-bsa-height': 0
        });
        expect(resultZero).toHaveLength(0); // Should return empty, no crash

        // Scenario: Negative Weight
        const resultNeg = bmiBsaCalculation({
            'bmi-bsa-weight': -70,
            'bmi-bsa-height': 175
        });
        expect(resultNeg).toHaveLength(0);
    });

    // Note: TC-002 (Unit Mismatch) is handled by the UnifiedCalculator factory logic (input normalization).
    // Here we test strictly the calculation logic assuming inputs are passed as standard units.
    // If we wanted to test the factory's normalization, we'd need an integration test or mock the factory flow.
    // For unit calculation logic, we assume the factory did its job, as verified in 'unified-formula-calculator.test.ts'.

    test('TC-004: Clinical Scenario - Underweight', () => {
        // Weight: 45kg, Height: 160cm
        // BMI: 45 / (1.6^2) = 45 / 2.56 = 17.57 -> 17.6 (<18.5)
        const result = bmiBsaCalculation({
            'bmi-bsa-weight': 45,
            'bmi-bsa-height': 160
        });

        expect(result[0].value).toBe(17.6);
        expect(result[0].interpretation).toBe('Underweight');
        expect(result[0].alertClass).toBe('warning');
    });

    test('TC-005: Clinical Scenario - Extreme Obesity (Class III)', () => {
        // Weight: 140kg, Height: 170cm
        // BMI: 140 / (1.7^2) = 140 / 2.89 = 48.44 -> 48.4
        const result = bmiBsaCalculation({
            'bmi-bsa-weight': 140,
            'bmi-bsa-height': 170
        });

        expect(result[0].value).toBe(48.4);
        expect(result[0].interpretation).toBe('Obese (Class III)');
        expect(result[0].alertClass).toBe('danger');
    });

    test('TC-006: Null/Missing Input', () => {
        const result = bmiBsaCalculation({
            'bmi-bsa-weight': 70,
            'bmi-bsa-height': null as any
        });
        expect(result).toHaveLength(0);
    });
});
