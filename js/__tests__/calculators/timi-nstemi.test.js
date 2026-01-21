/**
 * TIMI Risk Score for UA/NSTEMI Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { timiNstemiConfig } from '../../calculators/timi-nstemi/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('TIMI NSTEMI Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should be yesno type', () => {
        expect(timiNstemiConfig.inputType).toBe('yesno');
        expect(timiNstemiConfig.id).toBe('timi-nstemi');
        expect(timiNstemiConfig.questions).toBeDefined();
        // 7 risk factors
        expect(timiNstemiConfig.questions?.length).toBe(7);
    });
    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================
    // Scenario 1: Low Risk (0-2)
    // Age >= 65 (+1)
    test('Low Risk Case', () => {
        const result = calculateScoringResult(timiNstemiConfig, {
            'timi-age': '1'
        });
        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.label).toBe('Low Risk');
        expect(result.riskLevel?.description).toContain('5-8%');
    });
    // Scenario 2: Intermediate Risk (3-4)
    // Age (+1) + Known CAD (+1) + 3 Risk Factors (+1) = 3
    test('Intermediate Risk Case', () => {
        const result = calculateScoringResult(timiNstemiConfig, {
            'timi-age': '1',
            'timi-known-cad': '1',
            'timi-cad-risk': '1'
        });
        expect(result.totalScore).toBe(3);
        expect(result.riskLevel?.label).toBe('Intermediate Risk');
        expect(result.riskLevel?.description).toContain('13-20%');
    });
    // Scenario 3: High Risk (5-7)
    // All of the above (3) + ASA (+1) + Severe Angina (+1) = 5
    test('High Risk Case', () => {
        const result = calculateScoringResult(timiNstemiConfig, {
            'timi-age': '1',
            'timi-known-cad': '1',
            'timi-cad-risk': '1',
            'timi-asa': '1',
            'timi-angina': '1'
        });
        expect(result.totalScore).toBe(5);
        expect(result.riskLevel?.label).toBe('High Risk');
        expect(result.riskLevel?.description).toContain('26-41%');
    });
    // Scenario 4: Max Score (7)
    test('Max Score Case', () => {
        const inputs = {};
        timiNstemiConfig.questions?.forEach(q => {
            inputs[q.id] = '1';
        });
        const result = calculateScoringResult(timiNstemiConfig, inputs);
        expect(result.totalScore).toBe(7);
        expect(result.riskLevel?.label).toBe('High Risk');
    });
});
