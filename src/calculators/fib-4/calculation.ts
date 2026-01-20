import { AlertSeverity } from '../../types/calculator-base.js';
import { FormulaResultItem } from '../../types/calculator-formula.js';

export function fib4Calculation(
    values: Record<string, number | string | boolean>
): FormulaResultItem[] {
    const age = Number(values['fib4-age']);
    const ast = Number(values['fib4-ast']);
    const alt = Number(values['fib4-alt']);
    const plt = Number(values['fib4-plt']);

    // Check for valid inputs
    if (
        isNaN(age) ||
        isNaN(ast) ||
        isNaN(alt) ||
        isNaN(plt) ||
        plt === 0 ||
        alt < 0 ||
        age <= 0 ||
        ast <= 0
    ) {
        return [];
    }

    // Formula: (Age * AST) / (Platelets * sqrt(ALT))
    // Note: User input checks should handle PLT units but here we assume standardized input if configured correctly.
    // Standard units: Age (years), AST (U/L), ALT (U/L), Platelets (10^9/L or K/uL - same value)

    const score = (age * ast) / (plt * Math.sqrt(alt));

    // Interpretation
    let interpretation = '';
    let alertClass: AlertSeverity = 'info';

    if (score < 1.3) {
        interpretation = 'Low Risk (Low probability of advanced fibrosis F3-F4)';
        alertClass = 'success';
    } else if (score > 2.67) {
        interpretation = 'High Risk (High probability of advanced fibrosis F3-F4)';
        alertClass = 'danger';
    } else {
        interpretation = 'Indeterminate Risk';
        alertClass = 'warning';
    }

    return [
        {
            label: 'FIB-4 Score',
            value: Number(score.toFixed(2)),
            unit: 'points',
            interpretation: interpretation,
            alertClass: alertClass
        }
    ];
}
