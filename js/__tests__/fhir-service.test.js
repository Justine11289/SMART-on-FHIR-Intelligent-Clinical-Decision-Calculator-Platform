import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { fhirDataService } from '../fhir-data-service';
import { LOINC_CODES } from '../fhir-codes';
// Create a mock function for the request
const mockRequest = jest.fn();
// Mock FHIR Client
const mockClient = {
    patient: {
        id: 'test-patient-id',
        request: mockRequest
    }
};
describe('FHIRDataService', () => {
    beforeEach(() => {
        // Reset singleton state if possible or re-initialize
        document.body.innerHTML = '<div id="test-container"></div>';
        const container = document.getElementById('test-container');
        fhirDataService.initialize(mockClient, { id: 'test-patient-id' }, container);
        mockRequest.mockClear();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test('getObservation should fetch and return value', async () => {
        const mockObservation = {
            resourceType: 'Observation',
            code: {
                coding: [{ system: 'http://loinc.org', code: LOINC_CODES.WEIGHT }]
            },
            valueQuantity: {
                value: 70,
                unit: 'kg'
            },
            effectiveDateTime: '2023-01-01T00:00:00Z'
        };
        mockRequest.mockResolvedValueOnce({
            entry: [{ resource: mockObservation }]
        });
        const result = await fhirDataService.getObservation(LOINC_CODES.WEIGHT);
        expect(result.value).toBe(70);
        expect(result.unit).toBe('kg');
        expect(mockRequest).toHaveBeenCalledWith(expect.stringContaining(`code=${LOINC_CODES.WEIGHT}`));
    });
    test('getObservation should handle no data found', async () => {
        mockRequest.mockResolvedValueOnce({
            entry: []
        });
        const result = await fhirDataService.getObservation('INVALID-CODE');
        expect(result.value).toBeNull();
    });
    test('getObservation should handle errors gracefully', async () => {
        mockRequest.mockRejectedValueOnce(new Error('Network error'));
        const result = await fhirDataService.getObservation(LOINC_CODES.HEIGHT);
        expect(result.value).toBeNull();
    });
    // =========================================
    // Patient Name Tests (TWCORE IG Support)
    // =========================================
    describe('Patient Name - TWCORE IG Support', () => {
        test('should read Chinese name from text field', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id',
                name: [
                    {
                        use: 'official',
                        text: '陳加玲',
                        family: 'Chen',
                        given: ['Chia Lin']
                    }
                ],
                birthDate: '1990-01-01',
                gender: 'female'
            }, container);
            const name = fhirDataService.getPatientName();
            expect(name).not.toBeNull();
            expect(name?.display).toBe('陳加玲');
            expect(name?.text).toBe('陳加玲');
            expect(name?.family).toBe('Chen');
            expect(name?.given).toEqual(['Chia Lin']);
        });
        test('should prioritize official name over other uses', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id',
                name: [
                    {
                        use: 'nickname',
                        text: '阿玲'
                    },
                    {
                        use: 'official',
                        text: '陳加玲'
                    }
                ]
            }, container);
            const name = fhirDataService.getPatientName();
            expect(name?.display).toBe('陳加玲');
        });
        test('should fallback to family+given for Western format', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id',
                name: [
                    {
                        use: 'official',
                        family: 'Smith',
                        given: ['John', 'Michael']
                    }
                ]
            }, container);
            const name = fhirDataService.getPatientName();
            expect(name?.display).toBe('John Michael Smith');
        });
        test('getPatientDisplayName should return display string', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id',
                name: [{ text: '王大明' }]
            }, container);
            expect(fhirDataService.getPatientDisplayName()).toBe('王大明');
        });
        test('should return null for patient with no name', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id'
            }, container);
            expect(fhirDataService.getPatientName()).toBeNull();
            expect(fhirDataService.getPatientDisplayName()).toBeNull();
        });
    });
    // =========================================
    // Birth Date Tests
    // =========================================
    describe('Patient Birth Date', () => {
        test('should return birth date as Date object', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id',
                birthDate: '1990-01-01'
            }, container);
            const birthDate = fhirDataService.getPatientBirthDate();
            expect(birthDate).toBeInstanceOf(Date);
            expect(birthDate?.getFullYear()).toBe(1990);
            expect(birthDate?.getMonth()).toBe(0); // January
            expect(birthDate?.getDate()).toBe(1);
        });
        test('should return birth date string', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id',
                birthDate: '1990-01-01'
            }, container);
            expect(fhirDataService.getPatientBirthDateString()).toBe('1990-01-01');
        });
        test('should return null for patient with no birth date', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id'
            }, container);
            expect(fhirDataService.getPatientBirthDate()).toBeNull();
            expect(fhirDataService.getPatientBirthDateString()).toBeNull();
        });
    });
    // =========================================
    // Demographics Tests
    // =========================================
    describe('Patient Demographics', () => {
        test('should return complete demographics for TWCORE patient', () => {
            const container = document.getElementById('test-container');
            fhirDataService.initialize(mockClient, {
                id: 'test-patient-id',
                name: [{ use: 'official', text: '陳加玲' }],
                birthDate: '1990-01-01',
                gender: 'female'
            }, container);
            const demographics = fhirDataService.getPatientDemographics();
            expect(demographics.name).toBe('陳加玲');
            expect(demographics.gender).toBe('female');
            expect(demographics.birthDate).toBe('1990-01-01');
            expect(demographics.age).toBeGreaterThan(30); // Born in 1990
        });
    });
});
