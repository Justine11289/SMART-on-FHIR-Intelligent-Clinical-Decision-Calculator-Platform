import { describe, expect, test } from '@jest/globals';
import { calculateAge } from '../utils';
import { UnitConverter } from '../unit-converter';

describe('Utility Functions', () => {
    describe('calculateAge', () => {
        test('should calculate age accurately for past date', () => {
            // Mock Date to ensure deterministic tests
            const realDate = Date;
            const mockToday = new Date('2023-10-15T00:00:00Z');

            // @ts-ignore
            global.Date = class extends Date {
                constructor(date: any) {
                    if (date) {
                        return super(date) as any;
                    }
                    return mockToday as any;
                }
                static now() {
                    return mockToday.getTime();
                }
            };

            // 2000-10-15 -> 23
            expect(calculateAge('2000-10-15')).toBe(23);

            // 2000-10-16 -> 22 (hasn't had birthday yet)
            expect(calculateAge('2000-10-16')).toBe(22);

            // 2000-10-14 -> 23 (had birthday)
            expect(calculateAge('2000-10-14')).toBe(23);

            // Restore Date
            global.Date = realDate;
        });
    });

    describe('UnitConverter.convert', () => {
        test('should return same value if units are identical', () => {
            expect(UnitConverter.convert(100, 'mg/dL', 'mg/dL', 'glucose')).toBe(100);
        });

        test('should convert glucose mg/dL to mmol/L', () => {
            // Factor: 0.0555
            const result = UnitConverter.convert(100, 'mg/dL', 'mmol/L', 'glucose');
            expect(result).toBeCloseTo(5.55);
        });

        test('should convert glucose mmol/L to mg/dL', () => {
            // Factor: 18.018
            const result = UnitConverter.convert(5.55, 'mmol/L', 'mg/dL', 'glucose');
            expect(result).toBeCloseTo(99.9999);
        });

        test('should convert temperature C to F', () => {
            // (100 * 9/5) + 32 = 212
            const result = UnitConverter.convert(100, 'C', 'F', 'temperature');
            expect(result).toBe(212);
        });

        test('should convert temperature F to C', () => {
            // (212 - 32) * 5/9 = 100
            const result = UnitConverter.convert(212, 'F', 'C', 'temperature');
            expect(result).toBe(100);
        });

        test('should return null for invalid measurement type', () => {
            // @ts-ignore
            expect(UnitConverter.convert(100, 'kg', 'lbs', 'invalidType')).toBeNull();
        });

        test('should return null for invalid unit conversion', () => {
            expect(UnitConverter.convert(100, 'kg', 'meter', 'weight')).toBeNull();
        });
    });
});
