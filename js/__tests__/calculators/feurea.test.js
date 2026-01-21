import { calculateFEUrea } from '../../calculators/feurea/calculation.js';
describe('FEUrea Calculator', () => {
    describe('Calculation Logic', () => {
        // Formula: (Serum Cr * Urine Urea) / (Serum Urea * Urine Cr) * 100
        test('Prerenal AKI: FEUrea <= 35%', () => {
            const input = {
                'feurea-serum-cr': 2.0,
                'feurea-urine-urea': 300,
                'feurea-serum-urea': 40,
                'feurea-urine-cr': 100
            };
            const result = calculateFEUrea(input);
            expect(result).not.toBeNull();
            // (2 * 300) / (40 * 100) * 100 = 600 / 4000 * 100 = 15%
            if (result) {
                const val = parseFloat(result[0].value);
                expect(val).toBeLessThanOrEqual(35);
                expect(result[0].interpretation).toContain('Prerenal');
            }
        });
        test('Intrinsic Renal AKI: FEUrea > 50%', () => {
            const input = {
                'feurea-serum-cr': 3.0,
                'feurea-urine-urea': 400,
                'feurea-serum-urea': 30,
                'feurea-urine-cr': 60
            };
            const result = calculateFEUrea(input);
            // (3 * 400) / (30 * 60) * 100 = 1200 / 1800 * 100 = 66.7%
            const val = parseFloat(result[0].value);
            expect(val).toBeGreaterThan(50);
            expect(result[0].interpretation).toContain('Intrinsic');
        });
        test('Indeterminate: FEUrea 35-50%', () => {
            const input = {
                'feurea-serum-cr': 2.0,
                'feurea-urine-urea': 300,
                'feurea-serum-urea': 30,
                'feurea-urine-cr': 50
            };
            const result = calculateFEUrea(input);
            // (2 * 300) / (30 * 50) * 100 = 600 / 1500 * 100 = 40%
            const val = parseFloat(result[0].value);
            expect(val).toBeGreaterThan(35);
            expect(val).toBeLessThanOrEqual(50);
            expect(result[0].interpretation).toContain('Indeterminate');
        });
        test('Missing inputs should return null', () => {
            const input = {
                'feurea-serum-cr': 2.0,
                'feurea-urine-urea': 300
            };
            expect(calculateFEUrea(input)).toBeNull();
        });
        test('Division by zero handling', () => {
            const input = {
                'feurea-serum-cr': 2.0,
                'feurea-urine-urea': 300,
                'feurea-serum-urea': 0,
                'feurea-urine-cr': 100
            };
            expect(calculateFEUrea(input)).toBeNull();
        });
    });
});
