/**
 * 4AT Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { fourAsDeliriumConfig } from '../../calculators/4as-delirium/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('4AT Calculator', () => {
    test('Config Structure', () => {
        expect(fourAsDeliriumConfig.id).toBe('4as-delirium');
        expect(fourAsDeliriumConfig.sections).toHaveLength(4);
    });
    test('Score 0: Delirium Unlikely', () => {
        // All default normal values (implied 0 if nothing selected, but let's be explicit if needed,
        // usually calculateScoringResult handles undefined as 0 unless default/checked logic is simulated manually,
        // but our helper defaults to 0 if not found, or use checked value if implemented.
        // The helper `calculateScoringResult` strictly follows input map.
        const result = calculateScoringResult(fourAsDeliriumConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Delirium Unlikely');
    });
    test('Score 2: Possible Cognitive Impairment', () => {
        // AMT4 >= 2 mistakes (+2)
        const result = calculateScoringResult(fourAsDeliriumConfig, {
            amt4: '2'
        });
        expect(result.totalScore).toBe(2);
        expect(result.riskLevel?.label).toBe('Possible Cognitive Impairment');
    });
    test('Score 4: Likely Delirium', () => {
        // Alertness Clearly Abnormal (+4)
        const result = calculateScoringResult(fourAsDeliriumConfig, {
            alertness: '4'
        });
        expect(result.totalScore).toBe(4);
        expect(result.riskLevel?.label).toBe('Likely Delirium');
    });
    test('Score 12: Max Score', () => {
        // Alertness (4) + AMT4 (2) + Attention (2) + Acute Change (4) = 12
        const result = calculateScoringResult(fourAsDeliriumConfig, {
            alertness: '4',
            amt4: '2',
            attention: '2',
            acute_change: '4'
        });
        expect(result.totalScore).toBe(12);
        expect(result.riskLevel?.label).toBe('Likely Delirium');
    });
});
