/**
 * Data Staleness Module Tests
 * Tests for staleness tracking and observation date utilities
 */

import { describe, expect, test, beforeEach } from '@jest/globals';
import {
    DataStalenessTracker,
    createStalenessTracker,
    getObservationDate,
    isObservationStale
} from '../data-staleness.js';

describe('Data Staleness Module', () => {
    // =========================================
    // getObservationDate Function Tests
    // =========================================
    describe('getObservationDate', () => {
        test('should return Date from effectiveDateTime', () => {
            const observation = {
                effectiveDateTime: '2024-01-15T10:30:00Z'
            };
            const date = getObservationDate(observation);
            expect(date).toBeInstanceOf(Date);
            expect(date?.toISOString()).toBe('2024-01-15T10:30:00.000Z');
        });

        test('should return Date from issued if effectiveDateTime not present', () => {
            const observation = {
                issued: '2024-02-20T14:00:00Z'
            };
            const date = getObservationDate(observation);
            expect(date).toBeInstanceOf(Date);
            expect(date?.toISOString()).toBe('2024-02-20T14:00:00.000Z');
        });

        test('should return null for observation without date', () => {
            const observation = {
                valueQuantity: { value: 100 }
            };
            expect(getObservationDate(observation)).toBeNull();
        });

        test('should return null for null observation', () => {
            expect(getObservationDate(null)).toBeNull();
        });

        test('should return null for undefined observation', () => {
            expect(getObservationDate(undefined)).toBeNull();
        });
    });

    // =========================================
    // isObservationStale Function Tests
    // =========================================
    describe('isObservationStale', () => {
        test('should return false for recent observation', () => {
            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

            const observation = {
                effectiveDateTime: recentDate.toISOString()
            };
            expect(isObservationStale(observation)).toBe(false);
        });

        test('should return true for observation older than 90 days', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 100); // 100 days ago

            const observation = {
                effectiveDateTime: oldDate.toISOString()
            };
            expect(isObservationStale(observation)).toBe(true);
        });

        test('should respect custom threshold', () => {
            const date = new Date();
            date.setDate(date.getDate() - 10); // 10 days ago

            const observation = {
                effectiveDateTime: date.toISOString()
            };

            // With 7-day threshold, 10 days ago is stale
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            expect(isObservationStale(observation, sevenDaysMs)).toBe(true);

            // With 30-day threshold, 10 days ago is not stale
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            expect(isObservationStale(observation, thirtyDaysMs)).toBe(false);
        });

        test('should return false for observation without date', () => {
            const observation = {
                valueQuantity: { value: 100 }
            };
            expect(isObservationStale(observation)).toBe(false);
        });
    });

    // =========================================
    // createStalenessTracker Function Tests
    // =========================================
    describe('createStalenessTracker', () => {
        test('should create tracker with default options', () => {
            const tracker = createStalenessTracker();
            expect(tracker).toBeInstanceOf(DataStalenessTracker);
        });

        test('should create tracker with custom threshold', () => {
            const customThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days
            const tracker = createStalenessTracker({ thresholdMs: customThreshold });
            expect(tracker).toBeInstanceOf(DataStalenessTracker);
        });
    });

    // =========================================
    // DataStalenessTracker Class Tests
    // =========================================
    describe('DataStalenessTracker', () => {
        let tracker: DataStalenessTracker;

        beforeEach(() => {
            tracker = new DataStalenessTracker();
        });

        test('should initialize with zero stale items', () => {
            expect(tracker.getStaleCount()).toBe(0);
        });

        test('should track stale observation', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 100); // 100 days ago

            const observation = {
                effectiveDateTime: oldDate.toISOString()
            };

            const result = tracker.trackObservation(
                '#creatinine',
                observation,
                '2160-0',
                'Creatinine'
            );
            expect(result).not.toBeNull();
            expect(result?.isStale).toBe(true);
            expect(tracker.getStaleCount()).toBe(1);
        });

        test('should not track recent observation as stale', () => {
            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

            const observation = {
                effectiveDateTime: recentDate.toISOString()
            };

            const result = tracker.trackObservation(
                '#hemoglobin',
                observation,
                '718-7',
                'Hemoglobin'
            );
            // trackObservation returns staleness info, but isStale should be false for recent observations
            // and it won't be added to the stale items list
            expect(tracker.getStaleCount()).toBe(0);
        });

        test('should clear field tracking', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 100);

            const observation = { effectiveDateTime: oldDate.toISOString() };
            tracker.trackObservation('#test', observation, '0000-0', 'Test');
            expect(tracker.getStaleCount()).toBe(1);

            tracker.clearField('#test');
            expect(tracker.getStaleCount()).toBe(0);
        });

        test('should clear all tracking', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 100);

            const observation = { effectiveDateTime: oldDate.toISOString() };
            tracker.trackObservation('#field1', observation, '0000-0', 'Field 1');
            tracker.trackObservation('#field2', observation, '0000-1', 'Field 2');
            expect(tracker.getStaleCount()).toBe(2);

            tracker.clearAll();
            expect(tracker.getStaleCount()).toBe(0);
        });

        test('should return stale items array', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 100);

            const observation = { effectiveDateTime: oldDate.toISOString() };
            tracker.trackObservation('#sodium', observation, '2951-2', 'Sodium');

            const items = tracker.getStaleItems();
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBe(1);
            expect(items[0]).toHaveProperty('fieldId', '#sodium');
        });

        test('checkStaleness should return staleness info', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 100);

            const observation = { effectiveDateTime: oldDate.toISOString() };
            const info = tracker.checkStaleness(observation);

            expect(info).not.toBeNull();
            expect(info?.isStale).toBe(true);
            expect(info?.ageInDays).toBeGreaterThanOrEqual(100);
        });

        test('checkStaleness should return null for observation without date', () => {
            const observation = { valueQuantity: { value: 100 } };
            const info = tracker.checkStaleness(observation);
            expect(info).toBeNull();
        });
    });
});
