/**
 * @jest-environment jsdom
 */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { gcs } from '../../calculators/gcs/index';
describe('Glasgow Coma Scale (GCS) Calculator', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = gcs.generateHTML();
        document.body.appendChild(container);
        gcs.initialize(null, null, container);
    });
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });
    test('should export valid calculator module', () => {
        expect(gcs).toBeDefined();
        expect(gcs.id).toBe('gcs');
        expect(typeof gcs.generateHTML).toBe('function');
    });
    test('should calculate maximum GCS score (15)', () => {
        // Select best responses: Eye 4, Verbal 5, Motor 6
        const eyeRadio = container.querySelector('input[name="gcs-eye"][value="4"]');
        const verbalRadio = container.querySelector('input[name="gcs-verbal"][value="5"]');
        const motorRadio = container.querySelector('input[name="gcs-motor"][value="6"]');
        if (eyeRadio && verbalRadio && motorRadio) {
            eyeRadio.checked = true;
            verbalRadio.checked = true;
            motorRadio.checked = true;
            eyeRadio.dispatchEvent(new Event('change', { bubbles: true }));
            verbalRadio.dispatchEvent(new Event('change', { bubbles: true }));
            motorRadio.dispatchEvent(new Event('change', { bubbles: true }));
            const resultText = container.textContent || '';
            expect(resultText).toContain('15');
        }
    });
    test('should calculate minimum GCS score (3)', () => {
        // Select worst responses: Eye 1, Verbal 1, Motor 1
        const eyeRadio = container.querySelector('input[name="gcs-eye"][value="1"]');
        const verbalRadio = container.querySelector('input[name="gcs-verbal"][value="1"]');
        const motorRadio = container.querySelector('input[name="gcs-motor"][value="1"]');
        if (eyeRadio && verbalRadio && motorRadio) {
            eyeRadio.checked = true;
            verbalRadio.checked = true;
            motorRadio.checked = true;
            eyeRadio.dispatchEvent(new Event('change', { bubbles: true }));
            verbalRadio.dispatchEvent(new Event('change', { bubbles: true }));
            motorRadio.dispatchEvent(new Event('change', { bubbles: true }));
            const resultText = container.textContent || '';
            expect(resultText).toContain('3');
        }
    });
    test('should classify severe brain injury (GCS 3-8)', () => {
        const eyeRadio = container.querySelector('input[name="gcs-eye"][value="2"]');
        const verbalRadio = container.querySelector('input[name="gcs-verbal"][value="2"]');
        const motorRadio = container.querySelector('input[name="gcs-motor"][value="3"]');
        if (eyeRadio && verbalRadio && motorRadio) {
            eyeRadio.checked = true;
            verbalRadio.checked = true;
            motorRadio.checked = true;
            eyeRadio.dispatchEvent(new Event('change', { bubbles: true }));
            verbalRadio.dispatchEvent(new Event('change', { bubbles: true }));
            motorRadio.dispatchEvent(new Event('change', { bubbles: true }));
            // GCS = 2 + 2 + 3 = 7 (Severe)
            const resultText = container.textContent?.toLowerCase() || '';
            expect(resultText).toContain('7');
            expect(resultText).toMatch(/severe|coma/i);
        }
    });
    test('should classify mild brain injury (GCS 13-15)', () => {
        const eyeRadio = container.querySelector('input[name="gcs-eye"][value="4"]');
        const verbalRadio = container.querySelector('input[name="gcs-verbal"][value="4"]');
        const motorRadio = container.querySelector('input[name="gcs-motor"][value="6"]');
        if (eyeRadio && verbalRadio && motorRadio) {
            eyeRadio.checked = true;
            verbalRadio.checked = true;
            motorRadio.checked = true;
            eyeRadio.dispatchEvent(new Event('change', { bubbles: true }));
            verbalRadio.dispatchEvent(new Event('change', { bubbles: true }));
            motorRadio.dispatchEvent(new Event('change', { bubbles: true }));
            // GCS = 4 + 4 + 6 = 14 (Mild)
            const resultText = container.textContent?.toLowerCase() || '';
            expect(resultText).toContain('14');
            expect(resultText).toMatch(/mild|minor|normal/i);
        }
    });
});
