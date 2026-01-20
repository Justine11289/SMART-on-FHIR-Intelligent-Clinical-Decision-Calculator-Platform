/**
 * EuroSCORE II Calculation
 *
 * Predicts operative mortality for cardiac surgery.
 *
 * Formula: Predicted mortality = e^y / (1 + e^y)
 * Where y = -5.324537 + Σβᵢxᵢ
 *
 * Reference: Nashef SA, et al. EuroSCORE II. Eur J Cardiothorac Surg. 2012;41(4):734-744.
 */

import type {
    ComplexCalculationResult,
    GetValueFn,
    GetStdValueFn,
    GetRadioValueFn
} from '../../types/calculator-formula.js';

// ==========================================
// Coefficients (β values)
// ==========================================

const COEFFICIENTS = {
    // Patient factors
    age: 0.0285181, // Per year if >60
    female: 0.2196434,
    renalModerate: 0.303553, // CrCl 51-85
    renalSevere: 0.8592256, // CrCl ≤50
    dialysis: 0.6421508,
    diabetes: 0.3542749, // Insulin-dependent
    pulmonary: 0.1886564, // Chronic pulmonary dysfunction
    neurologicalMobility: 0.2407181,
    criticalPreop: 1.086517,

    // Cardiac factors
    nyhaII: 0.1070545,
    nyhaIII: 0.2958358,
    nyhaIV: 0.5597929,
    ccs4: 0.2226147,
    arteriopathy: 0.5360268,
    previousCardiacSurgery: 1.118599,
    activeEndocarditis: 0.6194522,
    lvefModerate: 0.3150652, // 31-50%
    lvefPoor: 0.8084096, // 21-30%
    lvefVeryPoor: 0.9346919, // ≤20%
    recentMI: 0.1528943, // ≤90 days
    paPressureModerate: 0.1788899, // 31-54 mmHg
    paPressureHigh: 0.3491475, // ≥55 mmHg

    // Procedural factors
    urgencyUrgent: 0.3174673,
    urgencyEmergency: 0.7039121,
    urgencySalvage: 1.362947,
    procedureNonCABG: 0.0062118,
    procedure2: 0.5521478,
    procedure3OrMore: 0.9724533,
    thoracicAorta: 0.6527205
};

const INTERCEPT = -5.324537;

// ==========================================
// Main Calculation Function
// ==========================================

export function calculateEuroScoreII(
    getValue: GetValueFn,
    getStdValue: GetStdValueFn,
    getRadioValue: GetRadioValueFn
): ComplexCalculationResult | null {
    // Get all values
    const age = getValue('es2-age');
    const sex = getRadioValue('es2-sex');
    const creatinineClearance = getRadioValue('es2-renal');
    const diabetes = getRadioValue('es2-diabetes');
    const pulmonary = getRadioValue('es2-pulmonary');
    const neuroMobility = getRadioValue('es2-neuro');
    const criticalPreop = getRadioValue('es2-critical');
    const nyha = getRadioValue('es2-nyha');
    const ccs4 = getRadioValue('es2-ccs4');
    const arteriopathy = getRadioValue('es2-arteriopathy');
    const previousSurgery = getRadioValue('es2-previous-surgery');
    const endocarditis = getRadioValue('es2-endocarditis');
    const lvef = getRadioValue('es2-lvef');
    const recentMI = getRadioValue('es2-recent-mi');
    const paPressure = getRadioValue('es2-pa-pressure');
    const urgency = getRadioValue('es2-urgency');
    const procedureWeight = getRadioValue('es2-procedure-weight');
    const thoracicAorta = getRadioValue('es2-thoracic-aorta');

    // Check required
    if (age === null) return null;

    // Calculate linear predictor (y)
    let y = INTERCEPT;
    const breakdown: string[] = [];

    // Age: if >60, add (age - 60) * coefficient
    if (age > 60) {
        const ageContrib = (age - 60) * COEFFICIENTS.age;
        y += ageContrib;
        breakdown.push(`Age ${age} (>${60}): +${ageContrib.toFixed(4)}`);
    }

    // Sex
    if (sex === 'female') {
        y += COEFFICIENTS.female;
        breakdown.push(`Female: +${COEFFICIENTS.female}`);
    }

    // Renal dysfunction
    if (creatinineClearance === 'moderate') {
        y += COEFFICIENTS.renalModerate;
        breakdown.push(`Renal (CrCl 51-85): +${COEFFICIENTS.renalModerate}`);
    } else if (creatinineClearance === 'severe') {
        y += COEFFICIENTS.renalSevere;
        breakdown.push(`Renal (CrCl ≤50): +${COEFFICIENTS.renalSevere}`);
    } else if (creatinineClearance === 'dialysis') {
        y += COEFFICIENTS.dialysis;
        breakdown.push(`On Dialysis: +${COEFFICIENTS.dialysis}`);
    }

    // Diabetes (IDDM)
    if (diabetes === '1') {
        y += COEFFICIENTS.diabetes;
        breakdown.push(`Insulin-dependent DM: +${COEFFICIENTS.diabetes}`);
    }

    // Pulmonary dysfunction
    if (pulmonary === '1') {
        y += COEFFICIENTS.pulmonary;
        breakdown.push(`Chronic pulmonary: +${COEFFICIENTS.pulmonary}`);
    }

    // Neurological/Mobility dysfunction
    if (neuroMobility === '1') {
        y += COEFFICIENTS.neurologicalMobility;
        breakdown.push(`Neuro/mobility impairment: +${COEFFICIENTS.neurologicalMobility}`);
    }

    // Critical preoperative state
    if (criticalPreop === '1') {
        y += COEFFICIENTS.criticalPreop;
        breakdown.push(`Critical preop state: +${COEFFICIENTS.criticalPreop}`);
    }

    // NYHA class
    if (nyha === '2') {
        y += COEFFICIENTS.nyhaII;
        breakdown.push(`NYHA II: +${COEFFICIENTS.nyhaII}`);
    } else if (nyha === '3') {
        y += COEFFICIENTS.nyhaIII;
        breakdown.push(`NYHA III: +${COEFFICIENTS.nyhaIII}`);
    } else if (nyha === '4') {
        y += COEFFICIENTS.nyhaIV;
        breakdown.push(`NYHA IV: +${COEFFICIENTS.nyhaIV}`);
    }

    // CCS class 4
    if (ccs4 === '1') {
        y += COEFFICIENTS.ccs4;
        breakdown.push(`CCS class 4: +${COEFFICIENTS.ccs4}`);
    }

    // Extracardiac arteriopathy
    if (arteriopathy === '1') {
        y += COEFFICIENTS.arteriopathy;
        breakdown.push(`Arteriopathy: +${COEFFICIENTS.arteriopathy}`);
    }

    // Previous cardiac surgery
    if (previousSurgery === '1') {
        y += COEFFICIENTS.previousCardiacSurgery;
        breakdown.push(`Previous cardiac surgery: +${COEFFICIENTS.previousCardiacSurgery}`);
    }

    // Active endocarditis
    if (endocarditis === '1') {
        y += COEFFICIENTS.activeEndocarditis;
        breakdown.push(`Active endocarditis: +${COEFFICIENTS.activeEndocarditis}`);
    }

    // LV function
    if (lvef === 'moderate') {
        y += COEFFICIENTS.lvefModerate;
        breakdown.push(`LVEF 31-50%: +${COEFFICIENTS.lvefModerate}`);
    } else if (lvef === 'poor') {
        y += COEFFICIENTS.lvefPoor;
        breakdown.push(`LVEF 21-30%: +${COEFFICIENTS.lvefPoor}`);
    } else if (lvef === 'very-poor') {
        y += COEFFICIENTS.lvefVeryPoor;
        breakdown.push(`LVEF ≤20%: +${COEFFICIENTS.lvefVeryPoor}`);
    }

    // Recent MI
    if (recentMI === '1') {
        y += COEFFICIENTS.recentMI;
        breakdown.push(`Recent MI (≤90 days): +${COEFFICIENTS.recentMI}`);
    }

    // PA pressure
    if (paPressure === 'moderate') {
        y += COEFFICIENTS.paPressureModerate;
        breakdown.push(`PA pressure 31-54: +${COEFFICIENTS.paPressureModerate}`);
    } else if (paPressure === 'high') {
        y += COEFFICIENTS.paPressureHigh;
        breakdown.push(`PA pressure ≥55: +${COEFFICIENTS.paPressureHigh}`);
    }

    // Urgency
    if (urgency === 'urgent') {
        y += COEFFICIENTS.urgencyUrgent;
        breakdown.push(`Urgent: +${COEFFICIENTS.urgencyUrgent}`);
    } else if (urgency === 'emergency') {
        y += COEFFICIENTS.urgencyEmergency;
        breakdown.push(`Emergency: +${COEFFICIENTS.urgencyEmergency}`);
    } else if (urgency === 'salvage') {
        y += COEFFICIENTS.urgencySalvage;
        breakdown.push(`Salvage: +${COEFFICIENTS.urgencySalvage}`);
    }

    // Weight of procedure
    if (procedureWeight === 'non-cabg') {
        y += COEFFICIENTS.procedureNonCABG;
        breakdown.push(`Non-CABG single: +${COEFFICIENTS.procedureNonCABG}`);
    } else if (procedureWeight === '2-procedures') {
        y += COEFFICIENTS.procedure2;
        breakdown.push(`2 procedures: +${COEFFICIENTS.procedure2}`);
    } else if (procedureWeight === '3-or-more') {
        y += COEFFICIENTS.procedure3OrMore;
        breakdown.push(`≥3 procedures: +${COEFFICIENTS.procedure3OrMore}`);
    }

    // Thoracic aorta surgery
    if (thoracicAorta === '1') {
        y += COEFFICIENTS.thoracicAorta;
        breakdown.push(`Thoracic aorta surgery: +${COEFFICIENTS.thoracicAorta}`);
    }

    // Calculate predicted mortality
    const mortality = (Math.exp(y) / (1 + Math.exp(y))) * 100;

    // Determine risk level
    let severity: 'success' | 'warning' | 'danger' = 'success';
    let riskLevel = 'Low Risk';

    if (mortality < 2) {
        severity = 'success';
        riskLevel = 'Low Risk';
    } else if (mortality < 5) {
        severity = 'warning';
        riskLevel = 'Moderate Risk';
    } else if (mortality < 10) {
        severity = 'danger';
        riskLevel = 'High Risk';
    } else {
        severity = 'danger';
        riskLevel = 'Very High Risk';
    }

    return {
        score: parseFloat(mortality.toFixed(2)),
        interpretation: riskLevel,
        severity,
        additionalResults: [
            { label: 'Predicted Mortality', value: mortality.toFixed(2), unit: '%' },
            { label: 'Linear Predictor (y)', value: y.toFixed(4) }
        ],
        breakdown: `<strong>Coefficients Applied:</strong><br>${breakdown.length > 0 ? breakdown.join('<br>') : 'Base risk only'}`
    };
}

// Export for testing
export { COEFFICIENTS, INTERCEPT };
