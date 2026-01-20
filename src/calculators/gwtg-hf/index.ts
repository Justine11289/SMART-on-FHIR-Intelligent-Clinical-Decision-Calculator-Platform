/**
 * GWTG-Heart Failure Risk Score
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateGwtgHf } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'gwtg-hf',
    title: 'GWTG-Heart Failure Risk Score',
    description: 'Predicts in-hospital all-cause heart failure mortality.',

    infoAlert:
        '<strong>IMPORTANT:</strong> This calculator includes inputs based on race, which may or may not provide better estimates.',

    autoPopulateAge: 'gwtg-age',

    sections: [
        {
            title: 'Clinical Parameters',
            fields: [
                {
                    type: 'number',
                    id: 'gwtg-sbp',
                    label: 'Systolic BP',
                    unit: 'mmHg',
                    placeholder: '120',
                    validationType: 'systolicBP',
                    loincCode: LOINC_CODES.SYSTOLIC_BP
                },
                {
                    type: 'number',
                    id: 'gwtg-bun',
                    label: 'BUN',
                    unit: 'mg/dL',
                    placeholder: '30',
                    validationType: 'bun',
                    loincCode: LOINC_CODES.BUN
                },
                {
                    type: 'number',
                    id: 'gwtg-sodium',
                    label: 'Sodium',
                    unit: 'mEq/L',
                    placeholder: '140',
                    validationType: 'sodium',
                    loincCode: LOINC_CODES.SODIUM
                },
                {
                    type: 'number',
                    id: 'gwtg-age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: '65',
                    validationType: 'age'
                },
                {
                    type: 'number',
                    id: 'gwtg-hr',
                    label: 'Heart Rate',
                    unit: 'bpm',
                    placeholder: '80',
                    validationType: 'heartRate',
                    loincCode: LOINC_CODES.HEART_RATE
                }
            ]
        },
        {
            title: 'Risk Factors',
            fields: [
                {
                    type: 'radio',
                    id: 'copd',
                    label: 'COPD History',
                    options: [
                        { value: '0', label: 'No (0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ],
                    snomedCode: SNOMED_CODES.COPD
                },
                {
                    type: 'radio',
                    id: 'race',
                    label: 'Black Race',
                    helpText:
                        'Race may/may not provide better estimates of in-hospital mortality; optional',
                    options: [
                        { value: '0', label: 'No (0)', checked: true },
                        { value: '-3', label: 'Yes (-3)' }
                    ]
                }
            ]
        }
    ],

    resultTitle: 'GWTG-HF Score Result',

    formulaSection: {
        show: true,
        title: 'FACTS & FIGURES',
        calculationNote: 'Score interpretation:',
        tableHeaders: ['Total Score', 'Predicted Mortality'],
        scoringCriteria: [
            { criteria: '0-33', points: '<1%' },
            { criteria: '34-50', points: '1-5%' },
            { criteria: '51-57', points: '5-10%' },
            { criteria: '58-61', points: '10-15%' },
            { criteria: '62-65', points: '15-20%' },
            { criteria: '66-70', points: '20-30%' },
            { criteria: '71-74', points: '30-40%' },
            { criteria: '75-78', points: '40-50%' },
            { criteria: '≥79', points: '>50%' }
        ]
    },

    calculate: calculateGwtgHf,

    customInitialize: async (client, patient, container, calculate) => {
        // Initialize FHIRDataService
        fhirDataService.initialize(client, patient, container);

        const setValue = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement;
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        const setRadio = (id: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${id}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // Age is handled by autoPopulateAge

        if (client) {
            try {
                // Fetch all observations in parallel
                const [bpResult, bunResult, sodiumResult, hrResult] = await Promise.all([
                    fhirDataService
                        .getBloodPressure({ trackStaleness: true })
                        .catch(() => ({ systolic: null })),
                    fhirDataService
                        .getObservation(LOINC_CODES.BUN, {
                            trackStaleness: true,
                            stalenessLabel: 'BUN',
                            targetUnit: 'mg/dL'
                        })
                        .catch(() => ({ value: null })),
                    fhirDataService
                        .getObservation(LOINC_CODES.SODIUM, {
                            trackStaleness: true,
                            stalenessLabel: 'Sodium',
                            targetUnit: 'mEq/L'
                        })
                        .catch(() => ({ value: null })),
                    fhirDataService
                        .getObservation(LOINC_CODES.HEART_RATE, {
                            trackStaleness: true,
                            stalenessLabel: 'Heart Rate'
                        })
                        .catch(() => ({ value: null }))
                ]);

                if (bpResult.systolic !== null) {
                    setValue('gwtg-sbp', bpResult.systolic.toFixed(0));
                }

                if (bunResult.value !== null) {
                    setValue('gwtg-bun', bunResult.value.toFixed(0));
                }

                if (sodiumResult.value !== null) {
                    setValue('gwtg-sodium', sodiumResult.value.toFixed(0));
                }

                if (hrResult.value !== null) {
                    setValue('gwtg-hr', hrResult.value.toFixed(0));
                }

                // Check for COPD
                const hasCopd = await fhirDataService.hasCondition([SNOMED_CODES.COPD]);
                if (hasCopd) {
                    setRadio('copd', '2');
                }
            } catch (e) {
                console.warn('Error fetching FHIR data for GWTG-HF', e);
            }
        }

        calculate();
    }
};

export const gwtgHf = createUnifiedFormulaCalculator(config);
