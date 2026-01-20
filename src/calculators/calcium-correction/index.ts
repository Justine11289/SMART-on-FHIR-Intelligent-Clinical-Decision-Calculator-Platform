import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calciumCorrectionCalculation } from './calculation.js';

export const calciumCorrection = createUnifiedFormulaCalculator({
    id: 'calcium-correction',
    title: 'Calcium Correction for Albumin',
    description: 'Calculates corrected calcium for patients with hypoalbuminemia.',
    infoAlert:
        '<h4>Interpretation:</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Normal Range:</strong> 8.5 - 10.5 mg/dL',
                '<strong>Hypocalcemia:</strong> < 8.5 mg/dL',
                '<strong>Hypercalcemia:</strong> > 10.5 mg/dL'
            ],
            className: 'info-list'
        }) +
        '<p class="mt-10"><strong>Note:</strong> Used when serum albumin is low (< 4.0 g/dL).</p>',
    sections: [
        {
            title: 'Lab Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'ca-total',
                    label: 'Total Calcium',
                    placeholder: 'e.g., 8.0',
                    unitToggle: {
                        type: 'calcium',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'calcium',
                    loincCode: LOINC_CODES.CALCIUM,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'ca-albumin',
                    label: 'Albumin',
                    placeholder: 'e.g., 3.0',
                    unitToggle: {
                        type: 'albumin',
                        units: ['g/dL', 'g/L'],
                        default: 'g/dL'
                    },
                    validationType: 'albumin',
                    loincCode: LOINC_CODES.ALBUMIN,
                    standardUnit: 'g/dL',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Corrected Calcium',
            formula: 'Total Calcium + 0.8 × (4.0 - Albumin)',
            notes: 'Normal albumin assumed to be 4.0 g/dL.'
        }
    ],
    calculate: calciumCorrectionCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as { mmolValue: number; alertMsg: string };
        const mmolValue = payload.mmolValue;
        const alertMsg = payload.alertMsg;
        const alertClass = res.alertClass || 'info';

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value,
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: `ui-alert-${alertClass}`
            })}
            <div class="text-center mt-5 text-muted">
                (${mmolValue} mmol/L)
            </div>
            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: alertMsg
            })}
            ${uiBuilder.createAlert({
                type: 'warning',
                message:
                    '<strong>Clinical Note:</strong> This correction is an estimation. For critically ill patients or precise assessment, measurement of ionized calcium is preferred.'
            })}
        `;
    }
});
