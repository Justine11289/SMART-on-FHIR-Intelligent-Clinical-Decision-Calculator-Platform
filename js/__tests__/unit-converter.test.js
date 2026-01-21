/**
 * @jest-environment jsdom
 */
import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { UnitConverter } from '../unit-converter';
describe('UnitConverter', () => {
    describe('Weight Conversions', () => {
        test('should convert kg to lbs', () => {
            const result = UnitConverter.convert(70, 'kg', 'lbs', 'weight');
            expect(result).toBeCloseTo(154.32, 1);
        });
        test('should convert lbs to kg', () => {
            const result = UnitConverter.convert(154.32, 'lbs', 'kg', 'weight');
            expect(result).toBeCloseTo(70, 1);
        });
        test('should return same value for same unit', () => {
            const result = UnitConverter.convert(70, 'kg', 'kg', 'weight');
            expect(result).toBe(70);
        });
    });
    describe('Height Conversions', () => {
        test('should convert cm to inches', () => {
            const result = UnitConverter.convert(175, 'cm', 'in', 'height');
            expect(result).toBeCloseTo(68.9, 1);
        });
        test('should convert inches to cm', () => {
            const result = UnitConverter.convert(68.9, 'in', 'cm', 'height');
            expect(result).toBeCloseTo(175, 0);
        });
        test('should convert cm to feet', () => {
            const result = UnitConverter.convert(180, 'cm', 'ft', 'height');
            expect(result).toBeCloseTo(5.9, 1);
        });
    });
    describe('Temperature Conversions', () => {
        test('should convert Celsius to Fahrenheit', () => {
            const result = UnitConverter.convert(37, 'C', 'F', 'temperature');
            expect(result).toBeCloseTo(98.6, 1);
        });
        test('should convert Fahrenheit to Celsius', () => {
            const result = UnitConverter.convert(98.6, 'F', 'C', 'temperature');
            expect(result).toBeCloseTo(37, 1);
        });
        test('should handle freezing point', () => {
            const result = UnitConverter.convert(0, 'C', 'F', 'temperature');
            expect(result).toBe(32);
        });
        test('should handle boiling point', () => {
            const result = UnitConverter.convert(100, 'C', 'F', 'temperature');
            expect(result).toBe(212);
        });
    });
    describe('Creatinine Conversions', () => {
        test('should convert mg/dL to umol/L', () => {
            const result = UnitConverter.convert(1.0, 'mg/dL', 'umol/L', 'creatinine');
            expect(result).toBeCloseTo(88.4, 1);
        });
        test('should convert umol/L to mg/dL', () => {
            const result = UnitConverter.convert(88.4, 'umol/L', 'mg/dL', 'creatinine');
            expect(result).toBeCloseTo(1.0, 1);
        });
    });
    describe('Glucose Conversions', () => {
        test('should convert mg/dL to mmol/L', () => {
            const result = UnitConverter.convert(100, 'mg/dL', 'mmol/L', 'glucose');
            expect(result).toBeCloseTo(5.55, 1);
        });
        test('should convert mmol/L to mg/dL', () => {
            const result = UnitConverter.convert(5.55, 'mmol/L', 'mg/dL', 'glucose');
            expect(result).toBeCloseTo(100, 0);
        });
    });
    describe('Edge Cases', () => {
        test('should handle zero values', () => {
            const result = UnitConverter.convert(0, 'kg', 'lbs', 'weight');
            expect(result).toBe(0);
        });
        test('should handle negative values for temperature', () => {
            const result = UnitConverter.convert(-40, 'C', 'F', 'temperature');
            expect(result).toBe(-40); // -40 is the same in both scales
        });
        test('should return null for invalid conversion type', () => {
            const result = UnitConverter.convert(100, 'kg', 'lbs', 'invalid');
            expect(result).toBeNull();
        });
        test('should return null for invalid unit pair', () => {
            const result = UnitConverter.convert(100, 'kg', 'cm', 'weight');
            expect(result).toBeNull();
        });
    });
    describe('DOM Integration', () => {
        let container;
        let input;
        beforeEach(() => {
            container = document.createElement('div');
            input = document.createElement('input');
            input.type = 'number';
            input.id = 'test-input';
            input.value = '70';
            input.dataset.unit = 'kg';
            input.dataset.standardUnit = 'kg';
            container.appendChild(input);
            document.body.appendChild(container);
        });
        afterEach(() => {
            document.body.innerHTML = '';
        });
        test('getStandardValue should return value in standard unit', () => {
            const result = UnitConverter.getStandardValue(input, 'kg');
            expect(result).toBe(70);
        });
        test('getStandardValue should return value when unit matches standard', () => {
            input.value = '70';
            input.dataset.unit = 'kg';
            const result = UnitConverter.getStandardValue(input, 'kg');
            expect(result).toBe(70);
        });
        test('getStandardValue should return null for empty input', () => {
            input.value = '';
            const result = UnitConverter.getStandardValue(input, 'kg');
            expect(result).toBeNull();
        });
    });
    describe('Unit Toggle Creation', () => {
        let input;
        beforeEach(() => {
            input = document.createElement('input');
            input.type = 'number';
            input.id = 'test-input';
            document.body.appendChild(input);
        });
        afterEach(() => {
            document.body.innerHTML = '';
        });
        test('should create unit toggle element', () => {
            const toggle = UnitConverter.createUnitToggle(input, 'weight', ['kg', 'lbs'], 'kg');
            expect(toggle).toBeDefined();
            expect(toggle.tagName).toBe('BUTTON');
        });
        test('should return a button element', () => {
            const toggle = UnitConverter.createUnitToggle(input, 'weight', ['kg', 'lbs'], 'kg');
            expect(toggle.tagName).toBe('BUTTON');
            expect(toggle.textContent).toContain('kg');
        });
    });
});
