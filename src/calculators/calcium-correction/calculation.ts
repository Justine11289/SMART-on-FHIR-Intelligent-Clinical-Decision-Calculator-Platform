import { AlertSeverity } from '../../types/calculator-base.js';
import { FormulaResultItem } from '../../types/calculator-formula.js';

export function calciumCorrectionCalculation(
    values: Record<string, number | string | boolean>
): FormulaResultItem[] {
    const calciumInput = values['ca-total'];
    const albuminInput = values['ca-albumin'];

    if (
        calciumInput === undefined ||
        calciumInput === null ||
        calciumInput === '' ||
        albuminInput === undefined ||
        albuminInput === null ||
        albuminInput === ''
    ) {
        return [];
    }

    const calcium = Number(calciumInput);
    const albumin = Number(albuminInput);

    if (isNaN(calcium) || isNaN(albumin)) {
        return [];
    }

    // Formula: Total Calcium + 0.8 * (4.0 - Albumin)
    // Assumes standard units: Calcium (mg/dL), Albumin (g/dL)
    const correctedCalcium = calcium + 0.8 * (4.0 - albumin);
    // Conversion to mmol/L: mg/dL * 0.2495
    const correctedCalciumMmol = correctedCalcium * 0.2495;

    let interpretation = 'Normal Range';
    let alertClass: AlertSeverity = 'success';
    let alertMsg = 'Corrected calcium is within normal limits (8.5 - 10.5 mg/dL).';

    if (correctedCalcium < 8.5) {
        interpretation = 'Hypocalcemia';
        alertClass = 'warning';
        alertMsg = 'Corrected calcium is below normal range (< 8.5 mg/dL).';
    } else if (correctedCalcium > 10.5) {
        interpretation = 'Hypercalcemia';
        alertClass = 'danger';
        alertMsg = 'Corrected calcium is above normal range (> 10.5 mg/dL).';
    }

    return [
        {
            label: 'Corrected Calcium',
            value: Number(correctedCalcium.toFixed(2)),
            unit: 'mg/dL',
            interpretation: interpretation,
            alertClass: alertClass,
            alertPayload: {
                mmolValue: Number(correctedCalciumMmol.toFixed(2)),
                alertMsg
            }
        }
    ];
}
