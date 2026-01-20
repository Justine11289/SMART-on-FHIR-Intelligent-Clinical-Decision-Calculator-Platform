import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { fib4Calculation } from './calculation.js';

export const fib4 = createUnifiedFormulaCalculator({
    id: 'fib-4',
    title: 'Fibrosis-4 (FIB-4) Index',
    description: 'Estimates liver fibrosis in patients with chronic liver disease.',
    sections: [
        {
            title: 'Patient Parameters',
            icon: '👤',
            fields: [
                {
                    type: 'number',
                    id: 'fib4-age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: 'e.g. 45',
                    validationType: 'age',
                    required: true
                },
                {
                    type: 'number',
                    id: 'fib4-ast',
                    label: 'AST (Aspartate Aminotransferase)',
                    unit: 'U/L',
                    placeholder: 'e.g. 30',
                    validationType: 'liverEnzyme',
                    loincCode: LOINC_CODES.AST,
                    required: true
                },
                {
                    type: 'number',
                    id: 'fib4-alt',
                    label: 'ALT (Alanine Aminotransferase)',
                    unit: 'U/L',
                    placeholder: 'e.g. 30',
                    validationType: 'liverEnzyme',
                    loincCode: LOINC_CODES.ALT,
                    required: true
                },
                {
                    type: 'number',
                    id: 'fib4-plt',
                    label: 'Platelet Count',
                    placeholder: 'e.g. 250',
                    unitToggle: {
                        type: 'platelet',
                        units: ['×10⁹/L', 'K/µL', 'thou/mm³'],
                        default: '×10⁹/L'
                    },
                    validationType: 'platelets',
                    loincCode: LOINC_CODES.PLATELETS,
                    standardUnit: '×10⁹/L',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'FIB-4 Index',
            formula:
                '<span class="formula-fraction"><span class="numerator">Age × AST</span><span class="denominator">Platelets × √ALT</span></span>'
        }
    ],
    autoPopulateAge: 'fib4-age',
    calculate: fib4Calculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const alertClass = res.alertClass || 'info';

        let recommendation = '';
        if (alertClass === 'success') {
            recommendation = 'Continue routine monitoring.';
        } else if (alertClass === 'danger') {
            recommendation = 'Referral to hepatology recommended. Consider FibroScan or biopsy.';
        } else {
            recommendation = 'Further evaluation needed (e.g. FibroScan, elastography).';
        }

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value,
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: res.alertClass ? `ui-alert-${res.alertClass}` : ''
            })}
            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: `<strong>Recommendation:</strong> ${recommendation}`
            })}
        `;
    }
});
