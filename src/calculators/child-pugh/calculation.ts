import { AlertSeverity } from '../../types/calculator-base.js';
import { FormulaResultItem } from '../../types/calculator-formula.js';

export function childPughCalculation(
    values: Record<string, number | string | boolean>
): FormulaResultItem[] {
    const biliInput = values['bilirubin'];
    const albInput = values['albumin'];
    const inrInput = values['inr'];
    const ascitesInput = values['ascites'];
    const encephInput = values['encephalopathy'];

    if (
        biliInput === undefined ||
        albInput === undefined ||
        inrInput === undefined ||
        !ascitesInput ||
        !encephInput
    ) {
        return [];
    }

    const bili = Number(biliInput);
    const alb = Number(albInput);
    const inr = Number(inrInput);
    const ascitesPoints = Number(ascitesInput);
    const encephPoints = Number(encephInput);

    if (isNaN(bili) || isNaN(alb) || isNaN(inr) || isNaN(ascitesPoints) || isNaN(encephPoints)) {
        return [];
    }

    // Points Calculation
    let biliPoints = 0;
    if (bili < 2) biliPoints = 1;
    else if (bili <= 3) biliPoints = 2;
    else biliPoints = 3;

    let albPoints = 0;
    if (alb > 3.5) albPoints = 1;
    else if (alb >= 2.8) albPoints = 2;
    else albPoints = 3;

    let inrPoints = 0;
    if (inr < 1.7) inrPoints = 1;
    else if (inr <= 2.3) inrPoints = 2;
    else inrPoints = 3;

    const totalScore = biliPoints + albPoints + inrPoints + ascitesPoints + encephPoints;

    // Interpretation
    let classification = '';
    let prognosis = '';
    let alertClass: AlertSeverity = 'info';

    if (totalScore <= 6) {
        classification = 'Child Class A';
        prognosis =
            'Well-compensated disease - Good prognosis\nLife Expectancy: 15-20 years\nSurgical Mortality: 10%';
        alertClass = 'success';
    } else if (totalScore <= 9) {
        classification = 'Child Class B';
        prognosis =
            'Significant functional compromise - Moderate prognosis\nLife Expectancy: 4-14 years\nSurgical Mortality: 30%';
        alertClass = 'warning';
    } else {
        classification = 'Child Class C';
        prognosis =
            'Decompensated disease - Poor prognosis\nLife Expectancy: 1-3 years\nSurgical Mortality: 82%';
        alertClass = 'danger';
    }

    return [
        {
            label: 'Total Score',
            value: totalScore,
            unit: 'points',
            interpretation: classification,
            alertClass: alertClass,
            alertPayload: {
                prognosis
            }
        }
    ];
}
