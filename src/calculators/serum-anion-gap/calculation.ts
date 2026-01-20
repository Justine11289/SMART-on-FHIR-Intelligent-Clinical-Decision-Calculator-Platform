import { AlertSeverity } from '../../types/calculator-base.js';
import { FormulaResultItem } from '../../types/calculator-formula.js';

export function serumAnionGapCalculation(
    values: Record<string, number | string | boolean>
): FormulaResultItem[] {
    const naInput = values['sag-na'];
    const clInput = values['sag-cl'];
    const hco3Input = values['sag-hco3'];

    if (
        naInput === undefined ||
        naInput === null ||
        naInput === '' ||
        clInput === undefined ||
        clInput === null ||
        clInput === '' ||
        hco3Input === undefined ||
        hco3Input === null ||
        hco3Input === ''
    ) {
        return [];
    }

    const na = Number(naInput);
    const cl = Number(clInput);
    const hco3 = Number(hco3Input);

    if (isNaN(na) || isNaN(cl) || isNaN(hco3)) {
        return [];
    }

    // Formula: Na - (Cl + HCO3)
    const anionGap = na - (cl + hco3);

    let interpretation = '';
    let alertClass: AlertSeverity = 'success';
    let alertMsg = '';

    if (anionGap > 12) {
        interpretation = 'High Anion Gap';
        alertClass = 'danger';
        alertMsg =
            'Suggests metabolic acidosis (e.g., DKA, lactic acidosis, renal failure, toxic ingestions - MUDPILES).';
    } else if (anionGap < 6) {
        interpretation = 'Low Anion Gap';
        alertClass = 'warning';
        alertMsg = 'Less common, may be due to lab error, hypoalbuminemia, or paraproteinemia.';
    } else {
        interpretation = 'Normal Anion Gap';
        alertClass = 'success';
        alertMsg =
            'Metabolic acidosis, if present, is likely non-anion gap (e.g., diarrhea, renal tubular acidosis).';
    }

    return [
        {
            label: 'Serum Anion Gap',
            value: Number(anionGap.toFixed(1)),
            unit: 'mEq/L',
            interpretation: interpretation,
            alertClass: alertClass,
            alertPayload: {
                alertMsg
            }
        }
    ];
}
