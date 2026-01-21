import { childPughCalculation } from '../../calculators/child-pugh/calculation.js';
describe('Child-Pugh Score Calculator (SaMD Protocol Verification)', () => {
    test('TC-001: Standard Class A (Well-compensated)', () => {
        // Bili < 2 (1.0) -> 1
        // Alb > 3.5 (4.0) -> 1
        // INR < 1.7 (1.0) -> 1
        // Ascites None (1) -> 1
        // Enceph None (1) -> 1
        // Total = 5
        const result = childPughCalculation({
            bilirubin: 1.0,
            albumin: 4.0,
            inr: 1.0,
            ascites: '1',
            encephalopathy: '1'
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(5);
        expect(result[0].interpretation).toBe('Child Class A');
        expect(result[0].alertClass).toBe('success');
    });
    test('TC-002: Boundary Value Analysis (Bilirubin)', () => {
        // Bili 2.0 -> Should be range 2-3 -> 2 points
        // Rest min -> 4 points
        // Total = 6 -> Class A
        const result = childPughCalculation({
            bilirubin: 2.0,
            albumin: 4.0,
            inr: 1.0,
            ascites: '1',
            encephalopathy: '1'
        });
        expect(result[0].value).toBe(6);
    });
    test('TC-003: Boundary Value Analysis (Albumin)', () => {
        // Alb 2.8 -> Should be range 2.8-3.5 -> 2 points
        // Bili 1.0 (1)
        // INR 1.0 (1)
        // Asc 1 (1)
        // Enc 1 (1)
        // Total = 1 + 2 + 1 + 1 + 1 = 6
        const result = childPughCalculation({
            bilirubin: 1.0,
            albumin: 2.8,
            inr: 1.0,
            ascites: '1',
            encephalopathy: '1'
        });
        expect(result[0].value).toBe(6);
    });
    test('TC-004: Class C (Decompensated - Max Score)', () => {
        // Bili > 3 (4.0) -> 3
        // Alb < 2.8 (2.0) -> 3
        // INR > 2.3 (3.0) -> 3
        // Asc Mod (3) -> 3
        // Enc G3-4 (3) -> 3
        // Total = 15
        const result = childPughCalculation({
            bilirubin: 4.0,
            albumin: 2.0,
            inr: 3.0,
            ascites: '3',
            encephalopathy: '3'
        });
        expect(result[0].value).toBe(15);
        expect(result[0].interpretation).toBe('Child Class C');
        expect(result[0].alertClass).toBe('danger');
        const payload = result[0].alertPayload;
        expect(payload.prognosis).toContain('Life Expectancy: 1-3 years');
    });
    test('TC-005: Missing Inputs', () => {
        const result = childPughCalculation({
            bilirubin: 1.0,
            // Albumin missing
            inr: 1.0,
            ascites: '1',
            encephalopathy: '1'
        });
        expect(result).toHaveLength(0);
    });
});
