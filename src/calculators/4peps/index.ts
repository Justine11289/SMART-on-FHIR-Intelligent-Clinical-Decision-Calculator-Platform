/**
 * 4-Level Pulmonary Embolism Clinical Probability Score (4PEPS)
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateFourPeps } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: '4peps',
    title: '4-Level Pulmonary Embolism Clinical Probability Score (4PEPS)',
    description: 'Rules out PE based on clinical criteria.',
    infoAlert:
        '<strong>Instructions:</strong> Use clinician judgment to assess which vital sign should be used for the 4PEPS score.',

    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Addition of the selected points:',
        scoringCriteria: [
            { criteria: 'Age, years', isHeader: true },
            { criteria: '<50', points: '-2' },
            { criteria: '50-64', points: '-1' },
            { criteria: '>64', points: '0' },
            { criteria: 'Sex', isHeader: true },
            { criteria: 'Female', points: '0' },
            { criteria: 'Male', points: '2' },
            { criteria: 'Chronic respiratory disease', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '-1' },
            { criteria: 'Heart rate <80', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '-1' },
            { criteria: 'Chest pain AND acute dyspnea', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '1' },
            { criteria: 'Current estrogen use', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '2' },
            { criteria: 'Prior history of VTE', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '2' },
            { criteria: 'Syncope', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '2' },
            { criteria: 'Immobility within the last four weeks*', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '2' },
            { criteria: 'O₂ saturation <95%', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '3' },
            { criteria: 'Calf pain and/or unilateral lower limb edema', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '3' },
            { criteria: 'PE is the most likely diagnosis', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '5' }
        ],
        footnotes: [
            '*Surgery, lower limb plaster cast, or bedridden >3 days for acute medical condition within the last four weeks.'
        ],
        interpretationTitle: 'FACTS & FIGURES',
        tableHeaders: ['4PEPS Score for PE', 'Clinical probability of PE', 'PE diagnosis'],
        interpretations: [
            {
                score: '<0',
                category: 'Very low CPP (<2%)',
                interpretation: 'PE can be ruled out',
                severity: 'success'
            },
            {
                score: '0-5',
                category: 'Low CPP (2-20%)',
                interpretation: 'PE can be ruled out if D-dimer level <1.0 µg/mL',
                severity: 'success'
            },
            {
                score: '6-12',
                category: 'Moderate CPP (20-65%)',
                interpretation:
                    'PE can be ruled out if D-dimer level <0.5 µg/mL OR <(age x 0.01) µg/mL',
                severity: 'warning'
            },
            {
                score: '≥13',
                category: 'High CPP (>65%)',
                interpretation: 'PE cannot be ruled out without imaging testing',
                severity: 'danger'
            }
        ]
    },

    sections: [
        {
            title: 'Age',
            icon: '👴',
            fields: [
                {
                    type: 'number',
                    id: 'fourpeps-age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: 'e.g., 70',
                    helpText: '-2 (<50), -1 (50-64), 0 (>64)'
                }
            ]
        },
        {
            title: 'Sex',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-sex',
                    label: '',
                    options: [
                        { value: '0', label: 'Female', checked: true },
                        { value: '2', label: 'Male (+2)' }
                    ]
                }
            ]
        },
        {
            title: 'Chronic Respiratory Disease',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-resp_disease',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '-1', label: 'Yes (-1)' }
                    ]
                }
            ]
        },
        {
            title: 'Heart Rate < 80 bpm',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-hr',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '-1', label: 'Yes (-1)' }
                    ]
                }
            ]
        },
        {
            title: 'Chest pain AND acute dyspnea',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-chest_pain',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                }
            ]
        },
        {
            title: 'Current Estrogen Use',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-estrogen',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                }
            ]
        },
        {
            title: 'Prior History of VTE',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-vte',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                }
            ]
        },
        {
            title: 'Syncope',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-syncope',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                }
            ]
        },
        {
            title: 'Immobility (last 4 weeks)',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-immobility',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                }
            ]
        },
        {
            title: 'O₂ Saturation < 95%',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-o2_sat',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '3', label: 'Yes (+3)' }
                    ]
                }
            ]
        },
        {
            title: 'Calf pain / Unilateral Edema',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-calf_pain',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '3', label: 'Yes (+3)' }
                    ]
                }
            ]
        },
        {
            title: 'PE is the most likely diagnosis',
            fields: [
                {
                    type: 'radio',
                    id: '4peps-pe_likely',
                    label: '',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '5', label: 'Yes (+5)' }
                    ]
                }
            ]
        }
    ],

    formulas: [
        {
            label: 'Reference',
            formula:
                'Roy, P. M., et al. (2021). Derivation and Validation of a 4-Level Clinical Pretest Probability Score for Suspected Pulmonary Embolism to Safely Decrease Imaging Testing. JAMA Cardiology.'
        }
    ],

    calculate: calculateFourPeps,

    customResultRenderer: results => {
        // Find recommendation payload if exists
        const recommendationItem = results.find(r => r.label === 'Recommendation');
        const alertHtml = recommendationItem?.alertPayload
            ? uiBuilder.createAlert(recommendationItem.alertPayload)
            : '';

        const resultItems = results
            .filter(r => r.label !== 'Recommendation')
            .map(r =>
                uiBuilder.createResultItem({
                    label: r.label,
                    value: r.value.toString(),
                    unit: r.unit,
                    interpretation: r.interpretation,
                    alertClass: r.alertClass ? `ui-alert-${r.alertClass}` : ''
                })
            )
            .join('');

        return resultItems + alertHtml;
    },

    customInitialize: async (client, patient, container, calculate) => {
        const setValue = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement;
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        const setRadio = (name: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement | null;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        try {
            // Age handles by autoPopulateAge via helper, but logic was mixed here.
            // We can use standard fhirDataService calls.
            const age = fhirDataService.getPatientAge();
            if (age !== null) {
                setValue('fourpeps-age', age.toString());
            }

            const gender = fhirDataService.getPatientGender();
            if (gender) {
                setRadio('4peps-sex', gender === 'male' ? '2' : '0');
            }

            if (client) {
                // COPD (SNOMED: 13645005) and ICD-10 J44.9
                const chronicRespCodes = [SNOMED_CODES.COPD, 'J44.9'];

                // History of VTE (SNOMED: 451574005) and ICD-10 I82.90
                const vteCodes = [SNOMED_CODES.HISTORY_OF_VTE, 'I82.90'];

                // Fetch conditions and observations
                const [hasCOPD, hasVTE, hrResult, o2Result] = await Promise.all([
                    fhirDataService.hasCondition(chronicRespCodes).catch(() => false),
                    fhirDataService.hasCondition(vteCodes).catch(() => false),
                    fhirDataService
                        .getObservation(LOINC_CODES.HEART_RATE, {
                            trackStaleness: true,
                            stalenessLabel: 'Heart Rate'
                        })
                        .catch(() => ({ value: null })),
                    fhirDataService
                        .getObservation(LOINC_CODES.OXYGEN_SATURATION, {
                            trackStaleness: true,
                            stalenessLabel: 'O2 Saturation'
                        })
                        .catch(() => ({ value: null }))
                ]);

                if (hasCOPD) {
                    setRadio('4peps-resp_disease', '-1');
                }
                if (hasVTE) {
                    setRadio('4peps-vte', '2');
                }

                if (hrResult.value !== null && hrResult.value < 80) {
                    setRadio('4peps-hr', '-1');
                }

                if (o2Result.value !== null && o2Result.value < 95) {
                    setRadio('4peps-o2_sat', '3');
                }
            }
        } catch (error) {
            console.error('Error auto-populating 4PEPS:', error);
        } finally {
            calculate();
        }
    }
};

export const fourPeps = createUnifiedFormulaCalculator(config);
