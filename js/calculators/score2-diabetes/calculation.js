// Region-specific coefficients
const score2DiabetesData = {
    low: {
        male: {
            age: 0.0652,
            sbp: 0.0139,
            tchol: 0.2079,
            hdl: -0.4485,
            hba1c: 0.0211,
            egfr: -0.0076,
            smoking: 0.3838,
            s010: 0.9765,
            mean_x: 4.9664
        },
        female: {
            age: 0.0768,
            sbp: 0.0152,
            tchol: 0.147,
            hdl: -0.5659,
            hba1c: 0.0232,
            egfr: -0.0084,
            smoking: 0.5422,
            s010: 0.9859,
            mean_x: 5.215
        }
    },
    moderate: {
        male: {
            age: 0.0652,
            sbp: 0.0139,
            tchol: 0.2079,
            hdl: -0.4485,
            hba1c: 0.0211,
            egfr: -0.0076,
            smoking: 0.3838,
            s010: 0.9626,
            mean_x: 4.9664
        },
        female: {
            age: 0.0768,
            sbp: 0.0152,
            tchol: 0.147,
            hdl: -0.5659,
            hba1c: 0.0232,
            egfr: -0.0084,
            smoking: 0.5422,
            s010: 0.9782,
            mean_x: 5.215
        }
    },
    high: {
        male: {
            age: 0.0652,
            sbp: 0.0139,
            tchol: 0.2079,
            hdl: -0.4485,
            hba1c: 0.0211,
            egfr: -0.0076,
            smoking: 0.3838,
            s010: 0.9388,
            mean_x: 4.9664
        },
        female: {
            age: 0.0768,
            sbp: 0.0152,
            tchol: 0.147,
            hdl: -0.5659,
            hba1c: 0.0232,
            egfr: -0.0084,
            smoking: 0.5422,
            s010: 0.9661,
            mean_x: 5.215
        }
    },
    very_high: {
        male: {
            age: 0.0652,
            sbp: 0.0139,
            tchol: 0.2079,
            hdl: -0.4485,
            hba1c: 0.0211,
            egfr: -0.0076,
            smoking: 0.3838,
            s010: 0.9038,
            mean_x: 4.9664
        },
        female: {
            age: 0.0768,
            sbp: 0.0152,
            tchol: 0.147,
            hdl: -0.5659,
            hba1c: 0.0232,
            egfr: -0.0084,
            smoking: 0.5422,
            s010: 0.9472,
            mean_x: 5.215
        }
    }
};
export const calculateScore2Diabetes = values => {
    const getString = (key) => values[key] || '';
    const getFloat = (key) => {
        const val = values[key];
        return typeof val === 'string' ? parseFloat(val) : typeof val === 'number' ? val : NaN;
    };
    const region = getString('score2d-region');
    const sex = getString('score2d-sex');
    const age = getFloat('score2d-age');
    const smoking = parseInt(getString('score2d-smoking') || '0', 10);
    const sbp = getFloat('score2d-sbp');
    const tchol = getFloat('score2d-tchol');
    const hdl = getFloat('score2d-hdl');
    const hba1c = getFloat('score2d-hba1c');
    const egfr = getFloat('score2d-egfr');
    // Validation
    if (!region ||
        !sex ||
        isNaN(age) ||
        isNaN(sbp) ||
        isNaN(tchol) ||
        isNaN(hdl) ||
        isNaN(hba1c) ||
        isNaN(egfr)) {
        return [];
    }
    if (age < 40 || age > 69) {
        // Will be handled by customResultRenderer alert usually, but here we return empty or special value?
        // Original logic returned null. We return empty array which means no result items.
        // Or better, we return an item that indicates invalid age?
        // Logic says: "Will be handled by customResultRenderer".
        // But if we return empty array, customResultRenderer might not run if it depends on results?
        // Wait, unified calculator calls customResultRenderer with results array.
        // If results array is empty, customResultRenderer can still append alerts.
        // But wait, original code: if (age < 40...) return null.
        // If we return [], we signify no calculation.
        return [];
    }
    const coeffs = score2DiabetesData[region]?.[sex];
    if (!coeffs)
        return [];
    // Conversions
    const tchol_mmol = tchol / 38.67;
    const hdl_mmol = hdl / 38.67;
    const hba1c_mmol = hba1c * 10.93 - 23.5;
    const ind_x = coeffs.age * age +
        coeffs.sbp * sbp +
        coeffs.tchol * tchol_mmol +
        coeffs.hdl * hdl_mmol +
        coeffs.hba1c * hba1c_mmol +
        coeffs.egfr * egfr +
        coeffs.smoking * smoking;
    const risk = 100 * (1 - Math.pow(coeffs.s010, Math.exp(ind_x - coeffs.mean_x)));
    const score = Math.round(risk * 10) / 10; // Round to 1 decimal
    let riskCategory = '';
    let alertType = 'success';
    if (score < 5) {
        riskCategory = 'Low Risk';
        alertType = 'success';
    }
    else if (score < 10) {
        riskCategory = 'Moderate Risk';
        alertType = 'warning';
    }
    else if (score < 20) {
        riskCategory = 'High Risk';
        alertType = 'danger';
    }
    else {
        riskCategory = 'Very High Risk';
        alertType = 'danger';
    }
    const results = [
        {
            label: '10-Year CVD Risk',
            value: score.toFixed(1),
            unit: '%',
            interpretation: riskCategory,
            alertClass: alertType
        }
    ];
    return results;
};
