/**
 * CIWA-Ar Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { ciwaArConfig } from '../../calculators/ciwa-ar/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('CIWA-Ar Calculator', () => {
    test('Config Structure', () => {
        expect(ciwaArConfig.id).toBe('ciwa-ar');
        expect(ciwaArConfig.sections).toHaveLength(10);
    });
    // Scenario 1: Absent or minimal withdrawal (0-8)
    test('Minimal Withdrawal (0)', () => {
        const result = calculateScoringResult(ciwaArConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Absent or minimal withdrawal');
    });
    test('Minimal Withdrawal (8)', () => {
        // Nausea 4 + Tremor 4 = 8
        const result = calculateScoringResult(ciwaArConfig, {
            nausea: '4',
            tremor: '4'
        });
        expect(result.totalScore).toBe(8);
        expect(result.riskLevel?.label).toBe('Absent or minimal withdrawal');
    });
    // Scenario 2: Mild to moderate withdrawal (9-19)
    test('Moderate Withdrawal (9)', () => {
        // Nausea 5 + Tremor 4 = 9
        const result = calculateScoringResult(ciwaArConfig, {
            nausea: '5',
            tremor: '4'
        });
        expect(result.totalScore).toBe(9);
        expect(result.riskLevel?.label).toBe('Mild to moderate withdrawal');
    });
    test('Moderate Withdrawal (19)', () => {
        // Nausea 7 + Tremor 7 + Sweats 5 = 19
        const result = calculateScoringResult(ciwaArConfig, {
            nausea: '7',
            tremor: '7',
            sweats: '5'
        });
        expect(result.totalScore).toBe(19);
        expect(result.riskLevel?.label).toBe('Mild to moderate withdrawal');
    });
    // Scenario 3: Severe withdrawal (>= 20)
    test('Severe Withdrawal (20)', () => {
        // Nausea 7 + Tremor 7 + Sweats 6 = 20
        const result = calculateScoringResult(ciwaArConfig, {
            nausea: '7',
            tremor: '7',
            sweats: '6'
        });
        expect(result.totalScore).toBe(20);
        expect(result.riskLevel?.label).toBe('Severe withdrawal');
    });
    // Custom Renderer
    test('Custom Renderer Output', () => {
        const renderer = ciwaArConfig.customResultRenderer;
        const output8 = renderer(8, {});
        expect(output8).toContain('Absent or minimal withdrawal');
        expect(output8).toContain('Supportive care');
        const output20 = renderer(20, {});
        expect(output20).toContain('Severe withdrawal');
        expect(output20).toContain('Consider ICU admission');
    });
});
