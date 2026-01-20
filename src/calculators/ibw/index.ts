import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateIBW } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const ibwConfig: FormulaCalculatorConfig = {
    id: 'ibw',
    title: 'Ideal & Adjusted Body Weight',
    description:
        'Calculates ideal body weight (IBW) and adjusted body weight (ABW) using the Devine formula.',
    infoAlert:
        '<h4>Clinical Applications</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Ideal Body Weight (IBW):</strong> Drug dosing for medications with narrow therapeutic index, nutritional assessment, ventilator settings.',
                '<strong>Adjusted Body Weight (ABW):</strong> Drug dosing in obese patients (actual weight > IBW), aminoglycoside dosing.'
            ]
        }),
    sections: [
        {
            title: 'Patient Data',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'ibw-gender',
                    label: 'Gender',
                    options: [
                        { label: 'Male', value: 'male', checked: true },
                        { label: 'Female', value: 'female' }
                    ]
                },
                {
                    type: 'number',
                    id: 'ibw-height',
                    label: 'Height',
                    placeholder: 'Enter height',
                    unitConfig: { type: 'height', units: ['cm', 'in'], default: 'cm' },
                    validationType: 'height',
                    loincCode: LOINC_CODES.HEIGHT,
                    standardUnit: 'cm',
                    required: true
                },
                {
                    type: 'number',
                    id: 'ibw-actual',
                    label: 'Actual Weight',
                    placeholder: 'Enter weight',
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
        { label: 'IBW (Male)', formula: '50 + 2.3 × (height in inches - 60)' },
        { label: 'IBW (Female)', formula: '45.5 + 2.3 × (height in inches - 60)' },
        { label: 'ABW', formula: 'IBW + 0.4 × (Actual Weight - IBW)' },
        { label: 'Note', formula: 'ABW is calculated only when actual weight exceeds IBW.' }
    ],
    autoPopulateGender: 'ibw-gender',
    calculate: calculateIBW,
    customResultRenderer: results => {
        const standardResults = results.filter(r => r.label !== '__ALERT__');
        const alertResult = results.find(r => r.label === '__ALERT__');

        let html = standardResults
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

        if (alertResult && alertResult.value) {
            html += uiBuilder.createAlert({
                type: alertResult.alertClass as any,
                message: alertResult.value.toString()
            });
        }

        return html;
    }
};

export const ibw = createUnifiedFormulaCalculator(ibwConfig);
