const FEMALE_COEFFS = {
    intercept: -7.0804,
    crp: 0.0915,
    creatinine: 0.6092,
    st: 0.0328,
    lvef35to50: -1.0953,
    lvefLess50: -1.9474,
    age: 0.1825,
    arrest: 1.2567,
    killip: 1.0503,
    hr: 0.2408,
    bp: 0.8192,
    glycemia: 0.4019,
    leftMain: 0.6397,
    timi: 0.7198
};
const MALE_COEFFS = {
    intercept: -7.9666,
    crp: 0.0696,
    creatinine: 0.604,
    st: 0.768,
    lvef35to50: -1.2722,
    lvefLess50: -2.0153,
    age: 0.2635,
    arrest: 1.1459,
    killip: 0.6849,
    hr: 0.5386,
    bp: 0.7062,
    glycemia: 0.8375,
    leftMain: 0.9036,
    timi: 0.4966
};
export const calculateSexShock = values => {
    const getVal = (name) => {
        const v = values[name];
        return typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : 0;
    };
    const getFloat = (name) => {
        const v = values[name];
        return typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : 0;
    };
    const sex = getVal('sex-shock-sex');
    const isFemale = sex === 1;
    const coeffs = isFemale ? FEMALE_COEFFS : MALE_COEFFS;
    const age70 = getVal('sex-shock-age');
    const arrest = getVal('sex-shock-arrest');
    const killip = getVal('sex-shock-killip');
    const hr = getVal('sex-shock-hr');
    const bp = getVal('sex-shock-bp');
    const timi = getVal('sex-shock-timi');
    const leftMain = getVal('sex-shock-left-main');
    const st = getVal('sex-shock-st');
    const lvef = getFloat('sex-shock-lvef');
    const glycemia = getVal('sex-shock-glycemia');
    const creatinine = getFloat('sex-shock-creatinine');
    const crp = getFloat('sex-shock-crp');
    let Y = coeffs.intercept;
    if (crp > 0) {
        Y += coeffs.crp * Math.log2(crp + 1);
    }
    if (creatinine > 0) {
        Y += coeffs.creatinine * Math.log2(creatinine * 88.4); // Convert mg/dL to umol/L
    }
    Y += coeffs.st * st;
    // LVEF adjustment
    if (lvef === 55) {
        Y += coeffs.lvefLess50; // >50% (protective)  <-- Wait, logic in original was lvefLess50 for 55?
        // Let's check original logic carefully.
        // Original: if (lvef === 55) Y += coeffs.lvefLess50;
        // Wait, 55 option label says "> 50%".
        // coeffs.lvefLess50 is -2.0153 (Male) / -1.9474 (Female).
        // If >50%, risk should be LOWER? The coefficient is negative, so risk decreases.
        // But the variable name "lvefLess50" implies <50%.
        // Let's check the other one:
        // if (lvef === 42.5) Y += coeffs.lvef35to50;
        // coeffs.lvef35to50 is -1.2722.
        // coeffs.lvefLess50 is -2.0153.
        // So 55 (>50%) gets a bigger negative (more protection) than 35-50%.
        // So the usage is correct for the logic, but the variable name in original `SexShockCoeffs` might be confusing.
        // In original FEMALE_COEFFS: lvefLess50: -1.9474.
        // I will preserve exact original logic.
    }
    else if (lvef === 42.5) {
        Y += coeffs.lvef35to50; // 35-50%
    }
    // lvef === 30 (<35%) is baseline, no adjustment
    Y += coeffs.age * age70;
    Y += coeffs.arrest * arrest;
    Y += coeffs.killip * killip;
    Y += coeffs.hr * hr;
    Y += coeffs.bp * bp;
    Y += coeffs.glycemia * glycemia;
    Y += coeffs.leftMain * leftMain;
    Y += coeffs.timi * timi;
    const risk = (1 / (1 + Math.exp(-Y))) * 100;
    const score = Math.round(risk * 10) / 10; // Round to 1 decimal
    let riskLevel = '';
    let alertType = 'success';
    if (score < 5) {
        riskLevel = 'Low Risk';
        alertType = 'success';
    }
    else if (score < 15) {
        riskLevel = 'Moderate Risk';
        alertType = 'warning';
    }
    else if (score < 30) {
        riskLevel = 'High Risk';
        alertType = 'danger';
    }
    else {
        riskLevel = 'Very High Risk';
        alertType = 'danger';
    }
    const results = [
        {
            label: 'In-Hospital Cardiogenic Shock Risk',
            value: score.toFixed(1),
            unit: '%',
            interpretation: riskLevel,
            alertClass: alertType
        }
    ];
    return results;
};
