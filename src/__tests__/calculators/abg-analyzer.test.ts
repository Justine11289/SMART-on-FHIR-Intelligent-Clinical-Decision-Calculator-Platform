import { describe, expect, test } from '@jest/globals';
import { calculateABG } from '../../calculators/abg-analyzer/calculation.js';

// Mock helpers
const createMockGetters = (inputs: Record<string, number>) => {
    return {
        getValue: (id: string) => inputs[id] ?? null,
        getStdValue: (id: string, _unit: string) => inputs[id] ?? null, // Assume inputs are already in std units
        getRadioValue: (_id: string) => '', // Not used in current logic
        getCheckboxValue: (_id: string) => false // Added mock
    };
};

describe('ABG Analyzer', () => {
    test('Detects Metabolic Acidosis (Simple)', () => {
        // pH 7.20 (Acidosis) // pCO2 40 (Normal) // HCO3 15 (Low)
        const inputs = {
            ph: 7.2,
            pco2: 40,
            hco3: 15,
            sodium: 140,
            chloride: 100,
            albumin: 4.0 // Normal
        };

        const { getValue, getStdValue, getRadioValue, getCheckboxValue } =
            createMockGetters(inputs);
        const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);

        expect(result).not.toBeNull();
        expect(result!.severity).toBe('danger');
        expect(result!.interpretation).toBe('Metabolic Acidosis');
    });

    test('Detects Respiratory Alkalosis', () => {
        // pH 7.50 (Alk) // pCO2 25 (Low) // HCO3 24 (Normal)
        const inputs = {
            ph: 7.5,
            pco2: 25,
            hco3: 24
        };

        const { getValue, getStdValue, getRadioValue, getCheckboxValue } =
            createMockGetters(inputs);
        const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);

        expect(result!.interpretation).toBe('Respiratory Alkalosis');
    });

    test('Calculates Anion Gap correctly', () => {
        // Na 140, Cl 100, HCO3 24
        // AG = 140 - (100 + 24) = 16 (High)
        // Albumin 4.0 -> Corrected AG same (16)
        // Delta Gap = 16 - 12 = 4
        // Delta Delta = 4 + 24 = 28 -> No metabolic alkalosis boundary (>28)

        const inputs = {
            ph: 7.4,
            pco2: 40,
            hco3: 24,
            sodium: 140,
            chloride: 100,
            albumin: 4.0
        };

        const { getValue, getStdValue, getRadioValue, getCheckboxValue } =
            createMockGetters(inputs);
        const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);

        // Result should contain AG info
        // AG is > 12 -> High Anion Gap (16.0)

        expect(result!.score).toBe(16);
        const agInfo = result!.additionalResults?.find(r => r.label === 'Anion Gap Assessment');
        expect(agInfo).toBeDefined();
        expect(agInfo!.value).toContain('High Anion Gap (16.0)');
    });

    test('Calculates High Anion Gap with Albumin Correction', () => {
        // Na 135, Cl 100, HCO3 24
        // Uncorrected AG = 135 - 124 = 11 (Normal)
        // Low Albumin 2.0
        // Correction: 11 + 2.5 * (4 - 2) = 11 + 5 = 16 (High)

        const inputs = {
            ph: 7.4,
            pco2: 40,
            hco3: 24,
            sodium: 135,
            chloride: 100,
            albumin: 2.0
        };

        const { getValue, getStdValue, getRadioValue, getCheckboxValue } =
            createMockGetters(inputs);
        const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);

        expect(result!.score).toBe(16);
        const agInfo = result!.additionalResults?.find(r => r.label === 'Anion Gap Assessment');
        expect(agInfo!.value).toContain('High Anion Gap (16.0)');
    });

    test('Detects Mixed Disorders (Delta Ratio)', () => {
        // High AG Acidosis
        // Na 140, Cl 100, HCO3 10 -> AG 30
        // Delta Gap = 30 - 12 = 18
        // Delta Ratio = 18 / (24 - 10) = 18 / 14 = 1.28
        // 0.8 - 2.0 -> Pure high anion gap metabolic acidosis

        const inputs = {
            ph: 7.2,
            pco2: 30, // Compensating
            hco3: 10,
            sodium: 140,
            chloride: 100,
            albumin: 4.0
        };

        const { getValue, getStdValue, getRadioValue, getCheckboxValue } =
            createMockGetters(inputs);
        const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);

        const deltaInfo = result!.additionalResults?.find(r => r.label === 'Delta Ratio Analysis');
        expect(deltaInfo!.value).toContain('1.29'); // 18/14 = 1.2857 -> 1.29
        expect(deltaInfo!.value).toContain('Pure high anion gap metabolic acidosis');
    });
});
