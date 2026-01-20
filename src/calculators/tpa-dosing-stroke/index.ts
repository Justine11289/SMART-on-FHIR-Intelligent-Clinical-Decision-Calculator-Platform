import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateTpaDosingStroke, TpaStrokeResult } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig, FormulaResultItem } from '../../types/calculator-formula.js';

export const tpaDosingStrokeConfig: FormulaCalculatorConfig = {
    id: 'tpa-dosing-stroke',
    title: 'tPA Dosing for Acute Stroke',
    description:
        'Calculates tissue plasminogen activator (tPA) dosing for acute ischemic stroke with eligibility check.',
    infoAlert: uiBuilder.createAlert({
        type: 'warning',
        message: `
            <h4>Important Reminders</h4>
            ${uiBuilder.createList({
                items: [
                    'Verify all inclusion/exclusion criteria before administration',
                    'Obtain informed consent when possible',
                    'Ensure BP < 185/110 mmHg before treatment',
                    'Have reversal agents available (cryoprecipitate, aminocaproic acid)'
                ]
            })}
        `
    }),
    sections: [
        {
            title: 'Patient Data',
            icon: '⚖️',
            fields: [
                {
                    type: 'number',
                    id: 'tpa-stroke-weight',
                    label: 'Weight',
                    placeholder: 'e.g., 70',
                    unitConfig: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    standardUnit: 'kg',
                    required: true
                },
                {
                    type: 'number',
                    id: 'tpa-stroke-onset',
                    label: 'Time from symptom onset',
                    unit: 'hours',
                    placeholder: 'e.g., 2.5',
                    validationType: 'hours',
                    helpText: 'Must be ≤ 4.5 hours for IV tPA eligibility'
                }
            ]
        }
    ],
    formulas: [
        { label: 'Total Dose', formula: '0.9 mg/kg (Max 90 mg)' },
        { label: 'Bolus', formula: '10% of Total Dose (over 1 min)' },
        { label: 'Infusion', formula: '90% of Total Dose (over 60 min)' }
    ],
    reference: uiBuilder.createReference({
        citations: [
            'NINDS rt-PA Stroke Study Group. Tissue plasminogen activator for acute ischemic stroke. <em>N Engl J Med</em>. 1995;333(24):1581-1587.'
        ]
    }),
    calculate: calculateTpaDosingStroke,
    customResultRenderer: (results: FormulaResultItem[]) => {
        // Extract Eligibility Item
        const eligibilityItem = results.find(r => r.label === 'Eligibility Status') as
            | TpaStrokeResult
            | undefined;
        const dosingItems = results.filter(r => r.label !== 'Eligibility Status');

        let eligibilityHtml = '';
        if (eligibilityItem) {
            const status = eligibilityItem.eligibilityStatus || eligibilityItem.value;
            if (status === 'eligible') {
                eligibilityHtml = uiBuilder.createAlert({
                    type: 'success',
                    message:
                        '<strong>Eligibility:</strong> Within time window for IV tPA (≤ 4.5 hours)'
                });
            } else if (status === 'ineligible') {
                eligibilityHtml = uiBuilder.createAlert({
                    type: 'danger',
                    message:
                        '<strong>Eligibility:</strong> Outside time window for IV tPA (> 4.5 hours)'
                });
            } else {
                eligibilityHtml = uiBuilder.createAlert({
                    type: 'warning',
                    message:
                        '<strong>Note:</strong> Please enter time from symptom onset to check eligibility.'
                });
            }
        }

        // Render items
        const renderItem = (res: FormulaResultItem) =>
            uiBuilder.createResultItem({
                label: res.label,
                value: res.value?.toString() || '',
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: res.alertClass ? `ui-alert-${res.alertClass}` : ''
            });

        const totalDoseItem = dosingItems.find(r => r.label === 'Total Dose');
        const stepItems = dosingItems.filter(r => r.label !== 'Total Dose');

        return `
            ${eligibilityHtml}
            ${totalDoseItem ? renderItem(totalDoseItem) : ''}
            ${stepItems.length > 0 ? '<hr class="mt-10 mb-10">' : ''}
            ${stepItems.map(item => renderItem(item)).join('')}
            ${uiBuilder.createAlert({
                type: 'info',
                message: 'Maximum dose is 90 mg regardless of weight.'
            })}
        `;
    }
};

export const tpaDosing = createUnifiedFormulaCalculator(tpaDosingStrokeConfig);
