/**
 * Pediatric Blood Pressure Calculator - Verification Tests
 *
 * Tests based on AAP 2017 guidelines.
 * Reference: Flynn JT, et al. Pediatrics. 2017;140(3):e20171904.
 */

import {
    calculatePediatricBP,
    BOYS_BP_TABLE,
    GIRLS_BP_TABLE
} from '../../calculators/pediatric-bp/calculation';

describe('Pediatric Blood Pressure Calculator', () => {
    // Mock functions
    const createMockGetter = (values: Record<string, number | null>) => (key: string) =>
        values[key] ?? null;

    const createMockRadioGetter = (values: Record<string, string>) => (key: string) =>
        values[key] || '';

    // ===========================================
    // TC-001: BP Tables Validation
    // ===========================================

    describe('BP Percentile Tables', () => {
        test('Boys table should have entries for ages 1-12', () => {
            for (let age = 1; age <= 12; age++) {
                expect(BOYS_BP_TABLE[age]).toBeDefined();
                expect(BOYS_BP_TABLE[age]).toHaveLength(4);
            }
        });

        test('Girls table should have entries for ages 1-12', () => {
            for (let age = 1; age <= 12; age++) {
                expect(GIRLS_BP_TABLE[age]).toBeDefined();
                expect(GIRLS_BP_TABLE[age]).toHaveLength(4);
            }
        });

        test('95th percentile should be higher than 90th', () => {
            for (let age = 1; age <= 12; age++) {
                const [sbp90, dbp90, sbp95, dbp95] = BOYS_BP_TABLE[age];
                expect(sbp95).toBeGreaterThan(sbp90);
                expect(dbp95).toBeGreaterThan(dbp90);
            }
        });
    });

    // ===========================================
    // TC-002: Normal BP (Child 1-12 years)
    // ===========================================

    describe('Normal BP Classification', () => {
        test('2-year-old boy with SBP 85, DBP 50 = Normal', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 2, 'peds-bp-sbp': 85, 'peds-bp-dbp': 50 }),
                createMockGetter({ 'peds-bp-age': 2, 'peds-bp-sbp': 85, 'peds-bp-dbp': 50 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Normal BP');
            expect(result?.severity).toBe('success');
        });

        test('5-year-old girl with SBP 90, DBP 55 = Normal', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 5, 'peds-bp-sbp': 90, 'peds-bp-dbp': 55 }),
                createMockGetter({ 'peds-bp-age': 5, 'peds-bp-sbp': 90, 'peds-bp-dbp': 55 }),
                createMockRadioGetter({ 'peds-bp-sex': 'female' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Normal BP');
        });
    });

    // ===========================================
    // TC-003: Elevated BP
    // ===========================================

    describe('Elevated BP Classification', () => {
        test('10-year-old with SBP 110, DBP 73 = Elevated (at 90th percentile)', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 10, 'peds-bp-sbp': 110, 'peds-bp-dbp': 73 }),
                createMockGetter({ 'peds-bp-age': 10, 'peds-bp-sbp': 110, 'peds-bp-dbp': 73 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Elevated BP');
            expect(result?.severity).toBe('warning');
        });
    });

    // ===========================================
    // TC-004: Stage 1 HTN
    // ===========================================

    describe('Stage 1 HTN Classification', () => {
        test('8-year-old with SBP at 95th percentile = Stage 1', () => {
            // For 8yo boy: 95th SBP = 111, 95th DBP = 73
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 8, 'peds-bp-sbp': 115, 'peds-bp-dbp': 70 }),
                createMockGetter({ 'peds-bp-age': 8, 'peds-bp-sbp': 115, 'peds-bp-dbp': 70 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Stage 1 Hypertension');
            expect(result?.severity).toBe('danger');
        });
    });

    // ===========================================
    // TC-005: Stage 2 HTN
    // ===========================================

    describe('Stage 2 HTN Classification', () => {
        test('Child with SBP 140, DBP 90 = Stage 2', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 10, 'peds-bp-sbp': 140, 'peds-bp-dbp': 90 }),
                createMockGetter({ 'peds-bp-age': 10, 'peds-bp-sbp': 140, 'peds-bp-dbp': 90 }),
                createMockRadioGetter({ 'peds-bp-sex': 'female' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Stage 2 Hypertension');
        });
    });

    // ===========================================
    // TC-006: Adolescent (≥13 years) Static Thresholds
    // ===========================================

    describe('Adolescent Classification (≥13 years)', () => {
        test('14-year-old with SBP 115, DBP 75 = Normal', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 14, 'peds-bp-sbp': 115, 'peds-bp-dbp': 75 }),
                createMockGetter({ 'peds-bp-age': 14, 'peds-bp-sbp': 115, 'peds-bp-dbp': 75 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Normal BP');
        });

        test('15-year-old with SBP 125, DBP 75 = Elevated', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 15, 'peds-bp-sbp': 125, 'peds-bp-dbp': 75 }),
                createMockGetter({ 'peds-bp-age': 15, 'peds-bp-sbp': 125, 'peds-bp-dbp': 75 }),
                createMockRadioGetter({ 'peds-bp-sex': 'female' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Elevated BP');
        });

        test('16-year-old with SBP 135, DBP 85 = Stage 1', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 16, 'peds-bp-sbp': 135, 'peds-bp-dbp': 85 }),
                createMockGetter({ 'peds-bp-age': 16, 'peds-bp-sbp': 135, 'peds-bp-dbp': 85 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );

            expect(result).not.toBeNull();
            expect(result?.interpretation).toBe('Stage 1 Hypertension');
        });
    });

    // ===========================================
    // TC-007: Validation
    // ===========================================

    describe('Input Validation', () => {
        test('Should return null if age is missing', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': null, 'peds-bp-sbp': 100, 'peds-bp-dbp': 60 }),
                createMockGetter({ 'peds-bp-age': null, 'peds-bp-sbp': 100, 'peds-bp-dbp': 60 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );
            expect(result).toBeNull();
        });

        test('Should return null if SBP is missing', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 5, 'peds-bp-sbp': null, 'peds-bp-dbp': 60 }),
                createMockGetter({ 'peds-bp-age': 5, 'peds-bp-sbp': null, 'peds-bp-dbp': 60 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );
            expect(result).toBeNull();
        });

        test('Should return null for age <1', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 0.5, 'peds-bp-sbp': 80, 'peds-bp-dbp': 50 }),
                createMockGetter({ 'peds-bp-age': 0.5, 'peds-bp-sbp': 80, 'peds-bp-dbp': 50 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );
            expect(result).toBeNull();
        });

        test('Should return null for age >18', () => {
            const result = calculatePediatricBP(
                createMockGetter({ 'peds-bp-age': 20, 'peds-bp-sbp': 120, 'peds-bp-dbp': 80 }),
                createMockGetter({ 'peds-bp-age': 20, 'peds-bp-sbp': 120, 'peds-bp-dbp': 80 }),
                createMockRadioGetter({ 'peds-bp-sex': 'male' })
            );
            expect(result).toBeNull();
        });
    });
});
