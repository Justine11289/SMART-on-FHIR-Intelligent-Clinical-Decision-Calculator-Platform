import { AlertSeverity } from '../../types/calculator-base.js';
import { FormulaResultItem } from '../../types/calculator-formula.js';

export function ttkgCalculation(
    values: Record<string, number | string | boolean>
): FormulaResultItem[] {
    const uK = values['ttkg-urine-k'];
    const sK = values['ttkg-serum-k'];
    const uO = values['ttkg-urine-osmo'];
    const sO = values['ttkg-serum-osmo'];

    if (
        uK === undefined ||
        uK === null ||
        uK === '' ||
        sK === undefined ||
        sK === null ||
        sK === '' ||
        uO === undefined ||
        uO === null ||
        uO === '' ||
        sO === undefined ||
        sO === null ||
        sO === ''
    ) {
        return [];
    }

    const urineK = Number(uK);
    const serumK = Number(sK);
    const urineOsmo = Number(uO);
    const serumOsmo = Number(sO);

    // Check for valid inputs
    if (isNaN(urineK) || isNaN(serumK) || isNaN(urineOsmo) || isNaN(serumOsmo)) {
        return [];
    }

    // Safety checks
    if (serumK === 0 || urineOsmo === 0) {
        return [];
    }

    // Calculate TTKG
    // Formula: (Urine K * Serum Osmolality) / (Serum K * Urine Osmolality)
    const ttkg = (urineK * serumOsmo) / (serumK * urineOsmo);

    const resultValue = Number(ttkg.toFixed(2));
    let interpretation = '';
    let alertClass: AlertSeverity = 'info';

    // Validity Check
    if (urineOsmo <= serumOsmo) {
        interpretation = `<strong>Warning:</strong> TTKG is not valid when Urine Osmolality (${urineOsmo}) ≤ Serum Osmolality (${serumOsmo}).`;
        alertClass = 'warning';

        return [
            {
                label: 'TTKG',
                value: resultValue,
                interpretation: interpretation,
                alertClass: alertClass
            }
        ];
    }

    // Interpretation based on Serum K
    if (serumK < 3.5) {
        // Hypokalemia
        if (ttkg < 3) {
            interpretation =
                'Suggests non-renal potassium loss (e.g., GI loss, transcellular shift).';
            alertClass = 'success';
        } else {
            interpretation = 'Suggests renal potassium wasting.';
            alertClass = 'warning';
        }
    } else if (serumK > 5.2) {
        // Hyperkalemia
        if (ttkg > 10) {
            interpretation =
                'Suggests hyperkalemia is driven by high potassium intake (dietary or iatrogenic).';
            alertClass = 'success';
        } else if (ttkg < 7) {
            interpretation =
                'Suggests an issue with aldosterone (e.g., hypoaldosteronism or aldosterone resistance).';
            alertClass = 'warning';
        } else {
            interpretation = 'Intermediate value.';
            alertClass = 'info';
        }
    } else {
        interpretation =
            'Normal potassium levels. TTKG should be interpreted in context of potassium disorders.';
        alertClass = 'info';
    }

    return [
        {
            label: 'TTKG',
            value: resultValue,
            interpretation: interpretation,
            alertClass: alertClass
        }
    ];
}
