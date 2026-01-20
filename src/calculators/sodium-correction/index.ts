import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateSodiumCorrection } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const sodiumCorrectionConfig: FormulaCalculatorConfig = {
    id: 'sodium-correction',
    title: 'Sodium Correction for Hyperglycemia',
    description: 'Calculates the corrected sodium level in patients with hyperglycemia.',
    infoAlert: `
        <h4>Correction Factor Selection:</h4>
        ${uiBuilder.createList({
            items: [
                '<strong>1.6:</strong> Standard factor (Hillier). For every 100 mg/dL glucose above 100.',
                '<strong>2.4:</strong> Suggested by Katz for glucose > 400 mg/dL.'
            ],
            className: 'info-list'
        })}
    `,
    sections: [
        {
            title: 'Laboratory Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'measured-sodium',
                    label: 'Measured Sodium',
                    placeholder: '135',
                    unitToggle: {
                        type: 'sodium',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    standardUnit: 'mEq/L',
                    validationType: 'sodium',
                    loincCode: LOINC_CODES.SODIUM,
                    required: true
                },
                {
                    type: 'number',
                    id: 'glucose',
                    label: 'Serum Glucose',
                    placeholder: '400',
                    unitToggle: {
                        type: 'glucose',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    standardUnit: 'mg/dL',
                    validationType: 'glucose',
                    loincCode: LOINC_CODES.GLUCOSE,
                    required: true
                }
            ]
        },
        {
            title: 'Calculation Settings',
            icon: '⚙️',
            fields: [
                {
                    type: 'radio',
                    id: 'correction-factor',
                    label: 'Correction Factor',
                    options: [
                        { value: '1.6', label: '1.6 (Standard/Hillier)', checked: true },
                        { value: '2.4', label: '2.4 (Katz, for severe hyperglycemia)' }
                    ],
                    helpText:
                        'Katz et al. found a factor of 2.4 was more accurate when glucose > 400 mg/dL.'
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Corrected Na',
            formula: 'Measured Na + Factor × [(Glucose - 100) / 100]'
        }
    ],
    calculate: calculateSodiumCorrection,
    customResultRenderer: results => {
        const mainRes = results[0];
        const amountRes = results[1];
        if (!mainRes || !amountRes) return '';

        // Safe extraction of payload
        const payload = mainRes.alertPayload as { glucose: number; factor: number } | undefined;
        let alertHTML = '';

        if (payload && payload.factor === 1.6 && payload.glucose > 400) {
            alertHTML = uiBuilder.createAlert({
                type: 'warning',
                message:
                    '<strong>Clinical Note:</strong> Glucose > 400 mg/dL. Consider using a correction factor of 2.4 (Katz et al).'
            });
        }

        return `
            ${uiBuilder.createResultItem({
                label: mainRes.label,
                value: mainRes.value.toString(),
                unit: mainRes.unit,
                interpretation: mainRes.interpretation,
                alertClass: `ui-alert-${mainRes.alertClass}`
            })}

            ${uiBuilder.createResultItem({
                label: amountRes.label,
                value: amountRes.value.toString(),
                unit: amountRes.unit
            })}

            ${alertHTML}
        `;
    }
};

export const sodiumCorrection = createUnifiedFormulaCalculator(sodiumCorrectionConfig);
