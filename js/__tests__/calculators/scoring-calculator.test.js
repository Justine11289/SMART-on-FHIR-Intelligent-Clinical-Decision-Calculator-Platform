/**
 * @jest-environment jsdom
 */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { createScoringCalculator } from '../../calculators/shared/scoring-calculator';
// Mock console
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });
describe('Unified Scoring Calculator Factory', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });
    describe('Radio Mode (inputType: radio)', () => {
        const radioConfig = {
            id: 'test-radio-score',
            title: 'Test Radio Score',
            description: 'A radio score calculator',
            inputType: 'radio',
            sections: [
                {
                    title: 'Test Section',
                    options: [
                        { value: '0', label: 'Option A (0 points)' },
                        { value: '1', label: 'Option B (1 point)' },
                        { value: '2', label: 'Option C (2 points)' }
                    ]
                }
            ],
            riskLevels: [
                {
                    minScore: 0,
                    maxScore: 1,
                    risk: 'Low',
                    category: 'Low',
                    severity: 'success'
                },
                {
                    minScore: 2,
                    maxScore: 3,
                    risk: 'High',
                    category: 'High',
                    severity: 'danger'
                }
            ]
        };
        test('should create radio calculator with unified factory', () => {
            const calculator = createScoringCalculator(radioConfig);
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-radio-score');
        });
        test('should create radio calculator via unified factory', () => {
            const calculator = createScoringCalculator({
                id: 'test-radio-2',
                title: 'Test Radio 2',
                description: 'Test description',
                inputType: 'radio',
                sections: radioConfig.sections,
                riskLevels: radioConfig.riskLevels
            });
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-radio-2');
        });
    });
    describe('Checkbox Mode (inputType: checkbox)', () => {
        const checkboxConfig = {
            id: 'test-checkbox-score',
            title: 'Test Checkbox Score',
            description: 'A checkbox score calculator',
            inputType: 'checkbox',
            sections: [
                {
                    title: 'Risk Factors',
                    options: [
                        { id: 'factor-1', label: 'Factor 1 (+1)', value: 1 },
                        { id: 'factor-2', label: 'Factor 2 (+2)', value: 2 },
                        { id: 'factor-3', label: 'Factor 3 (+3)', value: 3 }
                    ]
                }
            ],
            riskLevels: [
                {
                    minScore: 0,
                    maxScore: 2,
                    risk: 'Low',
                    category: 'Low',
                    severity: 'success'
                },
                {
                    minScore: 3,
                    maxScore: 6,
                    risk: 'High',
                    category: 'High',
                    severity: 'danger'
                }
            ]
        };
        test('should create checkbox calculator with unified factory', () => {
            const calculator = createScoringCalculator(checkboxConfig);
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-checkbox-score');
        });
        test('should create checkbox calculator via unified factory', () => {
            const calculator = createScoringCalculator({
                id: 'test-checkbox-2',
                title: 'Test Checkbox 2',
                description: 'Test description',
                inputType: 'checkbox',
                sections: checkboxConfig.sections,
                riskLevels: checkboxConfig.riskLevels
            });
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-checkbox-2');
        });
        test('should generate HTML with checkboxes', () => {
            const calculator = createScoringCalculator({
                id: 'test-checkbox-html',
                title: 'Test',
                description: 'Test description',
                inputType: 'checkbox',
                sections: checkboxConfig.sections,
                riskLevels: checkboxConfig.riskLevels
            });
            const html = calculator.generateHTML();
            expect(html).toContain('type="checkbox"');
        });
    });
    describe('Yes/No Mode (inputType: yesno)', () => {
        const yesNoConfig = {
            id: 'test-yesno-score',
            title: 'Test Yes/No Score',
            description: 'A yes/no score calculator',
            inputType: 'yesno',
            questions: [
                { id: 'q1', label: 'Question 1', points: 1 },
                { id: 'q2', label: 'Question 2', points: 2 },
                { id: 'q3', label: 'Question 3', points: 3 }
            ],
            riskLevels: [
                {
                    minScore: 0,
                    maxScore: 2,
                    risk: 'Low',
                    category: 'Low',
                    severity: 'success'
                },
                {
                    minScore: 3,
                    maxScore: 6,
                    risk: 'High',
                    category: 'High',
                    severity: 'danger'
                }
            ]
        };
        test('should create yes/no calculator with unified factory', () => {
            const calculator = createScoringCalculator(yesNoConfig);
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-yesno-score');
        });
        test('should create yes/no calculator via unified factory', () => {
            const calculator = createScoringCalculator({
                id: 'test-yesno-2',
                title: 'Test Yes/No 2',
                description: 'Test description',
                inputType: 'yesno',
                questions: yesNoConfig.questions,
                riskLevels: yesNoConfig.riskLevels
            });
            expect(calculator).toBeDefined();
            expect(calculator.id).toBe('test-yesno-2');
        });
        test('should generate HTML with Yes/No options', () => {
            const calculator = createScoringCalculator({
                id: 'test-yesno-html',
                title: 'Test',
                description: 'Test description',
                inputType: 'yesno',
                questions: yesNoConfig.questions,
                riskLevels: yesNoConfig.riskLevels
            });
            const html = calculator.generateHTML();
            expect(html).toContain('No');
            expect(html).toContain('Yes');
        });
    });
    describe('Formula Section Support', () => {
        test('should include formula section when configured', () => {
            const calculator = createScoringCalculator({
                id: 'test-with-formula',
                title: 'Test With Formula',
                description: 'Test description',
                inputType: 'checkbox',
                sections: [
                    {
                        title: 'Test',
                        options: [{ id: 'opt1', label: 'Option', value: 1 }]
                    }
                ],
                riskLevels: [
                    {
                        minScore: 0,
                        maxScore: 10,
                        risk: 'Test',
                        category: 'Test',
                        severity: 'info'
                    }
                ],
                formulaSection: {
                    title: 'SCORING FORMULA',
                    show: true,
                    calculationNote: 'Add selected points',
                    scoringCriteria: [
                        { criteria: 'Item 1', points: '1' },
                        { criteria: 'Item 2', points: '2' }
                    ]
                }
            });
            const html = calculator.generateHTML();
            expect(html).toContain('SCORING FORMULA');
            expect(html).toContain('Item 1');
        });
    });
});
