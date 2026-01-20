import { FormulaResultItem } from '../../types/calculator-formula.js';

export const crclCalculation = (values: Record<string, any>): FormulaResultItem[] => {
    const gender = values['gender'] || 'male';
    const age = values['age'];
    const weight = values['weight'];
    const creatinine = values['creatinine'];

    // Check for null/undefined specifically, allowing 0 to pass through for explicit error handling
    if (
        age === undefined ||
        age === null ||
        weight === undefined ||
        weight === null ||
        creatinine === undefined ||
        creatinine === null
    ) {
        return [];
    }

    if (creatinine === 0) return [{ label: 'Error', value: 'Creatinine cannot be 0' }];

    let crcl = ((140 - age) * weight) / (72 * creatinine);
    if (gender === 'female') {
        crcl *= 0.85;
    }

    let category = '';
    let severityClass: any = 'success';
    let alertType: 'info' | 'warning' | 'danger' = 'info';
    let alertMsg = '';

    if (crcl >= 90) {
        category = 'Normal kidney function';
        severityClass = 'success';
        alertMsg = 'Normal creatinine clearance.';
    } else if (crcl >= 60) {
        category = 'Mild reduction';
        severityClass = 'success';
        alertMsg = 'Mildly reduced creatinine clearance.';
    } else if (crcl >= 30) {
        category = 'Moderate reduction';
        severityClass = 'warning';
        alertMsg =
            'Moderate reduction in kidney function. Consider nephrology referral and dose adjustment for renally cleared medications.';
        alertType = 'warning';
    } else if (crcl >= 15) {
        category = 'Severe reduction';
        severityClass = 'danger';
        alertMsg =
            'Severe reduction in kidney function. Nephrology referral required. Careful medication dosing adjustments necessary.';
        alertType = 'danger';
    } else {
        category = 'Kidney failure';
        severityClass = 'danger';
        alertMsg =
            'Kidney failure. Consider dialysis or transplantation. Avoid renally cleared medications.';
        alertType = 'danger';
    }

    return [
        {
            label: 'Creatinine Clearance',
            value: crcl.toFixed(1),
            unit: 'mL/min',
            interpretation: category,
            alertClass: severityClass,
            alertPayload: {
                type: alertType,
                message: alertMsg
            }
        }
    ];
};
