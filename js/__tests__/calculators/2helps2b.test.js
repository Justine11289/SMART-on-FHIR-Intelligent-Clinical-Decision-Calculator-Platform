/**
 * 2HELPS2B Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { helps2bConfig } from '../../calculators/2helps2b/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('2HELPS2B Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct structure', () => {
        expect(helps2bConfig.id).toBe('2helps2b');
        expect(helps2bConfig.inputType).toBe('checkbox');
    });
    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================
    // Scenario 1: Very Low Risk (0)
    test('Very Low Risk Case', () => {
        const result = calculateScoringResult(helps2bConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.category).toBe('Very Low');
        expect(result.riskLevel?.risk).toBe('< 5%');
    });
    // Scenario 2: Low Risk (1)
    // Frequency > 2Hz (+1)
    test('Low Risk Case', () => {
        const result = calculateScoringResult(helps2bConfig, {
            'freq-gt-2hz': 'true'
        });
        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.category).toBe('Low');
        expect(result.riskLevel?.risk).toBe('12%');
    });
    // Scenario 3: Moderate Risk (2)
    // BIRDs (+2)
    test('Moderate Risk Case', () => {
        const result = calculateScoringResult(helps2bConfig, {
            birds: 'true'
        });
        expect(result.totalScore).toBe(2);
        expect(result.riskLevel?.category).toBe('Moderate');
        expect(result.riskLevel?.risk).toBe('27%');
    });
    // Scenario 4: High Risk (4)
    // BIRDs (+2) + Prior Seizure (+1) + Plus features (+1)
    test('High Risk Case', () => {
        const result = calculateScoringResult(helps2bConfig, {
            birds: 'true',
            'prior-seizure': 'true',
            'plus-features': 'true'
        });
        expect(result.totalScore).toBe(4);
        expect(result.riskLevel?.category).toBe('High');
        expect(result.riskLevel?.risk).toBe('73%');
    });
    // Scenario 5: Extremely High Risk (Max 7)
    // All checkable items
    test('Max Score Case', () => {
        const inputs = {
            'freq-gt-2hz': 'true',
            'sporadic-epileptiform': 'true',
            'lpd-bipd-lrda': 'true',
            'plus-features': 'true',
            'prior-seizure': 'true',
            birds: 'true'
        };
        // 1+1+1+1+1+2 = 7
        const result = calculateScoringResult(helps2bConfig, inputs);
        expect(result.totalScore).toBe(7);
        expect(result.riskLevel?.category).toBe('Extremely High'); // >= 6
    });
});
