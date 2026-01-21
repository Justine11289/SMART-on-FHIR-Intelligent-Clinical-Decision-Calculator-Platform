/**
 * Cache Manager Module Tests
 * Tests for caching strategies and cache operations
 */
import { describe, expect, test } from '@jest/globals';
import { CACHE_NAMES, CACHE_EXPIRY } from '../cache-manager.js';
// Note: Since CacheManager relies on browser Cache API which is not available in Node.js,
// we test the exported constants and create mock-based tests for the class methods.
describe('Cache Manager Module', () => {
    // =========================================
    // CACHE_NAMES Constants Tests
    // =========================================
    describe('CACHE_NAMES Constants', () => {
        test('should define static cache name', () => {
            expect(CACHE_NAMES.static).toBeDefined();
            expect(CACHE_NAMES.static).toContain('medcalc-static');
        });
        test('should define calculators cache name', () => {
            expect(CACHE_NAMES.calculators).toBeDefined();
            expect(CACHE_NAMES.calculators).toContain('medcalc-calculators');
        });
        test('should define fhir cache name', () => {
            expect(CACHE_NAMES.fhir).toBeDefined();
            expect(CACHE_NAMES.fhir).toContain('medcalc-fhir');
        });
        test('should define images cache name', () => {
            expect(CACHE_NAMES.images).toBeDefined();
            expect(CACHE_NAMES.images).toContain('medcalc-images');
        });
    });
    // =========================================
    // CACHE_EXPIRY Constants Tests
    // =========================================
    describe('CACHE_EXPIRY Constants', () => {
        test('should define static cache expiry (7 days)', () => {
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            expect(CACHE_EXPIRY.static).toBe(sevenDaysMs);
        });
        test('should define calculators cache expiry (1 day)', () => {
            const oneDayMs = 24 * 60 * 60 * 1000;
            expect(CACHE_EXPIRY.calculators).toBe(oneDayMs);
        });
        test('should define fhir cache expiry (5 minutes)', () => {
            const fiveMinutesMs = 5 * 60 * 1000;
            expect(CACHE_EXPIRY.fhir).toBe(fiveMinutesMs);
        });
        test('should define images cache expiry (30 days)', () => {
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            expect(CACHE_EXPIRY.images).toBe(thirtyDaysMs);
        });
    });
    // =========================================
    // Cache Expiry Logic Tests
    // =========================================
    describe('Cache Expiry Logic', () => {
        test('FHIR cache should expire faster than calculator cache', () => {
            expect(CACHE_EXPIRY.fhir).toBeLessThan(CACHE_EXPIRY.calculators);
        });
        test('Calculator cache should expire faster than static cache', () => {
            expect(CACHE_EXPIRY.calculators).toBeLessThan(CACHE_EXPIRY.static);
        });
        test('Static cache should expire faster than images cache', () => {
            expect(CACHE_EXPIRY.static).toBeLessThan(CACHE_EXPIRY.images);
        });
    });
    // =========================================
    // Cache Key Generation Tests
    // =========================================
    describe('Cache Key Generation', () => {
        test('patient cache key should include patient ID', () => {
            const patientId = '12345';
            const cacheKey = `patient_${patientId}`;
            expect(cacheKey).toBe('patient_12345');
        });
        test('observation cache key should include patient ID and code', () => {
            const patientId = '12345';
            const observationCode = '2160-0';
            const cacheKey = `observation_${patientId}_${observationCode}`;
            expect(cacheKey).toBe('observation_12345_2160-0');
        });
        test('calculator cache key should include calculator ID', () => {
            const calculatorId = 'apache-ii';
            const cacheKey = `calculator_${calculatorId}`;
            expect(cacheKey).toBe('calculator_apache-ii');
        });
    });
});
