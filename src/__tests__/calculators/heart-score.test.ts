/**
 * HEART Score Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { heartScoreConfig } from '../../calculators/heart-score/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe('HEART Score Calculator', () => {
    test('Config Structure', () => {
        expect(heartScoreConfig.id).toBe('heart-score');
    });

    // Scenario 1: Low Risk (0-3)
    test('Low Risk (0)', () => {
        const result = calculateScoringResult(heartScoreConfig, {});
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low Risk (0-3)');
    });

    test('Low Risk (3)', () => {
        // Age 45-64 (+1) + Risk Factors 1-2 (+1) + Troponin 1-3x (+1) = 3
        const result = calculateScoringResult(heartScoreConfig, {
            'heart-age': '1',
            'heart-risk': '1',
            'heart-troponin': '1'
        });
        expect(result.totalScore).toBe(3);
        expect(result.riskLevel?.label).toBe('Low Risk (0-3)');
    });

    // Scenario 2: High Risk (7-10)
    test('High Risk (10)', () => {
        // History +2, EKG +2, Age +2, Risk +2, Troponin +2 = 10
        const result = calculateScoringResult(heartScoreConfig, {
            'heart-history': '2',
            'heart-ecg': '2',
            'heart-age': '2',
            'heart-risk': '2',
            'heart-troponin': '2'
        });
        expect(result.totalScore).toBe(10);
        expect(result.riskLevel?.label).toBe('High Risk (7-10)');
    });

    // Custom Renderer
    test('Custom Renderer Output', () => {
        const renderer = heartScoreConfig.customResultRenderer!;

        const output3 = renderer(3, {});
        expect(output3).toContain('Low Risk');
        expect(output3).toContain('0.9-1.7%');

        const output7 = renderer(7, {});
        expect(output7).toContain('High Risk');
        expect(output7).toContain('50-65%');
    });
});
