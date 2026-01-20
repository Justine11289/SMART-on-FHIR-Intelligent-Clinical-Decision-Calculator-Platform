import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { bmiBsa } from '../calculators/bmi-bsa';
import { fhirDataService } from '../fhir-data-service';

// Mock dependencies if needed
// For now, we use real UnitConverter and UIBuilder as they are pure logic/string generation
// Mock FHIR services to prevent network calls
jest.spyOn(fhirDataService, 'initialize').mockImplementation(() => {});
jest.spyOn(fhirDataService, 'isReady').mockReturnValue(false);

describe('BMI & BSA Calculator', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = bmiBsa.generateHTML();
        document.body.appendChild(container);

        // Mock client/patient for initialize
        bmiBsa.initialize({}, {}, container);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('should calculate BMI and BSA correctly for standard input', () => {
        const weightInput = container.querySelector('#bmi-bsa-weight') as HTMLInputElement;
        const heightInput = container.querySelector('#bmi-bsa-height') as HTMLInputElement;
        const resultBox = container.querySelector('#bmi-bsa-result') as HTMLElement;

        // Set inputs: 70kg, 175cm
        weightInput.value = '70';
        heightInput.value = '175';

        // Trigger input events (must bubble for event delegation to work)
        weightInput.dispatchEvent(new Event('input', { bubbles: true }));
        heightInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Check if result box is visible
        expect(resultBox.classList.contains('show')).toBe(true);

        // Verify values
        // BMI = 70 / (1.75^2) = 22.86
        // BSA (Du Bois) = 0.007184 * 70^0.425 * 175^0.725 = 1.84 (approx)

        const content = resultBox.textContent || '';
        expect(content).toContain('22.9'); // BMI fixed to 1 decimal
        expect(content).toContain('1.85'); // BSA fixed to 2 decimals

        expect(content).toContain('Normal weight');
    });

    test('should classify Underweight correctly', () => {
        const weightInput = container.querySelector('#bmi-bsa-weight') as HTMLInputElement;
        const heightInput = container.querySelector('#bmi-bsa-height') as HTMLInputElement;
        const resultBox = container.querySelector('#bmi-bsa-result') as HTMLElement;

        // 50kg, 180cm -> BMI = 15.4
        weightInput.value = '50';
        heightInput.value = '180';
        weightInput.dispatchEvent(new Event('input', { bubbles: true }));
        heightInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(resultBox.textContent).toContain('Underweight');
    });

    test('should classify Obese correctly', () => {
        const weightInput = container.querySelector('#bmi-bsa-weight') as HTMLInputElement;
        const heightInput = container.querySelector('#bmi-bsa-height') as HTMLInputElement;
        const resultBox = container.querySelector('#bmi-bsa-result') as HTMLElement;

        // 100kg, 170cm -> BMI = 34.6
        weightInput.value = '100';
        heightInput.value = '170';
        weightInput.dispatchEvent(new Event('input', { bubbles: true }));
        heightInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(resultBox.textContent).toContain('Obese');
    });

    test('should handle invalid inputs gracefully', () => {
        const weightInput = container.querySelector('#bmi-bsa-weight') as HTMLInputElement;
        const heightInput = container.querySelector('#bmi-bsa-height') as HTMLInputElement;
        const resultBox = container.querySelector('#bmi-bsa-result') as HTMLElement;

        // Set valid height first, then invalid weight
        heightInput.value = '175';
        weightInput.value = '-5'; // Invalid negative weight
        heightInput.dispatchEvent(new Event('input', { bubbles: true }));
        weightInput.dispatchEvent(new Event('input', { bubbles: true }));

        // The unified-formula-calculator shows result box with validation message
        // but should NOT show actual BMI calculation results
        const content = resultBox.textContent || '';

        // Should NOT contain valid BMI calculation results
        expect(content).not.toContain('kg/m²');
        expect(content).not.toContain('Normal weight');
        expect(content).not.toContain('Underweight');
        expect(content).not.toContain('Overweight');
        expect(content).not.toContain('Obese');
    });
});
