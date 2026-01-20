import { AlertSeverity } from '../../types/calculator-base.js';
import { FormulaResultItem } from '../../types/calculator-formula.js';

export function qsofaCalculation(
    values: Record<string, number | string | boolean>
): FormulaResultItem[] {
    const rrInput = values['rr'];
    const sbpInput = values['sbp'];
    const gcsInput = values['gcs'];
    const amsInput = values['ams'];

    if (
        rrInput === undefined &&
        sbpInput === undefined &&
        gcsInput === undefined &&
        amsInput === undefined
    ) {
        return [];
    }

    const rr = Number(rrInput);
    const sbp = Number(sbpInput);
    const gcs = Number(gcsInput);

    // Validate required numbers if they are non-empty strings
    if (rrInput !== '' && isNaN(rr)) return [];
    if (sbpInput !== '' && isNaN(sbp)) return [];
    if (gcsInput !== '' && isNaN(gcs)) return [];

    let score = 0;
    const metCriteria: string[] = [];

    // 1. Respiratory Rate >= 22
    if (!isNaN(rr) && rr >= 22) {
        score++;
        metCriteria.push('Respiratory Rate ≥ 22');
    }

    // 2. Systolic Blood Pressure <= 100
    if (!isNaN(sbp) && sbp <= 100) {
        score++;
        metCriteria.push('SBP ≤ 100 mmHg');
    }

    // 3. Altered Mental Status (GCS < 15)
    // Supports either explicit GCS number or simple "Yes/No" toggle
    const isAMS = (!isNaN(gcs) && gcs < 15) || amsInput === 'yes';
    if (isAMS) {
        score++;
        metCriteria.push('Altered Mental Status (GCS < 15)');
    }

    let interpretation = '';
    let alertClass: AlertSeverity = 'success';
    let recommendation = '';

    if (score >= 2) {
        interpretation = 'Positive Screen (High Risk)';
        alertClass = 'danger';
        recommendation = 'Assess for organ dysfunction; Calculate full SOFA; Measure lactate.';
    } else {
        interpretation = 'Negative Screen (Lower Risk)';
        alertClass = 'success';
        recommendation = 'Continue monitoring; Re-evaluate if condition changes.';
    }

    return [
        {
            label: 'qSOFA Score',
            value: score,
            unit: 'points',
            interpretation: interpretation,
            alertClass: alertClass,
            alertPayload: {
                metCriteria,
                recommendation
            }
        }
    ];
}
