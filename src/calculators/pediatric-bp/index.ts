/**
 * Pediatric Blood Pressure Calculator
 *
 * Evaluates blood pressure in children and adolescents based on AAP 2017 guidelines.
 *
 * Reference: Flynn JT, et al. Clinical Practice Guideline for Screening and Management
 * of High Blood Pressure in Children and Adolescents. Pediatrics. 2017;140(3):e20171904.
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { uiBuilder } from '../../ui-builder.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { calculatePediatricBP } from './calculation.js';

export const pediatricBP = createUnifiedFormulaCalculator({
    id: 'pediatric-bp',
    title: 'Pediatric Blood Pressure Percentile',
    description:
        'Evaluates blood pressure in children and adolescents (1-18 years) based on AAP 2017 guidelines.',

    infoAlert: `
        <strong>Important Notes:</strong>
        ${uiBuilder.createList({
            items: [
                'For children 1-12 years: Uses age, sex, and height-based percentiles',
                'For adolescents ≥13 years: Uses static thresholds (aligned with adult guidelines)',
                'Do not use this calculator for patients with hypotension',
                'Decimal age is acceptable (e.g., 5 years 6 months = 5.5)'
            ]
        })}
    `,

    autoPopulateAge: 'peds-bp-age',
    autoPopulateGender: 'peds-bp-sex',

    sections: [
        {
            title: 'Patient Information',
            icon: '👶',
            fields: [
                {
                    type: 'number',
                    id: 'peds-bp-age',
                    label: 'Age',
                    helpText:
                        'Decimal values recommended (e.g., for a child who is 5 years and 6 months, enter 5.5)',
                    unit: 'years',
                    placeholder: 'e.g., 5.5',
                    min: 1,
                    max: 18,
                    step: 0.1,
                    validationType: 'age',
                    required: true
                },
                {
                    type: 'radio',
                    name: 'peds-bp-sex',
                    label: 'Sex',
                    options: [
                        { value: 'male', label: 'Male', checked: true },
                        { value: 'female', label: 'Female' }
                    ]
                },
                {
                    type: 'number',
                    id: 'peds-bp-height',
                    label: 'Height',
                    helpText: 'Optional - used for more precise percentile calculation',
                    unit: 'cm',
                    loincCode: LOINC_CODES.HEIGHT,
                    placeholder: 'e.g., 110',
                    validationType: 'height',
                    min: 50,
                    max: 200
                }
            ]
        },
        {
            title: 'Blood Pressure',
            icon: '💓',
            fields: [
                {
                    type: 'number',
                    id: 'peds-bp-sbp',
                    label: 'Systolic BP',
                    helpText:
                        'Normal values are age-dependent; do not use this calculator in patients with hypotension',
                    unit: 'mmHg',
                    loincCode: LOINC_CODES.SYSTOLIC_BP,
                    placeholder: 'e.g., 100',
                    min: 50,
                    max: 200,
                    validationType: 'systolicBP',
                    required: true
                },
                {
                    type: 'number',
                    id: 'peds-bp-dbp',
                    label: 'Diastolic BP',
                    helpText:
                        'Normal values are age-dependent; do not use this calculator in patients with hypotension',
                    unit: 'mmHg',
                    loincCode: LOINC_CODES.DIASTOLIC_BP,
                    placeholder: 'e.g., 60',
                    min: 30,
                    max: 130,
                    validationType: 'diastolicBP',
                    required: true
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'BP Classification (AAP 2017)',
        calculationNote:
            'Classification is based on percentiles for ages 1-12, and static thresholds for ≥13 years.',
        scoringCriteria: [
            { criteria: 'Ages 1-12 Years', isHeader: true },
            { criteria: 'Normal BP', points: 'SBP and DBP <90th percentile' },
            {
                criteria: 'Elevated BP',
                points: 'SBP or DBP ≥90th to <95th percentile, or 120/80 to <95th'
            },
            {
                criteria: 'Stage 1 HTN',
                points: 'SBP or DBP ≥95th to <95th+12 mmHg, or 130-139/80-89'
            },
            { criteria: 'Stage 2 HTN', points: 'SBP or DBP ≥95th+12 mmHg, or ≥140/90' },

            { criteria: 'Ages ≥13 Years', isHeader: true },
            { criteria: 'Normal BP', points: '<120/80 mmHg' },
            { criteria: 'Elevated BP', points: '120-129/<80 mmHg' },
            { criteria: 'Stage 1 HTN', points: '130-139/80-89 mmHg' },
            { criteria: 'Stage 2 HTN', points: '≥140/90 mmHg' }
        ]
    },

    resultTitle: 'BP Classification',

    complexCalculate: calculatePediatricBP,

    reference: `
        ${uiBuilder.createSection({
            title: 'Recommendations by Classification',
            icon: '📋',
            content: uiBuilder.createTable({
                headers: ['Classification', 'Action'],
                rows: [
                    ['Normal', 'Recheck at next routine well-child visit'],
                    ['Elevated', 'Lifestyle changes; Recheck in 6 months'],
                    [
                        'Stage 1 HTN',
                        'Lifestyle changes; Recheck in 1-2 weeks; If persistent, refer'
                    ],
                    [
                        'Stage 2 HTN',
                        'Refer to specialist within 1 week (or immediately if symptomatic)'
                    ]
                ]
            })
        })}

        ${uiBuilder.createSection({
            title: 'Reference',
            icon: '📚',
            content: `
                <p>Flynn JT, et al. Clinical Practice Guideline for Screening and Management of High Blood Pressure 
                in Children and Adolescents. <em>Pediatrics</em>. 2017;140(3):e20171904.</p>
                <p>Rosner B, et al. Blood Pressure Percentiles in Normal-Weight Children. 
                <em>Am J Epidemiol</em>. 2008;167(6):653-666.</p>
            `
        })}
    `
});
