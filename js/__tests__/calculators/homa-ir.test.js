import { calculateHOMAIR } from '../../calculators/homa-ir/calculation.js';
describe('HOMA-IR Calculator', () => {
    describe('Calculation Logic', () => {
        // Formula: (Glucose * Insulin) / 405
        test('Optimal insulin sensitivity: HOMA-IR < 1.9', () => {
            const input = {
                'homa-glucose': 90,
                'homa-insulin': 5
            };
            const result = calculateHOMAIR(input);
            expect(result).not.toBeNull();
            // (90 * 5) / 405 = 1.11
            if (result) {
                const val = parseFloat(result[0].value);
                expect(val).toBeLessThan(1.9);
                expect(result[0].interpretation).toContain('Optimal');
            }
        });
        test('Early insulin resistance: HOMA-IR 1.9-2.9', () => {
            const input = {
                'homa-glucose': 100,
                'homa-insulin': 10
            };
            const result = calculateHOMAIR(input);
            // (100 * 10) / 405 = 2.47
            const val = parseFloat(result[0].value);
            expect(val).toBeGreaterThan(1.9);
            expect(val).toBeLessThanOrEqual(2.9);
            expect(result[0].interpretation).toContain('Early');
        });
        test('High insulin resistance: HOMA-IR > 2.9', () => {
            const input = {
                'homa-glucose': 120,
                'homa-insulin': 15
            };
            const result = calculateHOMAIR(input);
            // (120 * 15) / 405 = 4.44
            const val = parseFloat(result[0].value);
            expect(val).toBeGreaterThan(2.9);
            expect(result[0].interpretation).toContain('High');
        });
        test('Missing inputs should return null', () => {
            const input = {
                'homa-glucose': 100
            };
            expect(calculateHOMAIR(input)).toBeNull();
        });
    });
});
