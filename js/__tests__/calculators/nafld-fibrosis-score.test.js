/**
 * NAFLD Fibrosis Score Calculator - SaMD Verification Tests
 *
 * Formula:
 * −1.675 + (0.037 × age) + (0.094 × BMI) + (1.13 × IFG/diabetes) + (0.99 × AST/ALT) − (0.013 × platelet) − (0.66 × albumin)
 */
import { calculateNafldFibrosisScore } from '../../calculators/nafld-fibrosis-score/calculation';
describe('NAFLD Fibrosis Score Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    // Case 1: Low Risk (F0-F2)
    // Age 40, BMI 25, Diabetes No(0), AST 20, ALT 30, Platelet 250, Albumin 4.0
    // AST/ALT = 0.666
    // Score = -1.675 + 0.037(40) + 0.094(25) + 0 + 0.99(0.666) - 0.013(250) - 0.66(4.0)
    // = -1.675 + 1.48 + 2.35 + 0.659 - 3.25 - 2.64
    // = -1.675 + 1.48 + 2.35 + 0.659 - 5.89
    // = 4.489 - 7.565
    // = -3.076
    // Indicated result: < -1.455 -> Low Risk (F0-F2)
    test('Standard Low Risk Case', () => {
        const result = calculateNafldFibrosisScore({
            age: '40',
            bmi: '25',
            diabetes: '0',
            ast: '20',
            alt: '30',
            platelet: '250',
            albumin: '4.0'
        });
        expect(result).not.toBeNull();
        expect(result).toHaveLength(2); // result + alert
        const score = parseFloat(result[0].value);
        expect(score).toBeCloseTo(-3.076, 1);
        expect(result[0].interpretation).toBe('F0-F2');
        expect(result[0].alertClass).toBe('success');
    });
    // Case 2: High Risk (F3-F4)
    // Age 60, BMI 35, Diabetes Yes(1), AST 50, ALT 40, Platelet 100, Albumin 3.0
    // AST/ALT = 1.25
    // Score = -1.675 + 0.037(60) + 0.094(35) + 1.13(1) + 0.99(1.25) - 0.013(100) - 0.66(3.0)
    // = -1.675 + 2.22 + 3.29 + 1.13 + 1.2375 - 1.3 - 1.98
    // = 7.8775 - 4.955
    // = 2.9225
    // Indicated result: > 0.675 -> High Risk (F3-F4)
    test('Standard High Risk Case', () => {
        const result = calculateNafldFibrosisScore({
            age: '60',
            bmi: '35',
            diabetes: '1',
            ast: '50',
            alt: '40',
            platelet: '100',
            albumin: '3.0'
        });
        expect(result).not.toBeNull();
        const score = parseFloat(result[0].value);
        expect(score).toBeGreaterThan(0.675);
        expect(result[0].interpretation).toBe('F3-F4');
        expect(result[0].alertClass).toBe('danger');
    });
    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should handle zero ALT (Division by zero)', () => {
        const result = calculateNafldFibrosisScore({
            age: '40',
            bmi: '25',
            diabetes: '0',
            ast: '20',
            alt: '0', // Invalid
            platelet: '250',
            albumin: '4.0'
        });
        expect(result).toHaveLength(0);
    });
    test('Should handle missing inputs', () => {
        const result = calculateNafldFibrosisScore({});
        expect(result).toHaveLength(0);
    });
});
