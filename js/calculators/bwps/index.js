/**
 * Burch-Wartofsky Point Scale (BWPS) for Thyrotoxicosis
 *
 * Migrated to createUnifiedFormulaCalculator
 */
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateBwps } from './calculation.js';
const config = {
    id: 'bwps',
    title: 'Burch-Wartofsky Point Scale (BWPS) for Thyrotoxicosis',
    description: 'Predicts likelihood that biochemical thyrotoxicosis is thyroid storm.',
    infoAlert: '<strong>INSTRUCTIONS:</strong> Use in patients >18 years old with biochemical thyrotoxicosis.',
    sections: [
        {
            title: 'Clinical Parameters',
            fields: [
                {
                    type: 'select',
                    id: 'bwps-temp',
                    label: 'Temperature',
                    options: [
                        { value: '0', label: '<99°F (<37.2°C)' },
                        { value: '5', label: '99-99.9°F (37.2-37.7°C)' },
                        { value: '10', label: '100-100.9°F (37.8-38.2°C)' },
                        { value: '15', label: '101-101.9°F (38.3-38.8°C)' },
                        { value: '20', label: '102-102.9°F (38.9-39.2°C)' },
                        { value: '25', label: '103-103.9°F (39.3-39.9°C)' },
                        { value: '30', label: '≥104.0°F (≥40.0°C)' }
                    ]
                },
                {
                    type: 'select',
                    id: 'bwps-cns',
                    label: 'Central nervous system effects',
                    options: [
                        { value: '0', label: 'Absent' },
                        { value: '10', label: 'Mild (agitation)' },
                        { value: '20', label: 'Moderate (delirium, psychosis, extreme lethargy)' },
                        { value: '30', label: 'Severe (seizures, coma)' }
                    ]
                },
                {
                    type: 'select',
                    id: 'bwps-gi',
                    label: 'Gastrointestinal-hepatic dysfunction',
                    options: [
                        { value: '0', label: 'Absent' },
                        {
                            value: '10',
                            label: 'Moderate (diarrhea, nausea/vomiting, abdominal pain)'
                        },
                        { value: '20', label: 'Severe (unexplained jaundice)' }
                    ]
                },
                {
                    type: 'select',
                    id: 'bwps-hr',
                    label: 'Heart Rate (beats/minute)',
                    options: [
                        { value: '0', label: '<90' },
                        { value: '5', label: '90-109' },
                        { value: '10', label: '110-119' },
                        { value: '15', label: '120-129' },
                        { value: '20', label: '130-139' },
                        { value: '25', label: '≥140' }
                    ]
                },
                {
                    type: 'select',
                    id: 'bwps-chf',
                    label: 'Congestive Heart Failure',
                    options: [
                        { value: '0', label: 'Absent' },
                        { value: '5', label: 'Mild (pedal edema)' },
                        { value: '10', label: 'Moderate (bibasilar rales)' },
                        { value: '15', label: 'Severe (pulmonary edema)' }
                    ]
                },
                {
                    type: 'select',
                    id: 'bwps-afib',
                    label: 'Atrial fibrillation present',
                    options: [
                        { value: '0', label: 'No' },
                        { value: '10', label: 'Yes' }
                    ]
                },
                {
                    type: 'select',
                    id: 'bwps-precip',
                    label: 'Precipitating event',
                    options: [
                        { value: '0', label: 'No' },
                        { value: '10', label: 'Yes' }
                    ]
                }
            ]
        }
    ],
    formulaSection: {
        show: true,
        title: 'Scoring',
        calculationNote: 'Sum of all selected point values.',
        interpretations: [
            {
                score: '<25',
                interpretation: 'Unlikely to represent thyroid storm',
                severity: 'success'
            },
            { score: '25-44', interpretation: 'Suggests impending storm', severity: 'warning' },
            {
                score: '≥45',
                interpretation: 'Highly suggestive of thyroid storm',
                severity: 'danger'
            }
        ]
    },
    calculate: calculateBwps,
    customInitialize: async (client, patient, container, calculate) => {
        if (!client)
            return;
        fhirDataService.initialize(client, patient, container);
        const setValue = (id, value) => {
            const input = container.querySelector(`#${id}`);
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
        try {
            // Temperature (convert to Fahrenheit)
            const tempResult = await fhirDataService.getObservation(LOINC_CODES.TEMPERATURE, {
                trackStaleness: true,
                stalenessLabel: 'Temperature',
                targetUnit: 'degF',
                unitType: 'temperature'
            });
            if (tempResult.value !== null) {
                const tempF = tempResult.value;
                let tempValue = '0';
                if (tempF >= 104)
                    tempValue = '30';
                else if (tempF >= 103)
                    tempValue = '25';
                else if (tempF >= 102)
                    tempValue = '20';
                else if (tempF >= 101)
                    tempValue = '15';
                else if (tempF >= 100)
                    tempValue = '10';
                else if (tempF >= 99)
                    tempValue = '5';
                setValue('bwps-temp', tempValue);
            }
            // Heart Rate
            const hrResult = await fhirDataService.getObservation(LOINC_CODES.HEART_RATE, {
                trackStaleness: true,
                stalenessLabel: 'Heart Rate'
            });
            if (hrResult.value !== null) {
                const hr = hrResult.value;
                let hrValue = '0';
                if (hr >= 140)
                    hrValue = '25';
                else if (hr >= 130)
                    hrValue = '20';
                else if (hr >= 120)
                    hrValue = '15';
                else if (hr >= 110)
                    hrValue = '10';
                else if (hr >= 90)
                    hrValue = '5';
                setValue('bwps-hr', hrValue);
            }
            calculate();
        }
        catch (e) {
            console.warn('FHIR data fetch failed:', e);
        }
    }
};
export const bwps = createUnifiedFormulaCalculator(config);
