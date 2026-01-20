import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateCharlson: SimpleCalculateFn = values => {
    let score = 0;

    // All inputs are radios returning '0' or points (e.g. '1', '2', '3', '6').
    // Just sum them up.
    Object.values(values).forEach(val => {
        const num = parseInt(val as string, 10);
        if (!isNaN(num)) {
            score += num;
        }
    });

    // Adjusted formula from literature
    // Survival = 100 * 0.983^(e^(score * 0.9))
    const survival = 100 * Math.pow(0.983, Math.exp(score * 0.9));

    return [
        {
            label: 'Charlson Comorbidity Index',
            value: score.toString(),
            unit: 'points'
        },
        {
            label: 'Estimated 10-year survival',
            value: `${survival.toFixed(0)}%`,
            unit: ''
        }
    ];
};
