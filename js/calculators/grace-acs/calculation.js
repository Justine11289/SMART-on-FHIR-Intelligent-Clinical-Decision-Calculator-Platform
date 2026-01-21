export const calculateGraceAcs = values => {
    const parseInput = (val) => {
        if (val === undefined || val === null || val === '' || typeof val === 'boolean')
            return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    };
    const age = parseInput(values['grace-age']);
    const hr = parseInput(values['grace-hr']);
    const sbp = parseInput(values['grace-sbp']);
    const creatinine = parseInput(values['grace-creatinine']);
    // Require all numeric inputs
    if (age === null || hr === null || sbp === null || creatinine === null) {
        return [];
    }
    // Age points
    let agePoints = 0;
    if (age >= 40 && age <= 49)
        agePoints = 18;
    else if (age >= 50 && age <= 59)
        agePoints = 36;
    else if (age >= 60 && age <= 69)
        agePoints = 55;
    else if (age >= 70 && age <= 79)
        agePoints = 73;
    else if (age >= 80)
        agePoints = 91;
    // HR points
    let hrPoints = 0;
    if (hr >= 50 && hr <= 69)
        hrPoints = 0;
    else if (hr >= 70 && hr <= 89)
        hrPoints = 3;
    else if (hr >= 90 && hr <= 109)
        hrPoints = 7;
    else if (hr >= 110 && hr <= 149)
        hrPoints = 13;
    else if (hr >= 150 && hr <= 199)
        hrPoints = 23;
    else if (hr >= 200)
        hrPoints = 36;
    // SBP points
    let sbpPoints = 0;
    if (sbp >= 200)
        sbpPoints = 0;
    else if (sbp >= 160 && sbp <= 199)
        sbpPoints = 10;
    else if (sbp >= 140 && sbp <= 159)
        sbpPoints = 18;
    else if (sbp >= 120 && sbp <= 139)
        sbpPoints = 24;
    else if (sbp >= 100 && sbp <= 119)
        sbpPoints = 34;
    else if (sbp >= 80 && sbp <= 99)
        sbpPoints = 43;
    else if (sbp < 80)
        sbpPoints = 53;
    // Creatinine points
    let crPoints = 0;
    if (creatinine >= 0 && creatinine <= 0.39)
        crPoints = 1;
    else if (creatinine >= 0.4 && creatinine <= 0.79)
        crPoints = 4;
    else if (creatinine >= 0.8 && creatinine <= 1.19)
        crPoints = 7;
    else if (creatinine >= 1.2 && creatinine <= 1.59)
        crPoints = 10;
    else if (creatinine >= 1.6 && creatinine <= 1.99)
        crPoints = 13;
    else if (creatinine >= 2.0 && creatinine <= 3.99)
        crPoints = 21;
    else if (creatinine >= 4.0)
        crPoints = 28;
    // Radio points (assume values are string representations of points)
    const killip = values['grace-killip'] ? parseInt(values['grace-killip'], 10) : 0;
    const arrest = values['grace-cardiac-arrest']
        ? parseInt(values['grace-cardiac-arrest'], 10)
        : 0;
    const st = values['grace-st-deviation']
        ? parseInt(values['grace-st-deviation'], 10)
        : 0;
    const enzymes = values['grace-cardiac-enzymes']
        ? parseInt(values['grace-cardiac-enzymes'], 10)
        : 0;
    const score = agePoints + hrPoints + sbpPoints + crPoints + killip + arrest + st + enzymes;
    let inHospitalMortality = '<1%';
    let riskLevel = 'Low Risk';
    let alertClass = 'success';
    let riskDescription = 'Low risk of in-hospital mortality';
    if (score > 140) {
        inHospitalMortality = '>3%';
        riskLevel = 'High Risk';
        alertClass = 'danger';
        riskDescription =
            'High risk of in-hospital mortality - Consider intensive monitoring and aggressive intervention';
    }
    else if (score > 118) {
        inHospitalMortality = '1-3%';
        riskLevel = 'Intermediate Risk';
        alertClass = 'warning';
        riskDescription =
            'Intermediate risk of in-hospital mortality - Close monitoring recommended';
    }
    return [
        {
            label: 'Total GRACE Score',
            value: score.toString(),
            unit: 'points',
            interpretation: riskLevel,
            alertClass: alertClass
        },
        {
            label: 'In-Hospital Mortality Risk',
            value: inHospitalMortality,
            alertClass: alertClass
        },
        {
            label: 'Interpretation',
            value: riskDescription,
            alertPayload: {
                type: alertClass,
                message: `<strong>Interpretation:</strong> ${riskDescription}`
            }
        }
    ];
};
