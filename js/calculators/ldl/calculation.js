import { UnitConverter } from '../../unit-converter.js';
export const calculateLDL = values => {
    const tcVal = Number(values['ldl-tc']);
    const hdlVal = Number(values['ldl-hdl']);
    const trigVal = Number(values['ldl-trig']);
    if (!tcVal || !hdlVal || !trigVal)
        return null;
    // Friedewald equation is invalid when Triglycerides >= 400 mg/dL
    const isInvalid = trigVal >= 400;
    let ldlVal = 0;
    if (!isInvalid) {
        // Friedewald Equation: LDL = TC - HDL - (TG / 5)
        ldlVal = tcVal - hdlVal - trigVal / 5;
    }
    const ldlMmol = UnitConverter.convert(ldlVal, 'mg/dL', 'mmol/L', 'cholesterol');
    let riskCategory = '';
    let alertClass = 'success';
    if (ldlVal < 100) {
        riskCategory = 'Optimal';
        alertClass = 'success';
    }
    else if (ldlVal < 130) {
        riskCategory = 'Near Optimal/Above Optimal';
        alertClass = 'success';
    }
    else if (ldlVal < 160) {
        riskCategory = 'Borderline High';
        alertClass = 'warning';
    }
    else if (ldlVal < 190) {
        riskCategory = 'High';
        alertClass = 'danger';
    }
    else {
        riskCategory = 'Very High';
        alertClass = 'danger';
    }
    return [
        {
            label: 'Calculated LDL',
            value: isInvalid ? 'Invalid' : ldlVal.toFixed(1),
            unit: 'mg/dL',
            interpretation: riskCategory,
            alertClass: alertClass
        },
        {
            label: 'Calculated LDL (mmol/L)',
            value: isInvalid || !ldlMmol ? '-' : ldlMmol.toFixed(2),
            unit: 'mmol/L'
        },
        // Pass raw trig for renderer
        { label: '_trig', value: trigVal }
    ];
};
