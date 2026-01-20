import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateTpaDosing } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const tpaDosingConfig: FormulaCalculatorConfig = {
    id: 'tpa-dosing',
    title: 'tPA (Alteplase) Dosing for Ischemic Stroke',
    description:
        'Calculates tPA (alteplase) dosing for acute ischemic stroke based on patient weight.',
    infoAlert:
        uiBuilder.createAlert({
            type: 'warning',
            message:
                '<strong>⚠️ Important:</strong> This calculator is for acute ischemic stroke only. Verify all inclusion/exclusion criteria before administration.'
        }) +
        '<h4>Dosing Guidelines</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Total Dose:</strong> 0.9 mg/kg (Maximum 90 mg)',
                '<strong>Bolus:</strong> 10% of total dose over 1 minute',
                '<strong>Infusion:</strong> 90% of total dose over 60 minutes',
                '<strong>Time Window:</strong> Within 4.5 hours of symptom onset'
            ]
        }),
    sections: [
        {
            title: 'Patient Weight',
            icon: '⚖️',
            fields: [
                {
                    type: 'number',
                    id: 'tpa-weight',
                    label: 'Weight',
                    placeholder: 'e.g., 70',
                    unitConfig: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    standardUnit: 'kg',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        { label: 'Total Dose', formula: '0.9 mg/kg (Max 90 mg)' },
        { label: 'Bolus Dose', formula: '10% of total dose over 1 minute' },
        { label: 'Infusion Dose', formula: '90% of total dose over 60 minutes' }
    ],
    reference: uiBuilder.createReference({
        citations: [
            'NINDS rt-PA Stroke Study Group. Tissue plasminogen activator for acute ischemic stroke. <em>N Engl J Med</em>. 1995;333(24):1581-1587.'
        ]
    }),
    calculate: calculateTpaDosing
};

export const tpaDosing = createUnifiedFormulaCalculator(tpaDosingConfig);
