import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { bmiBsaCalculation } from './calculation.js';

export const bmiBsa = createUnifiedFormulaCalculator({
    id: 'bmi-bsa',
    title: 'BMI & Body Surface Area (BSA)',
    description:
        'Calculates Body Mass Index (BMI) and Body Surface Area (BSA) for clinical assessment and medication dosing.',
    infoAlert: `
        <h4>BMI Categories:</h4>
        <ul class="info-list">
            <li><strong>Underweight:</strong> < 18.5</li>
            <li><strong>Normal:</strong> 18.5 - 24.9</li>
            <li><strong>Overweight:</strong> 25 - 29.9</li>
            <li><strong>Obese:</strong> ≥ 30</li>
        </ul>
    `,
    sections: [
        {
            title: 'Anthropometrics',
            icon: '📏',
            fields: [
                {
                    type: 'number',
                    id: 'bmi-bsa-weight',
                    label: 'Weight',
                    placeholder: 'e.g., 70',
                    unitToggle: {
                        type: 'weight',
                        units: ['kg', 'lbs'],
                        default: 'kg'
                    },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    standardUnit: 'kg',
                    required: true
                },
                {
                    type: 'number',
                    id: 'bmi-bsa-height',
                    label: 'Height',
                    placeholder: 'e.g., 175',
                    unitToggle: {
                        type: 'height',
                        units: ['cm', 'in'],
                        default: 'cm'
                    },
                    validationType: 'height',
                    loincCode: LOINC_CODES.HEIGHT,
                    standardUnit: 'cm',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        { label: 'BMI', formula: 'Weight (kg) / Height² (m²)' },
        {
            label: 'BSA (Du Bois)',
            formula: '0.007184 × Weight<sup>0.425</sup> (kg) × Height<sup>0.725</sup> (cm)'
        }
    ],
    calculate: bmiBsaCalculation,
    customResultRenderer: results => {
        const bmiRes = results[0];
        const bsaRes = results[1];

        if (!bmiRes || !bsaRes) return '';

        // Safely handle alert class
        const bmiAlertClass = bmiRes.alertClass || 'info';

        return `
            ${uiBuilder.createResultItem({
                label: bmiRes.label,
                value: bmiRes.value,
                unit: bmiRes.unit,
                interpretation: bmiRes.interpretation,
                alertClass: `ui-alert-${bmiAlertClass}`
            })}
            ${uiBuilder.createResultItem({
                label: bsaRes.label,
                value: bsaRes.value,
                unit: bsaRes.unit,
                interpretation: bsaRes.interpretation
            })}
            
            ${uiBuilder.createAlert({
                type: 'info',
                message:
                    'BSA calculated using Du Bois formula. Used for medication dosing and cardiac index calculation.'
            })}
        `;
    }
});
