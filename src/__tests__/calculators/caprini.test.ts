/**
 * Caprini Score Calculator - SaMD Verification Tests
 *
 * Formula: Sum of age points + risk factors.
 */

import { calculateCaprini } from '../../calculators/caprini/calculation';

describe('Caprini Score Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    // Case 1: Minimal Risk (Age < 41, No risks)
    // Points = 0
    test('Minimal Risk Case', () => {
        const result = calculateCaprini({
            age: '0',
            'minor-surgery': '0'
            // assuming others 0 implicitly if calculation handles partial or I pass full mock.
            // Calculation.ts implementation loops Object.values.
            // So unrelated keys? No, strictly keys passed.
            // If I pass partial, sum is partial.
            // Let's pass at least one risk factor as 0.
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(0);
        expect(scoreItem!.interpretation).toBe('Lowest Risk');
    });

    // Case 2: High Risk (Age 75+ (+3), Malignancy (+2), VTE History (+3))
    // Score = 3 + 2 + 3 = 8
    test('High Risk Case', () => {
        const result = calculateCaprini({
            age: '3',
            malignancy: '2',
            'history-vte': '3',
            'minor-surgery': '0'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(8);
        expect(scoreItem!.interpretation).toBe('High Risk');

        const recItem = result!.find(r => r.label === 'Recommendation');
        expect(recItem!.value).toContain('Pharmacologic prophylaxis');
    });

    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should handle multiple small risks summing up', () => {
        // Age 41-60 (+1)
        // Minor surgery (+1)
        // BMI > 25 (+1)
        // Swollen legs (+1)
        // Total = 4 (Moderate Risk)
        const result = calculateCaprini({
            age: '1',
            'minor-surgery': '1',
            bmi: '1',
            'swollen-legs': '1'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(4);
        expect(scoreItem!.interpretation).toBe('Moderate Risk');
    });
});
