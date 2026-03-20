import { calciumCorrectionCalculation } from '../../calculators/calcium-correction/calculation.js';
describe('Calcium Correction Calculator', () => {
    test('Should calculate Normal Range', () => {
        // Ca 8.0, Albumin 3.0
        // Corrected = 8.0 + 0.8 * (4 - 3) = 8.0 + 0.8 = 8.8 (Normal 8.5-10.5)
        const result = calciumCorrectionCalculation({
            'ca-total': 8.0,
            'ca-albumin': 3.0
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(8.8);
        expect(result[0].interpretation).toBe('Normal Range');
        expect(result[0].alertClass).toBe('success');
    });
    test('Should detect Hypocalcemia', () => {
        // Ca 7.0, Albumin 3.5
        // Corrected = 7.0 + 0.8 * (4 - 3.5) = 7.0 + 0.4 = 7.4 (< 8.5)
        const result = calciumCorrectionCalculation({
            'ca-total': 7.0,
            'ca-albumin': 3.5
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(7.4);
        expect(result[0].interpretation).toBe('Hypocalcemia');
        expect(result[0].alertClass).toBe('warning');
    });
    test('Should detect Hypercalcemia', () => {
        // Ca 10.5, Albumin 3.0
        // Corrected = 10.5 + 0.8 * (1) = 11.3 (> 10.5)
        const result = calciumCorrectionCalculation({
            'ca-total': 10.5,
            'ca-albumin': 3.0
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(11.3);
        expect(result[0].interpretation).toBe('Hypercalcemia');
        expect(result[0].alertClass).toBe('danger');
    });
    test('Should correctly calculate mmol/L value', () => {
        // Ca 8.0, Albumin 3.0 -> 8.8 mg/dL
        // mmol = 8.8 * 0.2495 = 2.1956
        const result = calciumCorrectionCalculation({
            'ca-total': 8.0,
            'ca-albumin': 3.0
        });
        const payload = result[0].alertPayload;
        expect(payload.mmolValue).toBe(2.2); // toFixed(2) rounded
    });
    test('Should return empty for missing inputs', () => {
        const result = calciumCorrectionCalculation({
            'ca-total': null,
            'ca-albumin': 3.0
        });
        expect(result).toHaveLength(0);
    });
});
