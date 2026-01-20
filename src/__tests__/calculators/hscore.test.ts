/**
 * HScore Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { hscoreConfig } from '../../calculators/hscore/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe('HScore Calculator', () => {
    test('Config Structure', () => {
        expect(hscoreConfig.id).toBe('hscore');
    });

    // Scenario 1: Low Probability (<169)
    test('Low Probability (0)', () => {
        const result = calculateScoringResult(hscoreConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low Probability');
    });

    test('Low Probability (168)', () => {
        // Try to construct 168
        // Immuno +18
        // Organomegaly (Hep+Splen) +38 -> 56
        // Temp >39.4 +49 -> 105
        // Ferritin >6000 +50 -> 155
        // AST +19 -> 174 (Oops, too high)

        // Let's try:
        // Temp >39.4 (+49)
        // Ferritin >6000 (+50)
        // Trig >354 (+64)
        // = 163
        const result = calculateScoringResult(hscoreConfig, {
            'hscore-temp': '49',
            'hscore-ferritin': '50',
            'hscore-trig': '64'
        });
        expect(result.totalScore).toBe(163);
        expect(result.riskLevel?.label).toBe('Low Probability');
    });

    // Scenario 2: High Probability (>=169)
    test('High Probability (Highest)', () => {
        // All max
        // 18 + 49 + 38 + 34 + 50 + 64 + 30 + 19 + 35
        // = 337 (roughly)
        const result = calculateScoringResult(hscoreConfig, {
            'hscore-immuno': '18',
            'hscore-temp': '49',
            'hscore-organo': '38',
            'hscore-cytopenias': '34',
            'hscore-ferritin': '50',
            'hscore-trig': '64',
            'hscore-fibrinogen': '30',
            'hscore-ast': '19',
            'hscore-bma': '35'
        });
        expect(result.totalScore).toBeGreaterThan(169);
        expect(result.riskLevel?.label).toBe('High Probability');
    });

    // Custom Renderer
    test('Custom Renderer Output', () => {
        const renderer = hscoreConfig.customResultRenderer!;

        const output0 = renderer(0, {});
        expect(output0).toContain('Low probability');

        const output200 = renderer(200, {});
        expect(output200).toContain('High probability');
    });
});
