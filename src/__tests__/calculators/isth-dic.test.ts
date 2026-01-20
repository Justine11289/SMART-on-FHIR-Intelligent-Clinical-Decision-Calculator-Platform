/**
 * ISTH DIC Calculator - SaMD Verification Tests
 *
 * Formula: Sum of points from 4 categories.
 * Score >= 5: Overt DIC
 * Score < 5: Not Overt DIC
 */

import { describe, expect, test } from '@jest/globals';
import { calculateIsthDic } from '../../calculators/isth-dic/calculation.js';

describe('ISTH DIC Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    // Case 1: Max Score
    // Platelet <50 (+2)
    // D-dimer >5 (+3)
    // PT Prolongation >=6 (+2)
    // Fibrinogen <1 (+1)
    // Total: 8 -> Overt DIC
    test('Max Score Case', () => {
        const result = calculateIsthDic({
            'isth-platelet': '2',
            'isth-fibrin_marker': '3',
            'isth-pt': '2',
            'isth-fibrinogen': '1'
        });

        expect(result).not.toBeNull();
        const score = parseFloat(result![0].value as string);
        expect(score).toBe(8);
        expect(result![0].interpretation).toBe('Overt DIC');
        expect(result![0].alertClass).toBe('danger');
    });

    // Case 2: Min Score
    // Platelet >=100 (0)
    // D-dimer <0.5 (0)
    // PT Prolongation <3 (0)
    // Fibrinogen >=1 (0)
    // Total: 0 -> Not Overt DIC
    test('Min Score Case', () => {
        const result = calculateIsthDic({
            'isth-platelet': '0',
            'isth-fibrin_marker': '0',
            'isth-pt': '0',
            'isth-fibrinogen': '0'
        });

        expect(result).not.toBeNull();
        const score = parseFloat(result![0].value as string);
        expect(score).toBe(0);
        expect(result![0].interpretation).toBe('Not Overt DIC');
        expect(result![0].alertClass).toBe('success');
    });

    // Case 3: Borderline Case (Score 5)
    // Platelet 50-100 (+1)
    // D-dimer 0.5-5 (+2)
    // PT 3-6 (+1)
    // Fibrinogen <1 (+1)
    // Total: 5 -> Overt DIC
    test('Borderline Overt DIC Case', () => {
        const result = calculateIsthDic({
            'isth-platelet': '1',
            'isth-fibrin_marker': '2',
            'isth-pt': '1',
            'isth-fibrinogen': '1'
        });

        expect(result).not.toBeNull();
        const score = parseFloat(result![0].value as string);
        expect(score).toBe(5);
        expect(result![0].interpretation).toBe('Overt DIC');
    });

    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should handle partial inputs (treat missing as 0 or sum what is present)', () => {
        // Only Platelet (+2)
        const result = calculateIsthDic({
            'isth-platelet': '2'
        });
        const score = parseFloat(result![0].value as string);
        expect(score).toBe(2);
    });

    // ===========================================
    // TC-003: Individual Parameter Tests
    // ===========================================

    describe('Platelet Count Scoring', () => {
        test('Platelet >= 100k adds 0 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(0);
        });

        test('Platelet 50-100k adds 1 point', () => {
            const result = calculateIsthDic({
                'isth-platelet': '1',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(1);
        });

        test('Platelet < 50k adds 2 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '2',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(2);
        });
    });

    describe('Fibrin Marker (D-dimer) Scoring', () => {
        test('D-dimer normal adds 0 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(0);
        });

        test('D-dimer moderate elevation adds 2 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '2',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(2);
        });

        test('D-dimer strong elevation adds 3 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '3',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(3);
        });
    });

    describe('PT Prolongation Scoring', () => {
        test('PT < 3s prolongation adds 0 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(0);
        });

        test('PT 3-6s prolongation adds 1 point', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '1',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(1);
        });

        test('PT >= 6s prolongation adds 2 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '2',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(2);
        });
    });

    describe('Fibrinogen Scoring', () => {
        test('Fibrinogen >= 1 g/L adds 0 points', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(0);
        });

        test('Fibrinogen < 1 g/L adds 1 point', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '1'
            });
            expect(parseFloat(result![0].value as string)).toBe(1);
        });
    });

    // ===========================================
    // TC-004: Threshold Tests
    // ===========================================

    describe('Overt DIC Threshold', () => {
        test('Score 4 is NOT Overt DIC', () => {
            const result = calculateIsthDic({
                'isth-platelet': '2',
                'isth-fibrin_marker': '2',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(4);
            expect(result![0].interpretation).toBe('Not Overt DIC');
            expect(result![0].alertClass).toBe('success');
        });

        test('Score 5 IS Overt DIC (threshold)', () => {
            const result = calculateIsthDic({
                'isth-platelet': '2',
                'isth-fibrin_marker': '2',
                'isth-pt': '1',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(5);
            expect(result![0].interpretation).toBe('Overt DIC');
            expect(result![0].alertClass).toBe('danger');
        });

        test('Score 6 IS Overt DIC', () => {
            const result = calculateIsthDic({
                'isth-platelet': '2',
                'isth-fibrin_marker': '2',
                'isth-pt': '2',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(6);
            expect(result![0].interpretation).toBe('Overt DIC');
        });
    });

    // ===========================================
    // TC-005: Interpretation Messages
    // ===========================================

    describe('Interpretation Messages', () => {
        test('Not Overt DIC includes repeat guidance', () => {
            const result = calculateIsthDic({
                'isth-platelet': '0',
                'isth-fibrin_marker': '0',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            const interpItem = result!.find(r => r.label === 'Interpretation');
            expect(interpItem!.value).toContain('Not suggestive of overt DIC');
            expect(interpItem!.value).toContain('1-2 days');
        });

        test('Overt DIC includes daily repeat guidance', () => {
            const result = calculateIsthDic({
                'isth-platelet': '2',
                'isth-fibrin_marker': '3',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            const interpItem = result!.find(r => r.label === 'Interpretation');
            expect(interpItem!.value).toContain('overt DIC');
            expect(interpItem!.value).toContain('daily');
        });
    });

    // ===========================================
    // TC-006: Edge Cases
    // ===========================================

    describe('Edge Cases', () => {
        test('Empty inputs returns score 0', () => {
            const result = calculateIsthDic({});
            expect(parseFloat(result![0].value as string)).toBe(0);
        });

        test('Null values are ignored', () => {
            const result = calculateIsthDic({
                'isth-platelet': null as any,
                'isth-fibrin_marker': '2',
                'isth-pt': '0',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(2);
        });

        test('Empty string values are ignored', () => {
            const result = calculateIsthDic({
                'isth-platelet': '',
                'isth-fibrin_marker': '2',
                'isth-pt': '1',
                'isth-fibrinogen': '0'
            });
            expect(parseFloat(result![0].value as string)).toBe(3);
        });
    });
});
