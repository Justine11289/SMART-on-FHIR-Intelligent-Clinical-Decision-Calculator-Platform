import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateGuptaMica: SimpleCalculateFn = values => {
    const age = values['mica-age'] ? parseFloat(values['mica-age'] as string) : null;
    const creat = values['mica-creat'] ? parseFloat(values['mica-creat'] as string) : null;
    const functionalStatus = parseFloat((values['mica-status'] as string) || '0');
    const asaClass = parseFloat((values['mica-asa'] as string) || '-6.17');
    const procedure = parseFloat((values['mica-procedure'] as string) || '-0.74');

    if (age === null || creat === null) {
        return [];
    }

    let x = -5.25;
    x += age * 0.02;
    x += functionalStatus;
    x += asaClass;
    if (creat >= 1.5) {
        x += 0.61;
    }
    x += procedure;

    const risk = (1 / (1 + Math.exp(-x))) * 100;
    const riskPercent = risk.toFixed(2);

    let riskLevel = 'Low Risk';
    let riskDescription = 'Low risk of postoperative MI or cardiac arrest';
    let alertType: 'success' | 'warning' | 'danger' = 'success';

    if (risk > 5) {
        riskLevel = 'High Risk';
        riskDescription = 'High risk - Consider risk modification strategies';
        alertType = 'danger';
    } else if (risk > 2) {
        riskLevel = 'Intermediate Risk';
        riskDescription = 'Intermediate risk - Consider perioperative optimization';
        alertType = 'warning';
    }

    const componentsHtml = `
        <div class="text-sm text-muted">
            <p>Age Component: ${(age * 0.02).toFixed(2)}</p>
            <p>Functional Status: ${functionalStatus.toFixed(2)}</p>
            <p>ASA Class: ${asaClass.toFixed(2)}</p>
            <p>Creatinine (≥1.5 mg/dL): ${creat >= 1.5 ? '0.61' : '0.00'}</p>
            <p>Procedure Type: ${procedure.toFixed(2)}</p>
            <p><strong>X Value: ${x.toFixed(2)}</strong></p>
        </div>
    `;

    return [
        {
            label: 'Cardiac Risk',
            value: riskPercent,
            unit: '%',
            interpretation: riskLevel,
            alertClass: alertType
        },
        {
            label: 'Risk Description',
            value: '',
            alertPayload: {
                type: alertType,
                message: riskDescription
            }
        },
        {
            label: 'Formula Components',
            value: '',
            alertPayload: {
                type: 'secondary', // Use alert to carry HTML content if renderer supports it?
                // The renderer below customizes this.
                // We'll pass the HTML content in alertPayload for now or a custom field if we could.
                // But since we use customResultRenderer in index.ts, we can access this item.
                message: componentsHtml,
                isHtml: true
            }
        }
    ];
};
