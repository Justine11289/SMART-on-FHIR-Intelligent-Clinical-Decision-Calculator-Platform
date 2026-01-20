import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateBwps: SimpleCalculateFn = values => {
    let score = 0;

    // All inputs are Selects returning numeric strings or '0'.
    Object.values(values).forEach(val => {
        const num = parseInt(val as string, 10);
        if (!isNaN(num)) {
            score += num;
        }
    });

    let interpretation = '';
    let alertType: 'success' | 'warning' | 'danger' = 'success';

    if (score >= 45) {
        interpretation = 'Highly suggestive of thyroid storm';
        alertType = 'danger';
    } else if (score >= 25) {
        interpretation = 'Suggests impending storm';
        alertType = 'warning';
    } else {
        interpretation = 'Unlikely to represent thyroid storm';
        alertType = 'success';
    }

    return [
        {
            label: 'Total Score',
            value: score.toString(),
            unit: 'points',
            interpretation: interpretation,
            alertClass: alertType
        }
    ];
};
