import { describe, expect, test } from '@jest/globals';
import { calculateFourPeps } from '../../calculators/4peps/calculation.js';
describe('4PEPS Calculator', () => {
    test('Calculates Very Low Risk correctly', () => {
        const result = calculateFourPeps({
            'fourpeps-age': '40', // <50: -2
            '4peps-sex': '0', // Female: 0
            '4peps-resp_disease': '0', // No: 0
            '4peps-hr': '0', // >80: 0 (Wait, logic says <80 is No(0) or Yes(-1)) -> Logic: HR<80 No(0), Yes(-1).
            // Actually config says: "Heart rate <80", No(0), Yes(-1).
            // If patient has HR 70, input "Yes" (-1).
            '4peps-chest_pain': '0', // No: 0
            '4peps-estrogen': '0', // No
            '4peps-vte': '0', // No
            '4peps-syncope': '0', // No
            '4peps-immobility': '0', // No
            '4peps-o2_sat': '0', // No (<95% is No:0, Yes:3) -> Sat usually >95
            '4peps-calf_pain': '0', // No
            '4peps-pe_likely': '0' // No
        });
        // Score: -2 (Age) = -2
        // Result: <0 -> Very low CPP
        expect(result).not.toBeNull();
        expect(result[0].value).toBe('-2');
        expect(result[1].value).toBe('<2%'); // Very low CPP
        expect(result[0].alertClass).toBe('success');
    });
    test('Calculates High Risk correctly', () => {
        const result = calculateFourPeps({
            'fourpeps-age': '70', // >64: 0
            '4peps-sex': '2', // Male: +2
            '4peps-resp_disease': '0',
            '4peps-hr': '0', // No (<80 is No, means >=80) -> 0
            '4peps-chest_pain': '0',
            '4peps-estrogen': '0',
            '4peps-vte': '2', // Yes: +2
            '4peps-syncope': '0',
            '4peps-immobility': '2', // Yes: +2
            '4peps-o2_sat': '3', // Yes: +3
            '4peps-calf_pain': '3', // Yes: +3
            '4peps-pe_likely': '5' // Yes: +5
        });
        // Score: 0 + 2 + 2 + 2 + 3 + 3 + 5 = 17
        // >12 -> High CPP
        expect(result).not.toBeNull();
        expect(result[0].value).toBe('17');
        expect(result[1].value).toBe('>65%');
        expect(result[0].alertClass).toBe('danger');
    });
    test('Handles Age Categories', () => {
        // <50: -2
        expect(calculateFourPeps({ 'fourpeps-age': '49' })[0].value).toBe('-2');
        // 50-64: -1
        expect(calculateFourPeps({ 'fourpeps-age': '50' })[0].value).toBe('-1');
        expect(calculateFourPeps({ 'fourpeps-age': '64' })[0].value).toBe('-1');
        // >64: 0
        expect(calculateFourPeps({ 'fourpeps-age': '65' })[0].value).toBe('0');
    });
});
