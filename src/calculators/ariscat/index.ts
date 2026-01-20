import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';

export const ariscatConfig: ScoringCalculatorConfig = {
    id: 'ariscat',
    title: 'ARISCAT Score for Postoperative Pulmonary Complications',
    description:
        'Predicts risk of pulmonary complications after surgery, including respiratory failure.',
    sections: [
        {
            id: 'ariscat-age',
            title: 'Age, years',
            options: [
                { value: '0', label: '≤50 (0)', checked: true },
                { value: '3', label: '51-80 (+3)' },
                { value: '16', label: '>80 (+16)' }
            ]
        },
        {
            id: 'ariscat-spo2',
            title: 'Preoperative SpO₂',
            options: [
                { value: '0', label: '≥96% (0)', checked: true },
                { value: '8', label: '91-95% (+8)' },
                { value: '24', label: '≤90% (+24)' }
            ]
        },
        {
            id: 'ariscat-resp',
            title: 'Respiratory infection in the last month',
            subtitle:
                'Either upper or lower (i.e., URI, bronchitis, pneumonia), with fever and antibiotic treatment',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '17', label: 'Yes (+17)' }
            ]
        },
        {
            id: 'ariscat-anemia',
            title: 'Preoperative anemia (Hgb ≤10 g/dL)',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '11', label: 'Yes (+11)' }
            ]
        },
        {
            id: 'ariscat-site',
            title: 'Surgical incision',
            options: [
                { value: '0', label: 'Peripheral (0)', checked: true },
                { value: '15', label: 'Upper abdominal (+15)' },
                { value: '24', label: 'Intrathoracic (+24)' }
            ]
        },
        {
            id: 'ariscat-duration',
            title: 'Duration of surgery',
            options: [
                { value: '0', label: '<2 hrs (0)', checked: true },
                { value: '16', label: '2-3 hrs (+16)' },
                { value: '23', label: '>3 hrs (+23)' }
            ]
        },
        {
            id: 'ariscat-emergency',
            title: 'Emergency procedure?',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '8', label: 'Yes (+8)' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 25,
            label: 'Low risk',
            severity: 'success',
            description: 'Risk: 1.6%'
        },
        {
            minScore: 26,
            maxScore: 44,
            label: 'Intermediate risk',
            severity: 'warning',
            description: 'Risk: 13.3%'
        },
        {
            minScore: 45,
            maxScore: 123,
            label: 'High risk',
            severity: 'danger',
            description: 'Risk: 42.1%'
        }
    ],
    formulaSection: {
        show: true,
        title: 'Formula',
        calculationNote: 'Addition of the selected points:',
        scoringCriteria: [
            // Age
            { criteria: 'Age, years', isHeader: true },
            { criteria: '≤50', points: '0' },
            { criteria: '51-80', points: '3' },
            { criteria: '>80', points: '16' },
            // SpO2
            { criteria: 'Preoperative SpO₂', isHeader: true },
            { criteria: '≥96%', points: '0' },
            { criteria: '91-95%', points: '8' },
            { criteria: '≤90%', points: '24' },
            // Respiratory infection
            { criteria: 'Respiratory infection in the last month*', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '17' },
            // Anemia
            { criteria: 'Preoperative anemia (Hgb ≤10 g/dL)', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '11' },
            // Surgical incision
            { criteria: 'Surgical incision', isHeader: true },
            { criteria: 'Peripheral', points: '0' },
            { criteria: 'Upper abdominal', points: '15' },
            { criteria: 'Intrathoracic', points: '24' },
            // Duration
            { criteria: 'Duration of surgery', isHeader: true },
            { criteria: '<2 hrs', points: '0' },
            { criteria: '2-3 hrs', points: '16' },
            { criteria: '>3 hrs', points: '23' },
            // Emergency
            { criteria: 'Emergency procedure', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '8' }
        ],
        footnotes: [
            '*Either upper or lower (i.e., URI, bronchitis, pneumonia), with fever and antibiotic treatment.'
        ],
        interpretationTitle: 'Facts & Figures',
        tableHeaders: [
            'ARISCAT Score',
            'Risk Group',
            'Risk of In-Hospital Postoperative Pulmonary Complications*'
        ],
        interpretations: [
            { score: '<26', category: 'Low', interpretation: '1.6%', severity: 'success' },
            {
                score: '26-44',
                category: 'Intermediate',
                interpretation: '13.3%',
                severity: 'warning'
            },
            { score: '≥45', category: 'High', interpretation: '42.1%', severity: 'danger' }
        ]
    },
    customResultRenderer: (score: number) => {
        let riskCategory = '';
        let riskInfo = '';
        let alertType: 'success' | 'warning' | 'danger' = 'success';

        if (score < 26) {
            riskCategory = 'Low risk';
            riskInfo = '1.6%';
            alertType = 'success';
        } else if (score <= 44) {
            riskCategory = 'Intermediate risk';
            riskInfo = '13.3%';
            alertType = 'warning';
        } else {
            riskCategory = 'High risk';
            riskInfo = '42.1%';
            alertType = 'danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'ARISCAT Score',
                value: score.toString(),
                unit: 'points',
                interpretation: riskCategory,
                alertClass: `ui-alert-${alertType}`
            })}
            ${uiBuilder.createResultItem({
                label: 'Pulmonary Complication Risk',
                value: riskInfo,
                alertClass: `ui-alert-${alertType}`
            })}
            ${uiBuilder.createAlert({
                type: alertType,
                message:
                    'Risk of in-hospital post-op pulmonary complications (respiratory failure, infection, pleural effusion, atelectasis, pneumothorax, bronchospasm, aspiration pneumonitis).'
            })}
        `;
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
            }
        };

        // Age from FHIRDataService
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            let ageValue = '0';
            if (age > 80) {
                ageValue = '16';
            } else if (age > 50) {
                ageValue = '3';
            }
            setRadioValue('ariscat-age', ageValue);
        }

        if (client) {
            // O2 Saturation
            fhirDataService
                .getObservation(LOINC_CODES.OXYGEN_SATURATION, {
                    trackStaleness: true,
                    stalenessLabel: 'SpO2'
                })
                .then(result => {
                    if (result.value !== null) {
                        let value = '0';
                        if (result.value <= 90) {
                            value = '24';
                        } else if (result.value <= 95) {
                            value = '8';
                        }
                        setRadioValue('ariscat-spo2', value);
                    }
                })
                .catch(console.error);

            // Hemoglobin
            fhirDataService
                .getObservation(LOINC_CODES.HEMOGLOBIN, {
                    trackStaleness: true,
                    stalenessLabel: 'Hemoglobin'
                })
                .then(result => {
                    if (result.value !== null) {
                        if (result.value <= 10) {
                            setRadioValue('ariscat-anemia', '11');
                        } else {
                            setRadioValue('ariscat-anemia', '0');
                        }
                    }
                })
                .catch(console.error);
        }

        calculate();
    }
};

export const ariscat = createScoringCalculator(ariscatConfig);
