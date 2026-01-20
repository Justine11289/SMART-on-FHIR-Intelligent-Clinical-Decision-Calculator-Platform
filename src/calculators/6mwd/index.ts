import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculate6MWD } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const sixMwdConfig: FormulaCalculatorConfig = {
    id: '6mwd',
    title: '6 Minute Walk Distance',
    description:
        'Calculates reference values for distance walked, as a measure of functional status.',
    sections: [
        {
            title: 'Patient Information',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'mwd6-gender',
                    label: 'Sex',
                    options: [
                        { value: 'male', label: 'Male', checked: true },
                        { value: 'female', label: 'Female' }
                    ]
                },
                {
                    type: 'number',
                    id: 'mwd6-age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: 'e.g., 62',
                    validationType: 'age',
                    required: true
                },
                {
                    type: 'number',
                    id: 'mwd6-height',
                    label: 'Height',
                    placeholder: 'e.g., 175',
                    unitConfig: { type: 'height', units: ['cm', 'in'], default: 'cm' },
                    validationType: 'height',
                    loincCode: LOINC_CODES.HEIGHT,
                    standardUnit: 'cm',
                    required: true
                },
                {
                    type: 'number',
                    id: 'mwd6-weight',
                    label: 'Weight',
                    placeholder: 'e.g., 88',
                    unitConfig: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    standardUnit: 'kg',
                    required: true
                }
            ]
        },
        {
            title: 'Test Result',
            icon: '🚶',
            fields: [
                {
                    type: 'number',
                    id: 'mwd6-distance',
                    label: 'Distance Walked (optional)',
                    unit: 'm',
                    placeholder: 'e.g., 400',
                    helpText: 'Enter actual distance to see % of expected',
                    required: false
                }
            ]
        }
    ],
    formulas: [
        {
            title: 'Men',
            formulas: [
                '6MWD = (7.57 × height<sub>cm</sub>) - (5.02 × age) - (1.76 × weight<sub>kg</sub>) - 309 m',
                'Alternate: 6MWD = 1,140 m - (5.61 × BMI) - (6.94 × age)'
            ]
        },
        {
            title: 'Women',
            formulas: [
                '6MWD = (2.11 × height<sub>cm</sub>) - (2.29 × weight<sub>kg</sub>) - (5.78 × age) + 667 m',
                'Alternate: 6MWD = 1,017 m - (6.24 × BMI) - (5.83 × age)'
            ]
        },
        {
            title: 'Lower Limit of Normal',
            formulas: ['LLN = Expected Distance - 153 m'],
            notes: 'When using either equation, subtract 153 m for the LLN'
        },
        {
            label: 'Abbreviations',
            content:
                'BMI = body mass index (kg/m²); 6MWD = 6-min walk distance; LLN = lower limit of normal'
        }
    ],
    reference: uiBuilder.createReference({
        citations: [
            'Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. <em>Am J Respir Crit Care Med</em>. 1998;158(5 Pt 1):1384-7.'
        ]
    }),
    autoPopulateAge: 'mwd6-age',
    autoPopulateGender: 'mwd6-gender',
    calculate: calculate6MWD
};

export const sixMwd = createUnifiedFormulaCalculator(sixMwdConfig);
