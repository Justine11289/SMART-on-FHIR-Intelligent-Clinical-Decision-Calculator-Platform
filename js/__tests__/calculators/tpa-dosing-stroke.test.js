/**
 * tPA Dosing for Acute Stroke Calculator - SaMD Verification Tests
 *
 * Formula:
 *   Total Dose = 0.9 mg/kg (Maximum 90 mg)
 *   Bolus Dose = 10% of total dose
 *   Infusion Dose = 90% of total dose
 *
 * Eligibility:
 *   Time from symptom onset ≤ 4.5 hours for IV tPA
 *
 * Reference:
 * NINDS rt-PA Stroke Study Group. N Engl J Med. 1995;333(24):1581-1587.
 */
import { calculateTpaDosingStroke } from '../../calculators/tpa-dosing-stroke/calculation.js';
describe('tPA Dosing for Acute Stroke Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    describe('Standard Calculations', () => {
        test('Should calculate correct doses for 70 kg patient', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 70,
                'tpa-stroke-onset': 2
            });
            expect(result).not.toBeNull();
            expect(result).toHaveLength(4);
            // Eligibility
            const eligibility = result.find(r => r.label === 'Eligibility Status');
            expect(eligibility?.value).toBe('eligible');
            expect(eligibility?.alertClass).toBe('success');
            // Total Dose: 70 * 0.9 = 63 mg
            const totalDose = result.find(r => r.label === 'Total Dose');
            expect(totalDose?.value).toBe('63.0');
            // Bolus: 63 * 0.1 = 6.3 mg
            const bolus = result.find(r => r.label === 'Step 1: IV Bolus');
            expect(bolus?.value).toBe('6.3');
            // Infusion: 63 * 0.9 = 56.7 mg
            const infusion = result.find(r => r.label === 'Step 2: Continuous Infusion');
            expect(infusion?.value).toBe('56.7');
        });
    });
    // ===========================================
    // TC-002: Eligibility Tests
    // ===========================================
    describe('Eligibility', () => {
        test('Should be eligible when onset ≤ 4.5 hours', () => {
            const testCases = [0, 1, 2, 3, 4, 4.5];
            testCases.forEach(onset => {
                const result = calculateTpaDosingStroke({
                    'tpa-stroke-weight': 70,
                    'tpa-stroke-onset': onset
                });
                const eligibility = result.find(r => r.label === 'Eligibility Status');
                expect(eligibility?.eligibilityStatus).toBe('eligible');
                expect(eligibility?.alertClass).toBe('success');
            });
        });
        test('Should be ineligible when onset > 4.5 hours', () => {
            const testCases = [4.6, 5, 6, 10, 24];
            testCases.forEach(onset => {
                const result = calculateTpaDosingStroke({
                    'tpa-stroke-weight': 70,
                    'tpa-stroke-onset': onset
                });
                const eligibility = result.find(r => r.label === 'Eligibility Status');
                expect(eligibility?.eligibilityStatus).toBe('ineligible');
                expect(eligibility?.alertClass).toBe('danger');
            });
        });
        test('Should be unknown when onset not provided', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 70
            });
            const eligibility = result.find(r => r.label === 'Eligibility Status');
            expect(eligibility?.eligibilityStatus).toBe('unknown');
            expect(eligibility?.alertClass).toBe('warning');
        });
        test('Should be eligible at exactly 4.5 hours', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 70,
                'tpa-stroke-onset': 4.5
            });
            const eligibility = result.find(r => r.label === 'Eligibility Status');
            expect(eligibility?.eligibilityStatus).toBe('eligible');
        });
    });
    // ===========================================
    // TC-003: Maximum Dose Cap Tests
    // ===========================================
    describe('Maximum Dose Cap', () => {
        test('Should cap total dose at 90 mg for weight > 100 kg', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 120,
                'tpa-stroke-onset': 2
            });
            const totalDose = result.find(r => r.label === 'Total Dose');
            expect(totalDose?.value).toBe('90.0');
            expect(totalDose?.interpretation).toContain('Capped');
            expect(totalDose?.alertClass).toBe('warning');
        });
        test('Should not show cap for weight ≤ 100 kg', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 100,
                'tpa-stroke-onset': 2
            });
            const totalDose = result.find(r => r.label === 'Total Dose');
            expect(totalDose?.value).toBe('90.0');
            expect(totalDose?.interpretation).not.toContain('Capped');
        });
    });
    // ===========================================
    // TC-004: Dose Ratio Tests
    // ===========================================
    describe('Dose Ratios', () => {
        test('Bolus should be exactly 10% of total', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 80,
                'tpa-stroke-onset': 2
            });
            const total = parseFloat(result.find(r => r.label === 'Total Dose')?.value);
            const bolus = parseFloat(result.find(r => r.label === 'Step 1: IV Bolus')?.value);
            expect(bolus).toBeCloseTo(total * 0.1, 1);
        });
        test('Infusion should be exactly 90% of total', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 80,
                'tpa-stroke-onset': 2
            });
            const total = parseFloat(result.find(r => r.label === 'Total Dose')?.value);
            const infusion = parseFloat(result.find(r => r.label === 'Step 2: Continuous Infusion')?.value);
            expect(infusion).toBeCloseTo(total * 0.9, 1);
        });
    });
    // ===========================================
    // TC-005: Invalid Input Tests
    // ===========================================
    describe('Invalid Inputs', () => {
        test('Should return null for zero weight', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': 0,
                'tpa-stroke-onset': 2
            });
            expect(result).toBeNull();
        });
        test('Should return null for negative weight', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-weight': -70,
                'tpa-stroke-onset': 2
            });
            expect(result).toBeNull();
        });
        test('Should return null for missing weight', () => {
            const result = calculateTpaDosingStroke({
                'tpa-stroke-onset': 2
            });
            expect(result).toBeNull();
        });
    });
    // ===========================================
    // TC-006: Golden Dataset Verification
    // ===========================================
    describe('Golden Dataset', () => {
        const goldenDataset = [
            // weight, onset, total, bolus, infusion, eligible
            { w: 50, o: 2, total: 45.0, bolus: 4.5, infusion: 40.5, eligible: true },
            { w: 70, o: 3, total: 63.0, bolus: 6.3, infusion: 56.7, eligible: true },
            { w: 90, o: 4, total: 81.0, bolus: 8.1, infusion: 72.9, eligible: true },
            { w: 100, o: 4.5, total: 90.0, bolus: 9.0, infusion: 81.0, eligible: true },
            { w: 110, o: 2, total: 90.0, bolus: 9.0, infusion: 81.0, eligible: true },
            { w: 70, o: 5, total: 63.0, bolus: 6.3, infusion: 56.7, eligible: false }
        ];
        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.w}kg, ${data.o}h`, () => {
                const result = calculateTpaDosingStroke({
                    'tpa-stroke-weight': data.w,
                    'tpa-stroke-onset': data.o
                });
                expect(result).not.toBeNull();
                const eligibility = result.find(r => r.label === 'Eligibility Status');
                expect(eligibility?.eligibilityStatus).toBe(data.eligible ? 'eligible' : 'ineligible');
                const total = parseFloat(result.find(r => r.label === 'Total Dose')?.value);
                const bolus = parseFloat(result.find(r => r.label === 'Step 1: IV Bolus')?.value);
                const infusion = parseFloat(result.find(r => r.label === 'Step 2: Continuous Infusion')?.value);
                expect(total).toBeCloseTo(data.total, 1);
                expect(bolus).toBeCloseTo(data.bolus, 1);
                expect(infusion).toBeCloseTo(data.infusion, 1);
            });
        });
    });
});
