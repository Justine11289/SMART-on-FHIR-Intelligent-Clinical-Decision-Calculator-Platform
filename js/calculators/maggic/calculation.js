// Points calculation helper
const getPoints = {
    age: (v) => v * 0.08,
    ef: (v) => v * -0.05,
    sbp: (v) => v * -0.02,
    bmi: (v) => {
        if (v < 20) {
            return 2;
        }
        if (v >= 20 && v < 25) {
            return 1;
        }
        if (v >= 25 && v < 30) {
            return 0;
        }
        if (v >= 30) {
            return -1;
        }
        return 0;
    },
    creatinine: (v) => {
        // v is in mg/dL
        if (v <= 0.9) {
            return 0;
        }
        if (v > 0.9 && v <= 1.3) {
            return 1;
        }
        if (v > 1.3 && v <= 2.2) {
            return 3;
        }
        if (v > 2.2) {
            return 5;
        }
        return 0;
    }
};
const getMortality = (score) => {
    const linearPredictor = 0.047 * (score - 21.6);
    const prob1yr = 1 - Math.pow(0.92, Math.exp(linearPredictor));
    const prob3yr = 1 - Math.pow(0.79, Math.exp(linearPredictor));
    return { prob1yr: (prob1yr * 100).toFixed(1), prob3yr: (prob3yr * 100).toFixed(1) };
};
export const calculateMaggic = values => {
    const getFloat = (key) => {
        const val = values[key];
        if (val === null || val === undefined || val === '')
            return null;
        return typeof val === 'string' ? parseFloat(val) : typeof val === 'number' ? val : null;
    };
    const getString = (key) => values[key] || '';
    const age = getFloat('maggic-age');
    const ef = getFloat('maggic-ef');
    const sbp = getFloat('maggic-sbp');
    const bmi = getFloat('maggic-bmi');
    const creatinine = getFloat('maggic-creatinine');
    const nyha = values['maggic-nyha'] ? getString('maggic-nyha') : null;
    if (age === null ||
        ef === null ||
        sbp === null ||
        bmi === null ||
        creatinine === null ||
        nyha === null) {
        return [];
    }
    let score = 0;
    score += getPoints.age(age);
    score += getPoints.ef(ef);
    score += getPoints.sbp(sbp);
    score += getPoints.bmi(bmi);
    score += getPoints.creatinine(creatinine);
    // Radio values
    const radios = [
        'maggic-gender',
        'maggic-smoker',
        'maggic-nyha',
        'maggic-diabetes',
        'maggic-copd',
        'maggic-hfdx',
        'maggic-bb',
        'maggic-acei'
    ];
    radios.forEach(name => {
        const val = values[name];
        if (val !== null && val !== undefined && val !== '') {
            score += parseInt(val, 10);
        }
    });
    const mortality = getMortality(score);
    const scoreFixed = score.toFixed(1);
    const results = [
        {
            label: 'Total MAGGIC Score',
            value: scoreFixed,
            unit: 'points'
        },
        {
            label: '1-Year Mortality Risk',
            value: mortality.prob1yr,
            unit: '%',
            alertClass: 'warning'
        },
        {
            label: '3-Year Mortality Risk',
            value: mortality.prob3yr,
            unit: '%',
            alertClass: 'danger'
        }
    ];
    return results;
};
