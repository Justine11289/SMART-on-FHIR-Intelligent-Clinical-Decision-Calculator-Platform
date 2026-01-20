import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateNafldFibrosisScore: SimpleCalculateFn = values => {
    const getFloat = (key: string): number => {
        const val = values[key];
        return typeof val === 'string' ? parseFloat(val) : typeof val === 'number' ? val : NaN;
    };

    // Age and BMI are numbers
    const age = getFloat('age');
    const bmi = getFloat('bmi');
    const diabetes = parseInt((values['diabetes'] as string) || '0', 10);
    const ast = getFloat('ast');
    const alt = getFloat('alt');
    const platelet = getFloat('platelet');
    const albumin = getFloat('albumin');

    if (isNaN(age) || isNaN(bmi) || isNaN(ast) || isNaN(alt) || isNaN(platelet) || isNaN(albumin)) {
        return [];
    }

    if (alt === 0) return []; // Avoid division by zero

    const astAltRatio = ast / alt;

    const score =
        -1.675 +
        0.037 * age +
        0.094 * bmi +
        1.13 * diabetes +
        0.99 * astAltRatio -
        0.013 * platelet -
        0.66 * albumin;

    let stage = '';
    let interpretation = '';
    let alertType: 'success' | 'warning' | 'danger' | 'info' = 'info';

    if (score < -1.455) {
        stage = 'F0-F2';
        interpretation = 'Low probability of advanced fibrosis';
        alertType = 'success';
    } else if (score <= 0.675) {
        stage = 'Indeterminate';
        interpretation = 'Further testing needed (e.g., elastography)';
        alertType = 'warning';
    } else {
        stage = 'F3-F4';
        interpretation = 'High probability of advanced fibrosis';
        alertType = 'danger';
    }

    const results: FormulaResultItem[] = [
        {
            label: 'NAFLD Fibrosis Score',
            value: score.toFixed(3),
            unit: 'points',
            interpretation: stage,
            alertClass: alertType
        },
        {
            label: 'Interpretation',
            value: interpretation,
            alertClass: alertType,
            alertPayload: {
                type: alertType,
                message: `<strong>Interpretation:</strong> ${interpretation}`
            }
        }
    ];

    return results;
};
