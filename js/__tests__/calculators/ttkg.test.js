import { ttkgCalculation } from '../../calculators/ttkg/calculation.js';
describe('TTKG Calculator', () => {
    test('Should calculate standard TTKG correctly', () => {
        // Urine K 40, Serum K 4, Urine Osmo 500, Serum Osmo 280
        // TTKG = (40 * 280) / (4 * 500) = 11200 / 2000 = 5.6
        const result = ttkgCalculation({
            'ttkg-urine-k': 40,
            'ttkg-serum-k': 4,
            'ttkg-urine-osmo': 500,
            'ttkg-serum-osmo': 280
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(5.6);
        expect(result[0].interpretation).toContain('Normal potassium levels');
        expect(result[0].alertClass).toBe('info');
    });
    test('Should return invalid warning if Urine Osmo <= Serum Osmo', () => {
        // Urine Osmo 200, Serum Osmo 280 (Invalid)
        const result = ttkgCalculation({
            'ttkg-urine-k': 40,
            'ttkg-serum-k': 4,
            'ttkg-urine-osmo': 200,
            'ttkg-serum-osmo': 280
        });
        expect(result).toHaveLength(1);
        expect(result[0].interpretation).toContain('not valid');
        expect(result[0].alertClass).toBe('warning');
    });
    test('Should handle Hypokalemia (< 3.5)', () => {
        // Hypokalemia (3.0) with TTKG < 3 (Normal renal response)
        // TTKG = (10 * 280) / (3 * 500) = 2800 / 1500 = 1.87
        const result = ttkgCalculation({
            'ttkg-urine-k': 10,
            'ttkg-serum-k': 3.0,
            'ttkg-urine-osmo': 500,
            'ttkg-serum-osmo': 280
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(1.87);
        expect(result[0].interpretation).toContain('non-renal potassium loss');
        expect(result[0].alertClass).toBe('success');
    });
    test('Should handle Hyperkalemia (> 5.2)', () => {
        // Hyperkalemia (6.0) with TTKG < 7 (Abnormal)
        // TTKG = (40 * 280) / (6 * 500) = 11200 / 3000 = 3.73
        const result = ttkgCalculation({
            'ttkg-urine-k': 40,
            'ttkg-serum-k': 6.0,
            'ttkg-urine-osmo': 500,
            'ttkg-serum-osmo': 280
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(3.73);
        expect(result[0].interpretation).toContain('issue with aldosterone');
        expect(result[0].alertClass).toBe('warning');
    });
    test('Should return empty for missing inputs', () => {
        const result = ttkgCalculation({
            'ttkg-urine-k': 40,
            'ttkg-serum-k': 4,
            'ttkg-urine-osmo': 500,
            'ttkg-serum-osmo': null
        });
        expect(result).toHaveLength(0);
    });
    test('Should handle division by zero (Zero Serum K)', () => {
        const result = ttkgCalculation({
            'ttkg-urine-k': 40,
            'ttkg-serum-k': 0,
            'ttkg-urine-osmo': 500,
            'ttkg-serum-osmo': 280
        });
        expect(result).toHaveLength(0);
    });
});
