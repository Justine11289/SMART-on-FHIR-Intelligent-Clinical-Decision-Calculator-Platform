/**
 * @jest-environment jsdom
 */

/**
 * Error Handler Module Tests
 * Tests for error handling utilities
 */

import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import {
    CalculatorError,
    FHIRDataError,
    ValidationError,
    logError,
    withErrorHandling,
    tryOrDefault
} from '../errorHandler.js';

describe('Error Handler Module', () => {
    // =========================================
    // CalculatorError Class Tests
    // =========================================
    describe('CalculatorError', () => {
        test('should create error with message, code, and details', () => {
            const error = new CalculatorError('Test error', 'TEST_ERROR', { field: 'test' });

            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_ERROR');
            expect(error.details).toEqual({ field: 'test' });
            expect(error.name).toBe('CalculatorError');
            expect(error.timestamp).toBeInstanceOf(Date);
        });

        test('should default details to empty object', () => {
            const error = new CalculatorError('Test error', 'TEST_ERROR');
            expect(error.details).toEqual({});
        });

        test('should be instance of Error', () => {
            const error = new CalculatorError('Test', 'CODE');
            expect(error).toBeInstanceOf(Error);
        });
    });

    // =========================================
    // FHIRDataError Class Tests
    // =========================================
    describe('FHIRDataError', () => {
        test('should create error with FHIR_DATA_ERROR code', () => {
            const error = new FHIRDataError('FHIR fetch failed', { resource: 'Patient' });

            expect(error.message).toBe('FHIR fetch failed');
            expect(error.code).toBe('FHIR_DATA_ERROR');
            expect(error.name).toBe('FHIRDataError');
            expect(error.details).toEqual({ resource: 'Patient' });
        });

        test('should be instance of CalculatorError', () => {
            const error = new FHIRDataError('Test');
            expect(error).toBeInstanceOf(CalculatorError);
        });
    });

    // =========================================
    // ValidationError Class Tests
    // =========================================
    describe('ValidationError', () => {
        test('should create error with VALIDATION_ERROR code', () => {
            const error = new ValidationError('Invalid input', { field: 'age', value: -5 });

            expect(error.message).toBe('Invalid input');
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.name).toBe('ValidationError');
            expect(error.details).toEqual({ field: 'age', value: -5 });
        });

        test('should be instance of CalculatorError', () => {
            const error = new ValidationError('Test');
            expect(error).toBeInstanceOf(CalculatorError);
        });
    });

    // =========================================
    // logError Function Tests
    // =========================================
    describe('logError', () => {
        beforeEach(() => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            jest.spyOn(console, 'log').mockImplementation(() => {});
            jest.spyOn(console, 'group').mockImplementation(() => {});
            jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should return error log object', () => {
            const error = new Error('Test error');
            const result = logError(error, { calculator: 'test' });

            expect(result).toHaveProperty('name', 'Error');
            expect(result).toHaveProperty('message', 'Test error');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('context');
            expect(result.context).toEqual({ calculator: 'test' });
        });

        test('should include code for CalculatorError', () => {
            const error = new CalculatorError('Test', 'CUSTOM_CODE');
            const result = logError(error);

            expect(result.code).toBe('CUSTOM_CODE');
        });

        test('should default code to UNKNOWN_ERROR', () => {
            const error = new Error('Generic error');
            const result = logError(error);

            expect(result.code).toBe('UNKNOWN_ERROR');
        });
    });

    // =========================================
    // withErrorHandling Function Tests
    // =========================================
    describe('withErrorHandling', () => {
        beforeEach(() => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            jest.spyOn(console, 'log').mockImplementation(() => {});
            jest.spyOn(console, 'group').mockImplementation(() => {});
            jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should return result on success', async () => {
            const successFn = async () => 'success';
            const wrapped = withErrorHandling(successFn);

            const result = await wrapped();
            expect(result).toBe('success');
        });

        test('should log and rethrow on error', async () => {
            const failFn = async () => {
                throw new Error('Failure');
            };
            const wrapped = withErrorHandling(failFn, { action: 'test' });

            await expect(wrapped()).rejects.toThrow('Failure');
            expect(console.error).toHaveBeenCalled();
        });

        test('should preserve function arguments', async () => {
            const addFn = async (a: number, b: number) => a + b;
            const wrapped = withErrorHandling(addFn);

            const result = await wrapped(2, 3);
            expect(result).toBe(5);
        });
    });

    // =========================================
    // tryOrDefault Function Tests
    // =========================================
    describe('tryOrDefault', () => {
        beforeEach(() => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            jest.spyOn(console, 'log').mockImplementation(() => {});
            jest.spyOn(console, 'group').mockImplementation(() => {});
            jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should return function result on success', () => {
            const result = tryOrDefault(() => 'value', 'default');
            expect(result).toBe('value');
        });

        test('should return default value on error', () => {
            const result = tryOrDefault(() => {
                throw new Error('Fail');
            }, 'default');
            expect(result).toBe('default');
        });

        test('should work with complex default values', () => {
            const defaultObj = { key: 'value', count: 0 };
            const result = tryOrDefault(() => {
                throw new Error('Fail');
            }, defaultObj);
            expect(result).toEqual(defaultObj);
        });

        test('should log error when exception occurs', () => {
            tryOrDefault(() => {
                throw new Error('Test');
            }, null);
            expect(console.error).toHaveBeenCalled();
        });
    });
});
