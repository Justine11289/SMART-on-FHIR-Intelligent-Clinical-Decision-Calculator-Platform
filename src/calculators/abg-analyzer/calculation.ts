import type { ComplexCalculateFn, FormulaResultItem } from '../../types/calculator-formula';

interface ABGwGapResult {
    primaryDisorder: string;
    anionGapInfo: string;
    deltaRatioInfo: string;
    alertClass: 'success' | 'warning' | 'danger' | 'info';
}

export const calculateABG: ComplexCalculateFn = (getValue, getStdValue, getRadioValue) => {
    // 1. Get standardized values
    // getStdValue handles unit conversion automatically
    const ph = getValue('ph');
    const pco2 = getStdValue('pco2', 'mmHg');
    const hco3 = getStdValue('hco3', 'mEq/L');
    const sodium = getStdValue('sodium', 'mEq/L');
    const chloride = getStdValue('chloride', 'mEq/L');
    const albumin = getStdValue('albumin', 'g/dL');

    // Chronicity for respiratory compensation (acute vs chronic)
    // Note: The original code had radio buttons but didn't actually use the value in the calculation logic provided
    // It seemed to rely solely on the rules of thumb relative to reference ranges.
    // However, for completeness if we want to add compensation checks later:
    // const chronicity = getRadioValue('chronicity');

    // 2. Validate core inputs
    if (ph === null || pco2 === null || hco3 === null) {
        return null;
    }

    let primaryDisorder = '';
    let anionGapInfo = '';
    let deltaRatioInfo = '';
    let alertClass: 'success' | 'warning' | 'danger' | 'info' = 'info';

    // 3. Primary Disorder Logic
    if (ph < 7.35) {
        alertClass = 'danger'; // Acidosis
        if (pco2 > 45) {
            primaryDisorder = 'Respiratory Acidosis';
        } else if (hco3 < 22) {
            primaryDisorder = 'Metabolic Acidosis';
        } else {
            primaryDisorder = 'Mixed Acidosis';
        }
    } else if (ph > 7.45) {
        alertClass = 'danger'; // Alkalosis
        if (pco2 < 35) {
            primaryDisorder = 'Respiratory Alkalosis';
        } else if (hco3 > 26) {
            primaryDisorder = 'Metabolic Alkalosis';
        } else {
            primaryDisorder = 'Mixed Alkalosis';
        }
    } else {
        alertClass = 'success'; // Normal pH
        if (pco2 > 45 && hco3 > 26) {
            primaryDisorder = 'Compensated Respiratory Acidosis/Metabolic Alkalosis';
        } else if (pco2 < 35 && hco3 < 22) {
            primaryDisorder = 'Compensated Metabolic Acidosis/Respiratory Alkalosis';
        } else {
            primaryDisorder = 'Normal Acid-Base Status';
        }
    }

    // 4. Anion Gap Logic
    let anionGap: number | null = null;
    let correctedAG: number | null = null;
    let deltaGap: number | null = null;

    if (sodium !== null && chloride !== null) {
        anionGap = sodium - (chloride + hco3);
        correctedAG = anionGap;

        // Albumin correction
        if (albumin !== null) {
            correctedAG = anionGap + 2.5 * (4.0 - albumin);
        }

        if (correctedAG > 12) {
            const formattedAG = correctedAG.toFixed(1);
            anionGapInfo = `High Anion Gap (${formattedAG})`;

            // Delta Gap
            deltaGap = correctedAG - 12;
            const deltaDelta = deltaGap + hco3;

            if (deltaDelta > 28) {
                anionGapInfo += ' + Metabolic Alkalosis';
            } else if (deltaDelta < 22) {
                anionGapInfo += ' + Non-Gap Acidosis';
            }
        } else {
            anionGapInfo = `Normal Anion Gap (${correctedAG.toFixed(1)})`;
        }
    }

    // 5. Delta Ratio (if valid)
    // Delta Ratio = Delta AG / (24 - HCO3)
    if (deltaGap !== null && hco3 < 24) {
        // Avoid division by zero if HCO3 is 24, though logic implies HCO3 < 24 for AG acidosis usually
        const denominator = 24 - hco3;
        if (denominator !== 0) {
            const ratio = deltaGap / denominator;
            let ratioInterp = '';
            if (ratio < 0.4) ratioInterp = 'Hyperchloremic normal anion gap acidosis';
            else if (ratio < 0.8) ratioInterp = 'Combined high AG and normal AG acidosis';
            else if (ratio < 2.0) ratioInterp = 'Pure high anion gap metabolic acidosis';
            else ratioInterp = 'High AG acidosis + Metabolic Alkalosis';

            deltaRatioInfo = `Delta Ratio: ${ratio.toFixed(2)} (${ratioInterp})`;
        }
    }

    // 6. Construct additional results
    const additionalResults: Array<{ label: string; value: string; unit?: string }> = [];

    if (anionGapInfo) {
        additionalResults.push({
            label: 'Anion Gap Assessment',
            value: anionGapInfo
        });
    }

    if (deltaRatioInfo) {
        additionalResults.push({
            label: 'Delta Ratio Analysis',
            value: deltaRatioInfo
        });
    }

    return {
        score: correctedAG || 0, // Using AG as the "score" for metadata purposes
        interpretation: primaryDisorder,
        severity: alertClass,
        additionalResults: additionalResults.length > 0 ? additionalResults : undefined
    };
};
