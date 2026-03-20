/**
 * CPIS Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { cpisConfig } from '../../calculators/cpis/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('CPIS Calculator', () => {
    test('Config Structure', () => {
        expect(cpisConfig.id).toBe('cpis');
    });
    // Scenario 1: Low Likelihood (0-5)
    test('Low Likelihood (0)', () => {
        const result = calculateScoringResult(cpisConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low likelihood of VAP');
    });
    test('Low Likelihood (5)', () => {
        // Temp >39 (+2) + Secretions Large (+2) + Infiltrate Diffuse (+1) = 5
        const result = calculateScoringResult(cpisConfig, {
            'cpis-temperature': '2',
            'cpis-secretions': '2',
            'cpis-chest_xray': '1'
        });
        expect(result.totalScore).toBe(5);
        expect(result.riskLevel?.label).toBe('Low likelihood of VAP');
    });
    // Scenario 2: High Likelihood (6-12)
    test('High Likelihood (6)', () => {
        // Temp >39 (+2) + Secretions Large (+2) + Infiltrate Localized (+2) = 6
        const result = calculateScoringResult(cpisConfig, {
            'cpis-temperature': '2',
            'cpis-secretions': '2',
            'cpis-chest_xray': '2'
        });
        expect(result.totalScore).toBe(6);
        expect(result.riskLevel?.label).toBe('High likelihood of VAP');
    });
    // Custom Renderer
    test('Custom Renderer Output', () => {
        const renderer = cpisConfig.customResultRenderer;
        const output0 = renderer(0, {});
        expect(output0).toContain('Low likelihood of VAP');
        expect(output0).toContain('Continue monitoring');
        const output6 = renderer(6, {});
        expect(output6).toContain('High likelihood of VAP');
        expect(output6).toContain('Obtain cultures');
    });
});
