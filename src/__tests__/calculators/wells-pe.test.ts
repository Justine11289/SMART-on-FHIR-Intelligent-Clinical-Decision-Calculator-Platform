/**
 * Wells' Criteria for Pulmonary Embolism Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { wellsPEConfig } from '../../calculators/wells-pe/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';

describe("Wells' PE Calculator", () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct input type', () => {
        expect(wellsPEConfig.inputType).toBe('yesno');
        expect(wellsPEConfig.id).toBe('wells-pe');
        expect(wellsPEConfig.questions).toBeDefined();
        // The config defines 7 questions: DVT signs, PE #1, HR, Immobilization, Previous, Hemoptysis, Malignancy
        expect(wellsPEConfig.questions?.length).toBe(7);
    });

    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================

    // Scenario 1: Low Risk (0-1)
    // Only Hemoptysis (+1)
    test('Low Risk Case', () => {
        const result = calculateScoringResult(wellsPEConfig, {
            'wells-hemo': '1' // 1 point
        });

        expect(result.totalScore).toBe(1);
        expect(result.riskLevel?.label).toBe('Low Risk');
        expect(result.riskLevel?.recommendation).toContain('PE is unlikely');

        const resultZero = calculateScoringResult(wellsPEConfig, {});
        expect(resultZero.totalScore).toBe(0);
        expect(resultZero.riskLevel?.label).toBe('Low Risk');
    });

    // Scenario 2: Moderate Risk (2-6) OR Low-Moderate / Moderate-High
    // Note: Config has Low-Moderate (1.5-4) and Moderate-High (4.5-6)
    // DVT signs (+3)
    test('Low-Moderate Risk Case', () => {
        const result = calculateScoringResult(wellsPEConfig, {
            'wells-dvt': '3'
        });

        expect(result.totalScore).toBe(3);
        expect(result.riskLevel?.label).toBe('Low-Moderate Risk');
    });

    // DVT signs (+3) + HR > 100 (+1.5) = 4.5
    test('Moderate-High Risk Case', () => {
        const result = calculateScoringResult(wellsPEConfig, {
            'wells-dvt': '3',
            'wells-hr': '1.5'
        });

        expect(result.totalScore).toBe(4.5);
        expect(result.riskLevel?.label).toBe('Moderate-High Risk'); // 4.5-6
    });

    // Scenario 3: High Risk (>6)
    // DVT signs (+3) + PE #1 (+3) + HR > 100 (+1.5) = 7.5
    test('High Risk Case', () => {
        const result = calculateScoringResult(wellsPEConfig, {
            'wells-dvt': '3',
            'wells-alt': '3',
            'wells-hr': '1.5'
        });

        expect(result.totalScore).toBe(7.5);
        expect(result.riskLevel?.label).toBe('High Risk');
        expect(result.riskLevel?.recommendation).toContain('PE is highly likely');
    });
});
