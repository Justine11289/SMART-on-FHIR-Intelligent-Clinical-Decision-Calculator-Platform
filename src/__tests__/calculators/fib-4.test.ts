import { fib4Calculation } from '../../calculators/fib-4/calculation.js';

describe('FIB-4 Calculator', () => {
    test('Should calculate Low Risk correctly (< 1.3)', () => {
        // Age 35, AST 20, ALT 25, PLT 300
        // Score = (35 * 20) / (300 * sqrt(25)) = 700 / (300 * 5) = 700 / 1500 = 0.47
        const result = fib4Calculation({
            'fib4-age': 35,
            'fib4-ast': 20,
            'fib4-alt': 25,
            'fib4-plt': 300
        });

        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(0.47);
        expect(result[0].interpretation).toContain('Low Risk');
        expect(result[0].alertClass).toBe('success');
    });

    test('Should calculate High Risk correctly (> 2.67)', () => {
        // Age 60, AST 80, ALT 40, PLT 100
        // Score = (60 * 80) / (100 * sqrt(40))
        // = 4800 / (100 * 6.3245) = 4800 / 632.45 = 7.589 -> 7.59
        const result = fib4Calculation({
            'fib4-age': 60,
            'fib4-ast': 80,
            'fib4-alt': 40,
            'fib4-plt': 100
        });

        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(7.59);
        expect(result[0].interpretation).toContain('High Risk');
        expect(result[0].alertClass).toBe('danger');
    });

    test('Should calculate Indeterminate Risk correctly (1.3 - 2.67)', () => {
        // Age 50, AST 40, ALT 40, PLT 200
        // Score = (50 * 40) / (200 * sqrt(40)) = 2000 / (200 * 6.3245) = 1.58
        const result = fib4Calculation({
            'fib4-age': 50,
            'fib4-ast': 40,
            'fib4-alt': 40,
            'fib4-plt': 200
        });

        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(1.58);
        expect(result[0].interpretation).toContain('Indeterminate Risk');
        expect(result[0].alertClass).toBe('warning');
    });

    test('Should return empty for invalid or missing inputs', () => {
        const result = fib4Calculation({
            'fib4-age': 50,
            'fib4-ast': null as any,
            'fib4-alt': 40,
            'fib4-plt': 200
        });
        expect(result).toHaveLength(0);
    });

    test('Should handle zero platelets (division by zero)', () => {
        const result = fib4Calculation({
            'fib4-age': 50,
            'fib4-ast': 40,
            'fib4-alt': 40,
            'fib4-plt': 0
        });
        expect(result).toHaveLength(0);
    });
});
