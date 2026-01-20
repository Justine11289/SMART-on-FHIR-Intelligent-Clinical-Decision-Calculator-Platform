import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';

export const fourCMortalityCovidConfig: ScoringCalculatorConfig = {
    id: '4c-mortality-covid',
    title: '4C Mortality Score for COVID-19',
    description: 'Predicts in-hospital mortality in patients admitted with COVID-19.',
    infoAlert: 'Use with admitted patients diagnosed with COVID-19.',
    sections: [
        {
            id: '4c-age',
            title: 'Age (years)',
            icon: '👴',
            options: [
                { value: '0', label: '<50', checked: true },
                { value: '2', label: '50-59 (+2)' },
                { value: '4', label: '60-69 (+4)' },
                { value: '6', label: '70-79 (+6)' },
                { value: '7', label: '≥80 (+7)' }
            ]
        },
        {
            id: '4c-sex',
            title: 'Sex at Birth',
            icon: '⚧',
            options: [
                { value: '0', label: 'Female', checked: true },
                { value: '1', label: 'Male (+1)' }
            ]
        },
        {
            id: '4c-comorbidities',
            title: 'Number of Comorbidities',
            icon: '🏥',
            subtitle:
                'Includes chronic cardiac/respiratory/renal/liver/neurological disease, dementia, malignancy, obesity, etc.',
            options: [
                { value: '0', label: '0', checked: true },
                { value: '1', label: '1 (+1)' },
                { value: '2', label: '≥2 (+2)' }
            ]
        },
        {
            id: '4c-resp_rate',
            title: 'Respiratory Rate (breaths/min)',
            icon: '🫁',
            options: [
                { value: '0', label: '<20', checked: true },
                { value: '1', label: '20-29 (+1)' },
                { value: '2', label: '≥30 (+2)' }
            ]
        },
        {
            id: '4c-oxygen_sat',
            title: 'Peripheral Oxygen Saturation (Room Air)',
            icon: '📉',
            options: [
                { value: '0', label: '≥92%', checked: true },
                { value: '2', label: '<92% (+2)' }
            ]
        },
        {
            id: '4c-gcs',
            title: 'Glasgow Coma Scale',
            icon: '🧠',
            options: [
                { value: '0', label: '15', checked: true },
                { value: '2', label: '<15 (+2)' }
            ]
        },
        {
            id: '4c-urea',
            title: 'Urea or BUN',
            icon: '🧪',
            options: [
                { value: '0', label: 'Urea <7 mmol/L or BUN <19.6 mg/dL', checked: true },
                { value: '1', label: 'Urea 7-14 mmol/L or BUN 19.6-39.2 mg/dL (+1)' },
                { value: '3', label: 'Urea >14 mmol/L or BUN >39.2 mg/dL (+3)' }
            ]
        },
        {
            id: '4c-crp',
            title: 'C-Reactive Protein (mg/L)',
            icon: '🔥',
            options: [
                { value: '0', label: '<50', checked: true },
                { value: '1', label: '50-99 (+1)' },
                { value: '2', label: '≥100 (+2)' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 3,
            label: 'Low Risk',
            severity: 'success',
            description: 'Mortality 1.2%'
        },
        {
            minScore: 4,
            maxScore: 8,
            label: 'Intermediate Risk',
            severity: 'warning',
            description: 'Mortality 9.9%'
        },
        {
            minScore: 9,
            maxScore: 14,
            label: 'High Risk',
            severity: 'danger',
            description: 'Mortality 31.4%'
        },
        {
            minScore: 15,
            maxScore: 21,
            label: 'Very High Risk',
            severity: 'danger',
            description: 'Mortality 61.5%'
        }
    ],
    customResultRenderer: (score: number) => {
        let riskGroup = '';
        let mortality = '';
        let alertClass = '';

        if (score <= 3) {
            riskGroup = 'Low Risk';
            mortality = '1.2%';
            alertClass = 'ui-alert-success';
        } else if (score <= 8) {
            riskGroup = 'Intermediate Risk';
            mortality = '9.9%';
            alertClass = 'ui-alert-warning';
        } else if (score <= 14) {
            riskGroup = 'High Risk';
            mortality = '31.4%';
            alertClass = 'ui-alert-danger';
        } else {
            riskGroup = 'Very High Risk';
            mortality = '61.5%';
            alertClass = 'ui-alert-danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total 4C Score',
                value: score.toString(),
                unit: 'points',
                interpretation: riskGroup,
                alertClass: alertClass
            })}
            ${uiBuilder.createResultItem({
                label: 'Estimated In-Hospital Mortality',
                value: mortality,
                unit: '',
                alertClass: alertClass
            })}
        `;
    },
    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Sum of all category points (0-21 points):',
        scoringCriteria: [
            { criteria: 'Age (years)', isHeader: true },
            { criteria: '<50', points: '0' },
            { criteria: '50-59', points: '+2' },
            { criteria: '60-69', points: '+4' },
            { criteria: '70-79', points: '+6' },
            { criteria: '≥80', points: '+7' },
            { criteria: 'Sex at Birth', isHeader: true },
            { criteria: 'Female', points: '0' },
            { criteria: 'Male', points: '+1' },
            { criteria: 'Number of Comorbidities', isHeader: true },
            { criteria: '0', points: '0' },
            { criteria: '1', points: '+1' },
            { criteria: '≥2', points: '+2' },
            { criteria: 'Respiratory Rate (breaths/min)', isHeader: true },
            { criteria: '<20', points: '0' },
            { criteria: '20-29', points: '+1' },
            { criteria: '≥30', points: '+2' },
            { criteria: 'Peripheral Oxygen Saturation (Room Air)', isHeader: true },
            { criteria: '≥92%', points: '0' },
            { criteria: '<92%', points: '+2' },
            { criteria: 'Glasgow Coma Scale', isHeader: true },
            { criteria: '15', points: '0' },
            { criteria: '<15', points: '+2' },
            { criteria: 'Urea / BUN', isHeader: true },
            { criteria: 'Urea <7 mmol/L or BUN <19.6 mg/dL', points: '0' },
            { criteria: 'Urea 7-14 mmol/L or BUN 19.6-39.2 mg/dL', points: '+1' },
            { criteria: 'Urea >14 mmol/L or BUN >39.2 mg/dL', points: '+3' },
            { criteria: 'C-Reactive Protein (mg/L)', isHeader: true },
            { criteria: '<50', points: '0' },
            { criteria: '50-99', points: '+1' },
            { criteria: '≥100', points: '+2' }
        ],
        interpretationTitle: 'Interpretation',
        tableHeaders: ['Score', 'Risk Group', 'Mortality Rate'],
        interpretations: [
            { score: '0-3', category: 'Low', interpretation: '1.2%', severity: 'success' },
            { score: '4-8', category: 'Intermediate', interpretation: '9.9%', severity: 'warning' },
            { score: '9-14', category: 'High', interpretation: '31.4%', severity: 'danger' },
            { score: '≥15', category: 'Very High', interpretation: '61.5%', severity: 'danger' }
        ]
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
            ) as HTMLInputElement | null;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        };

        // Age and gender from FHIRDataService
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            if (age < 50) {
                setRadioValue('4c-age', '0');
            } else if (age <= 59) {
                setRadioValue('4c-age', '2');
            } else if (age <= 69) {
                setRadioValue('4c-age', '4');
            } else if (age <= 79) {
                setRadioValue('4c-age', '6');
            } else {
                setRadioValue('4c-age', '7');
            }
        }

        const gender = fhirDataService.getPatientGender();
        if (gender === 'male') {
            setRadioValue('4c-sex', '1');
        } else if (gender === 'female') {
            setRadioValue('4c-sex', '0');
        }

        if (client) {
            // Respiratory Rate
            fhirDataService
                .getObservation(LOINC_CODES.RESPIRATORY_RATE, {
                    trackStaleness: true,
                    stalenessLabel: 'Respiratory Rate'
                })
                .then(result => {
                    if (result.value !== null) {
                        if (result.value < 20) {
                            setRadioValue('4c-resp_rate', '0');
                        } else if (result.value < 30) {
                            setRadioValue('4c-resp_rate', '1');
                        } else {
                            setRadioValue('4c-resp_rate', '2');
                        }
                    }
                })
                .catch(console.warn);

            // Oxygen Saturation
            fhirDataService
                .getObservation(LOINC_CODES.OXYGEN_SATURATION, {
                    trackStaleness: true,
                    stalenessLabel: 'O2 Saturation'
                })
                .then(result => {
                    if (result.value !== null) {
                        if (result.value >= 92) {
                            setRadioValue('4c-oxygen_sat', '0');
                        } else {
                            setRadioValue('4c-oxygen_sat', '2');
                        }
                    }
                })
                .catch(console.warn);

            // GCS
            fhirDataService
                .getObservation(LOINC_CODES.GCS, { trackStaleness: true, stalenessLabel: 'GCS' })
                .then(result => {
                    if (result.value !== null) {
                        if (result.value === 15) {
                            setRadioValue('4c-gcs', '0');
                        } else {
                            setRadioValue('4c-gcs', '2');
                        }
                    }
                })
                .catch(console.warn);

            // BUN
            fhirDataService
                .getObservation(LOINC_CODES.BUN, {
                    trackStaleness: true,
                    stalenessLabel: 'BUN',
                    targetUnit: 'mg/dL',
                    unitType: 'bun'
                })
                .then(result => {
                    if (result.value !== null) {
                        if (result.value < 19.6) {
                            setRadioValue('4c-urea', '0');
                        } else if (result.value <= 39.2) {
                            setRadioValue('4c-urea', '1');
                        } else {
                            setRadioValue('4c-urea', '3');
                        }
                    }
                })
                .catch(console.warn);

            // CRP
            fhirDataService
                .getObservation(LOINC_CODES.CRP, { trackStaleness: true, stalenessLabel: 'CRP' })
                .then(result => {
                    if (result.value !== null) {
                        if (result.value < 50) {
                            setRadioValue('4c-crp', '0');
                        } else if (result.value < 100) {
                            setRadioValue('4c-crp', '1');
                        } else {
                            setRadioValue('4c-crp', '2');
                        }
                    }
                })
                .catch(console.warn);
        }

        calculate();
    }
};

export const fourCMortalityCovid = createScoringCalculator(fourCMortalityCovidConfig);
