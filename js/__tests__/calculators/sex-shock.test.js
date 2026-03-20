/**
 * SEX-SHOCK Calculator - SaMD Verification Tests
 *
 * Formula: SEX-SHOCK Risk Score
 *
 * Clinical Thresholds:
 *   - Low Risk: < 5%
 *   - Moderate Risk: 5-15%
 *   - High Risk: 15-30%
 *   - Very High Risk: >= 30%
 */
import { calculateSexShock } from '../../calculators/sex-shock/calculation';
describe('SEX-SHOCK Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests (Female)
    // ===========================================
    describe('Standard Calculations - Female', () => {
        // Female Coefficients:
        // Intercept: -7.0804
        // Age (0.1825), HR (0.2408), BP (0.8192), Glycemia (0.4019), LeftMain (0.6397), TIMI (0.7198)
        // Assume baseline low risk
        test('Low risk female', () => {
            const result = calculateSexShock({
                'sex-shock-sex': '1', // Female
                'sex-shock-age': '0',
                'sex-shock-arrest': '0',
                'sex-shock-killip': '0',
                'sex-shock-hr': '0',
                'sex-shock-bp': '0',
                'sex-shock-glycemia': '0',
                'sex-shock-left-main': '0',
                'sex-shock-timi': '0',
                'sex-shock-st': '0',
                'sex-shock-lvef': '30', // Baseline
                'sex-shock-creatinine': '0',
                'sex-shock-crp': '0'
            });
            // Y = -7.0804
            // Risk = 1 / (1 + exp(-(-7.0804))) * 100
            // exp(7.0804) ~ 1188.4
            // Risk ~ 1/1189.4 * 100 ~ 0.08%
            expect(result).not.toBeNull();
            expect(parseFloat(result[0].value)).toBeLessThan(1.0);
            expect(result[0].interpretation).toBe('Low Risk');
        });
        test('High risk female', () => {
            // Female
            // Age>70 (0.1825)
            // Cardiac Arrest (1.2567)
            // Killip III (1.0503)
            // BP low (0.8192)
            // LVEF < 35 (0 adjustment base)
            // Intercept: -7.0804
            // Sum: -7.0804 + 0.1825 + 1.2567 + 1.0503 + 0.8192 = -3.7717
            // Risk = 1 / (1 + exp(3.7717)) * 100
            // exp(3.7717) ~ 43.45
            // Risk ~ 1/44.45 * 100 ~ 2.2% ... wait, still low?
            // Let's add more factors to get high risk.
            // + Creatinine 5.0 mg/dL -> 5*88.4 = 442 umol/L. log2(442) ~ 8.78.
            // Coeff 0.6092 * 8.78 = 5.35
            // New Sum: -3.77 + 5.35 = +1.58
            // Risk = 1 / (1 + exp(-1.58)) * 100
            // exp(-1.58) ~ 0.205
            // Risk ~ 1/1.205 * 100 ~ 82% -> Very High Risk
            const result = calculateSexShock({
                'sex-shock-sex': '1',
                'sex-shock-age': '1',
                'sex-shock-arrest': '1',
                'sex-shock-killip': '1',
                'sex-shock-bp': '1',
                'sex-shock-creatinine': '5.0',
                'sex-shock-lvef': '30'
                // default others 0
            });
            expect(result).not.toBeNull();
            expect(parseFloat(result[0].value)).toBeGreaterThan(30);
            expect(result[0].interpretation).toBe('Very High Risk');
        });
    });
    // ===========================================
    // TC-002: Standard Calculation Tests (Male)
    // ===========================================
    describe('Standard Calculations - Male', () => {
        // Male Intercept: -7.9666
        test('Low risk male', () => {
            const result = calculateSexShock({
                'sex-shock-sex': '0', // Male
                // all others 0
                'sex-shock-lvef': '30'
            });
            expect(result).not.toBeNull();
            expect(parseFloat(result[0].value)).toBeLessThan(1.0);
        });
    });
    // ===========================================
    // TC-003: Continuous Variable Transforms
    // ===========================================
    describe('Variable Transforms', () => {
        test('CRP logarithmic transform', () => {
            // Male baseline high risk to see effect
            const baseInput = {
                'sex-shock-sex': '0',
                'sex-shock-lvef': '30', // base (highest risk)
                'sex-shock-arrest': '1',
                'sex-shock-killip': '1',
                'sex-shock-st': '1',
                'sex-shock-left-main': '1'
            };
            const noCRP = calculateSexShock({ ...baseInput });
            const withCRP = calculateSexShock({
                ...baseInput,
                'sex-shock-crp': '100' // Large CRP to ensure visibility
            });
            const scoreNo = parseFloat(noCRP[0].value);
            const scoreYes = parseFloat(withCRP[0].value);
            // Risk should increase significantly
            expect(scoreYes).toBeGreaterThan(scoreNo);
        });
    });
});
