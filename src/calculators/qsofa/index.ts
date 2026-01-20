import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { qsofaCalculation } from './calculation.js';

export const qsofaScore = createUnifiedFormulaCalculator({
    id: 'qsofa',
    title: 'qSOFA Score for Sepsis',
    description:
        'Identifies patients with suspected infection at risk for poor outcomes (sepsis). Score ≥ 2 suggests high risk.',
    infoAlert:
        '<h4>qSOFA Criteria (Score 1 each):</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Respiratory Rate:</strong> ≥ 22 /min',
                '<strong>Systolic Blood Pressure:</strong> ≤ 100 mmHg',
                '<strong>Altered Mental Status:</strong> GCS < 15'
            ],
            className: 'info-list'
        }),
    sections: [
        {
            title: 'Vital Signs',
            icon: '🩺',
            fields: [
                {
                    type: 'number',
                    id: 'rr',
                    label: 'Respiratory Rate',
                    placeholder: '16',
                    unitToggle: {
                        type: 'none',
                        units: [],
                        default: '/min'
                    },
                    validationType: 'respiratoryRate',
                    loincCode: LOINC_CODES.RESPIRATORY_RATE,
                    required: true
                },
                {
                    type: 'number',
                    id: 'sbp',
                    label: 'Systolic BP',
                    placeholder: '120',
                    unitToggle: {
                        type: 'pressure',
                        units: ['mmHg'],
                        default: 'mmHg'
                    },
                    standardUnit: 'mmHg',
                    validationType: 'systolicBP',
                    loincCode: LOINC_CODES.SYSTOLIC_BLOOD_PRESSURE,
                    required: true
                }
            ]
        },
        {
            title: 'Neurological Status',
            icon: '🧠',
            fields: [
                {
                    type: 'number',
                    id: 'gcs',
                    label: 'Glasgow Coma Scale (GCS)',
                    placeholder: '15',
                    min: 3,
                    max: 15,
                    unitToggle: {
                        type: 'none',
                        units: [],
                        default: 'points'
                    },
                    validationType: 'gcs',
                    loincCode: LOINC_CODES.GCS
                },
                {
                    type: 'radio',
                    id: 'ams',
                    label: 'Altered Mental Status?',
                    options: [
                        { value: 'no', label: 'No', checked: true },
                        { value: 'yes', label: 'Yes' }
                    ],
                    helpText:
                        'Select "Yes" if GCS < 15 or not formally assessed but clinically altered.'
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Scoring',
            formula: 'Sum of criteria (0-3 points)'
        }
    ],
    calculate: qsofaCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as { metCriteria: string[]; recommendation: string };
        const metCriteria = payload.metCriteria;
        const recommendation = payload.recommendation;
        const alertClass = res.alertClass || 'info';

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value.toString(),
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: `ui-alert-${alertClass}`
            })}
            
            ${
                metCriteria.length > 0
                    ? `
            <div class="text-sm mt-5 mb-10 text-muted">
                <strong>Criteria Met:</strong>
                <ul class="list-disc pl-20">
                    ${metCriteria.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            `
                    : ''
            }

            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: `<strong>🏥 Recommendation:</strong> ${recommendation}`
            })}
        `;
    }
});
