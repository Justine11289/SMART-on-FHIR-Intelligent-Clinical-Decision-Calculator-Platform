/**
 * Lab Name Mapping Module Tests
 * Tests for lab name to LOINC code mapping
 */

import { describe, expect, test } from '@jest/globals';
import { LAB_NAME_MAPPING, getTextNameByLoinc, getLoincByTextName } from '../lab-name-mapping.js';
import { LOINC_CODES } from '../fhir-codes.js';

describe('Lab Name Mapping Module', () => {
    // =========================================
    // LAB_NAME_MAPPING Registry Tests
    // =========================================
    describe('LAB_NAME_MAPPING Registry', () => {
        test('should contain vital signs mappings', () => {
            expect(LAB_NAME_MAPPING.SYSTOLIC_BP).toBeDefined();
            expect(LAB_NAME_MAPPING.SYSTOLIC_BP.primary).toBe('Systolic Blood Pressure');
            expect(LAB_NAME_MAPPING.SYSTOLIC_BP.aliases).toContain('SBP');
        });

        test('should contain chemistry lab mappings', () => {
            expect(LAB_NAME_MAPPING.SODIUM).toBeDefined();
            expect(LAB_NAME_MAPPING.SODIUM.primary).toBe('Sodium');
            expect(LAB_NAME_MAPPING.SODIUM.aliases).toContain('Na');
        });

        test('should contain hematology lab mappings', () => {
            expect(LAB_NAME_MAPPING.HEMOGLOBIN).toBeDefined();
            expect(LAB_NAME_MAPPING.HEMOGLOBIN.primary).toBe('Hemoglobin');
            expect(LAB_NAME_MAPPING.HEMOGLOBIN.aliases).toContain('Hgb');
        });
    });

    // =========================================
    // getTextNameByLoinc Function Tests
    // =========================================
    describe('getTextNameByLoinc', () => {
        test('should return primary name for known LOINC code', () => {
            const name = getTextNameByLoinc(LOINC_CODES.HEMOGLOBIN);
            expect(name).toBe('Hemoglobin');
        });

        test('should return primary name for sodium', () => {
            const name = getTextNameByLoinc(LOINC_CODES.SODIUM);
            expect(name).toBe('Sodium');
        });

        test('should return null for unknown LOINC code', () => {
            expect(getTextNameByLoinc('0000-0')).toBeNull();
        });

        test('should return null for empty string', () => {
            expect(getTextNameByLoinc('')).toBeNull();
        });
    });

    // =========================================
    // getLoincByTextName Function Tests
    // =========================================
    describe('getLoincByTextName', () => {
        test('should return LOINC code for primary name', () => {
            const code = getLoincByTextName('Hemoglobin');
            expect(code).toBe(LOINC_CODES.HEMOGLOBIN);
        });

        test('should be case-insensitive', () => {
            expect(getLoincByTextName('hemoglobin')).toBe(LOINC_CODES.HEMOGLOBIN);
            expect(getLoincByTextName('HEMOGLOBIN')).toBe(LOINC_CODES.HEMOGLOBIN);
        });

        test('should match aliases', () => {
            const code = getLoincByTextName('Hgb');
            expect(code).toBe(LOINC_CODES.HEMOGLOBIN);
        });

        test('should match sodium aliases', () => {
            expect(getLoincByTextName('Na')).toBe(LOINC_CODES.SODIUM);
        });

        test('should return null for unknown text name', () => {
            expect(getLoincByTextName('Unknown Lab Test')).toBeNull();
        });

        test('should return null for empty string', () => {
            expect(getLoincByTextName('')).toBeNull();
        });

        test('should handle partial matches', () => {
            // Should match 'Systolic Blood Pressure' or alias 'SBP'
            const sbpCode = getLoincByTextName('SBP');
            expect(sbpCode).toBe(LOINC_CODES.SYSTOLIC_BP);
        });
    });

    // =========================================
    // Cross-Reference Tests
    // =========================================
    describe('Cross-Reference Validation', () => {
        test('round-trip: LOINC -> Text Name -> LOINC should match', () => {
            const originalCode = LOINC_CODES.CREATININE;
            const textName = getTextNameByLoinc(originalCode);
            expect(textName).not.toBeNull();

            if (textName) {
                const resolvedCode = getLoincByTextName(textName);
                expect(resolvedCode).toBe(originalCode);
            }
        });

        test('all mapped codes should have valid LOINC codes', () => {
            for (const key of Object.keys(LAB_NAME_MAPPING)) {
                const loincCode = LOINC_CODES[key as keyof typeof LOINC_CODES];
                expect(loincCode).toBeDefined();
            }
        });
    });
});
