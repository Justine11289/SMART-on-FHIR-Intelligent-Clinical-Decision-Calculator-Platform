import { FormulaResultItem } from '../../types/calculator-formula.js';

export interface MeldNaBreakdown {
    originalMeld: number;
    adjustedBili: number;
    adjustedInr: number;
    adjustedCreat: number;
    cappedForDialysis: boolean;
}

export const meldNaCalculation = (values: Record<string, any>): FormulaResultItem[] => {
    const bili = values['bili'] as number;
    const inr = values['inr'] as number;
    const creat = values['creat'] as number;
    const sodium = values['sodium'] as number;
    const onDialysis = values['dialysis'] === 'yes';

    // Check for null/undefined (allow 0 to pass through if logic permits, though 0 bili/inr is invalid clinically)
    if (bili === null || inr === null || creat === null || sodium === null) {
        return [];
    }

    // Apply UNOS/OPTN rules
    const adjustedBili = Math.max(bili, 1.0);
    const adjustedInr = Math.max(inr, 1.0);
    let adjustedCreat = Math.max(creat, 1.0);
    let cappedForDialysis = false;

    if (onDialysis || adjustedCreat > 4.0) {
        adjustedCreat = 4.0;
        cappedForDialysis = true;
    }

    // Calculate original MELD
    let meldScore =
        0.957 * Math.log(adjustedCreat) +
        0.378 * Math.log(adjustedBili) +
        1.12 * Math.log(adjustedInr) +
        0.643;

    // UNOS policy: Multiply by 10 and round to nearest tenth
    meldScore = meldScore * 10;
    meldScore = Math.round(meldScore * 10) / 10;

    // Calculate MELD-Na
    let meldNaScore = meldScore;
    const adjustedSodium = Math.max(125, Math.min(137, sodium));

    if (meldScore > 11) {
        meldNaScore =
            meldScore + 1.32 * (137 - adjustedSodium) - 0.033 * meldScore * (137 - adjustedSodium);
    }

    // Final score capping
    meldNaScore = Math.max(6, Math.min(40, meldNaScore));
    meldNaScore = Math.round(meldNaScore);

    let riskCategory = '';
    let mortalityRate = '';
    let alertClass: any = 'info';

    if (meldNaScore < 10) {
        riskCategory = 'Low Risk';
        mortalityRate = '1.9%';
        alertClass = 'success';
    } else if (meldNaScore <= 19) {
        riskCategory = 'Low-Moderate Risk';
        mortalityRate = '6.0%';
        alertClass = 'info';
    } else if (meldNaScore <= 29) {
        riskCategory = 'Moderate Risk';
        mortalityRate = '19.6%';
        alertClass = 'warning';
    } else if (meldNaScore <= 39) {
        riskCategory = 'High Risk';
        mortalityRate = '52.6%';
        alertClass = 'danger';
    } else {
        riskCategory = 'Very High Risk';
        mortalityRate = '71.3%';
        alertClass = 'danger';
    }

    const breakdown: MeldNaBreakdown = {
        originalMeld: meldScore,
        adjustedBili,
        adjustedInr,
        adjustedCreat,
        cappedForDialysis
    };

    return [
        {
            label: 'MELD-Na Score',
            value: meldNaScore,
            unit: 'points',
            interpretation: `${riskCategory} (90-Day Mortality: ${mortalityRate})`,
            alertClass: alertClass,
            alertPayload: {
                breakdown
            }
        }
    ];
};
