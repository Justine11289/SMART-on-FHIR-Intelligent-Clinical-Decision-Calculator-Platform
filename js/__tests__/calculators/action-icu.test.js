/**
 * ACTION ICU Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { actionIcuConfig } from '../../calculators/action-icu/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('ACTION ICU Calculator', () => {
    test('Config Structure', () => {
        expect(actionIcuConfig.id).toBe('action-icu');
    });
    // Scenario 1: Low Risk (0-5)
    test('Low Risk (0)', () => {
        const result = calculateScoringResult(actionIcuConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low Risk');
    });
    test('Low Risk (5)', () => {
        // HF (+5)
        const result = calculateScoringResult(actionIcuConfig, {
            'action-hf': '5'
        });
        expect(result.totalScore).toBe(5);
        expect(result.riskLevel?.label).toBe('Low Risk');
    });
    // Scenario 2: Moderate Risk (6-9)
    // Age >=70 (+1) + HF (+5) = 6
    test('Moderate Risk (6)', () => {
        const result = calculateScoringResult(actionIcuConfig, {
            'action-age': '1',
            'action-hf': '5'
        });
        expect(result.totalScore).toBe(6);
        expect(result.riskLevel?.label).toBe('Moderate Risk');
    });
    // Scenario 3: High Risk (10-17)
    // Age (+1) + Creat >1.1 (+1) + HR >100 (+3) + SBP <125 (+3) + Trop >=12 (+2) = 10
    test('High Risk (10)', () => {
        const result = calculateScoringResult(actionIcuConfig, {
            'action-age': '1',
            'action-creatinine': '1',
            'action-hr': '3',
            'action-sbp': '3',
            'action-troponin': '2'
        });
        expect(result.totalScore).toBe(10);
        expect(result.riskLevel?.label).toBe('High Risk');
    });
    // Custom Renderer Logic for ICU Risk
    test('Custom Renderer Output', () => {
        const renderer = actionIcuConfig.customResultRenderer;
        // Score 0 -> Risk 3.4%
        const output0 = renderer(0, {});
        expect(output0).toContain('3.4');
        expect(output0).toContain('%');
        // Score 17 -> Max risk (>= 90.6 or similar)
        // riskMap has 18 entries (0-17)
        // index 17 -> 90.6
        const output17 = renderer(17, {});
        expect(output17).toContain('90.6');
        expect(output17).toContain('%');
    });
});
