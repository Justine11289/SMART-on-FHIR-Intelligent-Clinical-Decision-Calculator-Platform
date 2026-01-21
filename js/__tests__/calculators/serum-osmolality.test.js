import { serumOsmolalityCalculation } from '../../calculators/serum-osmolality/calculation.js';
describe('Serum Osmolality Calculator', () => {
    test('Should calculate standard values correctly', () => {
        // Na 140, Glucose 100, BUN 15, Ethanol 0
        // 2*140 + 100/18 + 15/2.8 + 0
        // 280 + 5.55 + 5.36 + 0 = 290.91
        const result = serumOsmolalityCalculation({
            'osmo-na': 140,
            'osmo-glucose': 100,
            'osmo-bun': 15,
            'osmo-ethanol': 0
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(290.9);
        expect(result[0].interpretation).toBe('');
    });
    test('Should detect Low Osmolality', () => {
        // Na 130, Glucose 80, BUN 10
        // 260 + 4.44 + 3.57 = 268.01
        const result = serumOsmolalityCalculation({
            'osmo-na': 130,
            'osmo-glucose': 80,
            'osmo-bun': 10
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(268.0);
        expect(result[0].interpretation).toContain('Low Osmolality');
        expect(result[0].alertClass).toBe('info');
    });
    test('Should detect High Osmolality', () => {
        // Na 145, Glucose 200, BUN 30
        // 290 + 11.11 + 10.71 = 311.82
        const result = serumOsmolalityCalculation({
            'osmo-na': 145,
            'osmo-glucose': 200,
            'osmo-bun': 30
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(311.8);
        expect(result[0].interpretation).toContain('High Osmolality');
        expect(result[0].alertClass).toBe('warning');
    });
    test('Should handle Ethanol', () => {
        // Na 140, Glucose 100, BUN 15, Ethanol 46
        // 290.9 + 46/4.6 = 290.9 + 10 = 300.9
        const result = serumOsmolalityCalculation({
            'osmo-na': 140,
            'osmo-glucose': 100,
            'osmo-bun': 15,
            'osmo-ethanol': 46
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(300.9);
        const payload = result[0].alertPayload;
        expect(payload.breakdown.ethanolTerm).toBe(10);
    });
    test('Should return correct breakdown terms', () => {
        const result = serumOsmolalityCalculation({
            'osmo-na': 140,
            'osmo-glucose': 180, // /18 = 10
            'osmo-bun': 28, // /2.8 = 10
            'osmo-ethanol': 0
        });
        const payload = result[0].alertPayload;
        expect(payload.breakdown.naTerm).toBe(280);
        expect(payload.breakdown.glucoseTerm).toBe(10);
        expect(payload.breakdown.bunTerm).toBe(10);
    });
    test('Should return empty for missing inputs', () => {
        const result = serumOsmolalityCalculation({
            'osmo-na': 140,
            'osmo-glucose': null,
            'osmo-bun': 15
        });
        expect(result).toHaveLength(0);
    });
});
