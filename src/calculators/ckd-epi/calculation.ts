/**
 * CKD-EPI GFR Calculator (2021 Race-Free Equation)
 *
 * Formula:
 *   Female: 142 × min(Scr/0.7, 1)^(-0.241) × max(Scr/0.7, 1)^(-1.200) × 0.9938^Age × 1.012
 *   Male:   142 × min(Scr/0.9, 1)^(-0.302) × max(Scr/0.9, 1)^(-1.200) × 0.9938^Age
 *
 * Where:
 *   Scr = serum creatinine (mg/dL)
 *   Age = patient age (years)
 *
 * Reference:
 * Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR
 * without Race. N Engl J Med. 2021;385(19):1737-1749.
 */

import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateCkdEpi: SimpleCalculateFn = values => {
    const age = Number(values['ckd-epi-age']);
    const creatinine = Number(values['ckd-epi-creatinine']);
    const gender = values['ckd-epi-gender'] as string;

    if (!age || !creatinine || isNaN(age) || isNaN(creatinine)) {
        return null;
    }

    if (creatinine <= 0) {
        return null;
    }

    // CKD-EPI 2021 Race-Free Equation
    const kappa = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.241 : -0.302;
    const genderFactor = gender === 'female' ? 1.012 : 1;

    const gfr =
        142 *
        Math.pow(Math.min(creatinine / kappa, 1), alpha) *
        Math.pow(Math.max(creatinine / kappa, 1), -1.2) *
        Math.pow(0.9938, age) *
        genderFactor;

    // CKD Staging
    let stage = '';
    let alertClass: 'success' | 'warning' | 'danger' | 'info' = 'info';
    let interpretation = '';

    if (gfr >= 90) {
        stage = 'Stage 1 (Normal or high)';
        alertClass = 'success';
        interpretation = 'Normal kidney function.';
    } else if (gfr >= 60) {
        stage = 'Stage 2 (Mild)';
        alertClass = 'success';
        interpretation = 'Mildly decreased kidney function.';
    } else if (gfr >= 45) {
        stage = 'Stage 3a (Mild to moderate)';
        alertClass = 'warning';
        interpretation = 'Mild to moderate reduction in kidney function.';
    } else if (gfr >= 30) {
        stage = 'Stage 3b (Moderate to severe)';
        alertClass = 'warning';
        interpretation = 'Moderate to severe reduction. Consider nephrology referral.';
    } else if (gfr >= 15) {
        stage = 'Stage 4 (Severe)';
        alertClass = 'danger';
        interpretation = 'Severe reduction. Nephrology referral required.';
    } else {
        stage = 'Stage 5 (Kidney failure)';
        alertClass = 'danger';
        interpretation = 'Kidney failure. Consider dialysis or transplantation.';
    }

    const results: FormulaResultItem[] = [
        {
            label: 'eGFR',
            value: gfr.toFixed(0),
            unit: 'mL/min/1.73m²',
            interpretation: `${stage} - ${interpretation}`,
            alertClass: alertClass
        }
    ];

    return results;
};
