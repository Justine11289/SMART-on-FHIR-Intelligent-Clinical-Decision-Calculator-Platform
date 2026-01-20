import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateCkdEpi } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const ckdEpiConfig: FormulaCalculatorConfig = {
    id: 'ckd-epi',
    title: 'CKD-EPI GFR (2021 Race-Free)',
    description:
        'Estimates GFR using the CKD-EPI 2021 race-free equation, the recommended method for assessing kidney function.',
    infoAlert:
        '<h4>CKD Staging</h4>' +
        uiBuilder.createTable({
            headers: ['Stage', 'GFR', 'Description'],
            rows: [
                ['1', '≥90', 'Normal or high'],
                ['2', '60-89', 'Mildly decreased'],
                ['3a', '45-59', 'Mild to moderate decrease'],
                ['3b', '30-44', 'Moderate to severe decrease'],
                ['4', '15-29', 'Severely decreased'],
                ['5', '<15', 'Kidney failure']
            ]
        }),
    sections: [
        {
            title: 'Patient Data',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'ckd-epi-gender',
                    label: 'Gender',
                    options: [
                        { label: 'Male', value: 'male', checked: true },
                        { label: 'Female', value: 'female' }
                    ]
                },
                {
                    type: 'number',
                    id: 'ckd-epi-age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: 'e.g., 65',
                    validationType: 'age',
                    required: true
                }
            ]
        },
        {
            title: 'Lab Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'ckd-epi-creatinine',
                    label: 'Serum Creatinine',
                    placeholder: 'e.g., 1.2',
                    unitConfig: {
                        type: 'creatinine',
                        units: ['mg/dL', 'µmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'creatinine',
                    loincCode: LOINC_CODES.CREATININE,
                    standardUnit: 'mg/dL',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            title: 'Female',
            formulas: [
                '142 × min(Scr/0.7, 1)<sup>-0.241</sup> × max(Scr/0.7, 1)<sup>-1.200</sup> × 0.9938<sup>Age</sup> × 1.012'
            ]
        },
        {
            title: 'Male',
            formulas: [
                '142 × min(Scr/0.9, 1)<sup>-0.302</sup> × max(Scr/0.9, 1)<sup>-1.200</sup> × 0.9938<sup>Age</sup>'
            ]
        }
    ],
    reference: uiBuilder.createReference({
        citations: [
            'Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. <em>N Engl J Med</em>. 2021;385(19):1737-1749.'
        ]
    }),
    autoPopulateAge: 'ckd-epi-age',
    autoPopulateGender: 'ckd-epi-gender',
    calculate: calculateCkdEpi
};

export const ckdEpi = createUnifiedFormulaCalculator(ckdEpiConfig);
