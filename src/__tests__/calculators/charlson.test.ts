/**
 * Charlson Comorbidity Index Calculator - SaMD Verification Tests
 *
 * Formula: Sum of age points + comorbidity points.
 * Survival = 100 * 0.983^(e^(score * 0.9))
 */

import { describe, expect, test } from '@jest/globals';
import { calculateCharlson } from '../../calculators/charlson/calculation.js';

describe('Charlson Comorbidity Index Calculator', () => {
    // Helper to create default inputs (all zeros)
    const createDefaultInputs = () => ({
        age: '0',
        mi: '0',
        chf: '0',
        pvd: '0',
        cva: '0',
        dementia: '0',
        cpd: '0',
        ctd: '0',
        pud: '0',
        liver: '0',
        diabetes: '0',
        hemiplegia: '0',
        ckd: '0',
        tumor: '0',
        leukemia: '0',
        lymphoma: '0',
        aids: '0'
    });
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    // Case 1: Minimal Score (Age < 50, No Comorbidities)
    // Points = 0
    // Survival = 100 * 0.983^(e^(0)) = 100 * 0.983^1 = 98.3 -> 98%
    test('Minimal Score Case', () => {
        const result = calculateCharlson({
            age: '0',
            mi: '0',
            chf: '0',
            pvd: '0',
            cva: '0',
            dementia: '0',
            cpd: '0',
            ctd: '0',
            pud: '0',
            liver: '0',
            diabetes: '0',
            hemiplegia: '0',
            ckd: '0',
            tumor: '0',
            leukemia: '0',
            lymphoma: '0',
            aids: '0'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(0);
        const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
        expect(survItem!.value).toBe('98%');
    });

    // Case 2: High Score
    // Age > 80 (+4)
    // Metastatic Tumor (+6)
    // AIDS (+6)
    // Total = 16
    // Survival = ... very low.
    test('High Score Case', () => {
        const result = calculateCharlson({
            age: '4',
            mi: '0',
            chf: '0',
            pvd: '0',
            cva: '0',
            dementia: '0',
            cpd: '0',
            ctd: '0',
            pud: '0',
            liver: '0',
            diabetes: '0',
            hemiplegia: '0',
            ckd: '0',
            tumor: '6',
            leukemia: '0',
            lymphoma: '0',
            aids: '6'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(16);
        const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
        expect(survItem!.value).toBe('0%');
    });

    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should match known example from literature', () => {
        // Example: Age 60-69 (2), MI (1), Diabetes (1). Total = 4.
        // Survival = 100 * 0.983^(e^(4 * 0.9)) = 100 * 0.983^(e^3.6)
        // e^3.6 = 36.598
        // 0.983^36.598 = 0.53 -> 53%
        const result = calculateCharlson({
            age: '2',
            mi: '1',
            chf: '0',
            pvd: '0',
            cva: '0',
            dementia: '0',
            cpd: '0',
            ctd: '0',
            pud: '0',
            liver: '0',
            diabetes: '1',
            hemiplegia: '0',
            ckd: '0',
            tumor: '0',
            leukemia: '0',
            lymphoma: '0',
            aids: '0'
        });

        const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
        expect(scoreItem!.value).toBe('4');
        const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
        expect(survItem!.value).toBe('53%');
    });

    // ===========================================
    // TC-003: Age Group Tests
    // ===========================================

    describe('Age Group Scoring', () => {
        test('Age < 50 adds 0 points', () => {
            const inputs = createDefaultInputs();
            inputs.age = '0';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('0');
        });

        test('Age 50-59 adds 1 point', () => {
            const inputs = createDefaultInputs();
            inputs.age = '1';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('1');
        });

        test('Age 60-69 adds 2 points', () => {
            const inputs = createDefaultInputs();
            inputs.age = '2';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('2');
        });

        test('Age 70-79 adds 3 points', () => {
            const inputs = createDefaultInputs();
            inputs.age = '3';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('3');
        });

        test('Age >= 80 adds 4 points', () => {
            const inputs = createDefaultInputs();
            inputs.age = '4';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('4');
        });
    });

    // ===========================================
    // TC-004: Individual Comorbidity Tests
    // ===========================================

    describe('Individual Comorbidities', () => {
        test('MI adds 1 point', () => {
            const inputs = createDefaultInputs();
            inputs.mi = '1';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('1');
        });

        test('CHF adds 1 point', () => {
            const inputs = createDefaultInputs();
            inputs.chf = '1';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('1');
        });

        test('Hemiplegia adds 2 points', () => {
            const inputs = createDefaultInputs();
            inputs.hemiplegia = '2';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('2');
        });

        test('Moderate liver disease adds 3 points', () => {
            const inputs = createDefaultInputs();
            inputs.liver = '3';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('3');
        });

        test('Metastatic tumor adds 6 points', () => {
            const inputs = createDefaultInputs();
            inputs.tumor = '6';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('6');
        });

        test('AIDS adds 6 points', () => {
            const inputs = createDefaultInputs();
            inputs.aids = '6';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('6');
        });
    });

    // ===========================================
    // TC-005: Survival Rate Verification
    // ===========================================

    describe('Survival Rate Calculation', () => {
        test('Score 0 -> 98% survival', () => {
            const inputs = createDefaultInputs();
            const result = calculateCharlson(inputs);
            const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
            expect(survItem!.value).toBe('98%');
        });

        test('Score 1 -> 96% survival', () => {
            const inputs = createDefaultInputs();
            inputs.mi = '1';
            const result = calculateCharlson(inputs);
            const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
            expect(survItem!.value).toBe('96%');
        });

        test('Score 2 -> 90% survival', () => {
            const inputs = createDefaultInputs();
            inputs.age = '2'; // 60-69 years
            const result = calculateCharlson(inputs);
            const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
            expect(survItem!.value).toBe('90%');
        });

        test('Score 3 -> 77% survival', () => {
            const inputs = createDefaultInputs();
            inputs.liver = '3'; // Moderate liver disease
            const result = calculateCharlson(inputs);
            const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
            expect(survItem!.value).toBe('77%');
        });

        test('Score 5 -> 21% survival', () => {
            const inputs = createDefaultInputs();
            inputs.age = '3'; // 70-79 years (+3)
            inputs.hemiplegia = '2'; // +2
            const result = calculateCharlson(inputs);
            const survItem = result!.find(r => r.label === 'Estimated 10-year survival');
            expect(survItem!.value).toBe('21%');
        });
    });

    // ===========================================
    // TC-006: Edge Cases
    // ===========================================

    describe('Edge Cases', () => {
        test('All 1-point comorbidities', () => {
            const inputs = createDefaultInputs();
            inputs.mi = '1';
            inputs.chf = '1';
            inputs.pvd = '1';
            inputs.cva = '1';
            inputs.dementia = '1';
            inputs.cpd = '1';
            inputs.ctd = '1';
            inputs.pud = '1';
            // 8 points total
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('8');
        });

        test('Mixed severity comorbidities', () => {
            const inputs = createDefaultInputs();
            inputs.age = '2'; // +2
            inputs.diabetes = '2'; // +2 (end-organ damage)
            inputs.ckd = '2'; // +2
            inputs.tumor = '2'; // +2 (localized)
            // 8 points total
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            expect(scoreItem!.value).toBe('8');
        });

        test('Handles invalid/NaN values gracefully', () => {
            const inputs = createDefaultInputs();
            inputs.mi = 'invalid';
            const result = calculateCharlson(inputs);
            const scoreItem = result!.find(r => r.label === 'Charlson Comorbidity Index');
            // Invalid should be treated as 0
            expect(scoreItem!.value).toBe('0');
        });
    });
});
