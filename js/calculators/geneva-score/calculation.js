export const calculateGenevaScore = values => {
    let score = 0;
    // Radios (value '1' adds 1 point)
    const radioKeys = [
        'geneva-age',
        'geneva-prev-dvt',
        'geneva-surgery',
        'geneva-malignancy',
        'geneva-limb-pain',
        'geneva-hemoptysis',
        'geneva-palpation'
    ];
    radioKeys.forEach(key => {
        if (values[key] === '1') {
            score += 1;
        }
    });
    // Heart Rate
    const hr = values['geneva-hr'] !== '' &&
        values['geneva-hr'] !== undefined &&
        values['geneva-hr'] !== null
        ? Number(values['geneva-hr'])
        : null;
    if (hr !== null) {
        if (hr >= 75 && hr <= 94) {
            score += 1;
        }
        else if (hr >= 95) {
            score += 2;
        }
    }
    let riskLevel = 'Low Risk';
    let alertClass = 'success';
    let prevalence = '8%';
    let recommendation = 'PE is unlikely. Consider D-dimer testing. If negative, PE can be excluded.';
    if (score <= 1) {
        riskLevel = 'Low Risk';
        alertClass = 'success';
        prevalence = '8%';
        recommendation =
            'PE is unlikely. Consider D-dimer testing. If negative, PE can be excluded.';
    }
    else if (score <= 4) {
        riskLevel = 'Intermediate Risk';
        alertClass = 'warning';
        prevalence = '28%';
        recommendation = 'Consider imaging (CT pulmonary angiography) or age-adjusted D-dimer.';
    }
    else {
        riskLevel = 'High Risk';
        alertClass = 'danger';
        prevalence = '74%';
        recommendation = 'PE is likely. Proceed directly to CT pulmonary angiography.';
    }
    return [
        {
            label: 'Total Score',
            value: score.toString(),
            unit: 'points',
            interpretation: riskLevel,
            alertClass: alertClass
        },
        {
            label: 'PE Prevalence',
            value: prevalence,
            alertClass: alertClass
        },
        {
            label: 'Recommendation',
            value: recommendation, // Not used in display but keeps data
            alertPayload: {
                type: alertClass,
                message: `<strong>Recommendation:</strong> ${recommendation}`
            }
        }
    ];
};
