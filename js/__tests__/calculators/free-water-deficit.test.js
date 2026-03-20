import { calculateFreeWaterDeficit } from '../../calculators/free-water-deficit/calculation.js';
describe('Free Water Deficit Calculator', () => {
    describe('Calculation Logic', () => {
        // Formula: TBW * (Na/140 - 1)
        // TBW = Weight * Factor
        test('Adult Male with Hypernatremia: Na 160', () => {
            const input = {
                'fwd-weight': 70,
                'fwd-sodium': 160,
                'fwd-gender': 'male'
            };
            const result = calculateFreeWaterDeficit(input);
            expect(result).not.toBeNull();
            // TBW = 70 * 0.6 = 42L
            // Deficit = 42 * (160/140 - 1) = 42 * 0.143 = 6.0L
            if (result) {
                const deficit = parseFloat(result[0].value);
                expect(deficit).toBeCloseTo(6.0, 1);
                expect(result[0].interpretation).toContain('Hypernatremia');
            }
        });
        test('Adult Female with Hypernatremia: Na 155', () => {
            const input = {
                'fwd-weight': 60,
                'fwd-sodium': 155,
                'fwd-gender': 'female'
            };
            const result = calculateFreeWaterDeficit(input);
            // TBW = 60 * 0.5 = 30L
            // Deficit = 30 * (155/140 - 1) = 30 * 0.107 = 3.2L
            const deficit = parseFloat(result[0].value);
            expect(deficit).toBeCloseTo(3.2, 1);
        });
        test('Elderly Female with Hypernatremia: Na 150', () => {
            const input = {
                'fwd-weight': 55,
                'fwd-sodium': 150,
                'fwd-gender': 'elderly_female'
            };
            const result = calculateFreeWaterDeficit(input);
            // TBW = 55 * 0.45 = 24.75L
            // Deficit = 24.75 * (150/140 - 1) = 24.75 * 0.0714 = 1.77L
            const deficit = parseFloat(result[0].value);
            expect(deficit).toBeCloseTo(1.8, 1);
        });
        test('Normal Sodium (Not Indicated): Na 140', () => {
            const input = {
                'fwd-weight': 70,
                'fwd-sodium': 140,
                'fwd-gender': 'male'
            };
            const result = calculateFreeWaterDeficit(input);
            // Deficit = 42 * (140/140 - 1) = 0
            const deficit = parseFloat(result[0].value);
            expect(deficit).toBe(0);
            expect(result[0].interpretation).toContain('Not Indicated');
        });
        test('Missing inputs should return null', () => {
            const input = {
                'fwd-weight': 70,
                'fwd-sodium': 160
            };
            expect(calculateFreeWaterDeficit(input)).toBeNull();
        });
    });
});
