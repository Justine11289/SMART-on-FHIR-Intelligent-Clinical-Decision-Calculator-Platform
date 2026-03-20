export const calculateFourPeps = values => {
    let score = 0;
    // Age scoring
    // Note: unified calculator passes values as strings or numbers, so we parse safely
    const ageVal = values['fourpeps-age'];
    const age = typeof ageVal === 'string'
        ? parseFloat(ageVal)
        : typeof ageVal === 'number'
            ? ageVal
            : null;
    if (age !== null && !isNaN(age)) {
        if (age < 50) {
            score += -2;
        }
        else if (age <= 64) {
            score += -1;
        }
        // >64 is 0 points
    }
    // Radio group scoring
    const radioGroups = [
        '4peps-sex',
        '4peps-resp_disease',
        '4peps-hr',
        '4peps-chest_pain',
        '4peps-estrogen',
        '4peps-vte',
        '4peps-syncope',
        '4peps-immobility',
        '4peps-o2_sat',
        '4peps-calf_pain',
        '4peps-pe_likely'
    ];
    radioGroups.forEach(name => {
        const val = values[name];
        if (val !== null && val !== undefined && val !== '') {
            score += parseInt(val, 10);
        }
    });
    let probability = '';
    let riskLevel = '';
    let recommendation = '';
    let alertType = 'info';
    if (score < 0) {
        probability = '<2%';
        riskLevel = 'Very low CPP';
        alertType = 'success';
        recommendation = 'PE can be ruled out.';
    }
    else if (score <= 5) {
        probability = '2-20%';
        riskLevel = 'Low CPP';
        alertType = 'success';
        recommendation = 'PE can be ruled out if D-dimer level <1.0 µg/mL.';
    }
    else if (score <= 12) {
        probability = '20-65%';
        riskLevel = 'Moderate CPP';
        alertType = 'warning';
        recommendation = 'PE can be ruled out if D-dimer level <0.5 µg/mL OR <(age x 0.01) µg/mL.';
    }
    else {
        probability = '>65%';
        riskLevel = 'High CPP';
        alertType = 'danger';
        recommendation = 'PE cannot be ruled out without imaging testing.';
    }
    const results = [
        {
            label: '4PEPS Score',
            value: score.toString(),
            unit: 'points',
            interpretation: riskLevel,
            alertClass: alertType
        },
        {
            label: 'Clinical Pretest Probability',
            value: probability,
            alertClass: alertType
        },
        {
            label: 'Recommendation',
            value: recommendation, // Value is mandatory, using message as value or separate payload
            alertClass: alertType,
            alertPayload: {
                type: alertType,
                message: `<strong>Recommendation:</strong> ${recommendation}`
            }
        }
    ];
    return results;
};
