/**
 * @jest-environment jsdom
 */
import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { uiBuilder } from '../ui-builder';
describe('UI Builder', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.innerHTML = '';
    });
    describe('createSection', () => {
        test('should create section with title and icon', () => {
            const html = uiBuilder.createSection({
                title: 'Test Section',
                icon: '📋',
                content: '<p>Test content</p>'
            });
            expect(html).toContain('Test Section');
            expect(html).toContain('📋');
            expect(html).toContain('Test content');
        });
        test('should handle section without icon', () => {
            const html = uiBuilder.createSection({
                title: 'No Icon Section',
                content: '<p>Content</p>'
            });
            expect(html).toContain('No Icon Section');
            expect(html).toContain('Content');
        });
    });
    describe('createInput', () => {
        test('should create number input', () => {
            const html = uiBuilder.createInput({
                id: 'test-input',
                label: 'Test Input',
                type: 'number',
                min: 0,
                max: 100,
                placeholder: 'Enter value'
            });
            expect(html).toContain('test-input');
            expect(html).toContain('Test Input');
            expect(html).toContain('type="number"');
        });
        test('should create input with unit', () => {
            const html = uiBuilder.createInput({
                id: 'weight-input',
                label: 'Weight',
                type: 'number',
                unit: 'kg'
            });
            expect(html).toContain('kg');
        });
        test('should create input with help text', () => {
            const html = uiBuilder.createInput({
                id: 'help-input',
                label: 'Input',
                type: 'number',
                helpText: 'This is help text'
            });
            expect(html).toContain('This is help text');
        });
    });
    describe('createRadioGroup', () => {
        test('should create radio group with options', () => {
            const html = uiBuilder.createRadioGroup({
                name: 'test-radio',
                label: 'Select Option',
                options: [
                    { value: '1', label: 'Option 1' },
                    { value: '2', label: 'Option 2' },
                    { value: '3', label: 'Option 3' }
                ]
            });
            expect(html).toContain('test-radio');
            expect(html).toContain('Option 1');
            expect(html).toContain('Option 2');
            expect(html).toContain('Option 3');
            expect(html).toContain('type="radio"');
        });
        test('should handle checked option', () => {
            const html = uiBuilder.createRadioGroup({
                name: 'checked-radio',
                label: 'Select',
                options: [
                    { value: '1', label: 'A' },
                    { value: '2', label: 'B', checked: true }
                ]
            });
            expect(html).toContain('checked');
        });
    });
    describe('createCheckboxGroup', () => {
        test('should create checkbox group', () => {
            const html = uiBuilder.createCheckboxGroup({
                name: 'test-checkbox',
                label: 'Select All',
                options: [
                    { value: 'a', label: 'Checkbox A' },
                    { value: 'b', label: 'Checkbox B' }
                ]
            });
            expect(html).toContain('test-checkbox');
            expect(html).toContain('Checkbox A');
            expect(html).toContain('type="checkbox"');
        });
    });
    describe('createSelect', () => {
        test('should create select dropdown', () => {
            const html = uiBuilder.createSelect({
                id: 'test-select',
                label: 'Choose',
                options: [
                    { value: '', label: 'Select...' },
                    { value: '1', label: 'First' },
                    { value: '2', label: 'Second' }
                ]
            });
            expect(html).toContain('test-select');
            expect(html).toContain('<select');
            expect(html).toContain('First');
            expect(html).toContain('Second');
        });
    });
    describe('createRange', () => {
        test('should create range slider', () => {
            const html = uiBuilder.createRange({
                id: 'test-range',
                label: 'Slider',
                min: 0,
                max: 10,
                step: 1,
                defaultValue: 5
            });
            expect(html).toContain('test-range');
            expect(html).toContain('type="range"');
            expect(html).toContain('min="0"');
            expect(html).toContain('max="10"');
        });
    });
    describe('createAlert', () => {
        test('should create success alert', () => {
            const html = uiBuilder.createAlert({
                type: 'success',
                message: 'Operation completed successfully'
            });
            expect(html).toContain('success');
            expect(html).toContain('Operation completed successfully');
        });
        test('should create danger alert', () => {
            const html = uiBuilder.createAlert({
                type: 'danger',
                message: 'Error occurred'
            });
            expect(html).toContain('danger');
            expect(html).toContain('Error occurred');
        });
        test('should create alert with custom icon', () => {
            const html = uiBuilder.createAlert({
                type: 'info',
                message: 'Information',
                icon: '💡'
            });
            expect(html).toContain('💡');
            expect(html).toContain('Information');
        });
    });
    describe('createResultItem', () => {
        test('should create result item with value and unit', () => {
            const html = uiBuilder.createResultItem({
                label: 'BMI',
                value: '22.5',
                unit: 'kg/m²'
            });
            expect(html).toContain('BMI');
            expect(html).toContain('22.5');
            expect(html).toContain('kg/m²');
        });
        test('should create result item with interpretation', () => {
            const html = uiBuilder.createResultItem({
                label: 'Score',
                value: '15',
                interpretation: 'Normal range',
                alertClass: 'success'
            });
            expect(html).toContain('Normal range');
            expect(html).toContain('success');
        });
    });
    describe('initializeComponents', () => {
        test('should initialize unit toggles in container', () => {
            container.innerHTML = uiBuilder.createInput({
                id: 'weight',
                label: 'Weight',
                type: 'number',
                unitToggle: {
                    type: 'weight',
                    units: ['kg', 'lbs'],
                    default: 'kg'
                }
            });
            expect(() => {
                uiBuilder.initializeComponents(container);
            }).not.toThrow();
        });
        test('should initialize range sliders', () => {
            container.innerHTML = uiBuilder.createRange({
                id: 'slider',
                label: 'Slider',
                min: 0,
                max: 100,
                defaultValue: 50,
                showValue: true
            });
            expect(() => {
                uiBuilder.initializeComponents(container);
            }).not.toThrow();
        });
    });
    describe('createResultBox', () => {
        test('should create result box container', () => {
            const html = uiBuilder.createResultBox({
                id: 'test-result'
            });
            expect(html).toContain('test-result');
            expect(html).toContain('result');
        });
    });
    describe('createTable', () => {
        test('should create table with headers and rows', () => {
            const html = uiBuilder.createTable({
                headers: ['Name', 'Value'],
                rows: [
                    ['Item 1', '100'],
                    ['Item 2', '200']
                ]
            });
            expect(html).toContain('<table');
            expect(html).toContain('Name');
            expect(html).toContain('Value');
            expect(html).toContain('Item 1');
            expect(html).toContain('100');
        });
    });
});
