/**
 * 4C Mortality COVID Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { fourCMortalityCovidConfig } from '../../calculators/4c-mortality-covid/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('4C Mortality COVID Calculator', () => {
    test('Config Structure', () => {
        expect(fourCMortalityCovidConfig.id).toBe('4c-mortality-covid');
    });
    // Scenario 1: Low Risk (0-3)
    test('Low Risk Case', () => {
        const result = calculateScoringResult(fourCMortalityCovidConfig, {
            '4c-age': '0', // <50
            '4c-sex': '0', // Female
            '4c-comorbidities': '0',
            '4c-resp_rate': '0', // <20
            '4c-oxygen_sat': '0', // >=92%
            '4c-gcs': '0', // 15
            '4c-urea': '0', // <7
            '4c-crp': '0' // <50
        });
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low Risk');
        expect(result.riskLevel?.description).toContain('1.2%');
    });
    // Scenario 2: Intermediate Risk (4-8)
    // Age 70-79 (+6) + Male (+1) = 7
    test('Intermediate Risk Case', () => {
        const result = calculateScoringResult(fourCMortalityCovidConfig, {
            '4c-age': '6',
            '4c-sex': '1'
        });
        expect(result.totalScore).toBe(7);
        expect(result.riskLevel?.label).toBe('Intermediate Risk');
    });
    // Scenario 3: High Risk (9-14)
    // Age >=80 (+7) + Male (+1) + Comorb 1 (+1) = 9
    test('High Risk Case', () => {
        const result = calculateScoringResult(fourCMortalityCovidConfig, {
            '4c-age': '7',
            '4c-sex': '1',
            '4c-comorbidities': '1'
        });
        expect(result.totalScore).toBe(9);
        expect(result.riskLevel?.label).toBe('High Risk');
    });
    // Scenario 4: Very High Risk (>=15)
    // Age >=80 (+7) + Male (+1) + Comorb >=2 (+2) + RR >=30 (+2) + Sat <92% (+2) + GCS <15 (+2) = 16
    test('Very High Risk Case', () => {
        const result = calculateScoringResult(fourCMortalityCovidConfig, {
            '4c-age': '7',
            '4c-sex': '1',
            '4c-comorbidities': '2',
            '4c-resp_rate': '2',
            '4c-oxygen_sat': '2',
            '4c-gcs': '2' // +2
        });
        // 7+1+2+2+2+2 = 16
        expect(result.totalScore).toBe(16);
        expect(result.riskLevel?.label).toBe('Very High Risk');
    });
});
