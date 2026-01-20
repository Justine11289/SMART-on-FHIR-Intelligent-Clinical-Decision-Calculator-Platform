/**
 * STOP-BANG Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { stopBangConfig } from '../../calculators/stop-bang/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe('STOP-BANG Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should be checkbox type', () => {
        expect(stopBangConfig.inputType).toBe('checkbox');
        expect(stopBangConfig.id).toBe('stop-bang');
        expect(stopBangConfig.sections).toHaveLength(1);
        expect(stopBangConfig.sections![0].options).toHaveLength(8);
    });

    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================

    // Scenario 1: Low Risk (0-2)
    // Snoring only
    test('Low Risk Case', () => {
        const result = calculateScoringResult(stopBangConfig, {
            'sb-snoring': true
        });

        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.category).toBe('Low Risk'); // Risk levels use 'risk' or 'category'
        expect(result.riskLevel?.risk).toContain('Low probability');
    });

    // Scenario 2: Intermediate Risk (3-4)
    // Snoring + Tired + Observed (3 points)
    test('Intermediate Risk Case', () => {
        const result = calculateScoringResult(stopBangConfig, {
            'sb-snoring': true,
            'sb-tired': true,
            'sb-observed': true
        });

        expect(result.totalScore).toBe(3);
        expect(result.riskLevel?.category).toBe('Intermediate Risk');
    });

    // Scenario 3: High Risk (5-8)
    // All BANG (BMI, Age, Neck, Gender) + Snoring = 5 points
    test('High Risk Case', () => {
        const result = calculateScoringResult(stopBangConfig, {
            'sb-bmi': true,
            'sb-age': true,
            'sb-neck': true,
            'sb-gender': true,
            'sb-snoring': true
        });

        expect(result.totalScore).toBe(5);
        expect(result.riskLevel?.category).toBe('High Risk');
    });

    // Check string inputs ('true') which might come from HTML value attributes in some simulation contexts
    test('Should handle string inputs', () => {
        const result = calculateScoringResult(stopBangConfig, {
            'sb-snoring': 'true' as any // simulating string value often seen in DOM interaction
        });
        expect(result.totalScore).toBe(1);
    });
});
