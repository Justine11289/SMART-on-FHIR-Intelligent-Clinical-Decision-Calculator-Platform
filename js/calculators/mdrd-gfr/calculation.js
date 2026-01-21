export const calculateMDRD = values => {
    const age = Number(values['mdrd-age']);
    const creatinine = Number(values['mdrd-creatinine']);
    const gender = values['mdrd-gender'];
    const race = values['mdrd-race'];
    if (!age || !creatinine)
        return null;
    const isFemale = gender === 'female';
    const isAA = race === 'aa';
    // MDRD Formula: 175 * (Scr)^-1.154 * (Age)^-0.203
    let gfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203);
    // Adjustments
    if (isFemale)
        gfr *= 0.742;
    if (isAA)
        gfr *= 1.212;
    let stage = '';
    let alertClass = 'info';
    let alertMsg = '';
    if (gfr >= 90) {
        stage = 'Stage 1 (Normal or high)';
        alertClass = 'success';
        alertMsg = 'Normal kidney function.';
    }
    else if (gfr >= 60) {
        stage = 'Stage 2 (Mild)';
        alertClass = 'success';
        alertMsg = 'Mildly decreased kidney function.';
    }
    else if (gfr >= 45) {
        stage = 'Stage 3a (Mild to moderate)';
        alertClass = 'warning';
        alertMsg = 'Mild to moderate reduction in kidney function.';
    }
    else if (gfr >= 30) {
        stage = 'Stage 3b (Moderate to severe)';
        alertClass = 'warning';
        alertMsg = 'Moderate to severe reduction in kidney function. Consider nephrology referral.';
    }
    else if (gfr >= 15) {
        stage = 'Stage 4 (Severe)';
        alertClass = 'danger';
        alertMsg = 'Severe reduction in kidney function. Nephrology referral required.';
    }
    else {
        stage = 'Stage 5 (Kidney failure)';
        alertClass = 'danger';
        alertMsg = 'Kidney failure. Consider dialysis or transplantation.';
    }
    return [
        {
            label: 'Estimated GFR',
            value: gfr.toFixed(0),
            unit: 'mL/min/1.73m²',
            interpretation: stage,
            alertClass: alertClass
        }
    ];
};
