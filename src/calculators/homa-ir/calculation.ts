import { SimpleCalculateFn } from '../../types/calculator-formula.js';

export const calculateHOMAIR: SimpleCalculateFn = values => {
    const glucose = Number(values['homa-glucose']);
    const insulin = Number(values['homa-insulin']);

    if (!glucose || !insulin) return null;

    // HOMA-IR = (Fasting Glucose * Fasting Insulin) / 405
    const homaIr = (glucose * insulin) / 405;

    let interpretation = '';
    let alertClass: 'success' | 'warning' | 'danger' | 'info' = 'success';

    if (homaIr > 2.9) {
        interpretation = 'High likelihood of insulin resistance';
        alertClass = 'danger';
    } else if (homaIr > 1.9) {
        interpretation = 'Early insulin resistance likely';
        alertClass = 'warning';
    } else {
        interpretation = 'Optimal insulin sensitivity';
        alertClass = 'success';
    }

    return [
        {
            label: 'HOMA-IR',
            value: homaIr.toFixed(2),
            unit: '',
            interpretation: interpretation,
            alertClass: alertClass
        }
    ];
};
