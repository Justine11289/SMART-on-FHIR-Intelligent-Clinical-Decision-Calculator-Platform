import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { meldNaCalculation, MeldNaBreakdown } from './calculation.js';

export const meldNa = createUnifiedFormulaCalculator({
    id: 'meld-na',
    title: 'MELD-Na (UNOS/OPTN)',
    description: 'Quantifies end-stage liver disease for transplant planning with sodium.',
    infoAlert:
        'MELD-Na has superior predictive accuracy compared to MELD alone for 90-day mortality. Enter laboratory values below for automatic calculation.',
    sections: [
        {
            title: 'Laboratory Values',
            icon: '🧪',
            fields: [
                {
                    id: 'bili',
                    label: 'Bilirubin (Total)',
                    type: 'number',
                    loincCode: LOINC_CODES.BILIRUBIN_TOTAL,
                    unit: 'mg/dL',
                    unitToggle: { type: 'bilirubin', units: ['mg/dL', 'µmol/L'], default: 'mg/dL' },
                    validationType: 'bilirubin',
                    step: 0.1,
                    required: true
                },
                {
                    id: 'inr',
                    label: 'INR',
                    type: 'number',
                    loincCode: LOINC_CODES.INR_COAG,
                    placeholder: 'e.g., 1.5',
                    validationType: 'inr',
                    step: 0.01,
                    required: true
                },
                {
                    id: 'creat',
                    label: 'Creatinine',
                    type: 'number',
                    loincCode: LOINC_CODES.CREATININE,
                    unit: 'mg/dL',
                    unitToggle: {
                        type: 'creatinine',
                        units: ['mg/dL', 'µmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'creatinine',
                    step: 0.1,
                    required: true
                },
                {
                    id: 'sodium',
                    label: 'Sodium',
                    type: 'number',
                    loincCode: LOINC_CODES.SODIUM,
                    unit: 'mEq/L',
                    unitToggle: { type: 'sodium', units: ['mEq/L', 'mmol/L'], default: 'mEq/L' },
                    validationType: 'sodium',
                    step: 1,
                    placeholder: '100 - 155',
                    required: true
                },
                {
                    type: 'radio',
                    id: 'dialysis',
                    label: 'Patient on dialysis twice in the last week',
                    options: [
                        { value: 'no', label: 'No', checked: true },
                        { value: 'yes', label: 'Yes' }
                    ]
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'MELD Score',
            formula: '0.957 × ln(Creat) + 0.378 × ln(Bili) + 1.120 × ln(INR) + 0.643'
        },
        {
            label: 'MELD-Na Score (if MELD > 11)',
            formula: 'MELD + 1.32 × (137 − Na) − [0.033 × MELD × (137 − Na)]'
        },
        {
            label: 'Constraints',
            formula: uiBuilder.createList({
                items: [
                    'Minimum lab values: 1.0 (if actual value is lower)',
                    'Maximum Creatinine: 4.0 (or if on dialysis ≥2x/week)',
                    'Sodium capped: 125-137 mEq/L',
                    'Final score range: 6-40'
                ],
                type: 'ul',
                className: 'info-list text-sm'
            })
        }
    ],
    calculate: meldNaCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        let breakdownHtml = '';
        if (res.alertPayload && res.alertPayload.breakdown) {
            const bd = res.alertPayload.breakdown as MeldNaBreakdown;
            breakdownHtml = `
            <div class="mt-15 text-sm text-muted p-10">
                <strong>Calculation Breakdown:</strong><br>
                • Original MELD: ${bd.originalMeld.toFixed(1)}<br>
                • Adjusted Bilirubin: ${bd.adjustedBili.toFixed(1)} mg/dL<br>
                • Adjusted INR: ${bd.adjustedInr.toFixed(2)}<br>
                • Adjusted Creatinine: ${bd.adjustedCreat.toFixed(1)} mg/dL ${bd.cappedForDialysis ? '(capped for dialysis)' : ''}
            </div>`;
        }

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value,
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: res.alertClass ? `ui-alert-${res.alertClass}` : ''
            })}
            
            ${breakdownHtml}

            ${uiBuilder.createAlert({
                type: 'warning',
                message:
                    '<strong>Clinical Note:</strong> Used for liver transplant priority allocation. Scores should be updated regularly as clinical status changes.'
            })}
        `;
    }
});
