/**
 * ARISCAT Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { ariscatConfig } from '../../calculators/ariscat/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe('ARISCAT Calculator', () => {
    test('Config Structure', () => {
        expect(ariscatConfig.id).toBe('ariscat');
        expect(ariscatConfig.sections).toHaveLength(7);
    });

    // Scenario 1: Low Risk (<26)
    test('Low Risk Case', () => {
        const result = calculateScoringResult(ariscatConfig, {
            'ariscat-age': '0',
            'ariscat-spo2': '0',
            'ariscat-resp': '0',
            'ariscat-anemia': '0',
            'ariscat-site': '0',
            'ariscat-duration': '0',
            'ariscat-emergency': '0'
        });
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low risk');
        expect(result.riskLevel?.description).toContain('1.6%');
    });

    // Scenario 2: Intermediate Risk (26-44)
    // Age >80 (+16) + SpO2 91-95 (+8) + Emergency (+8) = 32
    test('Intermediate Risk Case', () => {
        const result = calculateScoringResult(ariscatConfig, {
            'ariscat-age': '16',
            'ariscat-spo2': '8',
            'ariscat-emergency': '8'
        });
        expect(result.totalScore).toBe(32);
        expect(result.riskLevel?.label).toBe('Intermediate risk');
        expect(result.riskLevel?.description).toContain('13.3%');
    });

    // Scenario 3: High Risk (>=45)
    // Age 51-80 (+3) + SpO2 <=90 (+24) + Resp Inf (+17) + Anemia (+11) = 55
    test('High Risk Case', () => {
        const result = calculateScoringResult(ariscatConfig, {
            'ariscat-age': '3',
            'ariscat-spo2': '24',
            'ariscat-resp': '17',
            'ariscat-anemia': '11'
        });
        expect(result.totalScore).toBe(55);
        expect(result.riskLevel?.label).toBe('High risk');
        expect(result.riskLevel?.description).toContain('42.1%');
    });

    // Custom Renderer
    test('Custom Renderer Output', () => {
        const renderer = ariscatConfig.customResultRenderer!;
        const output = renderer(45, {});
        expect(output).toContain('High risk');
        expect(output).toContain('42.1%');
    });
});
