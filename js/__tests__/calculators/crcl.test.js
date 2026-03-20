import { crclCalculation } from '../../calculators/crcl/calculation.js';
describe('Creatinine Clearance Calculator', () => {
    test('Should calculate correct CrCl for Male', () => {
        // (140 - 40) * 70 / (72 * 1.0) = 100 * 70 / 72 = 97.22...
        const result = crclCalculation({
            gender: 'male',
            age: 40,
            weight: 70,
            creatinine: 1.0
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe('97.2');
        expect(result[0].alertClass).toBe('success');
    });
    test('Should calculate correct CrCl for Female', () => {
        // Male val (97.22) * 0.85 = 82.63...
        const result = crclCalculation({
            gender: 'female',
            age: 40,
            weight: 70,
            creatinine: 1.0
        });
        expect(result[0].value).toBe('82.6');
    });
    test('Should return error for zero creatinine', () => {
        const result = crclCalculation({
            gender: 'male',
            age: 50,
            weight: 70,
            creatinine: 0
        });
        expect(result[0].label).toBe('Error');
        expect(result[0].value).toContain('cannot be 0');
    });
    test('Should handle missing values gracefully (return empty array)', () => {
        const result = crclCalculation({
            age: 40
            // missing others
        });
        expect(result).toHaveLength(0);
    });
    // Severity Checks
    test('Should identify Kidney Failure (<15)', () => {
        // (140 - 90) * 50 / (72 * 4.0) = 50 * 50 / 288 = 8.68
        const result = crclCalculation({
            gender: 'male',
            age: 90,
            weight: 50,
            creatinine: 4.0
        });
        // value is number | string, parseFloat needs string
        expect(parseFloat(result[0].value)).toBeLessThan(15);
        expect(result[0].alertClass).toBe('danger');
        // interpretation is optional
        expect(result[0].interpretation).toContain('Kidney failure');
    });
    test('Should identify Severe Reduction (15-29)', () => {
        // (140 - 80) * 60 / (72 * 2.0) = 60 * 60 / 144 = 25
        const result = crclCalculation({
            gender: 'male',
            age: 80,
            weight: 60,
            creatinine: 2.0
        });
        expect(parseFloat(result[0].value)).toBe(25.0);
        expect(result[0].alertClass).toBe('danger');
        expect(result[0].interpretation).toContain('Severe reduction');
    });
});
