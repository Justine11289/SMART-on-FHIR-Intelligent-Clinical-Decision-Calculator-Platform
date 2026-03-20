import { qtcCalculation } from '../../calculators/qtc/calculation.js';
describe('QTc Calculator (SaMD Protocol Verification)', () => {
    // Phase 1: Formula Verification
    // QT 400ms, HR 60bpm -> RR 1.0s. All formulas should yield 400ms.
    test('TC-001: Baseline Formula Verification (HR 60)', () => {
        const formulas = ['bazett', 'fridericia', 'hodges', 'framingham'];
        formulas.forEach(f => {
            const res = qtcCalculation({ qt: 400, hr: 60, gender: 'male', formula: f });
            expect(res[0].value).toBe(400);
        });
    });
    test('TC-002: Formula Comparison at Tachycardia (HR 120)', () => {
        // QT 300, HR 120 (RR 0.5s)
        // Bazett: 300 / sqrt(0.5) = 424.26
        // Fridericia: 300 / cbrt(0.5) = 377.97
        // Hodges: 300 + 1.75(60) = 405
        // Framingham: 300 + 154(0.5) = 377
        const baz = qtcCalculation({ qt: 300, hr: 120, formula: 'bazett' })[0].value;
        const frid = qtcCalculation({ qt: 300, hr: 120, formula: 'fridericia' })[0].value;
        // Bazett overestimates at high HR
        expect(baz).toBeGreaterThan(frid);
        expect(baz).toBe(424);
        expect(frid).toBe(378);
    });
    // Phase 2: Boundary Value Analysis (Gender & Risk)
    test('TC-003: Male Cutoff Verification', () => {
        // Limit: 450
        // Case 1: 450 (Normal)
        // RR = 1 (HR 60). QT 450.
        const resMaleNormal = qtcCalculation({ qt: 450, hr: 60, gender: 'male' });
        expect(resMaleNormal[0].interpretation).toBe('Normal');
        // Case 2: 451 (Prolonged)
        const resMaleProlonged = qtcCalculation({ qt: 451, hr: 60, gender: 'male' });
        expect(resMaleProlonged[0].interpretation).toBe('Prolonged');
        expect(resMaleProlonged[0].alertClass).toBe('warning');
    });
    test('TC-004: Female Cutoff Verification', () => {
        // Limit: 460
        // Case 1: 460 (Normal)
        const resFemaleNormal = qtcCalculation({ qt: 460, hr: 60, gender: 'female' });
        expect(resFemaleNormal[0].interpretation).toBe('Normal');
        // Case 2: 461 (Prolonged)
        const resFemaleProlonged = qtcCalculation({ qt: 461, hr: 60, gender: 'female' });
        expect(resFemaleProlonged[0].interpretation).toBe('Prolonged');
    });
    test('TC-005: High Risk Threshold (> 500ms)', () => {
        const resHighRisk = qtcCalculation({ qt: 501, hr: 60, gender: 'male' });
        expect(resHighRisk[0].interpretation).toContain('High Risk');
        expect(resHighRisk[0].alertClass).toBe('danger');
    });
});
