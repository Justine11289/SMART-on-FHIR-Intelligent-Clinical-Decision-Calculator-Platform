import { maintenanceFluidsConfig } from '../../calculators/maintenance-fluids/index.js';
import { calculateMaintenanceFluids } from '../../calculators/maintenance-fluids/calculation.js';

describe('Maintenance Fluids Calculator', () => {
    describe('Calculation Logic (Holliday-Segar)', () => {
        test('First 10kg Range: 8kg', () => {
            const input = { 'weight-fluids': 8 };
            const result = calculateMaintenanceFluids(input);
            expect(result).not.toBeNull();
            if (result) {
                // 8 * 4 = 32
                expect(result[0].value).toBe('32.0'); // Hourly
                expect(result[1].value).toBe((32 * 24).toFixed(1)); // Daily
            }
        });

        test('Breakpoint 10kg', () => {
            const input = { 'weight-fluids': 10 };
            const result = calculateMaintenanceFluids(input);
            // 10 * 4 = 40
            expect(result![0].value).toBe('40.0');
        });

        test('Second Range (11-20kg): 15kg', () => {
            const input = { 'weight-fluids': 15 };
            const result = calculateMaintenanceFluids(input);
            // 40 + (5 * 2) = 50
            expect(result![0].value).toBe('50.0');
        });

        test('Breakpoint 20kg', () => {
            const input = { 'weight-fluids': 20 };
            const result = calculateMaintenanceFluids(input);
            // 40 + 20 = 60
            expect(result![0].value).toBe('60.0');
        });

        test('Third Range (>20kg): 70kg', () => {
            const input = { 'weight-fluids': 70 };
            const result = calculateMaintenanceFluids(input);
            // 60 + (50 * 1) = 110
            expect(result![0].value).toBe('110.0');
        });

        test('High Weight: 100kg', () => {
            const input = { 'weight-fluids': 100 };
            const result = calculateMaintenanceFluids(input);
            // 60 + 80 = 140
            expect(result![0].value).toBe('140.0');
        });

        test('Invalid Input: <= 0', () => {
            const input = { 'weight-fluids': 0 };
            expect(calculateMaintenanceFluids(input)).toBeNull();

            const input2 = { 'weight-fluids': -5 };
            expect(calculateMaintenanceFluids(input2)).toBeNull();
        });
    });
});
