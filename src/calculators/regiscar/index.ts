import { createScoringCalculator } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';

export const regiscar = createScoringCalculator({
    id: 'regiscar',
    title: 'RegiSCAR Score for DRESS',
    description: 'Diagnoses Drug Reaction with Eosinophilia and Systemic Symptoms (DRESS).',
    infoAlert:
        '<strong>Note:</strong> DRESS is a severe drug hypersensitivity reaction. RegiSCAR helps standardize diagnosis.',
    sections: [
        {
            id: 'regiscar-fever',
            title: 'Fever (≥38.5 °C)',
            options: [
                { value: '-1', label: 'No / Unknown (-1)', checked: true },
                { value: '0', label: 'Yes (0)' }
            ]
        },
        {
            id: 'regiscar-lymph-nodes',
            title: 'Enlarged lymph nodes (≥2 sites, >1 cm)',
            options: [
                { value: '0', label: 'No / Unknown (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'regiscar-lymphocytes',
            title: 'Atypical lymphocytes',
            options: [
                { value: '0', label: 'No / Unknown (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'regiscar-eosinophilia',
            title: 'Eosinophilia',
            options: [
                { value: '0', label: '0-699 cells or <10% (0)', checked: true },
                { value: '1', label: '700-1,499 cells or 10-19.9% (+1)' },
                { value: '2', label: '≥1,500 cells or ≥20% (+2)' }
            ]
        },
        {
            id: 'regiscar-rash',
            title: 'Skin rash extent >50%',
            options: [
                { value: '0', label: 'No / Unknown (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'regiscar-skin-features',
            title: 'Skin features suggesting DRESS',
            subtitle: 'At least 2 of: edema, infiltration, purpura, scaling',
            options: [
                { value: '0', label: 'Unknown (0)', checked: true },
                { value: '-1', label: 'No (-1)' },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'regiscar-biopsy',
            title: 'Biopsy suggesting DRESS',
            options: [
                { value: '-1', label: 'No (-1)' },
                { value: '0', label: 'Yes / Unknown (0)', checked: true }
            ]
        },
        {
            id: 'regiscar-organ',
            title: 'Internal organ involved',
            subtitle: 'Liver, kidney, lung, heart, pancreas, etc.',
            options: [
                { value: '0', label: 'None (0)', checked: true },
                { value: '1', label: '1 organ (+1)' },
                { value: '2', label: '≥2 organs (+2)' }
            ]
        },
        {
            id: 'regiscar-resolution',
            title: 'Resolution in ≥15 days',
            options: [
                { value: '-1', label: 'No / Unknown (-1)', checked: true },
                { value: '0', label: 'Yes (0)' }
            ]
        },
        {
            id: 'regiscar-alternative',
            title: 'Alternative diagnoses excluded',
            subtitle: 'By ≥3 biological investigations',
            options: [
                { value: '0', label: 'No / Unknown (0)', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        }
    ],
    riskLevels: [
        { minScore: -4, maxScore: 1, label: 'No case', severity: 'success' },
        { minScore: 2, maxScore: 3, label: 'Possible case', severity: 'warning' },
        { minScore: 4, maxScore: 5, label: 'Probable case', severity: 'danger' },
        { minScore: 6, maxScore: 9, label: 'Definite case', severity: 'danger' }
    ],
    formulaSection: {
        show: true,
        interpretationTitle: 'Score Interpretation',
        tableHeaders: ['Score', 'Diagnosis', 'Likelihood'],
        interpretations: [
            { score: '< 2', category: 'No case', interpretation: 'Unlikely', severity: 'success' },
            {
                score: '2-3',
                category: 'Possible case',
                interpretation: 'Consider DRESS',
                severity: 'warning'
            },
            {
                score: '4-5',
                category: 'Probable case',
                interpretation: 'High likelihood',
                severity: 'danger'
            },
            {
                score: '> 5',
                category: 'Definite case',
                interpretation: 'Confirmed',
                severity: 'danger'
            }
        ]
    },
    customResultRenderer: (score: number) => {
        let diagnosis = '';
        let alertType: 'success' | 'warning' | 'danger' = 'success';

        if (score < 2) {
            diagnosis = 'No case';
            alertType = 'success';
        } else if (score <= 3) {
            diagnosis = 'Possible case';
            alertType = 'warning';
        } else if (score <= 5) {
            diagnosis = 'Probable case';
            alertType = 'danger';
        } else {
            diagnosis = 'Definite case';
            alertType = 'danger';
        }

        return uiBuilder.createResultItem({
            label: 'RegiSCAR Score',
            value: score.toString(),
            unit: 'points',
            interpretation: diagnosis,
            alertClass: `ui-alert-${alertType}`
        });
    },
    customInitialize: (
        client: unknown,
        patient: unknown,
        container: HTMLElement,
        calculate: () => void
    ) => {
        // Initialize FHIRDataService
        fhirDataService.initialize(client, patient, container);

        const setRadioValue = (name: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        };

        if (client) {
            // Temperature
            fhirDataService
                .getObservation(LOINC_CODES.TEMPERATURE, {
                    trackStaleness: true,
                    stalenessLabel: 'Temperature',
                    targetUnit: 'degC',
                    unitType: 'temperature'
                })
                .then(result => {
                    if (result.value !== null && result.value >= 38.5) {
                        setRadioValue('regiscar-fever', '0');
                    }
                })
                .catch(e => console.warn(e));

            // Eosinophils
            fhirDataService
                .getObservation(LOINC_CODES.EOSINOPHILS, {
                    trackStaleness: true,
                    stalenessLabel: 'Eosinophils'
                })
                .then(result => {
                    if (result.value !== null) {
                        if (result.value >= 1500) {
                            setRadioValue('regiscar-eosinophilia', '2');
                        } else if (result.value >= 700) {
                            setRadioValue('regiscar-eosinophilia', '1');
                        }
                        calculate();
                    }
                })
                .catch(e => console.warn(e));
        }

        calculate();
    }
});
