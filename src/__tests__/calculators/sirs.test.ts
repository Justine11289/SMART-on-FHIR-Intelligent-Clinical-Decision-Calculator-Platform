import { sirsCalculation } from '../../calculators/sirs/calculation.js';

describe('SIRS Criteria Calculator (SaMD Protocol Verification)', () => {
    // Phase 2: Technical Verification (Boundary Analysis)

    test('TC-001: Normal Values (0 Criteria)', () => {
        // Temp 37, HR 80, RR 16, WBC 7.5
        const result = sirsCalculation({
            temp: 37.0,
            hr: 80,
            rr: 16,
            wbc: 7.5,
            infection: 'no',
            hypotension: 'no'
        });

        const p = result[0].alertPayload as any;
        expect(p.criteriaCount).toBe(0);
        expect(result[0].interpretation).toBe('Normal');
        expect(result[0].alertClass).toBe('success');
    });

    test('TC-002: Boundary Analysis - Temperature', () => {
        // High Temp Boundary > 38
        const resHigh = sirsCalculation({
            temp: 38.1,
            hr: 80,
            rr: 16,
            wbc: 7.5,
            infection: 'no',
            hypotension: 'no'
        });
        expect((resHigh[0].alertPayload as any).criteriaCount).toBe(1);

        // Low Temp Boundary < 36
        const resLow = sirsCalculation({
            temp: 35.9,
            hr: 80,
            rr: 16,
            wbc: 7.5,
            infection: 'no',
            hypotension: 'no'
        });
        expect((resLow[0].alertPayload as any).criteriaCount).toBe(1);

        // Normal Temp Boundary 36 & 38
        const resNorm1 = sirsCalculation({ temp: 36.0, hr: 80, rr: 16, wbc: 7.5 });
        expect((resNorm1[0].alertPayload as any).criteriaCount).toBe(0);

        const resNorm2 = sirsCalculation({ temp: 38.0, hr: 80, rr: 16, wbc: 7.5 });
        expect((resNorm2[0].alertPayload as any).criteriaCount).toBe(0);
    });

    test('TC-003: Boundary Analysis - Heart Rate', () => {
        // > 90
        const resHigh = sirsCalculation({ temp: 37, hr: 91, rr: 16, wbc: 7.5 });
        expect((resHigh[0].alertPayload as any).criteriaCount).toBe(1);

        // = 90
        const resNorm = sirsCalculation({ temp: 37, hr: 90, rr: 16, wbc: 7.5 });
        expect((resNorm[0].alertPayload as any).criteriaCount).toBe(0);
    });

    test('TC-004: Boundary Analysis - WBC / Bands', () => {
        // Low WBC < 4
        const resLow = sirsCalculation({ temp: 37, hr: 80, rr: 16, wbc: 3.9 });
        expect((resLow[0].alertPayload as any).criteriaCount).toBe(1);

        // High WBC > 12
        const resHigh = sirsCalculation({ temp: 37, hr: 80, rr: 16, wbc: 12.1 });
        expect((resHigh[0].alertPayload as any).criteriaCount).toBe(1);

        // Bands > 10%
        const resBands = sirsCalculation({ temp: 37, hr: 80, rr: 16, wbc: 7.5, bands: 11 });
        expect((resBands[0].alertPayload as any).criteriaCount).toBe(1);
    });

    test('TC-005: Sepsis Diagnosis (2 Criteria + Infection)', () => {
        const result = sirsCalculation({
            temp: 39.0, // +1
            hr: 100, // +1
            rr: 16,
            wbc: 7.5,
            infection: 'yes',
            hypotension: 'no'
        });

        expect((result[0].alertPayload as any).criteriaCount).toBe(2);
        expect(result[0].interpretation).toBe('Sepsis');
        expect(result[0].alertClass).toBe('danger');
    });

    test('TC-006: Septic Shock (Sepsis + Hypotension)', () => {
        const result = sirsCalculation({
            temp: 39.0, // +1
            hr: 100, // +1
            rr: 16,
            wbc: 7.5,
            infection: 'yes',
            hypotension: 'yes'
        });

        expect(result[0].interpretation).toBe('Septic Shock');
    });
});
