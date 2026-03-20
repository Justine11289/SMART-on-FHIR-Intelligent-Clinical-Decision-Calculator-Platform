import { calculateLDL } from '../../calculators/ldl/calculation.js';
describe('LDL Calculator (Friedewald Equation)', () => {
    describe('Calculation Logic', () => {
        // Formula: LDL = TC - HDL - (TG / 5)
        test('Optimal LDL: TC 180, HDL 60, TG 100', () => {
            const input = {
                'ldl-tc': 180,
                'ldl-hdl': 60,
                'ldl-trig': 100
            };
            const result = calculateLDL(input);
            expect(result).not.toBeNull();
            // LDL = 180 - 60 - 20 = 100
            if (result) {
                expect(result[0].value).toBe('100.0');
                expect(result[0].interpretation).toBe('Near Optimal/Above Optimal');
            }
        });
        test('Borderline High LDL: TC 250, HDL 50, TG 150', () => {
            const input = {
                'ldl-tc': 250,
                'ldl-hdl': 50,
                'ldl-trig': 150
            };
            const result = calculateLDL(input);
            // LDL = 250 - 50 - 30 = 170
            expect(result[0].value).toBe('170.0');
            expect(result[0].interpretation).toBe('High');
        });
        test('Very High LDL: TC 300, HDL 40, TG 100', () => {
            const input = {
                'ldl-tc': 300,
                'ldl-hdl': 40,
                'ldl-trig': 100
            };
            const result = calculateLDL(input);
            // LDL = 300 - 40 - 20 = 240
            expect(result[0].value).toBe('240.0');
            expect(result[0].interpretation).toBe('Very High');
        });
        test('Invalid when Triglycerides >= 400', () => {
            const input = {
                'ldl-tc': 200,
                'ldl-hdl': 50,
                'ldl-trig': 400
            };
            const result = calculateLDL(input);
            expect(result[0].value).toBe('Invalid');
            // Hidden trig value should be passed
            expect(result[2].value).toBe(400);
        });
        test('Missing inputs should return null', () => {
            const input = {
                'ldl-tc': 200,
                'ldl-hdl': 50
            };
            expect(calculateLDL(input)).toBeNull();
        });
    });
});
