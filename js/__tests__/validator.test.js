/**
 * @jest-environment jsdom
 */
import { describe, expect, test } from '@jest/globals';
import { validateCalculatorInput, ValidationRules } from '../validator';
describe('Validator Module', () => {
    describe('validateCalculatorInput', () => {
        test('should pass validation for valid input', () => {
            const input = {
                weight: 70,
                height: 175,
                age: 30
            };
            const schema = {
                weight: { required: true, min: 0, max: 500 },
                height: { required: true, min: 0, max: 300 },
                age: { required: true, min: 0, max: 150 }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
        });
        test('should fail for missing required field', () => {
            const input = {
                weight: 70
            };
            const schema = {
                weight: { required: true },
                height: { required: true, message: 'Height is required' }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Height is required');
        });
        test('should fail for value below minimum', () => {
            const input = {
                age: -5
            };
            const schema = {
                age: { min: 0, message: 'Age must be positive' }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
        });
        test('should fail for value above maximum', () => {
            const input = {
                score: 150
            };
            const schema = {
                score: { max: 100, message: 'Score must be 100 or less' }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
        });
        test('should handle null and undefined values', () => {
            const input = {
                value1: null,
                value2: undefined
            };
            const schema = {
                value1: { required: true },
                value2: { required: true }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBe(2);
        });
        test('should handle NaN values', () => {
            const input = {
                value: NaN
            };
            const schema = {
                value: { required: true }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
        });
        test('should validate with pattern', () => {
            const input = {
                email: 'test@example.com'
            };
            const schema = {
                email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(true);
        });
        test('should fail pattern validation', () => {
            const input = {
                email: 'invalid-email'
            };
            const schema = {
                email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
        });
        test('should handle custom validation function returning error string', () => {
            const input = {
                password: 'short'
            };
            const schema = {
                password: {
                    custom: (value) => {
                        if (value.length < 8)
                            return 'Password too short';
                        return true;
                    }
                }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password too short');
        });
        test('should handle custom validation returning true', () => {
            const input = {
                password: 'longEnoughPassword123'
            };
            const schema = {
                password: {
                    custom: (value) => value.length >= 8
                }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(true);
        });
        test('should skip validation for empty non-required fields', () => {
            const input = {
                optional: ''
            };
            const schema = {
                optional: { min: 10 } // Not required, should skip min check
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(true);
        });
        test('should handle empty string as missing for required', () => {
            const input = {
                name: ''
            };
            const schema = {
                name: { required: true }
            };
            const result = validateCalculatorInput(input, schema);
            expect(result.isValid).toBe(false);
        });
    });
    describe('ValidationRules', () => {
        test('should have predefined validation rules', () => {
            expect(ValidationRules).toBeDefined();
            expect(typeof ValidationRules).toBe('object');
        });
    });
});
