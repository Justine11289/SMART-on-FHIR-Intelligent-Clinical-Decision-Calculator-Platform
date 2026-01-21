import { serumAnionGapCalculation } from '../../calculators/serum-anion-gap/calculation.js';
describe('Serum Anion Gap Calculator', () => {
    test('Should calculate Normal Anion Gap (6-12)', () => {
        // Na 140, Cl 100, HCO3 24 -> 140 - 124 = 16 (High) - wait, normal is 6-12
        // Let's try Na 140, Cl 105, HCO3 25 -> 140 - 130 = 10 (Normal)
        const result = serumAnionGapCalculation({
            'sag-na': 140,
            'sag-cl': 105,
            'sag-hco3': 25
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(10);
        expect(result[0].interpretation).toBe('Normal Anion Gap');
        expect(result[0].alertClass).toBe('success');
    });
    test('Should calculate High Anion Gap (>12)', () => {
        // Na 140, Cl 100, HCO3 20 -> 140 - 120 = 20
        const result = serumAnionGapCalculation({
            'sag-na': 140,
            'sag-cl': 100,
            'sag-hco3': 20
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(20);
        expect(result[0].interpretation).toBe('High Anion Gap');
        expect(result[0].alertClass).toBe('danger');
    });
    test('Should calculate Low Anion Gap (<6)', () => {
        // Na 130, Cl 100, HCO3 26 -> 130 - 126 = 4
        const result = serumAnionGapCalculation({
            'sag-na': 130,
            'sag-cl': 100,
            'sag-hco3': 26
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(4);
        expect(result[0].interpretation).toBe('Low Anion Gap');
        expect(result[0].alertClass).toBe('warning');
    });
    test('Should handle boundary cases', () => {
        // Na 140, Cl 104, HCO3 24 -> 140 - 128 = 12 (Normal)
        const result12 = serumAnionGapCalculation({
            'sag-na': 140,
            'sag-cl': 104,
            'sag-hco3': 24
        });
        expect(result12[0].interpretation).toBe('Normal Anion Gap');
        // Na 140, Cl 110, HCO3 24 -> 140 - 134 = 6 (Normal)
        const result6 = serumAnionGapCalculation({
            'sag-na': 140,
            'sag-cl': 110,
            'sag-hco3': 24
        });
        expect(result6[0].interpretation).toBe('Normal Anion Gap');
    });
    test('Should return empty for missing inputs', () => {
        const result = serumAnionGapCalculation({
            'sag-na': 140,
            'sag-cl': 100,
            'sag-hco3': null
        });
        expect(result).toHaveLength(0);
    });
});
