/**
 * EuroSCORE II Calculator - Verification Tests
 *
 * Tests for cardiac surgery mortality prediction.
 * Reference: Nashef SA, et al. Eur J Cardiothorac Surg. 2012
 */
import { calculateEuroScoreII, COEFFICIENTS, INTERCEPT } from '../../calculators/euroscore-ii/calculation';
describe('EuroSCORE II Calculator', () => {
    // Mock functions
    const createMockGetter = (values) => (key) => values[key] ?? null;
    const createMockRadioGetter = (values) => (key) => values[key] || '';
    // ===========================================
    // TC-001: Coefficient Validation
    // ===========================================
    describe('Coefficients', () => {
        test('Intercept should be -5.324537', () => {
            expect(INTERCEPT).toBeCloseTo(-5.324537, 5);
        });
        test('Age coefficient should be 0.0285181', () => {
            expect(COEFFICIENTS.age).toBeCloseTo(0.0285181, 6);
        });
        test('Female coefficient should be 0.2196434', () => {
            expect(COEFFICIENTS.female).toBeCloseTo(0.2196434, 6);
        });
        test('Critical preop coefficient should be 1.086517', () => {
            expect(COEFFICIENTS.criticalPreop).toBeCloseTo(1.086517, 5);
        });
        test('Previous cardiac surgery coefficient should be 1.118599', () => {
            expect(COEFFICIENTS.previousCardiacSurgery).toBeCloseTo(1.118599, 5);
        });
    });
    // ===========================================
    // TC-002: Low Risk Patient
    // ===========================================
    describe('Low Risk Calculation', () => {
        test('Young male with no risk factors = low risk (<2%)', () => {
            const values = { 'es2-age': 50 };
            const radioValues = {
                'es2-sex': 'male',
                'es2-renal': 'normal',
                'es2-diabetes': '0',
                'es2-pulmonary': '0',
                'es2-neuro': '0',
                'es2-critical': '0',
                'es2-nyha': '1',
                'es2-ccs4': '0',
                'es2-lvef': 'good',
                'es2-recent-mi': '0',
                'es2-pa-pressure': 'normal',
                'es2-arteriopathy': '0',
                'es2-previous-surgery': '0',
                'es2-endocarditis': '0',
                'es2-urgency': 'elective',
                'es2-procedure-weight': 'cabg',
                'es2-thoracic-aorta': '0'
            };
            const result = calculateEuroScoreII(createMockGetter(values), createMockGetter(values), createMockRadioGetter(radioValues));
            expect(result).not.toBeNull();
            expect(result.score).toBeLessThan(2);
            expect(result.interpretation).toBe('Low Risk');
        });
    });
    // ===========================================
    // TC-003: Age Factor
    // ===========================================
    describe('Age Factor', () => {
        test('Age ≤60 should not add points', () => {
            const values = { 'es2-age': 60 };
            const radioValues = {
                'es2-sex': 'male',
                'es2-renal': 'normal',
                'es2-diabetes': '0',
                'es2-pulmonary': '0',
                'es2-neuro': '0',
                'es2-critical': '0',
                'es2-nyha': '1',
                'es2-ccs4': '0',
                'es2-lvef': 'good',
                'es2-recent-mi': '0',
                'es2-pa-pressure': 'normal',
                'es2-arteriopathy': '0',
                'es2-previous-surgery': '0',
                'es2-endocarditis': '0',
                'es2-urgency': 'elective',
                'es2-procedure-weight': 'cabg',
                'es2-thoracic-aorta': '0'
            };
            const result60 = calculateEuroScoreII(createMockGetter({ 'es2-age': 60 }), createMockGetter({ 'es2-age': 60 }), createMockRadioGetter(radioValues));
            const result50 = calculateEuroScoreII(createMockGetter({ 'es2-age': 50 }), createMockGetter({ 'es2-age': 50 }), createMockRadioGetter(radioValues));
            // Both should have same score since age ≤60 doesn't add points
            expect(result60).not.toBeNull();
            expect(result50).not.toBeNull();
            expect(result60?.score).toBe(result50?.score);
        });
        test('Age >60 should add points progressively', () => {
            const radioValues = {
                'es2-sex': 'male',
                'es2-renal': 'normal',
                'es2-diabetes': '0',
                'es2-pulmonary': '0',
                'es2-neuro': '0',
                'es2-critical': '0',
                'es2-nyha': '1',
                'es2-ccs4': '0',
                'es2-lvef': 'good',
                'es2-recent-mi': '0',
                'es2-pa-pressure': 'normal',
                'es2-arteriopathy': '0',
                'es2-previous-surgery': '0',
                'es2-endocarditis': '0',
                'es2-urgency': 'elective',
                'es2-procedure-weight': 'cabg',
                'es2-thoracic-aorta': '0'
            };
            const result70 = calculateEuroScoreII(createMockGetter({ 'es2-age': 70 }), createMockGetter({ 'es2-age': 70 }), createMockRadioGetter(radioValues));
            const result80 = calculateEuroScoreII(createMockGetter({ 'es2-age': 80 }), createMockGetter({ 'es2-age': 80 }), createMockRadioGetter(radioValues));
            expect(result70).not.toBeNull();
            expect(result80).not.toBeNull();
            expect(result80?.score).toBeGreaterThan(result70?.score ?? 0);
        });
    });
    // ===========================================
    // TC-004: High Risk Patient
    // ===========================================
    describe('High Risk Calculation', () => {
        test('Patient with multiple risk factors = high risk', () => {
            const values = { 'es2-age': 75 };
            const radioValues = {
                'es2-sex': 'female',
                'es2-renal': 'severe',
                'es2-diabetes': '1',
                'es2-pulmonary': '1',
                'es2-neuro': '0',
                'es2-critical': '0',
                'es2-nyha': '3',
                'es2-ccs4': '0',
                'es2-lvef': 'poor',
                'es2-recent-mi': '1',
                'es2-pa-pressure': 'high',
                'es2-arteriopathy': '1',
                'es2-previous-surgery': '0',
                'es2-endocarditis': '0',
                'es2-urgency': 'urgent',
                'es2-procedure-weight': '2-procedures',
                'es2-thoracic-aorta': '0'
            };
            const result = calculateEuroScoreII(createMockGetter(values), createMockGetter(values), createMockRadioGetter(radioValues));
            expect(result).not.toBeNull();
            expect(result.score).toBeGreaterThan(5);
            expect(['High Risk', 'Very High Risk']).toContain(result.interpretation);
        });
    });
    // ===========================================
    // TC-005: Missing Required Input
    // ===========================================
    describe('Validation', () => {
        test('Should return null if age is missing', () => {
            const values = { 'es2-age': null };
            const radioValues = {
                'es2-sex': 'male',
                'es2-renal': 'normal'
            };
            const result = calculateEuroScoreII(createMockGetter(values), createMockGetter(values), createMockRadioGetter(radioValues));
            expect(result).toBeNull();
        });
    });
    // ===========================================
    // TC-006: Procedural Factors
    // ===========================================
    describe('Procedural Factors', () => {
        test('Salvage surgery should significantly increase risk', () => {
            const values = { 'es2-age': 65 };
            const baseRadio = {
                'es2-sex': 'male',
                'es2-renal': 'normal',
                'es2-diabetes': '0',
                'es2-pulmonary': '0',
                'es2-neuro': '0',
                'es2-critical': '0',
                'es2-nyha': '1',
                'es2-ccs4': '0',
                'es2-lvef': 'good',
                'es2-recent-mi': '0',
                'es2-pa-pressure': 'normal',
                'es2-arteriopathy': '0',
                'es2-previous-surgery': '0',
                'es2-endocarditis': '0',
                'es2-procedure-weight': 'cabg',
                'es2-thoracic-aorta': '0'
            };
            const resultElective = calculateEuroScoreII(createMockGetter(values), createMockGetter(values), createMockRadioGetter({ ...baseRadio, 'es2-urgency': 'elective' }));
            const resultSalvage = calculateEuroScoreII(createMockGetter(values), createMockGetter(values), createMockRadioGetter({ ...baseRadio, 'es2-urgency': 'salvage' }));
            expect(resultElective).not.toBeNull();
            expect(resultSalvage).not.toBeNull();
            expect(resultSalvage?.score).toBeGreaterThan((resultElective?.score ?? 0) * 2);
        });
    });
});
