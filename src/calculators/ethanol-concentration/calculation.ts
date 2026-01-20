import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateEthanolConcentration: SimpleCalculateFn = values => {
    const volumeMl = Number(values['eth-amount']);
    const abv = Number(values['eth-abv']);
    const weightKg = Number(values['eth-weight']);
    const gender = values['eth-gender'] as string;

    if (!volumeMl || !abv || !weightKg || isNaN(volumeMl) || isNaN(abv) || isNaN(weightKg)) {
        return null;
    }

    if (weightKg <= 0) {
        return null;
    }

    // Vd (Volume of Distribution)
    // Male: 0.68 L/kg, Female: 0.55 L/kg
    const volumeDistribution = gender === 'male' ? 0.68 : 0.55;

    // Grams of Alcohol = Volume(mL) * (ABV%/100) * Density(0.789 g/mL)
    const gramsAlcohol = volumeMl * (abv / 100) * 0.789;

    // Concentration = Grams / Total Body Water(L)
    // Result in g/L. Convert to mg/dL by multiplying by 100.
    const concentrationMgDl = (gramsAlcohol * 1000) / (weightKg * volumeDistribution * 10);

    let severityText = 'Below Legal Limit';
    let alertClass: 'success' | 'warning' | 'danger' = 'success';

    if (concentrationMgDl >= 400) {
        severityText = 'Potentially Fatal Level';
        alertClass = 'danger';
    } else if (concentrationMgDl >= 300) {
        severityText = 'Severe Intoxication';
        alertClass = 'danger';
    } else if (concentrationMgDl >= 80) {
        severityText = 'Above Legal Limit (0.08%)';
        alertClass = 'warning';
    }

    const results: FormulaResultItem[] = [
        {
            label: 'Estimated Concentration',
            value: concentrationMgDl.toFixed(0),
            unit: 'mg/dL',
            interpretation: severityText,
            alertClass: alertClass
        }
    ];

    return results;
};
