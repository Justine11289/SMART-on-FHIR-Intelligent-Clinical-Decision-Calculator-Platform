import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { phenytoinCorrectionCalculation } from './calculation.js';

export const phenytoinCorrection = createUnifiedFormulaCalculator({
    id: 'phenytoin-correction',
    title: 'Phenytoin (Dilantin) Correction for Albumin/Renal Failure',
    description: 'Corrects serum phenytoin level for renal failure and/or hypoalbuminemia.',
    infoAlert:
        '<h4>Therapeutic Range:</h4>' +
        uiBuilder.createList({
            items: ['10-20 mcg/mL', '>20 mcg/mL: Toxic', '<10 mcg/mL: Subtherapeutic'],
            className: 'info-list'
        }),
    sections: [
        {
            title: 'Lab Values & Clinical Status',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'pheny-total',
                    label: 'Total Phenytoin Level',
                    placeholder: 'e.g., 8.0',
                    unitToggle: {
                        type: 'phenytoin',
                        units: ['mcg/mL', 'µmol/L', 'mg/L'],
                        default: 'mcg/mL'
                    },
                    validationType: 'phenytoin',
                    loincCode: '4038-8',
                    standardUnit: 'mcg/mL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'pheny-albumin',
                    label: 'Serum Albumin',
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
                },
                {
                    type: 'radio',
                    id: 'pheny-renal',
                    label: 'Renal Status (CrCl < 10 mL/min)',
                    options: [
                        { value: 'no', label: 'No (Normal Function)', checked: true },
                        { value: 'yes', label: 'Yes (Renal Failure)' }
                    ],
                    helpText: 'Select Yes if CrCl < 10 mL/min, ESRD, or on dialysis.'
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Corrected Level',
            formula:
                '<span class="formula-fraction"><span class="numerator">Total Phenytoin</span><span class="denominator">((1 − K) × Albumin / 4.4) + K</span></span>',
            notes: 'K = 0.1 (Normal) or 0.2 (Renal Failure)'
        }
    ],
    calculate: phenytoinCorrectionCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as { alertMsg: string; measuredTotal: number };
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
            ${uiBuilder.createResultItem({
                label: 'Measured Total',
                value: payload.measuredTotal.toFixed(1),
                unit: 'mcg/mL'
            })}
            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: alertMsg
            })}
        `;
    }
});
