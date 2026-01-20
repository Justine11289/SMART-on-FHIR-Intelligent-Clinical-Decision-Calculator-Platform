import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { serumOsmolalityCalculation, SerumOsmoBreakdown } from './calculation.js';

export const serumOsmolality = createUnifiedFormulaCalculator({
    id: 'serum-osmolality',
    title: 'Serum Osmolality/Osmolarity',
    description:
        'Calculates expected serum osmolarity, for comparison to measured osmolality to detect unmeasured compounds in the serum.',
    infoAlert:
        '<h4>Normal Range:</h4><p>275-295 mOsm/kg</p>' +
        '<p class="mt-10"><strong>Osmolar Gap:</strong> Measured Osmolality - Calculated Osmolality</p>' +
        uiBuilder.createAlert({
            type: 'info',
            message: 'Gap > 10 mOsm/kg suggests unmeasured osmoles (e.g., toxic alcohols, ketones).'
        }),
    sections: [
        {
            title: 'Lab Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'osmo-na',
                    label: 'Sodium (Na)',
                    placeholder: 'e.g., 140',
                    unitToggle: {
                        type: 'sodium',
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
                    id: 'osmo-glucose',
                    label: 'Glucose',
                    placeholder: 'e.g., 100',
                    unitToggle: {
                        type: 'glucose',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'glucose',
                    loincCode: LOINC_CODES.GLUCOSE,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'osmo-bun',
                    label: 'BUN',
                    placeholder: 'e.g., 15',
                    unitToggle: {
                        type: 'bun',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'bun',
                    loincCode: LOINC_CODES.BUN,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'osmo-ethanol',
                    label: 'Ethanol (Optional)',
                    placeholder: 'e.g., 0',
                    unit: 'mg/dL',
                    validationType: 'ethanol',
                    helpText: 'If known, improves accuracy in suspected ingestion.',
                    standardUnit: 'mg/dL'
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Osmolality',
            formula: '2 × Na + (Glucose / 18) + (BUN / 2.8) + (Ethanol / 4.6)',
            notes: 'Measurements in mg/dL (except Na).'
        }
    ],
    calculate: serumOsmolalityCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as { breakdown: SerumOsmoBreakdown; alertMsg: string };
        const breakdown = payload.breakdown;
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
                type: alertClass as 'success' | 'warning' | 'info',
                message: alertMsg
            })}
            ${uiBuilder.createSection({
                title: 'Calculation Breakdown',
                content: `
                    <div class="text-sm text-muted">
                        <div>2 × Na: ${breakdown.naTerm}</div>
                        <div>Glucose / 18: ${breakdown.glucoseTerm}</div>
                        <div>BUN / 2.8: ${breakdown.bunTerm}</div>
                        ${breakdown.ethanolTerm > 0 ? `<div>Ethanol / 4.6: ${breakdown.ethanolTerm}</div>` : ''}
                    </div>
                `
            })}
        `;
    }
});
