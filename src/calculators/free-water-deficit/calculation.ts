import { SimpleCalculateFn } from '../../types/calculator-formula.js';

export const calculateFreeWaterDeficit: SimpleCalculateFn = values => {
    const weight = Number(values['fwd-weight']);
    const sodium = Number(values['fwd-sodium']);
    const genderType = values['fwd-gender'] as string;

    if (!weight || !sodium || !genderType) return null;

    // TBW Factor based on gender/age
    let tbwFactor = 0.6;
    switch (genderType) {
        case 'male':
            tbwFactor = 0.6;
            break;
        case 'female':
            tbwFactor = 0.5;
            break;
        case 'elderly':
            tbwFactor = 0.5;
            break;
        case 'elderly_female':
            tbwFactor = 0.45;
            break;
        case 'child':
            tbwFactor = 0.6;
            break;
    }

    const tbw = weight * tbwFactor;
    const deficit = tbw * (sodium / 140 - 1);

    // Determine status
    let status = '';
    let alertClass: 'success' | 'warning' | 'danger' | 'info' = 'info';
    let alertMsg = '';

    if (sodium <= 140) {
        status = 'Not Indicated';
        alertClass = 'warning';
        alertMsg = 'Calculation intended for hypernatremia (Na > 140).';
    } else {
        status = 'Hypernatremia';
        alertClass = 'danger';
        alertMsg =
            'Correction should be slow (e.g., over 48-72 hours) to avoid cerebral edema. Max rate ~0.5 mEq/L/hr.';
    }

    return [
        {
            label: 'Free Water Deficit',
            value: deficit > 0 ? deficit.toFixed(1) : '0.0',
            unit: 'Liters',
            interpretation: status,
            alertClass: alertClass
        },
        {
            label: 'Estimated TBW',
            value: tbw.toFixed(1),
            unit: 'Liters'
        },
        {
            label: '__NOTE__',
            value: alertMsg,
            alertClass: alertClass
        }
    ];
};
