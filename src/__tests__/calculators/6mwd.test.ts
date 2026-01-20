import { describe, expect, test } from '@jest/globals';
import { calculate6MWD } from '../../calculators/6mwd/calculation.js';

describe('6MWD Calculator', () => {
    test('Calculates Distance for Male correctly', () => {
        // formula: (7.57 × height_cm) - (5.02 × age) - (1.76 × weight_kg) - 309
        // Male, 60yo, 175cm, 80kg
        // 7.57*175 - 5.02*60 - 1.76*80 - 309
        // 1324.75 - 301.2 - 140.8 - 309 = 573.75

        const result = calculate6MWD({
            'mwd6-gender': 'male',
            'mwd6-age': '60',
            'mwd6-height': '175',
            'mwd6-weight': '80'
        });

        expect(result).not.toBeNull();
        const expectedVal = result!.find(r => r.label === 'Expected Distance');
        expect(expectedVal?.value).toBe('574'); // rounded
    });

    test('Calculates Distance for Female correctly', () => {
        // formula: (2.11 × height_cm) - (2.29 × weight_kg) - (5.78 × age) + 667
        // Female, 60yo, 160cm, 60kg
        // 2.11*160 - 2.29*60 - 5.78*60 + 667
        // 337.6 - 137.4 - 346.8 + 667 = 520.4

        const result = calculate6MWD({
            'mwd6-gender': 'female',
            'mwd6-age': '60',
            'mwd6-height': '160',
            'mwd6-weight': '60'
        });

        expect(result).not.toBeNull();
        const expectedVal = result!.find(r => r.label === 'Expected Distance');
        expect(expectedVal?.value).toBe('520'); // rounded
    });

    test('Calculates Percentage of Expected', () => {
        // Based on Male test expectation ~574m
        // Actual walked = 400m
        // % = 400 / 573.75 = ~69.7%

        const result = calculate6MWD({
            'mwd6-gender': 'male',
            'mwd6-age': '60',
            'mwd6-height': '175',
            'mwd6-weight': '80',
            'mwd6-distance': '400'
        });

        const pct = result!.find(r => r.label === '% of Expected');
        expect(pct).toBeDefined();
        expect(pct?.value).toBe('70'); // rounded
        expect(pct?.interpretation).toBe('Reduced'); // <80%
    });

    test('Returns null for invalid inputs', () => {
        const result = calculate6MWD({
            'mwd6-age': 'invalid'
        });
        expect(result).toBeNull();
    });
});
