/**
 * APGAR Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { apgarConfig } from '../../calculators/apgar/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('APGAR Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct structure', () => {
        expect(apgarConfig.id).toBe('apgar');
        expect(apgarConfig.sections).toHaveLength(5); // A-P-G-A-R
    });
    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================
    // Scenario 1: Normal Baby (10)
    // All score 2
    test('Normal Baby Case', () => {
        const result = calculateScoringResult(apgarConfig, {
            'apgar-appearance': '2',
            'apgar-pulse': '2',
            'apgar-grimace': '2',
            'apgar-activity': '2',
            'apgar-respiration': '2'
        });
        expect(result.totalScore).toBe(10);
        expect(result.riskLevel?.label).toBe('Reassuring (Normal)');
    });
    // Scenario 2: Moderate Distress (7)
    // Hands/feet blue (1) + Grimace (1) + Activity (1) + Respiration (2) + Pulse (2) = 7
    // Using min score for 7 -> Reassuring
    // Wait, let's check levels:
    // 7-10: Reassuring
    // 4-6: Moderately Abnormal
    // 0-3: Low (Critical)
    test('Borderline Normal Case (7)', () => {
        const result = calculateScoringResult(apgarConfig, {
            'apgar-appearance': '1',
            'apgar-grimace': '1',
            'apgar-activity': '1',
            'apgar-respiration': '2',
            'apgar-pulse': '2'
        });
        expect(result.totalScore).toBe(7);
        expect(result.riskLevel?.label).toBe('Reassuring (Normal)');
    });
    // Scenario 3: Moderate Distress (4)
    // All 1s except one 0
    test('Moderate Distress Case (4)', () => {
        const result = calculateScoringResult(apgarConfig, {
            'apgar-appearance': '1',
            'apgar-pulse': '1',
            'apgar-grimace': '1',
            'apgar-activity': '1',
            'apgar-respiration': '0'
        });
        expect(result.totalScore).toBe(4);
        expect(result.riskLevel?.label).toBe('Moderately Abnormal');
    });
    // Scenario 4: Critical (0)
    test('Critical Case', () => {
        const result = calculateScoringResult(apgarConfig, {
            'apgar-appearance': '0',
            'apgar-pulse': '0',
            'apgar-grimace': '0',
            'apgar-activity': '0',
            'apgar-respiration': '0'
        });
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low (Critical)');
    });
});
