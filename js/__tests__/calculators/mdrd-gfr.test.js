import { calculateMDRD } from '../../calculators/mdrd-gfr/calculation.js';
describe('MDRD GFR Calculator', () => {
    describe('Calculation Logic', () => {
        // Formula: 175 * (Scr)^-1.154 * (Age)^-0.203 * [0.742 if female] * [1.212 if AA]
        test('Case 1: Male, Non-AA, Age 50, Cr 1.0', () => {
            const input = {
                'mdrd-age': 50,
                'mdrd-creatinine': 1.0,
                'mdrd-gender': 'male',
                'mdrd-race': 'non-aa'
            };
            const result = calculateMDRD(input);
            expect(result).not.toBeNull();
            // 175 * 1^-1.154 * 50^-0.203 = 175 * 1 * 0.451xxx = 79.1
            if (result) {
                expect(result[0].value).toBe('79');
                expect(result[0].alertClass).toBe('success'); // > 60
            }
        });
        test('Case 2: Female, Non-AA, Age 50, Cr 1.0', () => {
            const input = {
                'mdrd-age': 50,
                'mdrd-creatinine': 1.0,
                'mdrd-gender': 'female',
                'mdrd-race': 'non-aa'
            };
            const result = calculateMDRD(input);
            // 79.1 * 0.742 = 58.7 => 59
            expect(result[0].value).toBe('59');
            // 59 is < 60 but >= 45, likely Stage 3a or just below normal depending on rounding
            // Wait, logic uses >= 60. 58.7 < 60.
            expect(result[0].interpretation).toContain('Stage 3');
        });
        test('Case 3: Male, AA, Age 50, Cr 1.0', () => {
            const input = {
                'mdrd-age': 50,
                'mdrd-creatinine': 1.0,
                'mdrd-gender': 'male',
                'mdrd-race': 'aa'
            };
            const result = calculateMDRD(input);
            // 79.1 * 1.212 = 95.8 => 96
            expect(result[0].value).toBe('96');
            expect(result[0].interpretation).toContain('Stage 1');
        });
        test('Severe Kidney Failure: Cr 4.0, Age 70, Male', () => {
            const input = {
                'mdrd-age': 70,
                'mdrd-creatinine': 4.0,
                'mdrd-gender': 'male',
                'mdrd-race': 'non-aa'
            };
            const result = calculateMDRD(input);
            // 175 * (4)^-1.154 * (70)^-0.203 = 14.918
            // Raw GFR < 15, so Stage 5 (Kidney Failure)
            // Display value rounds to 15
            expect(result[0].value).toBe('15');
            expect(result[0].interpretation).toContain('Stage 5');
        });
        test('Invalid Input', () => {
            const input = {
                'mdrd-age': 0,
                'mdrd-creatinine': 1.0
            };
            expect(calculateMDRD(input)).toBeNull();
        });
    });
});
