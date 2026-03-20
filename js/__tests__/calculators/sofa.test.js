/**
 * SOFA Score Calculator Tests
 */
import { describe, expect, test } from '@jest/globals';
import { sofaConfig } from '../../calculators/sofa/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('SOFA Score Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct structure', () => {
        expect(sofaConfig.id).toBe('sofa');
        expect(sofaConfig.title).toContain('SOFA');
        expect(sofaConfig.sections).toHaveLength(6);
        expect(sofaConfig.riskLevels).toBeDefined();
    });
    // ==========================================
    // TC-002: Score Calculation Scenarios
    // ==========================================
    // Scenario 1: Healthy Patient (All normal)
    // Score: 0
    test('Healthy Patient Score', () => {
        const result = calculateScoringResult(sofaConfig, {
            resp: '0', // PaO2/FiO2 >= 400
            coag: '0', // Platelets >= 150
            liver: '0', // Bilirubin < 1.2
            cardio: '0', // No hypotension
            cns: '0', // GCS 15
            renal: '0' // Creatinine < 1.2
        });
        expect(result.totalScore).toBe(0);
        expect(result.riskLevel?.label).toBe('Low Risk');
        expect(result.riskLevel?.description).toContain('10%');
    });
    // Scenario 2: Severe Sepsis Case
    // Resp: <100 with support (+4)
    // Coag: <20 (+4)
    // Liver: >12 (+4)
    // Cardio: High dose vasopressors (+4)
    // CNS: GCS < 6 (+4)
    // Renal: >5.0 (+4)
    // Total: 24 (Max Score)
    test('Max Score Case', () => {
        const result = calculateScoringResult(sofaConfig, {
            resp: '4',
            coag: '4',
            liver: '4',
            cardio: '4',
            cns: '4',
            renal: '4'
        });
        expect(result.totalScore).toBe(24);
        expect(result.riskLevel?.label).toBe('Very High Risk');
        expect(result.riskLevel?.description).toContain('>80%');
    });
    // Scenario 3: Moderate Dysfunction
    // Resp: 300-400 (+1)
    // Coag: 100-150 (+1)
    // Liver: 1.2-1.9 (+1)
    // Cardio: MAP < 70 (+1)
    // CNS: 13-14 (+1)
    // Renal: 1.2-1.9 (+1)
    // Total: 6
    test('Moderate Dysfunction (All +1)', () => {
        const result = calculateScoringResult(sofaConfig, {
            resp: '1',
            coag: '1',
            liver: '1',
            cardio: '1',
            cns: '1',
            renal: '1'
        });
        expect(result.totalScore).toBe(6);
        expect(result.riskLevel?.label).toBe('Low Risk'); // 0-6 is low risk in config
    });
    // Scenario 4: High Dysfunction
    // Resp: <200 (+3)
    // Coag: <50 (+3)
    // Liver: 6.0-11.9 (+3)
    // Cardio: Low dose dopamine (+3)
    // CNS: 6-9 (+3)
    // Renal: 3.5-4.9 (+3)
    // Total: 18
    test('High Dysfunction (All +3)', () => {
        const result = calculateScoringResult(sofaConfig, {
            resp: '3',
            coag: '3',
            liver: '3',
            cardio: '3',
            cns: '3',
            renal: '3'
        });
        expect(result.totalScore).toBe(18);
        expect(result.riskLevel?.label).toBe('Very High Risk');
    });
    // ==========================================
    // TC-003: Risk Level Boundaries
    // ==========================================
    test('Boundary Check: Moderate Risk (7-9)', () => {
        // Score 7
        const res7 = calculateScoringResult(sofaConfig, {
            resp: '4',
            coag: '3',
            liver: '0',
            cardio: '0',
            cns: '0',
            renal: '0'
        }); // 7 points
        expect(res7.totalScore).toBe(7);
        expect(res7.riskLevel?.label).toBe('Moderate Risk');
        // Score 9
        const res9 = calculateScoringResult(sofaConfig, {
            resp: '4',
            coag: '4',
            liver: '1',
            cardio: '0',
            cns: '0',
            renal: '0'
        }); // 9 points
        expect(res9.totalScore).toBe(9);
        expect(res9.riskLevel?.label).toBe('Moderate Risk');
    });
    test('Boundary Check: High Risk (10-12)', () => {
        // Score 10
        const res10 = calculateScoringResult(sofaConfig, {
            resp: '4',
            coag: '4',
            liver: '2',
            cardio: '0',
            cns: '0',
            renal: '0'
        });
        expect(res10.totalScore).toBe(10);
        expect(res10.riskLevel?.label).toBe('High Risk');
    });
});
