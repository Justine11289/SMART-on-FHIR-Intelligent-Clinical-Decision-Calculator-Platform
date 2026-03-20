/**
 * APACHE II Calculator - Verification Tests
 *
 * Tests for ICU mortality score.
 * Reference: Knaus et al., 1985
 */
import { getPoints, calculateMortality, apacheIiCalculation } from '../../calculators/apache-ii/calculation';
describe('APACHE II Calculator', () => {
    // ===========================================
    // TC-001: Individual Scoring Functions
    // ===========================================
    describe('Temperature Points', () => {
        test('Normal temperature (36-38.4°C) = 0 points', () => {
            expect(getPoints.temp(37.0)).toBe(0);
            expect(getPoints.temp(36.5)).toBe(0);
            expect(getPoints.temp(38.0)).toBe(0);
        });
        test('High temperature (≥41°C) = 4 points', () => {
            expect(getPoints.temp(41.0)).toBe(4);
            expect(getPoints.temp(42.0)).toBe(4);
        });
        test('Low temperature (≤29.9°C) = 4 points', () => {
            expect(getPoints.temp(29.0)).toBe(4);
        });
    });
    describe('MAP Points', () => {
        test('Normal MAP (70-109) = 0 points', () => {
            expect(getPoints.map(80)).toBe(0);
            expect(getPoints.map(90)).toBe(0);
        });
        test('High MAP (≥160) = 4 points', () => {
            expect(getPoints.map(160)).toBe(4);
            expect(getPoints.map(180)).toBe(4);
        });
        test('Low MAP (≤49) = 4 points', () => {
            expect(getPoints.map(49)).toBe(4);
            expect(getPoints.map(40)).toBe(4);
        });
    });
    describe('Heart Rate Points', () => {
        test('Normal HR (70-109) = 0 points', () => {
            expect(getPoints.hr(80)).toBe(0);
            expect(getPoints.hr(100)).toBe(0);
        });
        test('Very high HR (≥180) = 4 points', () => {
            expect(getPoints.hr(180)).toBe(4);
            expect(getPoints.hr(200)).toBe(4);
        });
    });
    describe('pH Points', () => {
        test('Normal pH (7.33-7.49) = 0 points', () => {
            expect(getPoints.ph(7.4)).toBe(0);
            expect(getPoints.ph(7.45)).toBe(0);
        });
        test('Very high pH (≥7.7) = 4 points', () => {
            expect(getPoints.ph(7.7)).toBe(4);
            expect(getPoints.ph(7.8)).toBe(4);
        });
        test('Very low pH (<7.15) = 4 points', () => {
            expect(getPoints.ph(7.1)).toBe(4);
        });
    });
    describe('GCS Points', () => {
        test('GCS 15 = 0 points', () => {
            expect(getPoints.gcs(15)).toBe(0);
        });
        test('GCS 3 = 12 points', () => {
            expect(getPoints.gcs(3)).toBe(12);
        });
        test('GCS 10 = 5 points', () => {
            expect(getPoints.gcs(10)).toBe(5);
        });
    });
    describe('Age Points', () => {
        test('Age <45 = 0 points', () => {
            expect(getPoints.age(30)).toBe(0);
            expect(getPoints.age(44)).toBe(0);
        });
        test('Age 45-54 = 2 points', () => {
            expect(getPoints.age(45)).toBe(2);
            expect(getPoints.age(50)).toBe(2);
        });
        test('Age ≥75 = 6 points', () => {
            expect(getPoints.age(75)).toBe(6);
            expect(getPoints.age(80)).toBe(6);
        });
    });
    describe('Creatinine Points', () => {
        test('Normal creatinine (0.6-1.4) = 0 points', () => {
            expect(getPoints.creatinine(1.0, false)).toBe(0);
        });
        test('High creatinine (≥3.5) = 4 points without ARF', () => {
            expect(getPoints.creatinine(4.0, false)).toBe(4);
        });
        test('High creatinine (≥3.5) = 8 points with ARF', () => {
            expect(getPoints.creatinine(4.0, true)).toBe(8);
        });
    });
    // ===========================================
    // TC-002: Mortality Calculation
    // ===========================================
    describe('Mortality Calculation', () => {
        test('Low score = low mortality', () => {
            const mortality = calculateMortality(5);
            expect(mortality).toBeLessThan(10);
        });
        test('High score = high mortality', () => {
            const mortality = calculateMortality(30);
            expect(mortality).toBeGreaterThan(50);
        });
        test('Score 0 = minimal mortality', () => {
            const mortality = calculateMortality(0);
            expect(mortality).toBeLessThan(5);
        });
    });
    // ===========================================
    // TC-003: Full Calculation
    // ===========================================
    describe('Full APACHE II Calculation', () => {
        const mockGetValue = (values) => (key) => values[key] ?? null;
        const mockGetStdValue = (values) => (key) => values[key] ?? null;
        const mockGetRadioValue = (values) => (key) => values[key] || '0';
        test('Should return null for missing required values', () => {
            const result = apacheIiCalculation(mockGetValue({}), mockGetStdValue({}), mockGetRadioValue({}));
            expect(result).toBeNull();
        });
        test('Low risk patient calculation', () => {
            const values = {
                'apache-ii-temp': 37.0,
                'apache-ii-map': 85,
                'apache-ii-hr': 80,
                'apache-ii-rr': 16,
                'apache-ii-ph': 7.4,
                'apache-ii-sodium': 140,
                'apache-ii-potassium': 4.0,
                'apache-ii-creatinine': 1.0,
                'apache-ii-hct': 40,
                'apache-ii-wbc': 8,
                'apache-ii-gcs': 15,
                'apache-ii-age': 40
            };
            const result = apacheIiCalculation(mockGetValue(values), mockGetStdValue(values), mockGetRadioValue({ arf: '0', chronic: '0' }));
            expect(result).not.toBeNull();
            expect(result.score).toBeLessThan(10);
            expect(result.severity).toBe('success');
        });
    });
});
