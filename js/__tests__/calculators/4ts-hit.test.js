/**
 * 4Ts HIT Score Calculator Tests
 * Uses Complex Formula logic (createUnifiedFormulaCalculator)
 */
import { describe, expect, test } from '@jest/globals';
import { hepScoreConfig } from '../../calculators/4ts-hit/index.js';
describe('4Ts HIT Calculator (HEP Score)', () => {
    // Mock Helpers
    const mockGetValue = (id) => null;
    const mockGetStdValue = (id) => null;
    const createMockRadioGetter = (values) => (name) => values[name] || null;
    const mockGetCheckboxValue = (name) => false;
    test('Config Structure', () => {
        expect(hepScoreConfig.id).toBe('4ts-hit');
        expect(hepScoreConfig.complexCalculate).toBeDefined();
    });
    // Scenario 1: Low Probability (<= -1)
    // Bleeding Yes (-1)
    test('Low Probability Case', () => {
        const inputs = {
            hit_onset_type: 'typical',
            bleeding: '-1'
        };
        const result = hepScoreConfig.complexCalculate(mockGetValue, mockGetStdValue, createMockRadioGetter(inputs), mockGetCheckboxValue);
        if (!result)
            throw new Error('Result should not be null');
        expect(result.score).toBe(-1);
        expect(result.interpretation).toContain('Low Probability');
        expect(result.severity).toBe('success');
    });
    // Scenario 2: Intermediate Probability (0-3)
    // Typical Onset, Fall 30-50% (+1) -> Score 1
    test('Intermediate Probability Case', () => {
        const inputs = {
            hit_onset_type: 'typical',
            platelet_fall_magnitude: '1'
        };
        const result = hepScoreConfig.complexCalculate(mockGetValue, mockGetStdValue, createMockRadioGetter(inputs), mockGetCheckboxValue);
        expect(result?.score).toBe(1);
        expect(result?.interpretation).toContain('Intermediate Probability');
        expect(result?.severity).toBe('warning');
    });
    // Scenario 3: High Probability (>= 4)
    // Typical Onset
    // Fall >50% (+3)
    // Fall Days 5-10 (+3)
    // New VTE (+3)
    // Skin Necrosis (+3)
    // Systemic Reaction (+2)
    // Total = 14
    test('High Probability Case', () => {
        const inputs = {
            hit_onset_type: 'typical',
            platelet_fall_magnitude: '3',
            timing_typical: '3',
            thrombosis_typical: '3',
            skin_necrosis: '3',
            systemic_reaction: '2'
        };
        const result = hepScoreConfig.complexCalculate(mockGetValue, mockGetStdValue, createMockRadioGetter(inputs), mockGetCheckboxValue);
        expect(result?.score).toBe(14);
        expect(result?.interpretation).toContain('High Probability');
        expect(result?.severity).toBe('danger');
    });
    // Logic Branch: Rapid Onset
    // Rapid Timing <48h (+2)
    // Rapid Thrombosis New (+3)
    test('Rapid Onset Logic', () => {
        const inputs = {
            hit_onset_type: 'rapid',
            timing_rapid: '2',
            thrombosis_rapid: '3'
        };
        const result = hepScoreConfig.complexCalculate(mockGetValue, mockGetStdValue, createMockRadioGetter(inputs), mockGetCheckboxValue);
        // 2 + 3 = 5
        expect(result?.score).toBe(5);
        expect(result?.interpretation).toContain('High Probability');
    });
});
