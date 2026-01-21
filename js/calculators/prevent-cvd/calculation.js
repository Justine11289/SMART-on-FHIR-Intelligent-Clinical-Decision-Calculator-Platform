/**
 * AHA PREVENT CVD Risk Calculation Logic
 *
 * Predicts 10-year risk of cardiovascular disease based on the
 * AHA PREVENT (Predicting Risk of cardiovascular disease EVENTs) equations.
 *
 * Reference: Khan SS, et al. Development and Validation of the
 * American Heart Association's PREVENT Equations. Circulation. 2024.
 */
export const preventCoefficients = {
    female: {
        cage: 0.7939,
        cnhdl: 0.0305,
        chdl: -0.1607,
        csbp: -0.2394,
        csbp2: 0.36,
        diabetes: 0.8668,
        smoker: 0.5361,
        cegfr: 0.6046,
        cegfr2: 0.0434,
        antihtn: 0.3152,
        statin: -0.1478,
        csbp2_antihtn: -0.0664,
        cnhdl_statin: 0.1198,
        cage_cnhdl: -0.082,
        cage_chdl: 0.0307,
        cage_csbp2: -0.0946,
        cage_diabetes: -0.2706,
        cage_smoker: -0.0787,
        cage_cegfr: -0.1638,
        constant: -3.3077
    },
    male: {
        cage: 0.7689,
        cnhdl: 0.0736,
        chdl: -0.0954,
        csbp: -0.4347,
        csbp2: 0.3363,
        diabetes: 0.7693,
        smoker: 0.4387,
        cegfr: 0.5379,
        cegfr2: 0.0165,
        antihtn: 0.2889,
        statin: -0.1337,
        csbp2_antihtn: -0.0476,
        cnhdl_statin: 0.1503,
        cage_cnhdl: -0.0518,
        cage_chdl: 0.0191,
        cage_csbp2: -0.1049,
        cage_diabetes: -0.2252,
        cage_smoker: -0.0895,
        cage_cegfr: -0.1543,
        constant: -3.0312
    }
};
/**
 * Calculate transformed variables for PREVENT equation
 */
export function calculateTransformedVariables(age, tc, // mmol/L
hdl, // mmol/L
sbp, // mmHg
egfr // mL/min/1.73m²
) {
    return {
        cage: (age - 55) / 10,
        cnhdl: tc - hdl - 3.5,
        chdl: (hdl - 1.3) / 0.3,
        csbp: (Math.min(sbp, 110) - 110) / 20,
        csbp2: (Math.max(sbp, 110) - 130) / 20,
        cegfr: (Math.min(egfr, 60) - 60) / -15,
        cegfr2: (Math.max(egfr, 60) - 90) / -15
    };
}
/**
 * Calculate the linear predictor x = Σ[β × transformed variables]
 */
export function calculateLinearPredictor(transformed, gender, diabetes, smoker, antihtn, statin) {
    const c = preventCoefficients[gender];
    const diabetesVal = diabetes ? 1 : 0;
    const smokerVal = smoker ? 1 : 0;
    const antihtnVal = antihtn ? 1 : 0;
    const statinVal = statin ? 1 : 0;
    // Main effects
    let x = c.constant;
    x += c.cage * transformed.cage;
    x += c.cnhdl * transformed.cnhdl;
    x += c.chdl * transformed.chdl;
    x += c.csbp * transformed.csbp;
    x += c.csbp2 * transformed.csbp2;
    x += c.diabetes * diabetesVal;
    x += c.smoker * smokerVal;
    x += c.cegfr * transformed.cegfr;
    x += c.cegfr2 * transformed.cegfr2;
    x += c.antihtn * antihtnVal;
    x += c.statin * statinVal;
    // Interactions
    x += c.csbp2_antihtn * transformed.csbp2 * antihtnVal;
    x += c.cnhdl_statin * transformed.cnhdl * statinVal;
    x += c.cage_cnhdl * transformed.cage * transformed.cnhdl;
    x += c.cage_chdl * transformed.cage * transformed.chdl;
    x += c.cage_csbp2 * transformed.cage * transformed.csbp2;
    x += c.cage_diabetes * transformed.cage * diabetesVal;
    x += c.cage_smoker * transformed.cage * smokerVal;
    x += c.cage_cegfr * transformed.cage * transformed.cegfr;
    return x;
}
/**
 * Calculate 10-year CVD risk percentage
 * Risk % = e^x / (1 + e^x) * 100
 */
export function calculateRiskPercentage(x) {
    const expX = Math.exp(x);
    const risk = (expX / (1 + expX)) * 100;
    return Math.max(0.1, Math.min(99.9, risk));
}
/**
 * Pure calculation function for PREVENT CVD Risk
 * Can be used independently for testing
 */
export function calculatePreventRisk(age, gender, tc, // mmol/L
hdl, // mmol/L
sbp, // mmHg
egfr, // mL/min/1.73m²
diabetes, smoker, antihtn, statin) {
    const transformed = calculateTransformedVariables(age, tc, hdl, sbp, egfr);
    const x = calculateLinearPredictor(transformed, gender, diabetes, smoker, antihtn, statin);
    return calculateRiskPercentage(x);
}
/**
 * PREVENT CVD Risk Calculation Function for UI integration
 */
export function preventCvdCalculation(getValue, getStdValue, getRadioValue, getCheckboxValue) {
    const age = getValue('prevent-age');
    const sbp = getValue('prevent-sbp');
    const tc = getStdValue('prevent-cholesterol', 'mmol/L');
    const hdl = getStdValue('prevent-hdl', 'mmol/L');
    const egfr = getValue('prevent-egfr');
    const gender = (getRadioValue('prevent-gender') || 'male');
    const smoker = getCheckboxValue('prevent-smoker');
    const diabetes = getCheckboxValue('prevent-diabetes');
    const antihtn = getCheckboxValue('prevent-antihtn');
    const statin = getCheckboxValue('prevent-statin');
    if (age === null || sbp === null || tc === null || hdl === null || egfr === null) {
        return null;
    }
    const riskVal = calculatePreventRisk(age, gender, tc, hdl, sbp, egfr, diabetes, smoker, antihtn, statin);
    let riskCategory = '';
    let severity = 'success';
    let recommendation = '';
    if (riskVal < 5) {
        riskCategory = 'Low Risk (<5%)';
        severity = 'success';
        recommendation = 'Focus on lifestyle modifications.';
    }
    else if (riskVal < 7.5) {
        riskCategory = 'Borderline Risk (5-7.5%)';
        severity = 'success';
        recommendation = 'Lifestyle counseling. Consider risk-enhancing factors.';
    }
    else if (riskVal < 20) {
        riskCategory = 'Intermediate Risk (7.5-20%)';
        severity = 'warning';
        recommendation = 'Consider statin therapy. Lifestyle interventions recommended.';
    }
    else {
        riskCategory = 'High Risk (≥20%)';
        severity = 'danger';
        recommendation = 'High-intensity statin recommended. Intensive lifestyle interventions.';
    }
    return {
        value: riskVal,
        interpretation: riskCategory,
        severity,
        additionalResults: [
            { label: '10-Year Total CVD Risk', value: riskVal.toFixed(1), unit: '%' }
        ],
        breakdown: `<strong>Recommendation:</strong> ${recommendation}`
    };
}
