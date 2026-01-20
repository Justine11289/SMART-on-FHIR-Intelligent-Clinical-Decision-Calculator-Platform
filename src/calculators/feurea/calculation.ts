import { SimpleCalculateFn } from '../../types/calculator-formula.js';

export const calculateFEUrea: SimpleCalculateFn = values => {
    const serumCr = Number(values['feurea-serum-cr']);
    const urineUrea = Number(values['feurea-urine-urea']);
    const serumUrea = Number(values['feurea-serum-urea']);
    const urineCr = Number(values['feurea-urine-cr']);

    if (!serumCr || !urineUrea || !serumUrea || !urineCr) return null;
    if (serumUrea === 0 || urineCr === 0) return null; // Avoid division by zero

    // FEUrea = (Serum Cr * Urine Urea) / (Serum Urea * Urine Cr) * 100
    const feurea = ((serumCr * urineUrea) / (serumUrea * urineCr)) * 100;

    let interpretation = '';
    let alertClass: 'success' | 'warning' | 'danger' | 'info' = 'info';
    let note = '';

    if (feurea <= 35) {
        interpretation = 'Prerenal AKI (≤ 35%)';
        alertClass = 'success';
        note = 'Suggests prerenal etiology. Consider volume resuscitation.';
    } else if (feurea > 50) {
        interpretation = 'Intrinsic Renal AKI (> 50%)';
        alertClass = 'danger';
        note = 'Suggests intrinsic renal injury (ATN). Consider nephrology consultation.';
    } else {
        interpretation = 'Indeterminate (35-50%)';
        alertClass = 'warning';
        note = 'Further evaluation needed. Clinical correlation required.';
    }

    return [
        {
            label: 'Fractional Excretion of Urea',
            value: feurea.toFixed(2),
            unit: '%',
            interpretation: interpretation,
            alertClass: alertClass
        },
        {
            label: '__NOTE__',
            value: note,
            alertClass: alertClass
        }
    ];
};
