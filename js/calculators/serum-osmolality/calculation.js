export function serumOsmolalityCalculation(values) {
    const naInput = values['osmo-na'];
    const glucoseInput = values['osmo-glucose'];
    const bunInput = values['osmo-bun'];
    const ethanolInput = values['osmo-ethanol'];
    if (naInput === undefined ||
        naInput === null ||
        naInput === '' ||
        glucoseInput === undefined ||
        glucoseInput === null ||
        glucoseInput === '' ||
        bunInput === undefined ||
        bunInput === null ||
        bunInput === '') {
        return [];
    }
    const na = Number(naInput);
    const glucose = Number(glucoseInput);
    const bun = Number(bunInput);
    const ethanol = ethanolInput ? Number(ethanolInput) : 0;
    if (isNaN(na) || isNaN(glucose) || isNaN(bun) || isNaN(ethanol)) {
        return [];
    }
    // Formula: 2 * Na + Glucose / 18 + BUN / 2.8 + Ethanol / 4.6
    // Assumes standard units: Na (mEq/L), Glucose (mg/dL), BUN (mg/dL), Ethanol (mg/dL)
    const naTerm = 2 * na;
    const glucoseTerm = glucose / 18;
    const bunTerm = bun / 2.8;
    const ethanolTerm = ethanol / 4.6;
    const score = naTerm + glucoseTerm + bunTerm + ethanolTerm;
    let interpretation = '';
    let alertClass = 'success';
    let alertMsg = 'Within normal range.';
    if (score < 275) {
        interpretation = 'Low Osmolality';
        alertClass = 'info';
        alertMsg = 'Below normal range (275-295 mOsm/kg).';
    }
    else if (score > 295) {
        interpretation = 'High Osmolality';
        alertClass = 'warning';
        alertMsg = 'Above normal range (275-295 mOsm/kg).';
    }
    const breakdown = {
        naTerm: Number(naTerm.toFixed(1)),
        glucoseTerm: Number(glucoseTerm.toFixed(1)),
        bunTerm: Number(bunTerm.toFixed(1)),
        ethanolTerm: Number(ethanolTerm.toFixed(1))
    };
    return [
        {
            label: 'Calculated Osmolality',
            value: Number(score.toFixed(1)),
            unit: 'mOsm/kg',
            interpretation: interpretation,
            alertClass: alertClass,
            alertPayload: {
                breakdown,
                alertMsg
            }
        }
    ];
}
