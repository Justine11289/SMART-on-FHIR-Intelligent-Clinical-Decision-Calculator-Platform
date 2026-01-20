/**
 * SCORE2-Diabetes Risk Score
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateScore2Diabetes } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'score2-diabetes',
    title: 'SCORE2-Diabetes Risk Score',
    description: 'Predicts 10-year CVD risk in patients with type 2 diabetes (age 40-69).',

    infoAlert:
        '<strong>Instructions:</strong> Select risk region and enter patient details. Validated for European populations aged 40-69.',

    autoPopulateAge: 'score2d-age',
    autoPopulateGender: 'score2d-sex',

    sections: [
        {
            title: 'Geographic Risk Region',
            icon: '🌍',
            fields: [
                {
                    type: 'radio',
                    id: 'score2d-region',
                    label: 'Select Region',
                    options: [
                        { value: 'low', label: 'Low Risk (e.g., France, Spain, Italy)' },
                        { value: 'moderate', label: 'Moderate Risk (e.g., Germany, UK)' },
                        { value: 'high', label: 'High Risk (e.g., Poland, Hungary)' },
                        { value: 'very_high', label: 'Very High Risk (e.g., Romania, Turkey)' }
                    ]
                }
            ]
        },
        {
            title: 'Demographics & History',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'score2d-sex',
                    label: 'Gender',
                    options: [
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' }
                    ]
                },
                {
                    type: 'number',
                    id: 'score2d-age',
                    label: 'Age',
                    unit: 'years',
                    min: 40,
                    max: 69,
                    placeholder: '40-69',
                    validationType: 'age'
                },
                {
                    type: 'radio',
                    id: 'score2d-smoking',
                    label: 'Smoking Status',
                    snomedCode: SNOMED_CODES.SMOKING,
                    options: [
                        { value: '0', label: 'Non-smoker', checked: true },
                        { value: '1', label: 'Current Smoker' }
                    ]
                }
            ]
        },
        {
            title: 'Clinical & Lab Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'score2d-sbp',
                    label: 'Systolic BP',
                    unit: 'mmHg',
                    placeholder: 'e.g. 130',
                    loincCode: LOINC_CODES.SYSTOLIC_BP,
                    validationType: 'systolicBP'
                },
                {
                    type: 'number',
                    id: 'score2d-tchol',
                    label: 'Total Cholesterol',
                    unit: 'mg/dL',
                    placeholder: 'e.g. 200',
                    loincCode: LOINC_CODES.CHOLESTEROL_TOTAL,
                    validationType: 'cholesterol'
                },
                {
                    type: 'number',
                    id: 'score2d-hdl',
                    label: 'HDL Cholesterol',
                    unit: 'mg/dL',
                    placeholder: 'e.g. 50',
                    loincCode: LOINC_CODES.HDL,
                    validationType: 'cholesterol'
                },
                {
                    type: 'number',
                    id: 'score2d-hba1c',
                    label: 'HbA1c',
                    unit: '%',
                    step: 0.1,
                    placeholder: 'e.g. 7.0',
                    loincCode: LOINC_CODES.HBA1C,
                    validationType: 'hba1c'
                },
                {
                    type: 'number',
                    id: 'score2d-egfr',
                    label: 'eGFR',
                    unit: 'mL/min',
                    placeholder: 'e.g. 90',
                    loincCode: LOINC_CODES.EGFR,
                    validationType: 'egfr'
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'Risk Calculation',
        type: 'list',
        calculationNote: 'Cox proportional hazards model with region-specific baseline survival',
        footnotes: [
            'Uses European Heart Journal validated coefficients',
            'Separate models for male and female patients',
            'Risk = 1 - S₀^exp(X - mean_X)'
        ]
    },

    calculate: calculateScore2Diabetes,

    customResultRenderer: results => {
        return results
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
    },

    customInitialize: async (client, patient, container, calculate) => {
        fhirDataService.initialize(client, patient, container);

        // Age and Gender are handled by autoPopulateAge/autoPopulateGender config
        // Numeric fields with loincCode are auto-populated by the framework
        // Only need custom logic for BP panel handling (if needed)

        if (!client) return;

        try {
            // BP panel may need special handling if using getBloodPressure
            const bpResult = await fhirDataService.getBloodPressure({
                trackStaleness: true
            });
            if (bpResult.systolic !== null) {
                const input = container.querySelector('#score2d-sbp') as HTMLInputElement;
                if (input && !input.value) {
                    input.value = bpResult.systolic.toFixed(0);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }

            calculate();
        } catch (e) {
            console.warn('FHIR data fetch failed:', e);
        }
    }
};

export const score2Diabetes = createUnifiedFormulaCalculator(config);
