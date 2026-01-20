import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateABG } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';

export const abgAnalyzer = createUnifiedFormulaCalculator({
    id: 'abg-analyzer',
    title: 'Arterial Blood Gas (ABG) Analyzer',
    description: 'Interprets arterial blood gas values to identify acid-base disorders.',
    mode: 'complex',

    // Use the new infoAlert feature for clinical context
    infoAlert: uiBuilder.createAlert({
        type: 'warning',
        message:
            '<strong>⚠️ Important</strong><br>This analyzer should not substitute for clinical context. Sodium, Chloride, and Albumin are required for accurate anion gap calculation.'
    }),

    sections: [
        {
            title: 'ABG Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'ph',
                    label: 'pH',
                    placeholder: 'e.g., 7.40',
                    step: 0.01,
                    validationType: 'pH',
                    loincCode: LOINC_CODES.PH, // 2744-1
                    required: true
                },
                {
                    type: 'number',
                    id: 'pco2',
                    label: 'PaCO₂',
                    placeholder: 'e.g., 40',
                    unitConfig: { type: 'pressure', units: ['mmHg', 'kPa'], default: 'mmHg' },
                    validationType: 'paCO2',
                    loincCode: LOINC_CODES.PCO2, // 2019-8
                    required: true
                },
                {
                    type: 'number',
                    id: 'hco3',
                    label: 'HCO₃⁻',
                    placeholder: 'e.g., 24',
                    unitConfig: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'bicarbonate',
                    loincCode: LOINC_CODES.HCO3, // 1960-4
                    required: true
                }
            ]
        },
        {
            title: 'Electrolytes & Albumin (for Anion Gap)',
            icon: '🧂',
            fields: [
                {
                    type: 'number',
                    id: 'sodium',
                    label: 'Sodium (Na⁺)',
                    placeholder: 'e.g., 140',
                    unitConfig: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'sodium',
                    loincCode: LOINC_CODES.SODIUM,
                    standardUnit: 'mEq/L'
                },
                {
                    type: 'number',
                    id: 'chloride',
                    label: 'Chloride (Cl⁻)',
                    placeholder: 'e.g., 100',
                    unitConfig: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'chloride',
                    loincCode: LOINC_CODES.CHLORIDE,
                    standardUnit: 'mEq/L'
                },
                {
                    type: 'number',
                    id: 'albumin',
                    label: 'Albumin',
                    placeholder: 'e.g., 4.0',
                    unitConfig: { type: 'albumin', units: ['g/dL', 'g/L'], default: 'g/dL' },
                    validationType: 'albumin',
                    loincCode: LOINC_CODES.ALBUMIN,
                    standardUnit: 'g/dL'
                }
            ]
        },
        {
            title: 'Chronicity (if respiratory)',
            icon: '⏱️',
            fields: [
                {
                    type: 'radio',
                    id: 'chronicity',
                    label: 'Condition',
                    options: [
                        { value: 'acute', label: 'Acute', checked: true },
                        { value: 'chronic', label: 'Chronic' }
                    ]
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'Interpretation',
        // Interpretation table for Delta Ratio
        interpretationTitle: 'Delta Ratio Interpretation',
        tableHeaders: ['Delta Ratio', 'Interpretation'],
        interpretations: [
            { score: '<0.4', interpretation: 'Pure normal anion gap acidosis' },
            { score: '0.4-0.8', interpretation: 'Mixed high and normal anion gap acidosis' },
            { score: '0.8-2.0', interpretation: 'Pure anion gap acidosis' },
            {
                score: '>2.0',
                interpretation: 'High anion gap acidosis with pre-existing metabolic alkalosis'
            }
        ]
    },

    formulas: [
        {
            label: 'Anion Gap',
            formula: 'Na - (Cl + HCO₃⁻)',
            notes: 'All values in mEq/L'
        },
        {
            label: 'Delta Gap',
            formula: 'Anion Gap - 12',
            notes: 'Normal anion gap is 10-12 mEq/L'
        },
        {
            label: 'Albumin Corrected AG',
            formula: 'Anion Gap + [2.5 × (4 - Albumin)]',
            notes: 'Albumin in g/dL'
        },
        { label: 'Albumin Corrected Delta Gap', formula: 'Albumin Corrected AG - 12' },
        { label: 'Delta Ratio', formula: 'Delta Anion Gap / (24 - HCO₃⁻)' },
        {
            label: 'Albumin Corrected Delta Ratio',
            formula: 'Albumin Corrected Delta Gap / (24 - HCO₃⁻)'
        }
    ],

    // Complex calculation function
    complexCalculate: calculateABG
});
