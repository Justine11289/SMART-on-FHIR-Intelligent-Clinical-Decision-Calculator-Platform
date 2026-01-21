/**
 * Pediatric Blood Pressure Calculator
 *
 * Evaluates blood pressure in children and adolescents based on AAP 2017 guidelines.
 *
 * References:
 * - Flynn JT, et al. Clinical Practice Guideline for Screening and Management of High Blood
 *   Pressure in Children and Adolescents. Pediatrics. 2017;140(3):e20171904.
 * - Rosner B, et al. Blood pressure percentiles for children. Am J Epidemiol. 2008.
 */
// ==========================================
// Simplified BP Screening Tables (AAP 2017)
// Based on 90th percentile at 5th height percentile
// ==========================================
// Boys: Age -> [SBP 90th, DBP 90th, SBP 95th, DBP 95th]
const BOYS_BP_TABLE = {
    1: [98, 52, 102, 54],
    2: [100, 55, 104, 59],
    3: [101, 58, 105, 62],
    4: [102, 60, 106, 64],
    5: [103, 63, 107, 66],
    6: [105, 66, 109, 70],
    7: [106, 68, 110, 72],
    8: [107, 69, 111, 73],
    9: [108, 71, 112, 75],
    10: [109, 72, 113, 76],
    11: [111, 74, 115, 78],
    12: [113, 75, 117, 79]
};
// Girls: Age -> [SBP 90th, DBP 90th, SBP 95th, DBP 95th]
const GIRLS_BP_TABLE = {
    1: [98, 54, 102, 58],
    2: [101, 58, 105, 62],
    3: [102, 60, 106, 64],
    4: [103, 62, 107, 66],
    5: [104, 64, 108, 68],
    6: [105, 67, 109, 71],
    7: [106, 68, 110, 72],
    8: [107, 69, 111, 73],
    9: [108, 71, 112, 75],
    10: [109, 72, 113, 76],
    11: [111, 74, 115, 78],
    12: [113, 75, 117, 79]
};
// ==========================================
// Classification Logic
// ==========================================
/**
 * Classify BP for children 1-12 years (percentile-based)
 */
function classifyChildBP(sbp, dbp, sbp90, dbp90, sbp95, dbp95) {
    // Stage 2 HTN: SBP or DBP ≥95th + 12 mmHg, or ≥140/90
    if (sbp >= sbp95 + 12 || dbp >= dbp95 + 12 || sbp >= 140 || dbp >= 90) {
        return {
            category: 'stage2',
            sbpPercentileRange: sbp >= sbp95 + 12 ? '≥95th + 12 mmHg' : sbp >= sbp95 ? '≥95th' : '<95th',
            dbpPercentileRange: dbp >= dbp95 + 12 ? '≥95th + 12 mmHg' : dbp >= dbp95 ? '≥95th' : '<95th',
            recommendation: 'Refer to specialist within 1 week or immediately if symptomatic. Initiate lifestyle modifications.'
        };
    }
    // Stage 1 HTN: ≥95th but <95th + 12, or 130-139/80-89
    if (sbp >= sbp95 || dbp >= dbp95 || (sbp >= 130 && sbp < 140) || (dbp >= 80 && dbp < 90)) {
        return {
            category: 'stage1',
            sbpPercentileRange: sbp >= sbp95 ? '≥95th' : sbp >= sbp90 ? '90th-95th' : '<90th',
            dbpPercentileRange: dbp >= dbp95 ? '≥95th' : dbp >= dbp90 ? '90th-95th' : '<90th',
            recommendation: 'Lifestyle modifications. Recheck in 1-2 weeks. If still elevated, repeat at 3 visits.'
        };
    }
    // Elevated BP: ≥90th but <95th, or 120/80 to <95th
    if (sbp >= sbp90 || dbp >= dbp90 || sbp >= 120 || dbp >= 80) {
        return {
            category: 'elevated',
            sbpPercentileRange: sbp >= sbp90 ? '90th-95th' : '<90th',
            dbpPercentileRange: dbp >= dbp90 ? '90th-95th' : '<90th',
            recommendation: 'Lifestyle modifications. Recheck in 6 months with nutrition and physical activity counseling.'
        };
    }
    // Normal: <90th percentile
    return {
        category: 'normal',
        sbpPercentileRange: '<90th',
        dbpPercentileRange: '<90th',
        recommendation: 'Check BP at next routine well-child visit.'
    };
}
/**
 * Classify BP for adolescents ≥13 years (static thresholds)
 */
function classifyAdolescentBP(sbp, dbp) {
    // Stage 2 HTN: ≥140/90
    if (sbp >= 140 || dbp >= 90) {
        return {
            category: 'stage2',
            sbpPercentileRange: sbp >= 140 ? '≥140 mmHg' : '<140 mmHg',
            dbpPercentileRange: dbp >= 90 ? '≥90 mmHg' : '<90 mmHg',
            recommendation: 'Refer to specialist within 1 week or immediately if symptomatic. Initiate lifestyle modifications.'
        };
    }
    // Stage 1 HTN: 130-139/80-89
    if (sbp >= 130 || dbp >= 80) {
        return {
            category: 'stage1',
            sbpPercentileRange: sbp >= 130 ? '130-139 mmHg' : '<130 mmHg',
            dbpPercentileRange: dbp >= 80 ? '80-89 mmHg' : '<80 mmHg',
            recommendation: 'Lifestyle modifications. Recheck in 1-2 weeks. If still elevated, repeat at 3 visits.'
        };
    }
    // Elevated BP: 120-129/<80
    if (sbp >= 120) {
        return {
            category: 'elevated',
            sbpPercentileRange: '120-129 mmHg',
            dbpPercentileRange: '<80 mmHg',
            recommendation: 'Lifestyle modifications. Recheck in 6 months with nutrition and physical activity counseling.'
        };
    }
    // Normal: <120/80
    return {
        category: 'normal',
        sbpPercentileRange: '<120 mmHg',
        dbpPercentileRange: '<80 mmHg',
        recommendation: 'Check BP at next routine well-child visit.'
    };
}
// ==========================================
// Main Calculation Function
// ==========================================
export function calculatePediatricBP(getValue, getStdValue, getRadioValue) {
    const age = getValue('peds-bp-age');
    const sex = getRadioValue('peds-bp-sex');
    const sbp = getValue('peds-bp-sbp');
    const dbp = getValue('peds-bp-dbp');
    // Validate required inputs
    if (age === null || sbp === null || dbp === null) {
        return null;
    }
    // Age must be 1-18 years
    if (age < 1 || age > 18) {
        return null;
    }
    let result;
    if (age >= 13) {
        // Use static thresholds for ≥13 years
        result = classifyAdolescentBP(sbp, dbp);
    }
    else {
        // Use percentile-based for 1-12 years
        const ageRounded = Math.floor(age);
        const bpTable = sex === 'female' ? GIRLS_BP_TABLE : BOYS_BP_TABLE;
        const thresholds = bpTable[ageRounded] || bpTable[12];
        const [sbp90, dbp90, sbp95, dbp95] = thresholds;
        result = classifyChildBP(sbp, dbp, sbp90, dbp90, sbp95, dbp95);
    }
    // Map category to severity and label
    const categoryInfo = {
        normal: { severity: 'success', label: 'Normal BP' },
        elevated: { severity: 'warning', label: 'Elevated BP' },
        stage1: { severity: 'danger', label: 'Stage 1 Hypertension' },
        stage2: { severity: 'danger', label: 'Stage 2 Hypertension' }
    };
    const info = categoryInfo[result.category];
    // Build interpretation message
    let interpretationNote = '';
    if (age < 13) {
        const ageInt = Math.floor(age);
        interpretationNote = `Normal BP in this ${ageInt}-year-old ${sex === 'female' ? 'girl' : 'boy'} is SBP <${sex === 'female' ? GIRLS_BP_TABLE[ageInt]?.[0] : BOYS_BP_TABLE[ageInt]?.[0]} and DBP <${sex === 'female' ? GIRLS_BP_TABLE[ageInt]?.[1] : BOYS_BP_TABLE[ageInt]?.[1]}`;
    }
    else {
        interpretationNote =
            'For adolescents ≥13 years, static thresholds apply: Normal <120/80, Elevated 120-129/<80, Stage 1 ≥130/80, Stage 2 ≥140/90';
    }
    return {
        score: result.category === 'normal'
            ? 0
            : result.category === 'elevated'
                ? 1
                : result.category === 'stage1'
                    ? 2
                    : 3,
        interpretation: info.label,
        severity: info.severity,
        additionalResults: [
            { label: 'SBP Percentile', value: result.sbpPercentileRange },
            { label: 'DBP Percentile', value: result.dbpPercentileRange }
        ],
        breakdown: `
            <div class="bp-interpretation">
                <p><strong>Interpretation:</strong> ${interpretationNote}</p>
                <p><strong>Recommendation:</strong> ${result.recommendation}</p>
            </div>
        `
    };
}
// Export tables for testing
export { BOYS_BP_TABLE, GIRLS_BP_TABLE };
