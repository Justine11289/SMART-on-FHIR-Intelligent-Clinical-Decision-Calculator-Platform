/**
 * Due Date Calculator Tests
 */

import { describe, expect, test } from '@jest/globals';
import { calculatePregnancyDates } from '../../calculators/due-date/index.js';

describe('Due Date Calculator Logic', () => {
    // Mock current date to a fixed point for stable tests
    // Let's assume "Today" is 2023-10-01
    const FIXED_NOW = new Date(2023, 9, 1); // Month is 0-indexed: 9 -> Oct

    // Helper function to format date as YYYY-MM-DD using local time (not UTC)
    const formatLocalDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    test('LMP today (0 weeks GA)', () => {
        // LMP: 2023-10-01
        // We must pass a new clone of FIXED_NOW because the function mutates it (setHours)
        const result = calculatePregnancyDates('2023-10-01', new Date(FIXED_NOW));

        expect(result).not.toBeNull();
        expect(result?.gaWeeks).toBe(0);
        expect(result?.gaDays).toBe(0);
        expect(result?.diffDays).toBe(0);

        // EDD should be +280 days
        const expectedEDD = new Date(2023, 9, 1);
        expectedEDD.setDate(expectedEDD.getDate() + 280);

        expect(result?.edd.getFullYear()).toBe(expectedEDD.getFullYear());
        expect(result?.edd.getMonth()).toBe(expectedEDD.getMonth());
        expect(result?.edd.getDate()).toBe(expectedEDD.getDate());
    });

    test('LMP 10 weeks ago', () => {
        // 10 weeks = 70 days.
        // Today 2023-10-01
        // LMP = 2023-10-01 - 70 days
        const lmp = new Date(FIXED_NOW);
        lmp.setDate(lmp.getDate() - 70);
        const lmpStr = formatLocalDate(lmp); // Use local date format to avoid timezone issues

        const result = calculatePregnancyDates(lmpStr, new Date(FIXED_NOW));
        expect(result?.gaWeeks).toBe(10);
        expect(result?.gaDays).toBe(0);
        expect(result?.diffDays).toBe(70);
    });

    test('LMP in future (Negative GA)', () => {
        const future = new Date(FIXED_NOW);
        future.setDate(future.getDate() + 10);
        const lmpStr = formatLocalDate(future); // Use local date format to avoid timezone issues

        const result = calculatePregnancyDates(lmpStr, new Date(FIXED_NOW));
        expect(result?.diffDays).toBe(-10);
        expect(result?.gaWeeks).toBe(-2); // -1.4 -> -2 weeks floor? No, floor(-10/7) = -2 (since -1.42). Correct.
    });

    test('Invalid Date String', () => {
        const result = calculatePregnancyDates('invalid-date', new Date(FIXED_NOW));
        expect(result).toBeNull();
    });
});
