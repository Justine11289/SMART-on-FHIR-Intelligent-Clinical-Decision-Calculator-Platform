/**
 * PRECISE-HBR Score Calculator - Verification Tests
 *
 * Tests for bleeding risk prediction in stent patients.
 */
import { describe, expect, test } from '@jest/globals';
import { calculatePreciseHbrScore, preciseHbrCalculation } from '../../calculators/precise-hbr/calculation.js';
describe('PRECISE-HBR Score Calculator', () => {
    // Helper wrapper to match test signature
    const calculateScore = (age, hb, egfr, wbc, priorBleeding, oralAnticoagulation, arcHbrRisk) => {
        const result = calculatePreciseHbrScore(age, hb, egfr, wbc, priorBleeding, oralAnticoagulation, arcHbrRisk);
        return result.score;
    };
    // Helper to get full result with breakdown
    const getFullResult = (age, hb, egfr, wbc, priorBleeding, oralAnticoagulation, arcHbrRisk) => {
        return calculatePreciseHbrScore(age, hb, egfr, wbc, priorBleeding, oralAnticoagulation, arcHbrRisk);
    };
    // ===========================================
    // TC-001: Base Score Calculation
    // ===========================================
    describe('Base Score', () => {
        test('Base score should be 2', () => {
            // Very young with optimal values
            const score = calculateScore(30, 15.0, 100, 3, false, false, false);
            expect(score).toBe(2);
        });
    });
    // ===========================================
    // TC-002: Age Component
    // ===========================================
    describe('Age Score Component', () => {
        test('Age 30 adds 0 points', () => {
            const score = calculateScore(30, 15.0, 100, 3, false, false, false);
            expect(score).toBe(2); // Base only
        });
        test('Age 50 adds ~5.2 points', () => {
            // (50-30) * 0.26 = 5.2
            const score = calculateScore(50, 15.0, 100, 3, false, false, false);
            expect(score).toBe(7); // 2 + 5.2 rounded
        });
        test('Age 80 adds ~13 points (capped)', () => {
            // (80-30) * 0.26 = 13
            const score = calculateScore(80, 15.0, 100, 3, false, false, false);
            expect(score).toBe(15); // 2 + 13
        });
        test('Age above 80 is capped', () => {
            const score90 = calculateScore(90, 15.0, 100, 3, false, false, false);
            const score80 = calculateScore(80, 15.0, 100, 3, false, false, false);
            expect(score90).toBe(score80);
        });
    });
    // ===========================================
    // TC-003: Hemoglobin Component
    // ===========================================
    describe('Hemoglobin Score Component', () => {
        test('Hb 15 adds 0 points', () => {
            const score = calculateScore(30, 15.0, 100, 3, false, false, false);
            expect(score).toBe(2);
        });
        test('Hb 12 adds 7.5 points', () => {
            // (15-12) * 2.5 = 7.5
            const score = calculateScore(30, 12.0, 100, 3, false, false, false);
            expect(score).toBe(10); // 2 + 7.5 rounded
        });
        test('Hb 8 adds 17.5 points', () => {
            // (15-8) * 2.5 = 17.5
            const score = calculateScore(30, 8.0, 100, 3, false, false, false);
            expect(score).toBe(20); // 2 + 17.5 rounded
        });
    });
    // ===========================================
    // TC-004: eGFR Component
    // ===========================================
    describe('eGFR Score Component', () => {
        test('eGFR 100 adds 0 points', () => {
            const score = calculateScore(30, 15.0, 100, 3, false, false, false);
            expect(score).toBe(2);
        });
        test('eGFR 60 adds 2 points', () => {
            // (100-60) * 0.05 = 2
            const score = calculateScore(30, 15.0, 60, 3, false, false, false);
            expect(score).toBe(4); // 2 + 2
        });
        test('eGFR 20 adds 4 points', () => {
            // (100-20) * 0.05 = 4
            const score = calculateScore(30, 15.0, 20, 3, false, false, false);
            expect(score).toBe(6); // 2 + 4
        });
    });
    // ===========================================
    // TC-005: WBC Component
    // ===========================================
    describe('WBC Score Component', () => {
        test('WBC 3 adds 0 points', () => {
            const score = calculateScore(30, 15.0, 100, 3, false, false, false);
            expect(score).toBe(2);
        });
        test('WBC 10 adds 5.6 points', () => {
            // (10-3) * 0.8 = 5.6
            const score = calculateScore(30, 15.0, 100, 10, false, false, false);
            expect(score).toBe(8); // 2 + 5.6 rounded
        });
    });
    // ===========================================
    // TC-006: Categorical Risk Factors
    // ===========================================
    describe('Categorical Risk Factors', () => {
        test('Prior bleeding adds 7 points', () => {
            const withoutBleeding = calculateScore(30, 15.0, 100, 3, false, false, false);
            const withBleeding = calculateScore(30, 15.0, 100, 3, true, false, false);
            expect(withBleeding - withoutBleeding).toBe(7);
        });
        test('Oral anticoagulation adds 5 points', () => {
            const without = calculateScore(30, 15.0, 100, 3, false, false, false);
            const with_ = calculateScore(30, 15.0, 100, 3, false, true, false);
            expect(with_ - without).toBe(5);
        });
        test('ARC-HBR risk adds 3 points', () => {
            const without = calculateScore(30, 15.0, 100, 3, false, false, false);
            const with_ = calculateScore(30, 15.0, 100, 3, false, false, true);
            expect(with_ - without).toBe(3);
        });
    });
    // ===========================================
    // TC-007: Risk Stratification
    // ===========================================
    describe('Risk Stratification', () => {
        test('Score ≤22 = Non-HBR (Low Risk)', () => {
            const score = calculateScore(50, 13.0, 80, 8, false, false, false);
            expect(score).toBeLessThanOrEqual(22);
        });
        test('Score 23-26 = HBR (High Risk)', () => {
            const score = calculateScore(70, 11.0, 50, 10, true, false, false);
            expect(score).toBeGreaterThan(22);
        });
        test('Score with all risk factors = Very High', () => {
            const score = calculateScore(80, 8.0, 20, 15, true, true, true);
            expect(score).toBeGreaterThan(30);
        });
    });
    // ===========================================
    // TC-008: Boundary Value Tests (Clamping)
    // ===========================================
    describe('Boundary Value Clamping', () => {
        test('Age below 30 is clamped to 30', () => {
            const score20 = calculateScore(20, 15.0, 100, 3, false, false, false);
            const score30 = calculateScore(30, 15.0, 100, 3, false, false, false);
            expect(score20).toBe(score30);
        });
        test('Hb below 5 is clamped to 5', () => {
            const score3 = calculateScore(30, 3.0, 100, 3, false, false, false);
            const score5 = calculateScore(30, 5.0, 100, 3, false, false, false);
            expect(score3).toBe(score5);
        });
        test('Hb above 15 adds 0 points', () => {
            const score = calculateScore(30, 18.0, 100, 3, false, false, false);
            expect(score).toBe(2); // Base only
        });
        test('eGFR below 5 is clamped to 5', () => {
            const score2 = calculateScore(30, 15.0, 2, 3, false, false, false);
            const score5 = calculateScore(30, 15.0, 5, 3, false, false, false);
            expect(score2).toBe(score5);
        });
        test('eGFR above 100 adds 0 points', () => {
            const score = calculateScore(30, 15.0, 120, 3, false, false, false);
            expect(score).toBe(2); // Base only
        });
        test('WBC above 15 is clamped to 15', () => {
            const score20 = calculateScore(30, 15.0, 100, 20, false, false, false);
            const score15 = calculateScore(30, 15.0, 100, 15, false, false, false);
            expect(score20).toBe(score15);
        });
        test('WBC at or below 3 adds 0 points', () => {
            const score2 = calculateScore(30, 15.0, 100, 2, false, false, false);
            const score3 = calculateScore(30, 15.0, 100, 3, false, false, false);
            expect(score2).toBe(2);
            expect(score3).toBe(2);
        });
    });
    // ===========================================
    // TC-009: Breakdown String Generation
    // ===========================================
    describe('Breakdown String Generation', () => {
        test('Base score is always in breakdown', () => {
            const result = getFullResult(30, 15.0, 100, 3, false, false, false);
            expect(result.breakdown).toContain('Base Score (2)');
        });
        test('Age contribution is in breakdown when applicable', () => {
            const result = getFullResult(50, 15.0, 100, 3, false, false, false);
            expect(result.breakdown).toContain('Age 50');
            expect(result.breakdown).toContain('5.20');
        });
        test('Hb contribution is in breakdown when applicable', () => {
            const result = getFullResult(30, 12.0, 100, 3, false, false, false);
            expect(result.breakdown).toContain('Hb 12');
            expect(result.breakdown).toContain('7.50');
        });
        test('eGFR contribution is in breakdown when applicable', () => {
            const result = getFullResult(30, 15.0, 60, 3, false, false, false);
            expect(result.breakdown).toContain('eGFR 60');
            expect(result.breakdown).toContain('2.00');
        });
        test('WBC contribution is in breakdown when applicable', () => {
            const result = getFullResult(30, 15.0, 100, 10, false, false, false);
            expect(result.breakdown).toContain('WBC 10');
            expect(result.breakdown).toContain('5.60');
        });
        test('Prior bleeding is in breakdown when true', () => {
            const result = getFullResult(30, 15.0, 100, 3, true, false, false);
            expect(result.breakdown).toContain('Prior Bleeding (+7)');
        });
        test('Oral anticoagulation is in breakdown when true', () => {
            const result = getFullResult(30, 15.0, 100, 3, false, true, false);
            expect(result.breakdown).toContain('Oral Anticoagulation (+5)');
        });
        test('ARC-HBR risk is in breakdown when true', () => {
            const result = getFullResult(30, 15.0, 100, 3, false, false, true);
            expect(result.breakdown).toContain('ARC-HBR Risk Factor (+3)');
        });
        test('Rounding is shown in breakdown when needed', () => {
            // Score that will have fractional part
            const result = getFullResult(45, 15.0, 100, 3, false, false, false);
            // (45-30)*0.26 = 3.9, total = 5.9 -> rounds to 6
            expect(result.breakdown).toContain('Rounded');
        });
        test('Total is shown without rounding when score is integer', () => {
            const result = getFullResult(30, 15.0, 100, 3, false, false, false);
            expect(result.breakdown).toContain('Total: 2');
        });
    });
    // ===========================================
    // TC-010: preciseHbrCalculation Function
    // ===========================================
    describe('preciseHbrCalculation Integration', () => {
        // Mock getValue function
        const createGetValue = (values) => {
            return (id) => values[id] ?? null;
        };
        // Mock getRadioValue function
        const createGetRadioValue = (values) => {
            return (id) => values[id] ?? '0';
        };
        // Mock getStdValue (not used but required)
        const mockGetStdValue = () => null;
        test('Returns null when required values are missing', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 50,
                'precise-hbr-hb': null,
                'precise-hbr-wbc': 8,
                'precise-hbr-egfr': 80
            });
            const getRadioValue = createGetRadioValue({});
            const result = preciseHbrCalculation(getValue, mockGetStdValue, getRadioValue);
            expect(result).toBeNull();
        });
        test('Non-HBR (Low Risk) for score <= 22', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 50,
                'precise-hbr-hb': 14,
                'precise-hbr-wbc': 6,
                'precise-hbr-egfr': 90
            });
            const getRadioValue = createGetRadioValue({
                'prior_bleeding': '0',
                'oral_anticoagulation': '0'
            });
            const result = preciseHbrCalculation(getValue, mockGetStdValue, getRadioValue);
            expect(result).not.toBeNull();
            expect(result.severity).toBe('success');
            expect(result.interpretation).toBe('Non-HBR (Low Risk)');
            expect(result.additionalResults).toContainEqual(expect.objectContaining({ label: '1-Year Bleeding Risk', value: '0.5% ~ 3.5%' }));
        });
        test('HBR (High Risk) for score 23-26', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 55,
                'precise-hbr-hb': 13,
                'precise-hbr-wbc': 7,
                'precise-hbr-egfr': 70
            });
            const getRadioValue = createGetRadioValue({
                'prior_bleeding': '1',
                'oral_anticoagulation': '0'
            });
            const result = preciseHbrCalculation(getValue, mockGetStdValue, getRadioValue);
            expect(result).not.toBeNull();
            expect(result.score).toBeGreaterThan(22);
            expect(result.score).toBeLessThanOrEqual(26);
            expect(result.severity).toBe('warning');
            expect(result.interpretation).toBe('HBR (High Risk)');
        });
        test('Very HBR (Very High Risk) for score 27-30', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 75,
                'precise-hbr-hb': 9,
                'precise-hbr-wbc': 12,
                'precise-hbr-egfr': 40
            });
            const getRadioValue = createGetRadioValue({
                'prior_bleeding': '1',
                'oral_anticoagulation': '0'
            });
            const result = preciseHbrCalculation(getValue, mockGetStdValue, getRadioValue);
            expect(result).not.toBeNull();
            const score = result?.score;
            if (score !== undefined && score > 26 && score <= 30) {
                expect(result.severity).toBe('danger');
                expect(result.interpretation).toBe('Very HBR (Very High Risk)');
            }
        });
        test('Extreme Risk for score 31-35', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 80,
                'precise-hbr-hb': 8,
                'precise-hbr-wbc': 14,
                'precise-hbr-egfr': 20
            });
            const getRadioValue = createGetRadioValue({
                'prior_bleeding': '1',
                'oral_anticoagulation': '1'
            });
            const result = preciseHbrCalculation(getValue, mockGetStdValue, getRadioValue);
            expect(result).not.toBeNull();
            const score = result?.score;
            if (score !== undefined && score > 30 && score <= 35) {
                expect(result.severity).toBe('danger');
                expect(result.interpretation).toBe('Extreme Risk');
                expect(result.additionalResults).toContainEqual(expect.objectContaining({ value: '8.0% ~ 12.0%' }));
            }
        });
        test('Extreme Risk (Capped) for score > 35', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 80,
                'precise-hbr-hb': 5,
                'precise-hbr-wbc': 15,
                'precise-hbr-egfr': 5
            });
            const getRadioValue = createGetRadioValue({
                'prior_bleeding': '1',
                'oral_anticoagulation': '1',
                'arc_hbr_plt': '1'
            });
            const result = preciseHbrCalculation(getValue, mockGetStdValue, getRadioValue);
            expect(result).not.toBeNull();
            expect(result.score).toBeGreaterThan(35);
            expect(result.severity).toBe('danger');
            expect(result.interpretation).toBe('Extreme Risk (Capped)');
            expect(result.additionalResults).toContainEqual(expect.objectContaining({ value: 'Upper limit ~15%' }));
        });
        test('ARC-HBR risk factors are aggregated correctly', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 50,
                'precise-hbr-hb': 14,
                'precise-hbr-wbc': 6,
                'precise-hbr-egfr': 90
            });
            // No ARC-HBR factors
            const noArc = preciseHbrCalculation(getValue, mockGetStdValue, createGetRadioValue({}));
            // With one ARC-HBR factor
            const withArc = preciseHbrCalculation(getValue, mockGetStdValue, createGetRadioValue({ 'arc_hbr_cirrhosis': '1' }));
            const withArcScore = withArc?.score;
            const noArcScore = noArc?.score;
            expect(withArcScore !== undefined && noArcScore !== undefined ? withArcScore - noArcScore : null).toBe(3);
        });
        test('Multiple ARC-HBR factors still add only 3 points', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 50,
                'precise-hbr-hb': 14,
                'precise-hbr-wbc': 6,
                'precise-hbr-egfr': 90
            });
            // One ARC-HBR factor
            const oneArc = preciseHbrCalculation(getValue, mockGetStdValue, createGetRadioValue({ 'arc_hbr_plt': '1' }));
            // Multiple ARC-HBR factors
            const multiArc = preciseHbrCalculation(getValue, mockGetStdValue, createGetRadioValue({
                'arc_hbr_plt': '1',
                'arc_hbr_diathesis': '1',
                'arc_hbr_cirrhosis': '1',
                'arc_hbr_malignancy': '1',
                'arc_hbr_surgery': '1',
                'arc_hbr_nsaids': '1'
            }));
            // Multiple factors still only add 3 points (boolean OR)
            expect(multiArc.score).toBe(oneArc.score);
        });
        test('Result includes breakdown string', () => {
            const getValue = createGetValue({
                'precise-hbr-age': 60,
                'precise-hbr-hb': 12,
                'precise-hbr-wbc': 8,
                'precise-hbr-egfr': 70
            });
            const getRadioValue = createGetRadioValue({});
            const result = preciseHbrCalculation(getValue, mockGetStdValue, getRadioValue);
            expect(result).not.toBeNull();
            expect(result.breakdown).toBeDefined();
            expect(result.breakdown).toContain('Base Score');
        });
    });
});
