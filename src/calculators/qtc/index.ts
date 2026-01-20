import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { qtcCalculation } from './calculation.js';

export const qtc = createUnifiedFormulaCalculator({
    id: 'qtc',
    title: 'Corrected QT Interval (QTc)',
    description: 'Calculates corrected QT interval to assess risk of arrhythmias.',
    infoAlert: `
        <h4>QTc Normal Ranges:</h4>
        ${uiBuilder.createList({
            items: [
                '<strong>Men:</strong> < 450 ms',
                '<strong>Women:</strong> < 460 ms',
                '<strong>Prolonged:</strong> > 500 ms (High Risk)'
            ],
            className: 'info-list'
        })}
        <p class="mt-5 text-sm">Select formula: Bazett (standard), Fridericia (better for high/low HR), Hodges, or Framingham.</p>
    `,
    sections: [
        {
            title: 'ECG Measurements',
            icon: '💓',
            fields: [
                {
                    type: 'number',
                    id: 'qt',
                    label: 'QT Interval',
                    placeholder: '400',
                    unitToggle: {
                        type: 'time',
                        units: ['ms'],
                        default: 'ms'
                    },
                    standardUnit: 'ms',
                    validationType: 'qtInterval',
                    loincCode: LOINC_CODES.QT_INTERVAL,
                    required: true
                },
                {
                    type: 'number',
                    id: 'hr',
                    label: 'Heart Rate',
                    placeholder: '72',
                    unitToggle: {
                        type: 'rate',
                        units: ['bpm'],
                        default: 'bpm'
                    },
                    loincCode: LOINC_CODES.HEART_RATE,
                    validationType: 'heartRate',
                    required: true
                }
            ]
        },
        {
            title: 'Patient Details',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'gender',
                    label: 'Gender',
                    options: [
                        { value: 'male', label: 'Male', checked: true },
                        { value: 'female', label: 'Female' }
                    ],
                    helpText: 'Used for normal range cutoffs (450ms vs 460ms).'
                },
                {
                    type: 'radio',
                    id: 'formula',
                    label: 'Correction Formula',
                    options: [
                        { value: 'bazett', label: 'Bazett (Standard)', checked: true },
                        { value: 'fridericia', label: 'Fridericia' },
                        { value: 'hodges', label: 'Hodges' },
                        { value: 'framingham', label: 'Framingham' }
                    ]
                }
            ]
        }
    ],
    formulas: [
        { label: 'Bazett', formula: 'QT / √RR' },
        { label: 'Fridericia', formula: 'QT / ∛RR' },
        { label: 'Hodges', formula: 'QT + 1.75(HR-60)' },
        { label: 'Framingham', formula: 'QT + 154(1-RR)' }
    ],
    calculate: qtcCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as { description: string; limit: number };
        const description = payload.description;
        const alertClass = res.alertClass || 'info';

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value.toString(),
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: `ui-alert-${alertClass}`
            })}

            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: `<strong>${res.interpretation}</strong>: ${description}`
            })}
        `;
    }
});
