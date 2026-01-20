/**
 * MEWS Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { mewsConfig } from '../../calculators/mews/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe('MEWS Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct structure', () => {
        expect(mewsConfig.id).toBe('mews');
        // 5 parameters: SBP, HR, RR, Temp, AVPU
        expect(mewsConfig.sections).toHaveLength(5);
    });

    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================

    // Scenario 1: Healthy (Score 0)
    // SBP 101-199, HR 51-100, RR 9-14, Temp 35-38.4, Alert
    test('Healthy Patient Score', () => {
        const result = calculateScoringResult(mewsConfig, {
            'mews-sbp': '0',
            'mews-hr': '0',
            'mews-rr': '0',
            'mews-temp': '0',
            'mews-avpu': '0'
        });

        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low Risk');
    });

    // Scenario 2: Moderate Risk (2-3)
    // HR 41-50 (+1) + RR 15-20 (+1) = 2
    test('Moderate Risk Case', () => {
        const result = calculateScoringResult(mewsConfig, {
            'mews-hr': '1',
            'mews-rr': '1',
            'mews-sbp': '0',
            'mews-temp': '0',
            'mews-avpu': '0'
        });

        expect(result.totalScore).toBe(2);
        expect(result.riskLevel?.label).toBe('Moderate Risk');
    });

    // Scenario 3: Moderate-High Risk (4)
    // SBP <= 70 (+3) + Voice response (+1) = 4
    test('Moderate-High Risk Case', () => {
        const result = calculateScoringResult(mewsConfig, {
            'mews-sbp': '3',
            'mews-avpu': '1',
            'mews-hr': '0',
            'mews-rr': '0',
            'mews-temp': '0'
        });

        expect(result.totalScore).toBe(4);
        expect(result.riskLevel?.label).toBe('Moderate-High Risk');
    });

    // Scenario 4: High Risk (>= 5)
    // Unresponsive (+3) + SBP <= 70 (+3) = 6
    test('High Risk Case', () => {
        const result = calculateScoringResult(mewsConfig, {
            'mews-sbp': '3',
            'mews-avpu': '3',
            'mews-hr': '0',
            'mews-rr': '0',
            'mews-temp': '0'
        });

        expect(result.totalScore).toBe(6);
        expect(result.riskLevel?.label).toBe('High Risk');
        expect(result.riskLevel?.description).toContain('Immediate ICU assessment');
    });
});
