import { qsofaCalculation } from '../../calculators/qsofa/calculation.js';

describe('qSOFA Score Calculator (SaMD Protocol Verification)', () => {
    // Phase 2: Technical Verification (Boundary Analysis)

    test('TC-001: Normal (Negative Screen)', () => {
        // RR 16, SBP 120, GCS 15
        const result = qsofaCalculation({
            rr: 16,
            sbp: 120,
            gcs: 15,
            ams: 'no'
        });

        expect(result[0].value).toBe(0);
        expect(result[0].interpretation).toContain('Negative Screen');
        expect(result[0].alertClass).toBe('success');
    });

    test('TC-002: Boundary Analysis - Respiratory Rate', () => {
        // RR 22 (Threshold) -> 1 Point
        const resHigh = qsofaCalculation({ rr: 22, sbp: 120, gcs: 15 });
        expect(resHigh[0].value).toBe(1);

        // RR 21 (Below) -> 0 Points
        const resLow = qsofaCalculation({ rr: 21, sbp: 120, gcs: 15 });
        expect(resLow[0].value).toBe(0);
    });

    test('TC-003: Boundary Analysis - Systolic BP', () => {
        // SBP 100 (Threshold) -> 1 Point
        const resLow = qsofaCalculation({ rr: 16, sbp: 100, gcs: 15 });
        expect(resLow[0].value).toBe(1);

        // SBP 101 (Above) -> 0 Points
        const resHigh = qsofaCalculation({ rr: 16, sbp: 101, gcs: 15 });
        expect(resHigh[0].value).toBe(0);
    });

    test('TC-004: Neurological Status (GCS vs AMS Toggle)', () => {
        // GCS 14 (<15) -> 1 Point
        const resGCS = qsofaCalculation({ rr: 16, sbp: 120, gcs: 14 });
        expect(resGCS[0].value).toBe(1);

        // AMS Toggle Yes -> 1 Point
        const resAMS = qsofaCalculation({ rr: 16, sbp: 120, gcs: 15, ams: 'yes' });
        expect(resAMS[0].value).toBe(1);
    });

    test('TC-005: Positive Screen (Score >= 2)', () => {
        // RR 22 (+1), SBP 100 (+1) -> Score 2
        const result = qsofaCalculation({
            rr: 22,
            sbp: 100,
            gcs: 15
        });

        expect(result[0].value).toBe(2);
        expect(result[0].interpretation).toContain('Positive Screen');
        expect(result[0].alertClass).toBe('danger');

        const payload = result[0].alertPayload as any;
        expect(payload.metCriteria).toContain('Respiratory Rate ≥ 22');
        expect(payload.metCriteria).toContain('SBP ≤ 100 mmHg');
    });

    test('TC-006: Max Score', () => {
        // all 3
        const result = qsofaCalculation({
            rr: 30,
            sbp: 80,
            gcs: 10
        });
        expect(result[0].value).toBe(3);
    });
});
