import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculate6MWD: SimpleCalculateFn = values => {
    const age = Number(values['mwd6-age']);
    const heightCm = Number(values['mwd6-height']);
    const weightKg = Number(values['mwd6-weight']);
    const gender = values['mwd6-gender'] as string;
    const actualDistance = values['mwd6-distance'] ? Number(values['mwd6-distance']) : null;

    if (!age || !heightCm || !weightKg || isNaN(age) || isNaN(heightCm) || isNaN(weightKg)) {
        return null;
    }

    // Enright, P L, & Sherrill, D L. (1998). Reference equations for the six-minute walk.
    let expectedDistance = 0;
    if (gender === 'male') {
        expectedDistance = 7.57 * heightCm - 5.02 * age - 1.76 * weightKg - 309;
    } else {
        // female
        expectedDistance = 2.11 * heightCm - 2.29 * weightKg - 5.78 * age + 667;
    }

    // Lower limit of normal: subtract 153 m for men and women
    const lowerLimitNormal = expectedDistance - 153;

    const results: FormulaResultItem[] = [
        {
            label: 'Expected Distance',
            value: expectedDistance.toFixed(0),
            unit: 'meters'
        },
        {
            label: 'Lower Limit of Normal',
            value: lowerLimitNormal.toFixed(0),
            unit: 'meters'
        }
    ];

    // If actual distance is provided, calculate % of expected
    if (actualDistance !== null && !isNaN(actualDistance)) {
        const percentage = (actualDistance / expectedDistance) * 100;
        results.push({
            label: '% of Expected',
            value: percentage.toFixed(0),
            unit: '%',
            interpretation: percentage < 80 ? 'Reduced' : 'Normal',
            alertClass: percentage < 80 ? 'warning' : 'success'
        });
    }

    return results;
};
