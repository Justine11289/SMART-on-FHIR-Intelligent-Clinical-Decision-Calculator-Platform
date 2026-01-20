import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { sirsCalculation } from './calculation.js';

export const sirs = createUnifiedFormulaCalculator({
    id: 'sirs',
    title: 'SIRS Criteria for Systemic Inflammatory Response',
    description:
        'Evaluates SIRS criteria and progression to sepsis and septic shock using clinical parameters.',
    infoAlert:
        '<h4>SIRS Criteria (Requires ≥ 2):</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Temperature:</strong> < 36°C or > 38°C',
                '<strong>Heart Rate:</strong> > 90 bpm',
                '<strong>Resp Rate:</strong> > 20/min OR PaCO2 < 32 mmHg',
                '<strong>WBC:</strong> < 4,000 or > 12,000 or > 10% Bands'
            ],
            className: 'info-list'
        }),
    sections: [
        {
            title: 'Vital Signs',
            icon: '💓',
            fields: [
                {
                    type: 'number',
                    id: 'temp',
                    label: 'Temperature',
                    placeholder: '37.0',
                    unitToggle: {
                        type: 'temperature',
                        units: ['°C', '°F'],
                        default: '°C'
                    },
                    validationType: 'temperature',
                    loincCode: LOINC_CODES.TEMPERATURE,
                    standardUnit: '°C',
                    required: true
                },
                {
                    type: 'number',
                    id: 'hr',
                    label: 'Heart Rate',
                    placeholder: '80',
                    unitToggle: {
                        type: 'none',
                        units: [],
                        default: 'bpm'
                    },
                    validationType: 'heartRate',
                    loincCode: LOINC_CODES.HEART_RATE,
                    required: true
                },
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
                    loincCode: LOINC_CODES.RESPIRATORY_RATE
                },
                {
                    type: 'number',
                    id: 'paco2',
                    label: 'PaCO₂ (Optional)',
                    placeholder: '40',
                    unitToggle: {
                        type: 'pressure',
                        units: ['mmHg', 'kPa'],
                        default: 'mmHg'
                    },
                    validationType: 'paCO2',
                    loincCode: LOINC_CODES.PCO2,
                    standardUnit: 'mmHg'
                }
            ]
        },
        {
            title: 'Labs (WBC)',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'wbc',
                    label: 'WBC Count',
                    placeholder: '7.5',
                    unitToggle: {
                        type: 'none',
                        units: [],
                        default: 'K/µL'
                    },
                    validationType: 'wbc',
                    loincCode: LOINC_CODES.WBC
                },
                {
                    type: 'number',
                    id: 'bands',
                    label: 'Band Forms (%)',
                    placeholder: '5',
                    unitToggle: {
                        type: 'none',
                        units: [],
                        default: '%'
                    }
                }
            ]
        },
        {
            title: 'Sepsis Assessment',
            icon: '🦠',
            fields: [
                {
                    type: 'radio',
                    id: 'infection',
                    label: 'Suspected or Confirmed Infection?',
                    options: [
                        { value: 'no', label: 'No', checked: true },
                        { value: 'yes', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'hypotension',
                    label: 'Persistent Hypotension despite fluids?',
                    options: [
                        { value: 'no', label: 'No', checked: true },
                        { value: 'yes', label: 'Yes' }
                    ],
                    helpText: 'SBP < 90 mmHg or MAP < 65 mmHg after fluid resuscitation'
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'SIRS Definition',
            formula: '≥ 2 criteria needed for diagnosis'
        }
    ],
    calculate: sirsCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as {
            criteriaCount: number;
            metDetails: string[];
            description: string;
            recommendations: string;
        };
        const criteriaCount = payload.criteriaCount;
        const metDetails = payload.metDetails;
        const description = payload.description;
        const recommendations = payload.recommendations;

        const alertClass = res.alertClass || 'info';

        return `
            ${uiBuilder.createResultItem({
                label: res.label, // Diagnosis
                value: res.interpretation || '',
                interpretation: description,
                alertClass: `ui-alert-${alertClass}`,
                unit: ''
            })}

            <div class="result-item mt-10">
                <span class="label text-muted">SIRS Criteria Met:</span>
                <span class="value font-semibold">${criteriaCount} / 4</span>
            </div>
            
            ${
                metDetails.length > 0
                    ? `
            <div class="text-sm mt-5 mb-10 text-muted">
                ${uiBuilder.createList({ items: metDetails })}
            </div>
            `
                    : ''
            }

            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: `<strong>🏥 Management:</strong> ${recommendations}`
            })}
        `;
    }
});
