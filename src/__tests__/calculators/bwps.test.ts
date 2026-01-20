/**
 * BWPS Calculator - SaMD Verification Tests
 *
 * Formula: Sum of selects.
 */

import { calculateBwps } from '../../calculators/bwps/calculation';

describe('BWPS Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    // Case 1: Minimal Score (All absent/lowest)
    // Score = 0
    test('Minimal Score Case', () => {
        const result = calculateBwps({
            'bwps-temp': '0',
            'bwps-cns': '0',
            'bwps-gi': '0',
            'bwps-hr': '0',
            'bwps-chf': '0',
            'bwps-afib': '0',
            'bwps-precip': '0'
        });

        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(0);
        expect(scoreItem!.interpretation).toBe('Unlikely to represent thyroid storm');
    });

    // Case 2: Severe Case
    // Temp >=104 (+30)
    // CNS Severe (+30)
    // HR >=140 (+25)
    // Total = 85
    test('Severe Risk Case', () => {
        const result = calculateBwps({
            'bwps-temp': '30',
            'bwps-cns': '30',
            'bwps-gi': '0', // absent
            'bwps-hr': '25',
            'bwps-chf': '0',
            'bwps-afib': '0',
            'bwps-precip': '0'
        });

        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(85);
        expect(scoreItem!.interpretation).toBe('Highly suggestive of thyroid storm');
    });

    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should handle intermediate scores', () => {
        // Temp 99-99.9 (+5)
        // CNS Mild (+10)
        // HR 110-119 (+10)
        // Total = 25 (Impending Storm)
        const result = calculateBwps({
            'bwps-temp': '5',
            'bwps-cns': '10',
            'bwps-gi': '0',
            'bwps-hr': '10',
            'bwps-chf': '0',
            'bwps-afib': '0',
            'bwps-precip': '0'
        });

        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(25);
        expect(scoreItem!.interpretation).toBe('Suggests impending storm');
    });
});
