import { calculateSodiumCorrection } from '../../calculators/sodium-correction/calculation.js';
describe('Sodium Correction Calculator', () => {
    describe('Calculation Logic', () => {
        // formula: Na + Factor * ((Glucose - 100) / 100)
        test('Standard Factor 1.6: Glucose 200', () => {
            const input = {
                'measured-sodium': 135,
                glucose: 200,
                'correction-factor': '1.6'
            };
            const result = calculateSodiumCorrection(input);
            expect(result).not.toBeNull();
            if (result) {
                // 135 + 1.6 * (100/100) = 136.6
                expect(result[0].value).toBe('136.6');
                expect(result[0].interpretation).toBe('Normal');
            }
        });
        test('Standard Factor 1.6: Glucose 500', () => {
            const input = {
                'measured-sodium': 130,
                glucose: 500,
                'correction-factor': '1.6'
            };
            const result = calculateSodiumCorrection(input);
            expect(result).not.toBeNull();
            if (result) {
                // 130 + 1.6 * (400/100) = 130 + 6.4 = 136.4
                expect(result[0].value).toBe('136.4');
                expect(result[0].interpretation).toBe('Normal');
            }
        });
        test('Katz Factor 2.4: Glucose 600', () => {
            const input = {
                'measured-sodium': 125,
                glucose: 600,
                'correction-factor': '2.4'
            };
            const result = calculateSodiumCorrection(input);
            expect(result).not.toBeNull();
            if (result) {
                // 125 + 2.4 * (500/100) = 125 + 12 = 137.0
                expect(result[0].value).toBe('137.0');
                expect(result[0].interpretation).toBe('Normal');
            }
        });
        test('Hyponatremia Result', () => {
            const input = {
                'measured-sodium': 120,
                glucose: 200,
                'correction-factor': '1.6'
            };
            const result = calculateSodiumCorrection(input);
            // 120 + 1.6 = 121.6 -> Low
            expect(result[0].interpretation).toBe('Low (Hyponatremia)');
            expect(result[0].alertClass).toBe('warning');
        });
        test('Hypernatremia Result', () => {
            const input = {
                'measured-sodium': 145,
                glucose: 300,
                'correction-factor': '1.6'
            };
            const result = calculateSodiumCorrection(input);
            // 145 + 1.6 * 2 = 148.2 -> High
            expect(result[0].interpretation).toBe('High (Hypernatremia)');
            expect(result[0].alertClass).toBe('danger');
        });
        test('Missing inputs should return null', () => {
            const input = {
                'measured-sodium': 135
                // missing glucose
            };
            const result = calculateSodiumCorrection(input);
            expect(result).toBeNull();
        });
    });
    /*
    describe('Calculator Configuration', () => {
        test('Should use correct ValidationTypes', () => {
            expect(sodiumCorrectionConfig).toBeDefined();
            // ...
        });
    });
    */
});
