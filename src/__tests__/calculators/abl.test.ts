import { describe, expect, test } from '@jest/globals';
import { calculateABL } from '../../calculators/abl/calculation.js';

describe('Allowable Blood Loss (ABL) Calculator', () => {
    test('Calculates ABL correctly', () => {
        // Weight 70kg, Category 75ml/kg (Adult Man), Init Hgb 14, Final Hgb 7
        // EBV = 70 * 75 = 5250 mL
        // Avg Hgb = (14 + 7) / 2 = 10.5
        // ABL = 5250 * (14 - 7) / 10.5 = 5250 * 7 / 10.5 = 3500 mL

        const result = calculateABL({
            'abl-weight': '70',
            'abl-age-category': '75',
            'abl-hgb-initial': '14',
            'abl-hgb-final': '7'
        });

        expect(result).not.toBeNull();
        const abl = result!.find(r => r.label === 'Maximum Allowable Blood Loss');
        expect(abl?.value).toBe('3500');
    });

    test('Returns null if Init Hgb <= Final Hgb', () => {
        const result = calculateABL({
            'abl-weight': '70',
            'abl-age-category': '75',
            'abl-hgb-initial': '8',
            'abl-hgb-final': '10'
        });
        expect(result).toBeNull();
    });

    test('Validates infant category', () => {
        // Infant 5kg, 80ml/kg. Init 15, Final 10.
        // EBV = 400
        // Avg = 12.5
        // ABL = 400 * 5 / 12.5 = 160

        const result = calculateABL({
            'abl-weight': '5',
            'abl-age-category': '80', // Infant
            'abl-hgb-initial': '15',
            'abl-hgb-final': '10'
        });

        expect(result![0].value).toBe('160');
    });
});
