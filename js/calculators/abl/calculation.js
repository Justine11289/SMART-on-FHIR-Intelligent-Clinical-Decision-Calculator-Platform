export const calculateABL = values => {
    const weightKg = Number(values['abl-weight']);
    const hgbInitial = Number(values['abl-hgb-initial']);
    const hgbFinal = Number(values['abl-hgb-final']);
    const avgBloodVolume = Number(values['abl-age-category']);
    if (!weightKg || !hgbInitial || !hgbFinal || !avgBloodVolume) {
        return null;
    }
    if (isNaN(weightKg) || isNaN(hgbInitial) || isNaN(hgbFinal) || isNaN(avgBloodVolume)) {
        return null;
    }
    // Initial hemoglobin must be greater than final/target
    if (hgbInitial <= hgbFinal) {
        return null;
    }
    // Estimated Blood Volume in mL
    const ebv = weightKg * avgBloodVolume;
    // Average Hemoglobin
    const hgbAvg = (hgbInitial + hgbFinal) / 2;
    // Allowable Blood Loss
    const ablValue = (ebv * (hgbInitial - hgbFinal)) / hgbAvg;
    const results = [
        {
            label: 'Maximum Allowable Blood Loss',
            value: ablValue.toFixed(0),
            unit: 'mL',
            alertClass: 'info'
        },
        {
            label: 'Estimated Blood Volume (EBV)',
            value: ebv.toFixed(0),
            unit: 'mL'
        },
        {
            label: 'Average Hemoglobin',
            value: hgbAvg.toFixed(1),
            unit: 'g/dL'
        }
    ];
    return results;
};
