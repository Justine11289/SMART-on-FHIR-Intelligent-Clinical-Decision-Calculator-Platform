/**
 * DASI Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { dasiConfig } from '../../calculators/dasi/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe('DASI Calculator', () => {
    test('Config Structure', () => {
        expect(dasiConfig.id).toBe('dasi');
        expect(dasiConfig.inputType).toBe('checkbox');
    });

    // Scenario 1: Poor Function (< 4 METs, score < 9.7)
    test('Poor Functional Capacity (0 METs)', () => {
        const result = calculateScoringResult(dasiConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.risk).toBe('Poor');
    });

    test('Poor Functional Capacity (Just under 9.7)', () => {
        // Can walk indoors (1.75) + Can walk a block (2.75) = 4.5
        const result = calculateScoringResult(dasiConfig, {
            'dasi-walk-indoors': 'true',
            'dasi-walk-flat': 'true'
        });
        expect(result.totalScore).toBe(4.5);
        expect(result.riskLevel?.risk).toBe('Poor');
    });

    // Scenario 2: Moderate Function (4-7 METs, score 9.7 - 28.2)
    test('Moderate Functional Capacity', () => {
        // Can run short distance (8.0) + Can do light housework (2.7) = 10.7
        const result = calculateScoringResult(dasiConfig, {
            'dasi-run': 'true',
            'dasi-light-housework': 'true'
        });
        expect(result.totalScore).toBe(10.7);
        expect(result.riskLevel?.risk).toBe('Moderate');
    });

    // Scenario 3: Good Function (> 7 METs, score > 28.2)
    test('Good Functional Capacity', () => {
        // Run (8.0) + Heavy housework (8.0) + Strenuous sports (7.5) + Sex (5.25) = 28.75
        const result = calculateScoringResult(dasiConfig, {
            'dasi-run': 'true',
            'dasi-heavy-housework': 'true',
            'dasi-recreation-strenuous': 'true',
            'dasi-sex': 'true'
        });
        expect(result.totalScore).toBe(28.75);
        expect(result.riskLevel?.risk).toBe('Good');
    });

    // Custom Renderer
    test('Custom Renderer Output', () => {
        const renderer = dasiConfig.customResultRenderer!;

        // Score 58.2 (Max)
        // VO2 = 0.43 * 58.2 + 9.6 = 25.026 + 9.6 = 34.626
        // METs = 34.626 / 3.5 = 9.89
        const outputMax = renderer(58.2, {});
        expect(outputMax).toContain('58.20');
        expect(outputMax).toContain('Good functional capacity');
        expect(outputMax).toContain('9.9'); // METs toFixed(1)
    });
});
