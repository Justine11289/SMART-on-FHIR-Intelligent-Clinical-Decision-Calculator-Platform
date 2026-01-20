/**
 * GWTG-HF Calculator - SaMD Verification Tests
 *
 * Formula: Sum of points from SBP, BUN, Na, Age, HR, COPD, Race.
 */

import { calculateGwtgHf } from '../../calculators/gwtg-hf/calculation';

describe('GWTG-HF Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================

    // Case 1: Low Risk
    // SBP 150 (0)
    // BUN 10 (0)
    // Na 130 (0)
    // Age 35 (0)
    // HR 65 (0)
    // COPD No (0)
    // Race No (0)
    // Total: 0 -> <1% mortality
    test('Low Risk Case', () => {
        const result = calculateGwtgHf({
            'gwtg-sbp': '150',
            'gwtg-bun': '10',
            'gwtg-sodium': '130',
            'gwtg-age': '35',
            'gwtg-hr': '65',
            copd: '0',
            race: '0'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'GWTG-HF Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(0);
        const mortItem = result!.find(r => r.label === 'In-hospital Mortality');
        expect(mortItem!.value).toBe('<1%');
        expect(scoreItem!.interpretation).toBe('Low Risk'); // actually default is Low Risk
    });

    // Case 2: High Risk
    // SBP 80 (28)
    // BUN 80 (28)
    // Na 145 (4)
    // Age 85 (28)
    // HR 120 (8)
    // COPD Yes (2)
    // Race No (0)
    // Total: 28+28+4+28+8+2 = 98 -> >50% mortality
    test('High Risk Case', () => {
        const result = calculateGwtgHf({
            'gwtg-sbp': '80',
            'gwtg-bun': '80',
            'gwtg-sodium': '145',
            'gwtg-age': '85',
            'gwtg-hr': '120',
            copd: '2',
            race: '0'
        });

        expect(result).not.toBeNull();
        const scoreItem = result!.find(r => r.label === 'GWTG-HF Score');
        const score = parseInt(scoreItem!.value as string, 10);
        expect(score).toBe(98);
        const mortItem = result!.find(r => r.label === 'In-hospital Mortality');
        expect(mortItem!.value).toBe('>50%');
        expect(scoreItem!.interpretation).toBe('High Risk');
    });

    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should return empty for missing inputs', () => {
        const result = calculateGwtgHf({
            'gwtg-sbp': '150'
            // Partial inputs
        });
        expect(result).toHaveLength(0);
    });
});
