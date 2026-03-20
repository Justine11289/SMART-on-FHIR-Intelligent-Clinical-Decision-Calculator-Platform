/**
 * HAS-BLED Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { hasBledConfig } from '../../calculators/has-bled/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('HAS-BLED Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should be yesno type', () => {
        expect(hasBledConfig.inputType).toBe('yesno');
        expect(hasBledConfig.id).toBe('has-bled');
        expect(hasBledConfig.questions).toHaveLength(9);
    });
    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================
    // Scenario 1: Low Risk (0-1)
    // Hypertension (+1)
    test('Low Risk Case', () => {
        const result = calculateScoringResult(hasBledConfig, {
            'hasbled-hypertension': '1'
        });
        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.label).toBe('Low-moderate risk');
    });
    // Scenario 2: Moderate Risk (2)
    // Hypertension (+1) + Stroke (+1) = 2
    test('Moderate Risk Case', () => {
        const result = calculateScoringResult(hasBledConfig, {
            'hasbled-hypertension': '1',
            'hasbled-stroke': '1'
        });
        expect(result.totalScore).toBe(2);
        expect(result.riskLevel?.label).toBe('Moderate risk');
    });
    // Scenario 3: High Risk (>=3)
    // HTN (+1) + Stroke (+1) + Elderly (+1) = 3
    test('High Risk Case', () => {
        const result = calculateScoringResult(hasBledConfig, {
            'hasbled-hypertension': '1',
            'hasbled-stroke': '1',
            'hasbled-age': '1'
        });
        expect(result.totalScore).toBe(3);
        expect(result.riskLevel?.label).toBe('High risk');
    });
    // Scenario 4: Max Score (9)
    test('Max Score Case', () => {
        const inputs = {};
        hasBledConfig.questions?.forEach(q => {
            inputs[q.id] = '1';
        });
        const result = calculateScoringResult(hasBledConfig, inputs);
        expect(result.totalScore).toBe(9);
        expect(result.riskLevel?.label).toBe('High risk');
    });
});
