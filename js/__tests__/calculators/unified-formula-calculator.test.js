/**
 * @jest-environment jsdom
 */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { createUnifiedFormulaCalculator } from '../../calculators/shared/unified-formula-calculator';
// Mock console
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });
describe('Unified Formula Calculator Factory', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });
    describe('Simple Mode (mode: simple)', () => {
        const simpleConfig = {
            id: 'test-simple-formula',
            title: 'Test Simple Formula',
            description: 'A test simple formula calculator',
            mode: 'simple',
            inputs: [
                {
                    type: 'number',
                    id: 'value-a',
                    label: 'Value A',
                    standardUnit: 'units'
                },
                {
                    type: 'number',
                    id: 'value-b',
                    label: 'Value B',
                    standardUnit: 'units'
                }
            ],
            formulas: [{ label: 'Result', formula: 'A + B' }],
            calculate: (values) => {
                const a = parseFloat(String(values['value-a'])) || 0;
                const b = parseFloat(String(values['value-b'])) || 0;
                return [{ label: 'Sum', value: String(a + b), unit: 'units' }];
            }
        };
        test('should create simple formula calculator', () => {
            const calculator = createUnifiedFormulaCalculator(simpleConfig);
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-simple-formula');
        });
        test('should create via unified function', () => {
            const calculator = createUnifiedFormulaCalculator({
                id: 'test-simple-2',
                title: 'Test Simple 2',
                description: 'Test description',
                mode: 'simple',
                inputs: simpleConfig.inputs,
                calculate: simpleConfig.calculate
            });
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-simple-2');
        });
        test('should generate HTML with number inputs', () => {
            const calculator = createUnifiedFormulaCalculator({
                id: 'test-html',
                title: 'Test',
                description: 'Test description',
                mode: 'simple',
                inputs: simpleConfig.inputs,
                calculate: simpleConfig.calculate
            });
            const html = calculator.generateHTML();
            expect(html).toContain('value-a');
            expect(html).toContain('value-b');
            expect(html).toContain('type="number"');
        });
        test('should initialize without errors', () => {
            const calculator = createUnifiedFormulaCalculator({
                id: 'test-init',
                title: 'Test',
                description: 'Test description',
                mode: 'simple',
                inputs: simpleConfig.inputs,
                calculate: simpleConfig.calculate
            });
            container.innerHTML = calculator.generateHTML();
            expect(() => {
                calculator.initialize(null, null, container);
            }).not.toThrow();
        });
    });
    describe('Complex Mode (mode: complex)', () => {
        const complexSections = [
            {
                title: 'Patient Data',
                icon: '👤',
                fields: [
                    {
                        type: 'number',
                        id: 'age',
                        label: 'Age',
                        unit: 'years'
                    }
                ]
            },
            {
                title: 'Lab Values',
                icon: '🧪',
                fields: [
                    {
                        type: 'number',
                        id: 'lab-value',
                        label: 'Lab Value',
                        unit: 'mg/dL'
                    }
                ]
            }
        ];
        const complexCalculate = (getValue, getStdValue, getRadioValue) => {
            const age = getValue('age');
            const lab = getValue('lab-value');
            if (age === null || lab === null)
                return null;
            return {
                results: [{ label: 'Score', value: String(age + lab), unit: 'points' }],
                interpretation: 'Test interpretation',
                severity: 'info'
            };
        };
        test('should create complex formula calculator', () => {
            const calculator = createUnifiedFormulaCalculator({
                id: 'test-complex-2',
                title: 'Test Complex 2',
                description: 'Test description',
                mode: 'complex',
                sections: complexSections,
                complexCalculate: complexCalculate
            });
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-complex-2');
        });
        test('should generate HTML with sections', () => {
            const calculator = createUnifiedFormulaCalculator({
                id: 'test-sections',
                title: 'Test',
                description: 'Test description',
                mode: 'complex',
                sections: complexSections,
                complexCalculate: complexCalculate
            });
            const html = calculator.generateHTML();
            expect(html).toContain('Patient Data');
            expect(html).toContain('Lab Values');
        });
    });
    describe('Formula Display', () => {
        test('should include formulas section when configured', () => {
            const calculator = createUnifiedFormulaCalculator({
                id: 'test-formulas',
                title: 'Test',
                description: 'Test description',
                mode: 'simple',
                inputs: [{ type: 'number', id: 'x', label: 'X', standardUnit: 'units' }],
                formulas: [
                    { label: 'Square', formula: 'X²' },
                    { label: 'Cube', formula: 'X³' }
                ],
                calculate: values => {
                    const x = parseFloat(String(values['x'])) || 0;
                    return [{ label: 'Square', value: String(x * x), unit: 'units²' }];
                }
            });
            const html = calculator.generateHTML();
            expect(html).toContain('Square');
            expect(html).toContain('X²');
        });
    });
    describe('Unit Toggle Support', () => {
        test('should support unit toggle in inputs', () => {
            const calculator = createUnifiedFormulaCalculator({
                id: 'test-unit-toggle',
                title: 'Test',
                description: 'Test description',
                mode: 'simple',
                inputs: [
                    {
                        type: 'number',
                        id: 'creatinine',
                        label: 'Creatinine',
                        standardUnit: 'mg/dL',
                        unitToggle: {
                            type: 'creatinine',
                            units: ['mg/dL', 'µmol/L'],
                            default: 'mg/dL'
                        }
                    }
                ],
                calculate: () => [{ label: 'Result', value: '1', unit: 'units' }]
            });
            const html = calculator.generateHTML();
            expect(html).toContain('mg/dL');
        });
    });
});
