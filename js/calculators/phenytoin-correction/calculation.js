export function phenytoinCorrectionCalculation(values) {
    const totalInput = values['pheny-total'];
    const albuminInput = values['pheny-albumin'];
    const renalStatus = values['pheny-renal'];
    if (totalInput === undefined ||
        totalInput === null ||
        totalInput === '' ||
        albuminInput === undefined ||
        albuminInput === null ||
        albuminInput === '' ||
        !renalStatus) {
        return [];
    }
    const total = Number(totalInput);
    const albumin = Number(albuminInput);
    if (isNaN(total) || isNaN(albumin)) {
        return [];
    }
    // Formula: Total / (((1 - K) * Albumin / 4.4) + K)
    // K = 0.2 if renal failure (CrCl < 10), else 0.1
    const K = renalStatus === 'yes' ? 0.2 : 0.1;
    // Avoid division by zero if albumin and K result in 0 (highly unlikely mathematically for positive K)
    const denominator = ((1 - K) * albumin) / 4.4 + K;
    if (denominator === 0)
        return [];
    const corrected = total / denominator;
    let interpretation = '';
    let alertClass = 'success';
    let alertMsg = 'Within therapeutic range.';
    if (corrected < 10) {
        interpretation = 'Subtherapeutic';
        alertClass = 'info';
        alertMsg = 'Level is below therapeutic range (10-20 mcg/mL).';
    }
    else if (corrected > 20) {
        interpretation = 'Potentially Toxic';
        alertClass = 'danger';
        alertMsg = 'Level is above therapeutic range (>20 mcg/mL). Monitor for toxicity.';
    }
    return [
        {
            label: 'Corrected Phenytoin',
            value: Number(corrected.toFixed(1)),
            unit: 'mcg/mL',
            interpretation: interpretation,
            alertClass: alertClass,
            alertPayload: {
                alertMsg,
                measuredTotal: Number(total.toFixed(1))
            }
        }
    ];
}
