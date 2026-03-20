/**
 * Wells' Criteria for DVT Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { wellsDVTConfig } from '../../calculators/wells-dvt/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe("Wells' DVT Calculator", () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct input type', () => {
        expect(wellsDVTConfig.inputType).toBe('yesno');
        expect(wellsDVTConfig.id).toBe('wells-dvt');
        expect(wellsDVTConfig.questions).toBeDefined();
        expect(wellsDVTConfig.questions?.length).toBe(10);
    });
    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================
    // Scenario 1: Low Risk
    // No symptoms found
    test('Low Risk (Score -2 to 0)', () => {
        const result = calculateScoringResult(wellsDVTConfig, {
            'dvt-alternative': '-2' // Only alternative diagnosis likely
        });
        expect(result.totalScore).toBe(-2);
        expect(result.riskLevel?.label).toBe('Low Risk');
        expect(result.riskLevel?.recommendation).toContain('DVT is unlikely');
        const resultZero = calculateScoringResult(wellsDVTConfig, {});
        expect(resultZero.totalScore).toBe(0);
        expect(resultZero.riskLevel?.label).toBe('Low Risk');
    });
    // Scenario 2: Moderate Risk (1-2)
    // Active cancer (+1)
    test('Moderate Risk Case', () => {
        const result = calculateScoringResult(wellsDVTConfig, {
            'dvt-cancer': '1'
        });
        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.label).toBe('Moderate Risk');
        // Cancer (+1) + Previous DVT (+1) = 2
        const resultTwo = calculateScoringResult(wellsDVTConfig, {
            'dvt-cancer': '1',
            'dvt-previous': '1'
        });
        expect(resultTwo.totalScore).toBe(2);
        expect(resultTwo.riskLevel?.label).toBe('Moderate Risk');
    });
    // Scenario 3: High Risk (>=3)
    // Cancer (+1) + Calf swelling (+1) + Pitting edema (+1) = 3
    test('High Risk Case', () => {
        const result = calculateScoringResult(wellsDVTConfig, {
            'dvt-cancer': '1',
            'dvt-calf': '1',
            'dvt-pitting': '1'
        });
        expect(result.totalScore).toBe(3);
        expect(result.riskLevel?.label).toBe('High Risk');
        expect(result.riskLevel?.recommendation).toContain('DVT is likely');
    });
    // Scenario 4: Max Score
    // All positive (+8), Alternative (-2) NOT selected
    // Note: Max score without alternative is 9 points (9 questions * 1)
    test('Max Score Case', () => {
        const inputs = {};
        wellsDVTConfig.questions?.forEach(q => {
            if (q.points > 0) {
                inputs[q.id] = String(q.points);
            }
        });
        const result = calculateScoringResult(wellsDVTConfig, inputs);
        expect(result.totalScore).toBe(9);
        expect(result.riskLevel?.label).toBe('High Risk');
    });
});
