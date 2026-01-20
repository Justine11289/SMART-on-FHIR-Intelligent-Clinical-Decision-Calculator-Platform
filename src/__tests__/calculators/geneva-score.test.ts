/**
 * Geneva Score Calculator - SaMD Verification Tests
 *
 * Formula: Sum of points. Simplified version.
 */

import { calculateGenevaScore } from '../../calculators/geneva-score/calculation';

describe('Geneva Score Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    // Case 1: Low Risk
    // All No (0)
    // HR 70 (0)
    // Total 0
    test('Low Risk Case', () => {
        const result = calculateGenevaScore({
            'geneva-age': '0',
            'geneva-prev-dvt': '0',
            'geneva-surgery': '0',
            'geneva-malignancy': '0',
            'geneva-limb-pain': '0',
            'geneva-hemoptysis': '0',
            'geneva-palpation': '0',
            'geneva-hr': '70'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(0);
        expect(scoreItem!.interpretation).toBe('Low Risk');
    });

    // Case 2: Intermediate Risk
    // Age > 65 (1)
    // HR 80 (1)
    // Others 0
    // Total 2
    test('Intermediate Risk Case', () => {
        const result = calculateGenevaScore({
            'geneva-age': '1',
            'geneva-hr': '80', // 75-94 -> +1
            'geneva-prev-dvt': '0',
            'geneva-surgery': '0',
            'geneva-malignancy': '0',
            'geneva-limb-pain': '0',
            'geneva-hemoptysis': '0',
            'geneva-palpation': '0'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(2);
        expect(scoreItem!.interpretation).toBe('Intermediate Risk');
    });

    // Case 3: High Risk
    // Age > 65 (1)
    // Unilateral limb pain (1)
    // Hemoptysis (1)
    // Malignancy (1)
    // HR 100 (+2)
    // Total 6
    test('High Risk Case', () => {
        const result = calculateGenevaScore({
            'geneva-age': '1',
            'geneva-limb-pain': '1',
            'geneva-hemoptysis': '1',
            'geneva-malignancy': '1',
            'geneva-hr': '100', // >=95 -> +2
            'geneva-prev-dvt': '0',
            'geneva-surgery': '0',
            'geneva-palpation': '0'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(6);
        expect(scoreItem!.interpretation).toBe('High Risk');
    });

    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should handle optional heart rate correctly (missing HR implies 0 points for HR)', () => {
        // As per original logic, 'geneva-hr' usually required for complete score but if empty, implies 0 in sum loop if strictly numeric?
        // But code: const hr = ... Number(val) : null.
        // if hr === null, no points added.
        // Assuming user didn't enter.
        const result = calculateGenevaScore({
            'geneva-age': '1'
            // HR missing
        });
        const scoreItem = result!.find(r => r.label === 'Total Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(1);
    });
});
