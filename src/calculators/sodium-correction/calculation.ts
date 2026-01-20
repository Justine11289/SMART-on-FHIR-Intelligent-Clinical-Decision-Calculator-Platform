import { FormulaResultItem } from '../../types/calculator-formula.js';

interface SodiumCorrectionInput {
    'measured-sodium': number;
    glucose: number;
    'correction-factor': string;
}

export const calculateSodiumCorrection = (
    values: Record<string, any>
): FormulaResultItem[] | null => {
    const inputs = values as SodiumCorrectionInput;
    const measuredSodium = inputs['measured-sodium'];
    const glucose = inputs['glucose'];
    const factorStr = inputs['correction-factor'] || '1.6';

    if (
        measuredSodium === undefined ||
        measuredSodium === null ||
        glucose === undefined ||
        glucose === null
    ) {
        return null;
    }

    const factor = parseFloat(factorStr);

    // Formula: Corrected Na = Measured Na + Factor * ((Glucose - 100) / 100)
    // Note: If Glucose < 100, the correction term would be negative, which might not be clinically intended for "hyperglycemia correction".
    // However, strictly following the formula allows it.
    // Usually this is used for Hyperglycemia (Glucose > 100).
    // Let's assume standard behavior: calculate as is, but interpretation focuses on the result.

    const correctionAmount = factor * ((glucose - 100) / 100);
    const correctedSodium = measuredSodium + correctionAmount;

    // Interpretation
    let interpretation = 'Normal';
    let alertClass: 'success' | 'warning' | 'danger' = 'success';

    if (correctedSodium < 136) {
        interpretation = 'Low (Hyponatremia)';
        alertClass = 'warning';
    } else if (correctedSodium > 145) {
        interpretation = 'High (Hypernatremia)';
        alertClass = 'danger';
    }

    // Additional data for custom renderer
    const resultItems: FormulaResultItem[] = [
        {
            label: 'Corrected Sodium',
            value: correctedSodium.toFixed(1),
            unit: 'mEq/L',
            interpretation,
            alertClass,
            // Pass extra data safely via a custom property if needed,
            // or we can rely on re-calculating or passing input values if the renderer has access.
            // But createUnifiedFormulaCalculator passes these results to the renderer.
            // We can treat 'alertPayload' as a generic bag for extra data if needed, or just append strictly formatted items.
            alertPayload: {
                glucose,
                factor
            }
        },
        {
            label: 'Correction Amount',
            value: (correctionAmount >= 0 ? '+' : '') + correctionAmount.toFixed(1),
            unit: 'mEq/L'
        }
    ];

    return resultItems;
};
