/**
 * @jest-environment jsdom
 */
import { describe, expect, test, jest } from '@jest/globals';
import { fhirDataService, FHIRDataService } from '../fhir-data-service';
import { bmiBsa } from '../calculators/bmi-bsa/index';
// Mock the console methods to avoid cluttering test output
global.console = {
    ...console,
    // log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};
describe('Smoke Tests', () => {
    describe('Environment', () => {
        test('JSDOM should be active', () => {
            expect(document).toBeDefined();
            expect(window).toBeDefined();
            const div = document.createElement('div');
            expect(div).toBeInstanceOf(HTMLElement);
        });
    });
    describe('FHIRDataService', () => {
        test('Singleton instance should be exported', () => {
            expect(fhirDataService).toBeDefined();
            expect(fhirDataService).toBeInstanceOf(FHIRDataService);
        });
        test('Should initialize correctly', () => {
            // Mock client and patient
            const mockClient = {
                patient: { id: 'test-patient-id' }
            };
            const mockPatient = { id: 'test-patient-id', birthDate: '1980-01-01' };
            const container = document.createElement('div');
            fhirDataService.initialize(mockClient, mockPatient, container);
            expect(fhirDataService.isReady()).toBe(true);
            expect(fhirDataService.getPatientId()).toBe('test-patient-id');
        });
    });
    describe('Calculator Module: BMI & BSA', () => {
        test('Should export valid calculator module', () => {
            expect(bmiBsa).toBeDefined();
            expect(bmiBsa.id).toBe('bmi-bsa');
            expect(bmiBsa.title).toBeDefined();
            expect(typeof bmiBsa.generateHTML).toBe('function');
            expect(typeof bmiBsa.initialize).toBe('function');
        });
        test('generateHTML should return non-empty HTML string', () => {
            const html = bmiBsa.generateHTML();
            expect(typeof html).toBe('string');
            expect(html.length).toBeGreaterThan(0);
            expect(html).toContain('BMI');
        });
        test('Should initialize without error', () => {
            const container = document.createElement('div');
            // Populate container with HTML first because initialize expects elements to exist
            container.innerHTML = bmiBsa.generateHTML();
            const mockClient = {
                patient: { id: 'test-patient-id' }
            };
            const mockPatient = { id: 'test-patient-id' };
            // Should not throw
            expect(() => {
                bmiBsa.initialize(mockClient, mockPatient, container);
            }).not.toThrow();
        });
    });
});
