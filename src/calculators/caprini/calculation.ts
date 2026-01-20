import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateCaprini: SimpleCalculateFn = values => {
    let score = 0;

    // Sum all values (assuming all inputs are numeric or string numbers)
    // The keys will be the field IDs.
    Object.values(values).forEach(val => {
        const num = parseInt(val as string, 10);
        if (!isNaN(num)) {
            score += num;
        }
    });

    let riskCategory = '';
    let recommendation = '';
    let alertClass: 'success' | 'info' | 'warning' | 'danger' = 'success';

    if (score === 0) {
        riskCategory = 'Lowest Risk';
        recommendation = 'Early ambulation.';
        alertClass = 'success';
    } else if (score >= 1 && score <= 2) {
        riskCategory = 'Low Risk';
        recommendation =
            'Mechanical prophylaxis (e.g., intermittent pneumatic compression devices).';
        alertClass = 'info';
    } else if (score >= 3 && score <= 4) {
        riskCategory = 'Moderate Risk';
        recommendation = 'Pharmacologic prophylaxis (e.g., LMWH or UFH) OR Mechanical prophylaxis.';
        alertClass = 'warning';
    } else {
        riskCategory = 'High Risk';
        recommendation =
            'Pharmacologic prophylaxis (e.g., LMWH or UFH) AND Mechanical prophylaxis.';
        alertClass = 'danger';
    }

    return [
        {
            label: 'Total Score',
            value: score.toString(),
            unit: 'points',
            interpretation: riskCategory,
            alertClass: alertClass
        },
        {
            label: 'Recommendation',
            value: recommendation,
            alertPayload: {
                type: alertClass,
                message: `<strong>Recommendation:</strong> ${recommendation}`
            }
        }
    ];
};
