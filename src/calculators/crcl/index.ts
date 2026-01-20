import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { crclCalculation } from './calculation.js';

export const crcl = createUnifiedFormulaCalculator({
    id: 'crcl',
    title: 'Creatinine Clearance (Cockcroft-Gault Equation)',
    description: 'Calculates CrCl according to the Cockcroft-Gault equation.',
    infoAlert: `
        <h4>Note:</h4>
        <ul class="info-list">
            <li>This formula estimates creatinine clearance, not GFR.</li>
            <li>May overestimate clearance in elderly patients.</li>
        </ul>
    `,
    autoPopulateAge: 'age',
    sections: [
        {
            title: 'Patient Information',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'gender',
                    label: 'Gender',
                    options: [
                        { value: 'male', label: 'Male', checked: true },
                        { value: 'female', label: 'Female' }
                    ]
                },
                {
                    type: 'number',
                    id: 'age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: 'e.g., 65',
                    validationType: 'age',
                    min: 1,
                    max: 120,
                    required: true
                },
                {
                    type: 'number',
                    id: 'weight',
                    label: 'Weight',
                    placeholder: 'e.g., 70',
                    unitToggle: {
                        type: 'weight',
                        units: ['kg', 'lbs'],
                        default: 'kg'
                    },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    min: 1,
                    max: 300,
                    required: true
                }
            ]
        },
        {
            title: 'Lab Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'creatinine',
                    label: 'Serum Creatinine',
                    placeholder: 'e.g., 1.0',
                    unitToggle: {
                        type: 'creatinine',
                        units: ['mg/dL', 'µmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'creatinine',
                    loincCode: LOINC_CODES.CREATININE,
                    min: 0.1,
                    max: 20,
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'Male',
            formula:
                '<span class="formula-fraction"><span class="numerator">(140 − Age) × Weight</span><span class="denominator">72 × Serum Creatinine</span></span>'
        },
        {
            label: 'Female',
            formula:
                '<span class="formula-fraction"><span class="numerator">(140 − Age) × Weight × 0.85</span><span class="denominator">72 × Serum Creatinine</span></span>'
        }
    ],
    calculate: crclCalculation,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        let alertHtml = '';
        if (res.alertPayload) {
            alertHtml = uiBuilder.createAlert(res.alertPayload);
        }

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value,
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: res.alertClass ? `ui-alert-${res.alertClass}` : ''
            })}
            ${alertHtml}
        `;
    },
    customInitialize: (client, patient, container) => {
        if (client && patient) {
            const gender = (patient as any).gender;
            if (gender) {
                const radio = container.querySelector(
                    `input[name="gender"][value="${gender}"]`
                ) as HTMLInputElement;
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                }
            }
        }
    }
});
