import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { serumAnionGapCalculation } from './calculation.js';

export const serumAnionGap = createUnifiedFormulaCalculator({
    id: 'serum-anion-gap',
    title: 'Serum Anion Gap',
    description: 'Evaluates states of metabolic acidosis.',
    infoAlert:
        '<h4>Interpretation:</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Normal Range:</strong> 6-12 mEq/L',
                '<strong>High (>12):</strong> High Anion Gap Metabolic Acidosis (MUDPILES)',
                '<strong>Low (<6):</strong> Uncommon, possible lab error or hypoalbuminemia'
            ],
            className: 'info-list'
        }) +
        '<p class="mt-10"><strong>Note:</strong> For every 1 g/dL decrease in albumin below 4 g/dL, add 2.5 mEq/L to the anion gap (corrected gap).</p>',
    sections: [
        {
            title: 'Electrolytes',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'sag-na',
                    label: 'Sodium (Na⁺)',
                    placeholder: 'e.g., 140',
                    unitToggle: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'sodium',
                    loincCode: LOINC_CODES.SODIUM,
                    standardUnit: 'mEq/L',
                    required: true
                },
                {
                    type: 'number',
                    id: 'sag-cl',
                    label: 'Chloride (Cl⁻)',
                    placeholder: 'e.g., 100',
                    unitToggle: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'chloride',
                    loincCode: LOINC_CODES.CHLORIDE,
                    standardUnit: 'mEq/L',
                    required: true
                },
                {
                    type: 'number',
                    id: 'sag-hco3',
                    label: 'Bicarbonate (HCO₃⁻)',
                    placeholder: 'e.g., 24',
                    unitToggle: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'bicarbonate',
                    loincCode: LOINC_CODES.BICARBONATE,
                    standardUnit: 'mEq/L',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Formulas',
            formula:
                '<ol class="info-list" style="list-style-type: decimal; padding-left: 20px;"><li><strong>Anion Gap</strong> = Na − (Cl + HCO3⁻)</li></ol>'
        }
    ],
    calculate: serumAnionGapCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as { alertMsg: string };
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
            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: alertMsg
            })}
        `;
    }
});
