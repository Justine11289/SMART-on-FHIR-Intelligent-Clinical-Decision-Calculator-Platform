import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

// Point scoring logic
const getPoints = {
    sbp: (v: number): number => {
        if (v < 90) return 28;
        if (v < 100) return 23;
        if (v < 110) return 18;
        if (v < 120) return 14;
        if (v < 130) return 9;
        if (v < 140) return 5;
        return 0;
    },
    bun: (v: number): number => {
        if (v < 20) return 0;
        if (v < 30) return 4;
        if (v < 40) return 9;
        if (v < 50) return 13;
        if (v < 60) return 18;
        if (v < 70) return 22;
        return 28;
    },
    sodium: (v: number): number => {
        if (v > 140) return 4;
        if (v > 135) return 2;
        return 0;
    },
    age: (v: number): number => {
        if (v < 40) return 0;
        if (v < 50) return 7;
        if (v < 60) return 14;
        if (v < 70) return 21;
        if (v < 80) return 28;
        return 28;
    },
    hr: (v: number): number => {
        if (v < 70) return 0;
        if (v < 80) return 1;
        if (v < 90) return 3;
        if (v < 100) return 5;
        if (v < 110) return 6;
        return 8;
    }
};

const getMortality = (score: number): string => {
    if (score <= 32) return '<1%';
    if (score <= 41) return '1-2%';
    if (score <= 50) return '2-5%';
    if (score <= 56) return '5-10%';
    if (score <= 61) return '10-15%';
    if (score <= 65) return '15-20%';
    if (score <= 72) return '20-30%';
    if (score <= 74) return '30-40%';
    if (score <= 79) return '40-50%';
    return '>50%';
};

export const calculateGwtgHf: SimpleCalculateFn = values => {
    const parseInput = (val: string | number | boolean | undefined | null): number | null => {
        if (val === undefined || val === null || val === '' || typeof val === 'boolean')
            return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    };

    const sbp = parseInput(values['gwtg-sbp']);
    const bun = parseInput(values['gwtg-bun']);
    const sodium = parseInput(values['gwtg-sodium']);
    const age = parseInput(values['gwtg-age']);
    const hr = parseInput(values['gwtg-hr']);

    if (sbp === null || bun === null || sodium === null || age === null || hr === null) {
        return [];
    }

    let score = 0;
    score += getPoints.sbp(sbp);
    score += getPoints.bun(bun);
    score += getPoints.sodium(sodium);
    score += getPoints.age(age);
    score += getPoints.hr(hr);

    const copd = values['copd'] as string | null;
    const race = values['race'] as string | null;

    if (copd) score += parseInt(copd, 10);
    if (race) score += parseInt(race, 10);

    const mortality = getMortality(score);

    let riskLevel = 'Low Risk';
    let alertType: 'success' | 'warning' | 'danger' = 'success';

    if (mortality.includes('>50%') || mortality.includes('40-50') || mortality.includes('30-40')) {
        riskLevel = 'High Risk';
        alertType = 'danger';
    } else if (
        mortality.includes('20-30') ||
        mortality.includes('15-20') ||
        mortality.includes('10-15')
    ) {
        riskLevel = 'Moderate Risk';
        alertType = 'warning';
    }

    return [
        {
            label: 'GWTG-HF Score',
            value: score.toString(),
            unit: 'points',
            interpretation: riskLevel,
            alertClass: alertType
        },
        {
            label: 'In-hospital Mortality',
            value: mortality,
            alertClass: alertType
        }
    ];
};
