import { SimpleCalculateFn } from '../../types/calculator-formula.js';

export const calculateFENa: SimpleCalculateFn = values => {
    const uNa = Number(values['fena-urine-na']);
    const sNa = Number(values['fena-serum-na']);
    const uCr = Number(values['fena-urine-creat']);
    const sCr = Number(values['fena-serum-creat']);

    if (!uNa || !sNa || !uCr || !sCr) return null;
    if (sNa === 0 || uCr === 0) return null; // Avoid division by zero

    // FENa = (Urine Na / Serum Na) / (Urine Cr / Serum Cr) * 100
    const fena = (uNa / sNa / (uCr / sCr)) * 100;

    let interpretation = '';
    let alertClass: 'success' | 'warning' | 'danger' | 'info' = 'info';

    if (fena < 1) {
        interpretation = 'Prerenal AKI (< 1%)';
        alertClass = 'success';
    } else if (fena > 2) {
        interpretation = 'Intrinsic/ATN (> 2%)';
        alertClass = 'danger';
    } else {
        interpretation = 'Indeterminate (1-2%)';
        alertClass = 'warning';
    }

    return [
        {
            label: 'Fractional Excretion of Sodium',
            value: fena.toFixed(2),
            unit: '%',
            interpretation: interpretation,
            alertClass: alertClass
        }
    ];
};
