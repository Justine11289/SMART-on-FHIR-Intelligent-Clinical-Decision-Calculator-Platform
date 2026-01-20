import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateMDRD } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const mdrdGfrConfig: FormulaCalculatorConfig = {
    id: 'mdrd-gfr',
    title: 'MDRD GFR Equation',
    description:
        'Estimates GFR using the MDRD equation. Note: CKD-EPI is now preferred for most patients.',
    infoAlert: uiBuilder.createAlert({
        type: 'info',
        message:
            '<strong>Note:</strong> MDRD is less accurate at higher GFR values (>60). Consider using CKD-EPI for general use.'
    }),
    inputs: [
        {
            type: 'radio',
            id: 'mdrd-gender',
            label: 'Gender',
            options: [
                { value: 'male', label: 'Male', checked: true },
                { value: 'female', label: 'Female' }
            ]
        },
        {
            type: 'radio',
            id: 'mdrd-race',
            label: 'Race',
            options: [
                { value: 'non-aa', label: 'Non-African American', checked: true },
                { value: 'aa', label: 'African American' }
            ]
        },
        {
            type: 'number',
            id: 'mdrd-age',
            label: 'Age',
            standardUnit: 'years',
            placeholder: 'e.g., 65',
            validationType: 'age',
            required: true
        },
        {
            type: 'number',
            id: 'mdrd-creatinine',
            label: 'Serum Creatinine',
            standardUnit: 'mg/dL',
            unitConfig: { type: 'creatinine', units: ['mg/dL', 'µmol/L'], default: 'mg/dL' },
            validationType: 'creatinine',
            loincCode: LOINC_CODES.CREATININE,
            min: 0.1,
            max: 20,
            required: true
        }
    ],
    formulas: [
        { label: 'Base Formula', formula: 'eGFR = 175 × (Scr)^-1.154 × (Age)^-0.203' },
        { label: 'Gender Adjustment', formula: 'If female: multiply by 0.742' },
        { label: 'Race Adjustment', formula: 'If African American: multiply by 1.212' }
    ],
    calculate: calculateMDRD,
    autoPopulateAge: 'mdrd-age',
    autoPopulateGender: 'mdrd-gender',
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        let note = '';
        if (res.alertClass === 'success') note = 'Normal or mildly decreased kidney function.';
        else if (res.alertClass === 'warning') note = 'Moderate reduction. Monitor closely.';
        else if (res.alertClass === 'danger')
            note = 'Severe reduction or kidney failure. Immediate attention required.';

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value.toString(),
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: `ui-alert-${res.alertClass}`
            })}
            
            ${uiBuilder.createAlert({
                type: res.alertClass === 'success' ? 'info' : (res.alertClass as any),
                message: note
            })}
        `;
    }
};

export const mdrdGfr = createUnifiedFormulaCalculator(mdrdGfrConfig);
