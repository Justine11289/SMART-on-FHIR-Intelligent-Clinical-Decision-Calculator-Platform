/**
 * CURB-65 Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { curb65Config } from '../../calculators/curb-65/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe('CURB-65 Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct structure', () => {
        expect(curb65Config.id).toBe('curb-65');
        expect(curb65Config.questions).toHaveLength(5); // C-U-R-B-65
    });

    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================

    // Scenario 1: Low Risk (0)
    test('Low Risk Case (0)', () => {
        const result = calculateScoringResult(curb65Config, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low Risk'); // level for 0
        expect(result.riskLevel?.recommendation).toContain('0.6% mortality');
    });

    // Scenario 2: Low Risk (1)
    // Age (+1)
    test('Low Risk Case (1)', () => {
        const result = calculateScoringResult(curb65Config, {
            'curb-age': '1'
        });
        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.label).toBe('Low Risk'); // level for 1
        expect(result.riskLevel?.recommendation).toContain('2.7% mortality');
    });

    // Scenario 3: Moderate Risk (2)
    // Age (+1) + Confusion (+1)
    test('Moderate Risk Case', () => {
        const result = calculateScoringResult(curb65Config, {
            'curb-age': '1',
            'curb-confusion': '1'
        });
        expect(result.totalScore).toBe(2);
        expect(result.riskLevel?.label).toBe('Moderate Risk');
        expect(result.riskLevel?.recommendation).toContain('6.8% mortality');
    });

    // Scenario 4: Severe (3)
    // Age (+1) + Confusion (+1) + BUN (+1)
    test('Severe High Risk Case (3)', () => {
        const result = calculateScoringResult(curb65Config, {
            'curb-age': '1',
            'curb-confusion': '1',
            'curb-bun': '1'
        });
        expect(result.totalScore).toBe(3);
        expect(result.riskLevel?.label).toBe('High Risk');
        expect(result.riskLevel?.recommendation).toContain('14% mortality');
    });

    // Scenario 5: Max Score (5)
    test('Max Score Case', () => {
        const inputs: Record<string, string> = {};
        curb65Config.questions?.forEach(q => {
            inputs[q.id] = '1';
        });

        const result = calculateScoringResult(curb65Config, inputs);
        expect(result.totalScore).toBe(5);
        expect(result.riskLevel?.label).toBe('Very High Risk'); // Level for 4-5
        expect(result.riskLevel?.recommendation).toContain('27.8% mortality');
    });
});
