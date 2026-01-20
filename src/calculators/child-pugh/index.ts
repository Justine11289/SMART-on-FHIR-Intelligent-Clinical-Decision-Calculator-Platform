import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { childPughCalculation } from './calculation.js';

export const childPugh = createUnifiedFormulaCalculator({
    id: 'child-pugh',
    title: 'Child-Pugh Score for Cirrhosis Mortality',
    description: 'Estimates cirrhosis severity and prognosis.',
    infoAlert:
        '<h4>Child-Pugh Classification:</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Class A (5-6 points):</strong> Good prognosis',
                '<strong>Class B (7-9 points):</strong> Moderate prognosis',
                '<strong>Class C (10-15 points):</strong> Poor prognosis'
            ],
            className: 'info-list'
        }),
    sections: [
        {
            title: 'Laboratory Parameters',
            icon: '🔬',
            fields: [
                {
                    type: 'number',
                    id: 'bilirubin',
                    label: 'Total Bilirubin',
                    placeholder: 'e.g., 1.5',
                    unitToggle: {
                        type: 'bilirubin',
                        units: ['mg/dL', 'µmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'bilirubin',
                    loincCode: LOINC_CODES.BILIRUBIN_TOTAL,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'albumin',
                    label: 'Albumin',
                    placeholder: 'e.g., 3.8',
                    unitToggle: {
                        type: 'albumin',
                        units: ['g/dL', 'g/L'],
                        default: 'g/dL'
                    },
                    validationType: 'albumin',
                    loincCode: LOINC_CODES.ALBUMIN,
                    standardUnit: 'g/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'inr',
                    label: 'INR',
                    placeholder: 'e.g., 1.2',
                    unitToggle: {
                        type: 'none',
                        units: [],
                        default: ''
                    },
                    validationType: 'inr',
                    loincCode: LOINC_CODES.INR_COAG,
                    required: true
                }
            ]
        },
        {
            title: 'Clinical Parameters',
            icon: '🩺',
            fields: [
                {
                    type: 'radio',
                    id: 'ascites',
                    label: 'Ascites',
                    options: [
                        { value: '1', label: 'Absent (+1)', checked: true },
                        { value: '2', label: 'Slight (+2)' },
                        { value: '3', label: 'Moderate (+3)' }
                    ],
                    helpText: 'Fluid accumulation in peritoneal cavity'
                },
                {
                    type: 'radio',
                    id: 'encephalopathy',
                    label: 'Hepatic Encephalopathy',
                    options: [
                        { value: '1', label: 'None (+1)', checked: true },
                        { value: '2', label: 'Grade 1-2 (+2)' },
                        { value: '3', label: 'Grade 3-4 (+3)' }
                    ],
                    helpText: 'Neuropsychiatric abnormalities'
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Scoring',
            formula: 'Sum of points from 5 parameters (5-15 points)',
            notes: 'Class A: 5-6, Class B: 7-9, Class C: 10-15'
        }
    ],
    calculate: childPughCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const payload = res.alertPayload as { prognosis: string };
        const prognosis = payload.prognosis;
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
                type: alertClass as 'info' | 'success' | 'warning' | 'danger',
                message: `<strong>Prognosis:</strong><br>${prognosis.replace(/\n/g, '<br>')}`
            })}
        `;
    }
});
