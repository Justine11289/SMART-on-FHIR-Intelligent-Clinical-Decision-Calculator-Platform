/**
 * ASCVD Risk Calculator - Pure Calculation Logic
 *
 * References:
 * - 2013 ACC/AHA Pooled Cohort Equations (PCE)
 * - Goff DC Jr, Lloyd-Jones DM, et al. Circulation. 2014;129:S49-S73.
 */

import { ValidationError } from '../../errorHandler.js';
import type { AlertSeverity } from '../../types/index.js';

// ==========================================
// Exported Coefficients for SaMD Testing
// ==========================================

/**
 * PCE Coefficients from 2013 ACC/AHA Guidelines
 * Source: Goff DC Jr, et al. Circulation. 2014;129:S49-S73
 */
export const PCE_COEFFICIENTS = {
    whiteMale: {
        lnAge: 12.344,
        lnTC: 11.853,
        lnAgeLnTC: -2.664,
        lnHDL: -7.99,
        lnAgeLnHDL: 1.769,
        lnSBP_treated: 1.797,
        lnSBP_untreated: 1.764,
        smoker: 7.837,
        lnAgeSmoker: -1.795,
        diabetes: 0.658,
        meanCoeff: 61.18,
        baselineSurvival: 0.9144
    },
    aaMale: {
        lnAge: 2.469,
        lnTC: 0.302,
        lnHDL: -0.307,
        lnSBP_treated: 1.916,
        lnSBP_untreated: 1.809,
        smoker: 0.549,
        diabetes: 0.645,
        meanCoeff: 19.54,
        baselineSurvival: 0.8954
    },
    whiteFemale: {
        lnAge: -29.799,
        lnAgeSq: 4.884,
        lnTC: 13.54,
        lnAgeLnTC: -3.114,
        lnHDL: -13.578,
        lnAgeLnHDL: 3.149,
        lnSBP_treated: 2.019,
        lnSBP_untreated: 1.957,
        smoker: 7.574,
        lnAgeSmoker: -1.665,
        diabetes: 0.661,
        meanCoeff: -29.18,
        baselineSurvival: 0.9665
    },
    aaFemale: {
        lnAge: 17.114,
        lnTC: 0.94,
        lnHDL: -18.92,
        lnAgeLnHDL: 4.475,
        lnSBP_treated: 29.291,
        lnSBP_untreated: 27.82,
        lnAgeLnSBP: -6.432,
        smoker: 0.691,
        diabetes: 0.874,
        meanCoeff: 86.61,
        baselineSurvival: 0.9533
    }
};

// ==========================================
// Interfaces
// ==========================================

export interface AscvdPatient {
    age: number;
    tc: number;
    hdl: number;
    sbp: number;
    isMale: boolean;
    race: 'white' | 'aa' | 'other';
    onHtnTx: boolean;
    isDiabetic: boolean;
    isSmoker: boolean;
}

export interface AscvdResult {
    results: any[];
    risk: number;
    patient: AscvdPatient;
}

// ==========================================
// Core Calculation Functions
// ==========================================

/**
 * Pure function for PCE (Pooled Cohort Equations) Calculation
 * @param patient - Patient data object
 * @returns 10-year ASCVD risk as percentage (0-100)
 */
export function calculatePCE(patient: AscvdPatient): number {
    const lnAge = Math.log(patient.age);
    const lnTC = Math.log(patient.tc);
    const lnHDL = Math.log(patient.hdl);
    const lnSBP = Math.log(patient.sbp);

    let individualSum = 0;
    let baselineSurvival = 0;
    let meanValue = 0;

    if (patient.isMale) {
        if (patient.race === 'white' || patient.race === 'other') {
            const c = PCE_COEFFICIENTS.whiteMale;
            individualSum =
                c.lnAge * lnAge +
                c.lnTC * lnTC +
                c.lnAgeLnTC * lnAge * lnTC +
                c.lnHDL * lnHDL +
                c.lnAgeLnHDL * lnAge * lnHDL +
                (patient.onHtnTx ? c.lnSBP_treated : c.lnSBP_untreated) * lnSBP +
                c.smoker * (patient.isSmoker ? 1 : 0) +
                c.lnAgeSmoker * lnAge * (patient.isSmoker ? 1 : 0) +
                c.diabetes * (patient.isDiabetic ? 1 : 0);
            meanValue = c.meanCoeff;
            baselineSurvival = c.baselineSurvival;
        } else {
            // African American Male
            const c = PCE_COEFFICIENTS.aaMale;
            individualSum =
                c.lnAge * lnAge +
                c.lnTC * lnTC +
                c.lnHDL * lnHDL +
                (patient.onHtnTx ? c.lnSBP_treated : c.lnSBP_untreated) * lnSBP +
                c.smoker * (patient.isSmoker ? 1 : 0) +
                c.diabetes * (patient.isDiabetic ? 1 : 0);
            meanValue = c.meanCoeff;
            baselineSurvival = c.baselineSurvival;
        }
    } else {
        // Female
        if (patient.race === 'white' || patient.race === 'other') {
            const c = PCE_COEFFICIENTS.whiteFemale;
            individualSum =
                c.lnAge * lnAge +
                c.lnAgeSq * lnAge * lnAge +
                c.lnTC * lnTC +
                c.lnAgeLnTC * lnAge * lnTC +
                c.lnHDL * lnHDL +
                c.lnAgeLnHDL * lnAge * lnHDL +
                (patient.onHtnTx ? c.lnSBP_treated : c.lnSBP_untreated) * lnSBP +
                c.smoker * (patient.isSmoker ? 1 : 0) +
                c.lnAgeSmoker * lnAge * (patient.isSmoker ? 1 : 0) +
                c.diabetes * (patient.isDiabetic ? 1 : 0);
            meanValue = c.meanCoeff;
            baselineSurvival = c.baselineSurvival;
        } else {
            // African American Female
            const c = PCE_COEFFICIENTS.aaFemale;
            individualSum =
                c.lnAge * lnAge +
                c.lnTC * lnTC +
                c.lnHDL * lnHDL +
                c.lnAgeLnHDL * lnAge * lnHDL +
                (patient.onHtnTx ? c.lnSBP_treated : c.lnSBP_untreated) * lnSBP +
                c.lnAgeLnSBP * lnAge * lnSBP +
                c.smoker * (patient.isSmoker ? 1 : 0) +
                c.diabetes * (patient.isDiabetic ? 1 : 0);
            meanValue = c.meanCoeff;
            baselineSurvival = c.baselineSurvival;
        }
    }

    const risk = (1 - Math.pow(baselineSurvival, Math.exp(individualSum - meanValue))) * 100;
    return Math.max(0, Math.min(100, risk));
}

/**
 * Main calculation function with validation
 * @param values - Input values from calculator form
 * @returns AscvdResult object with risk, patient data, and formatted results
 */
export const ascvdCalculationPure = (values: Record<string, any>): AscvdResult => {
    // 1. Check Known ASCVD
    if (values['known-ascvd']) {
        return {
            risk: 0,
            patient: {} as AscvdPatient,
            results: [
                {
                    label: '10-Year ASCVD Risk',
                    value: 'High Risk',
                    interpretation: 'Known Clinical ASCVD (History of MI, stroke, PAD)',
                    alertClass: 'danger' as AlertSeverity
                },
                {
                    label: 'Recommendation',
                    value: 'Secondary Prevention',
                    interpretation: 'High-intensity statin therapy is indicated.',
                    alertClass: 'warning' as AlertSeverity
                }
            ]
        };
    }

    // 2. Validate Core Inputs
    const requiredFields = ['ascvd-age', 'ascvd-tc', 'ascvd-hdl', 'ascvd-sbp'];
    const missing = requiredFields.filter(f => values[f] === undefined || values[f] === null);

    if (missing.length > 0) {
        throw new ValidationError(
            'Please complete all fields (Age, TC, HDL, SBP).',
            'MISSING_DATA'
        );
    }

    const age = values['ascvd-age'];
    const tc = values['ascvd-tc'];
    const hdl = values['ascvd-hdl'];
    const sbp = values['ascvd-sbp'];

    // Validate age range
    if (age < 40 || age > 79) {
        throw new ValidationError(`Valid for ages 40-79. Current age: ${age}.`, 'OUT_OF_RANGE');
    }

    // 3. Prepare Patient Object
    const patient: AscvdPatient = {
        age,
        tc,
        hdl,
        sbp,
        isMale: values['ascvd-gender'] !== 'female',
        race: values['ascvd-race'] || 'white',
        onHtnTx: values['ascvd-htn'] === 'yes',
        isDiabetic: values['ascvd-dm'] === 'yes',
        isSmoker: values['ascvd-smoker'] === 'yes'
    };

    // 4. Calculate Risk
    const risk = calculatePCE(patient);

    // 5. Interpret Result
    let interpretation = '';
    let alertClass: AlertSeverity = 'info';

    if (risk < 5) {
        interpretation = 'Low Risk (<5%). Emphasize lifestyle modifications.';
        alertClass = 'success';
    } else if (risk < 7.5) {
        interpretation =
            'Borderline Risk (5-7.4%). Discuss risk. Consider moderate-intensity statin.';
        alertClass = 'warning';
    } else if (risk < 20) {
        interpretation = 'Intermediate Risk (7.5-19.9%). Initiate moderate-intensity statin.';
        alertClass = 'warning';
    } else {
        interpretation = 'High Risk (≥20%). Initiate high-intensity statin.';
        alertClass = 'danger';
    }

    if (patient.race === 'other') {
        interpretation +=
            '<br><small>Note: Risk for "Other" race may be over- or underestimated.</small>';
    }

    return {
        risk,
        patient,
        results: [
            {
                label: '10-Year ASCVD Risk',
                value: risk.toFixed(1),
                unit: '%',
                interpretation: interpretation,
                alertClass: alertClass
            }
        ]
    };
};
