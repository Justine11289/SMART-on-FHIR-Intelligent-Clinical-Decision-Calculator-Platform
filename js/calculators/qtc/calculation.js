export function qtcCalculation(values) {
    const qtInput = values['qt'];
    const hrInput = values['hr'];
    const gender = values['gender'] || 'male'; // default male if not specified
    const formulaType = values['formula'] || 'bazett';
    if (qtInput === undefined || hrInput === undefined)
        return [];
    const qt = Number(qtInput);
    const hr = Number(hrInput);
    if (isNaN(qt) || isNaN(hr) || hr === 0)
        return [];
    // Calculate RR in seconds
    const rr = 60 / hr;
    let qtc = 0;
    let label = 'QTc';
    switch (formulaType) {
        case 'bazett':
            qtc = qt / Math.sqrt(rr);
            label = 'QTc (Bazett)';
            break;
        case 'fridericia':
            qtc = qt / Math.cbrt(rr);
            label = 'QTc (Fridericia)';
            break;
        case 'hodges':
            qtc = qt + 1.75 * (hr - 60);
            label = 'QTc (Hodges)';
            break;
        case 'framingham':
            qtc = qt + 154 * (1 - rr);
            label = 'QTc (Framingham)';
            break;
        default:
            qtc = qt / Math.sqrt(rr); // Default to Bazett
            label = 'QTc (Bazett)';
    }
    // Interpretation Logic
    // Male: Normal < 450
    // Female: Normal < 460
    // Both: > 500 High Risk
    const limit = gender === 'female' ? 460 : 450;
    let interpretation = 'Normal';
    let alertClass = 'success';
    let description = 'QTc is within normal range.';
    if (qtc > 500) {
        interpretation = 'Prolonged (High Risk)';
        alertClass = 'danger';
        description = 'Significantly increased risk of Torsades de Pointes.';
    }
    else if (qtc > limit) {
        interpretation = 'Prolonged';
        alertClass = 'warning';
        description = `Above normal limit for ${gender} (> ${limit} ms).`;
    }
    return [
        {
            label: label,
            value: Math.round(qtc),
            unit: 'ms',
            interpretation: interpretation,
            alertClass: alertClass,
            alertPayload: {
                description,
                limit
            }
        }
    ];
}
