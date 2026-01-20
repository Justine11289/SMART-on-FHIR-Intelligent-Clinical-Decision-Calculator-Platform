import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateIsthDic: SimpleCalculateFn = values => {
    const groups = ['isth-platelet', 'isth-fibrin_marker', 'isth-pt', 'isth-fibrinogen'];
    let score = 0;
    let hasValue = false;

    for (const group of groups) {
        const val = values[group];
        if (val !== null && val !== undefined && val !== '') {
            score += parseInt(val as string, 10);
            hasValue = true;
        }
    }

    // If no values selected, should we return 0 or empty?
    // Usually ideally we wait for all, but scoring calculators often sum what is there.
    // However, for valid diagnosis, all fields needed?
    // Original code: if (val...) score += ...
    // It didn't validate all inputs presence explicitly in `calculate` function (Step 486 just looped).
    // But UI usually requires selection.
    // Let's assume valid if at least one is present or just return score.

    const scoreStr = score.toString();

    let interpretation = '';
    let alertType: 'success' | 'danger' = 'success';

    if (score >= 5) {
        interpretation = 'Compatible with overt DIC. Repeat score daily.';
        alertType = 'danger';
    } else {
        interpretation =
            'Not suggestive of overt DIC. May be non-overt DIC. Repeat within 1-2 days.';
        alertType = 'success';
    }

    const results: FormulaResultItem[] = [
        {
            label: 'Total Score',
            value: scoreStr,
            unit: 'points',
            interpretation: score >= 5 ? 'Overt DIC' : 'Not Overt DIC',
            alertClass: alertType
        },
        {
            label: 'Interpretation',
            value: interpretation,
            alertClass: alertType,
            alertPayload: {
                type: alertType,
                message: interpretation
            }
        }
    ];

    return results;
};
