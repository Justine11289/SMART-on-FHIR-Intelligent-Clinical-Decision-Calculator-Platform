/**
 * APACHE II 評分計算邏輯
 *
 * 計算 ICU 死亡風險
 *
 * Reference: Knaus, W. A., Draper, E. A., Wagner, D. P., & Zimmerman, J. E. (1985).
 * APACHE II: a severity of disease classification system. Critical care medicine, 13(10), 818-829.
 */

import type {
    ComplexCalculationResult,
    GetValueFn,
    GetStdValueFn,
    GetRadioValueFn
} from '../../types/calculator-formula.js';

// ==========================================
// APACHE II 評分函數
// ==========================================

export const getPoints = {
    temp: (v: number): number => {
        if (v >= 41 || v <= 29.9) return 4;
        if (v >= 39 || v <= 31.9) return 3;
        if (v <= 33.9) return 2;
        if (v >= 38.5 || v <= 35.9) return 1;
        return 0;
    },
    map: (v: number): number => {
        if (v >= 160 || v <= 49) return 4;
        if (v >= 130) return 3;
        if (v >= 110 || v <= 69) return 2;
        return 0;
    },
    ph: (v: number): number => {
        if (v >= 7.7 || v < 7.15) return 4;
        if (v >= 7.6 || v < 7.25) return 3;
        if (v < 7.33) return 2;
        if (v >= 7.5) return 1;
        return 0;
    },
    hr: (v: number): number => {
        if (v >= 180 || v <= 39) return 4;
        if (v >= 140 || v <= 54) return 3;
        if (v >= 110 || v <= 69) return 2;
        return 0;
    },
    rr: (v: number): number => {
        if (v >= 50 || v <= 5) return 4;
        if (v >= 35) return 3;
        if (v <= 9) return 2;
        if (v >= 25 || v <= 11) return 1;
        return 0;
    },
    sodium: (v: number): number => {
        if (v >= 180 || v <= 110) return 4;
        if (v >= 160 || v <= 119) return 3;
        if (v >= 155 || v <= 129) return 2;
        if (v >= 150) return 1;
        return 0;
    },
    potassium: (v: number): number => {
        if (v >= 7 || v < 2.5) return 4;
        if (v >= 6) return 3;
        if (v <= 2.9) return 2;
        if (v >= 5.5 || v <= 3.4) return 1;
        return 0;
    },
    creatinine: (v: number, arf: boolean): number => {
        let score = 0;
        if (v >= 3.5) score = 4;
        else if (v >= 2.0) score = 3;
        else if (v >= 1.5 || v < 0.6) score = 2;
        return arf ? score * 2 : score;
    },
    hct: (v: number): number => {
        if (v >= 60 || v < 20) return 4;
        if (v >= 50 || v < 30) return 2;
        return 0;
    },
    wbc: (v: number): number => {
        if (v >= 40 || v < 1) return 4;
        if (v >= 20 || v < 3) return 2;
        if (v >= 15) return 1;
        return 0;
    },
    gcs: (v: number): number => 15 - v,
    oxygenation: (fio2: number, pao2: number | null, paco2: number | null): number => {
        if (fio2 >= 0.5 && paco2 !== null && pao2 !== null) {
            const A_a_gradient = fio2 * 713 - paco2 / 0.8 - pao2;
            if (A_a_gradient >= 500) return 4;
            if (A_a_gradient >= 350) return 3;
            if (A_a_gradient >= 200) return 2;
            return 0;
        } else if (pao2 !== null) {
            if (pao2 < 55) return 4;
            if (pao2 <= 60) return 3;
            if (pao2 <= 70) return 1;
            return 0;
        }
        return 0;
    },
    age: (v: number): number => {
        if (v >= 75) return 6;
        if (v >= 65) return 5;
        if (v >= 55) return 3;
        if (v >= 45) return 2;
        return 0;
    }
};

/**
 * 計算預測 ICU 死亡率
 *
 * @param score - APACHE II 總分
 * @returns 預測死亡率 (%)
 */
export function calculateMortality(score: number): number {
    return (Math.exp(-3.517 + 0.146 * score) / (1 + Math.exp(-3.517 + 0.146 * score))) * 100;
}

/**
 * APACHE II 主計算函數
 *
 * @param getValue - 取得原始值函數
 * @param getStdValue - 取得標準化值函數
 * @param getRadioValue - 取得 Radio 值函數
 * @returns 計算結果
 */
export function apacheIiCalculation(
    getValue: GetValueFn,
    getStdValue: GetStdValueFn,
    getRadioValue: GetRadioValueFn
): ComplexCalculationResult | null {
    const temp = getStdValue('apache-ii-temp', 'C');
    const map = getValue('apache-ii-map');
    const hr = getValue('apache-ii-hr');
    const rr = getValue('apache-ii-rr');
    const ph = getValue('apache-ii-ph');
    const sodium = getStdValue('apache-ii-sodium', 'mmol/L');
    const potassium = getStdValue('apache-ii-potassium', 'mmol/L');
    const creatinine = getStdValue('apache-ii-creatinine', 'mg/dL');
    const hct = getValue('apache-ii-hct');
    const wbc = getValue('apache-ii-wbc');
    const gcs = getValue('apache-ii-gcs');
    const age = getValue('apache-ii-age');
    const fio2 = getValue('apache-ii-fio2');
    const pao2 = getValue('apache-ii-pao2');
    const paco2 = getValue('apache-ii-paco2');

    const arf = getRadioValue('arf') === '1';
    const chronicVal = parseInt(getRadioValue('chronic') || '0');
    const oxyMethod = getRadioValue('oxy_method');

    // Check if all required fields are present
    const requiredFields = [
        temp,
        map,
        hr,
        rr,
        ph,
        sodium,
        potassium,
        creatinine,
        hct,
        wbc,
        gcs,
        age
    ];
    if (requiredFields.some(v => v === null)) return null;

    // Calculate APS
    let aps = 0;
    aps += getPoints.temp(temp!);
    aps += getPoints.map(map!);
    aps += getPoints.ph(ph!);
    aps += getPoints.hr(hr!);
    aps += getPoints.rr(rr!);
    aps += getPoints.sodium(sodium!);
    aps += getPoints.potassium(potassium!);
    aps += getPoints.creatinine(creatinine!, arf);
    aps += getPoints.hct(hct!);
    aps += getPoints.wbc(wbc!);
    aps += getPoints.gcs(gcs!);

    if (oxyMethod === 'fio2_pao2' && fio2 !== null && pao2 !== null && paco2 !== null) {
        aps += getPoints.oxygenation(fio2, pao2, paco2);
    } else if (pao2 !== null) {
        aps += getPoints.oxygenation(0.21, pao2, null);
    }

    const agePoints = getPoints.age(age!);
    const chronicPoints = chronicVal;

    const score = aps + agePoints + chronicPoints;
    const mortality = calculateMortality(score);

    let severity: 'success' | 'warning' | 'danger' = 'success';
    let riskLevel = 'Low Risk';

    if (mortality < 10) {
        severity = 'success';
        riskLevel = 'Low Risk';
    } else if (mortality < 25) {
        severity = 'warning';
        riskLevel = 'Moderate Risk';
    } else if (mortality < 50) {
        severity = 'danger';
        riskLevel = 'High Risk';
    } else {
        severity = 'danger';
        riskLevel = 'Very High Risk';
    }

    return {
        score,
        interpretation: riskLevel,
        severity,
        additionalResults: [
            { label: 'Predicted ICU Mortality', value: mortality.toFixed(1), unit: '%' }
        ],
        breakdown: `<strong>Breakdown:</strong> APS ${aps} + Age ${agePoints} + Chronic Health ${chronicPoints}`
    };
}
