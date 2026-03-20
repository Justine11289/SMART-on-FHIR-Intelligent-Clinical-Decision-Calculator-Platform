import { phenytoinCorrectionCalculation } from '../../calculators/phenytoin-correction/calculation.js';
describe('Phenytoin Correction Calculator', () => {
    test('Should calculate for Normal Renal Function (K=0.1)', () => {
        // Total 8.0, Albumin 3.0, K=0.1 (Normal)
        // Denom = ((0.9) * 3.0 / 4.4) + 0.1 = (2.7 / 4.4) + 0.1 = 0.6136 + 0.1 = 0.7136
        // Corrected = 8.0 / 0.7136 ≈ 11.21
        const result = phenytoinCorrectionCalculation({
            'pheny-total': 8.0,
            'pheny-albumin': 3.0,
            'pheny-renal': 'no'
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(11.2);
        expect(result[0].interpretation).toBe(''); // Within therapeutic range (10-20)
        expect(result[0].alertClass).toBe('success');
    });
    test('Should calculate for Renal Failure (K=0.2)', () => {
        // Total 8.0, Albumin 3.0, K=0.2 (Renal Failure)
        // Denom = ((0.8) * 3.0 / 4.4) + 0.2 = (2.4 / 4.4) + 0.2 = 0.5454 + 0.2 = 0.7454
        // Corrected = 8.0 / 0.7454 ≈ 10.73
        const result = phenytoinCorrectionCalculation({
            'pheny-total': 8.0,
            'pheny-albumin': 3.0,
            'pheny-renal': 'yes'
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(10.7);
        expect(result[0].interpretation).toBe('');
    });
    test('Should detect Subtherapeutic levels', () => {
        // Total 5.0, Albumin 4.4, K=0.1 (Normal)
        // Denom = ((0.9 * 4.4 / 4.4) + 0.1) = 0.9 + 0.1 = 1.0
        // Corrected = 5.0 / 1.0 = 5.0
        const result = phenytoinCorrectionCalculation({
            'pheny-total': 5.0,
            'pheny-albumin': 4.4,
            'pheny-renal': 'no'
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(5.0);
        expect(result[0].interpretation).toBe('Subtherapeutic');
        expect(result[0].alertClass).toBe('info');
    });
    test('Should detect Toxic levels', () => {
        // Total 25.0, Albumin 4.4, K=0.1 -> Corrected = 25.0
        const result = phenytoinCorrectionCalculation({
            'pheny-total': 25.0,
            'pheny-albumin': 4.4,
            'pheny-renal': 'no'
        });
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(25.0);
        expect(result[0].interpretation).toBe('Potentially Toxic');
        expect(result[0].alertClass).toBe('danger');
    });
    test('Should returned empty for missing inputs', () => {
        const result = phenytoinCorrectionCalculation({
            'pheny-total': 8.0,
            'pheny-albumin': null,
            'pheny-renal': 'no'
        });
        expect(result).toHaveLength(0);
    });
});
