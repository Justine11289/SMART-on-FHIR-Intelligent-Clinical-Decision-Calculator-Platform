/**
 * Ranson Score for Pancreatitis Calculator
 *
 * 使用 Score Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { uiBuilder } from '../../ui-builder.js';

const config: ScoringCalculatorConfig = {
    inputType: 'checkbox',
    id: 'ranson',
    title: 'Ranson Score for Pancreatitis',
    description: 'Predicts severity and mortality of acute pancreatitis (for non-gallstone cases).',
    infoAlert:
        '<strong>Note:</strong> This score applies to non-gallstone pancreatitis. Different criteria exist for gallstone pancreatitis.',
    sections: [
        {
            title: 'At Admission or Diagnosis',
            icon: '🏥',
            options: [
                { id: 'ranson-age', label: 'Age > 55 years', value: 1 },
                { id: 'ranson-wbc', label: 'WBC count > 16,000/mm³', value: 1 },
                { id: 'ranson-glucose', label: 'Blood glucose > 200 mg/dL (>11 mmol/L)', value: 1 },
                { id: 'ranson-ast', label: 'Serum AST > 250 IU/L', value: 1 },
                { id: 'ranson-ldh', label: 'Serum LDH > 350 IU/L', value: 1 }
            ]
        },
        {
            title: 'During Initial 48 Hours',
            icon: '⏱️',
            options: [
                {
                    id: 'ranson-calcium',
                    label: 'Serum calcium < 8.0 mg/dL (<2.0 mmol/L)',
                    value: 1
                },
                { id: 'ranson-hct', label: 'Hematocrit fall > 10%', value: 1 },
                { id: 'ranson-paO2', label: 'PaO₂ < 60 mmHg', value: 1 },
                { id: 'ranson-bun', label: 'BUN increase > 5 mg/dL (>1.8 mmol/L)', value: 1 },
                { id: 'ranson-base', label: 'Base deficit > 4 mEq/L', value: 1 },
                { id: 'ranson-fluid', label: 'Fluid sequestration > 6 L', value: 1 }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 2,
            risk: 'Low Risk',
            category: 'Low',
            severity: 'success',
            recommendation: 'Mortality: 0-3%'
        },
        {
            minScore: 3,
            maxScore: 4,
            risk: 'Moderate Risk',
            category: 'Moderate',
            severity: 'warning',
            recommendation: 'Mortality: 15-20%'
        },
        {
            minScore: 5,
            maxScore: 6,
            risk: 'High Risk',
            category: 'High',
            severity: 'danger',
            recommendation: 'Mortality: ~40%'
        },
        {
            minScore: 7,
            maxScore: 11,
            risk: 'Very High Risk',
            category: 'Very High',
            severity: 'danger',
            recommendation: 'Mortality: >50%'
        }
    ],
    formulaSection: {
        show: true,
        title: 'Scoring Criteria',
        calculationNote:
            'Select all applicable criteria. At admission (5 criteria) + 48 hours (6 criteria) = possible 11 points.',
        scoringCriteria: [
            { criteria: 'At Admission Criteria', isHeader: true },
            { criteria: 'Age > 55 years', points: '+1' },
            { criteria: 'WBC > 16,000/mm³', points: '+1' },
            { criteria: 'Blood Glucose > 200 mg/dL', points: '+1' },
            { criteria: 'AST > 250 IU/L', points: '+1' },
            { criteria: 'LDH > 350 IU/L', points: '+1' },
            { criteria: '48 Hour Criteria', isHeader: true },
            { criteria: 'Calcium < 8.0 mg/dL', points: '+1' },
            { criteria: 'Hematocrit fall > 10%', points: '+1' },
            { criteria: 'PaO₂ < 60 mmHg', points: '+1' },
            { criteria: 'BUN increase > 5 mg/dL', points: '+1' },
            { criteria: 'Base deficit > 4 mEq/L', points: '+1' },
            { criteria: 'Fluid sequestration > 6 L', points: '+1' }
        ],
        interpretationTitle: 'Mortality Estimation',
        tableHeaders: ['Score', 'Mortality', 'Severity'],
        interpretations: [
            { score: '0-2', category: '0-3%', interpretation: 'Low Risk', severity: 'success' },
            {
                score: '3-4',
                category: '15-20%',
                interpretation: 'Moderate Risk',
                severity: 'warning'
            },
            { score: '5-6', category: '~40%', interpretation: 'High Risk', severity: 'danger' },
            { score: '≥7', category: '>50%', interpretation: 'Very High Risk', severity: 'danger' }
        ]
    },
    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        let mortality = '';
        let severity = '';
        let alertType: 'success' | 'warning' | 'danger' = 'success';

        if (score <= 2) {
            mortality = '0-3%';
            severity = 'Low Risk';
            alertType = 'success';
        } else if (score <= 4) {
            mortality = '15-20%';
            severity = 'Moderate Risk';
            alertType = 'warning';
        } else if (score <= 6) {
            mortality = '~40%';
            severity = 'High Risk';
            alertType = 'danger';
        } else {
            mortality = '>50%';
            severity = 'Very High Risk';
            alertType = 'danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Ranson Score',
                value: score.toString(),
                unit: '/ 11 points',
                interpretation: severity,
                alertClass: `ui-alert-${alertType}`
            })}
            ${uiBuilder.createResultItem({
                label: 'Estimated Mortality',
                value: mortality,
                alertClass: `ui-alert-${alertType}`
            })}
        `;
    },

    // 使用 customInitialize 處理 FHIR 自動填充
    customInitialize: async (client, patient, container, calculate) => {
        const setCheckbox = (id: string, checked: boolean) => {
            const box = container.querySelector(`#${id}`) as HTMLInputElement;
            if (box && checked) {
                box.checked = true;
                box.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // 自動填充年齡
        const age = fhirDataService.getPatientAge();
        if (age !== null && age > 55) {
            setCheckbox('ranson-age', true);
        }

        if (!fhirDataService.isReady()) {
            return;
        }

        const stalenessTracker = fhirDataService.getStalenessTracker();

        try {
            // WBC > 16,000/mm³
            const wbcResult = await fhirDataService.getObservation(LOINC_CODES.WBC, {
                trackStaleness: true,
                stalenessLabel: 'WBC'
            });

            if (wbcResult.value !== null) {
                let val = wbcResult.value;
                // Normalize to K/uL
                if (val > 1000) {
                    val = val / 1000;
                }
                if (val > 16) {
                    setCheckbox('ranson-wbc', true);
                }
                if (stalenessTracker && wbcResult.observation) {
                    stalenessTracker.trackObservation(
                        '#ranson-wbc',
                        wbcResult.observation,
                        LOINC_CODES.WBC,
                        'WBC Count'
                    );
                }
            }

            // Blood glucose > 200 mg/dL
            const glucoseResult = await fhirDataService.getObservation(LOINC_CODES.GLUCOSE, {
                trackStaleness: true,
                stalenessLabel: 'Glucose'
            });

            if (glucoseResult.value !== null) {
                let val = glucoseResult.value;
                // Convert mmol/L to mg/dL if needed
                if (glucoseResult.unit === 'mmol/L') {
                    val = val * 18.0182;
                }
                if (val > 200) {
                    setCheckbox('ranson-glucose', true);
                }
                if (stalenessTracker && glucoseResult.observation) {
                    stalenessTracker.trackObservation(
                        '#ranson-glucose',
                        glucoseResult.observation,
                        LOINC_CODES.GLUCOSE,
                        'Blood Glucose'
                    );
                }
            }

            // AST > 250 IU/L
            const astResult = await fhirDataService.getObservation(LOINC_CODES.AST, {
                trackStaleness: true,
                stalenessLabel: 'AST'
            });

            if (astResult.value !== null && astResult.value > 250) {
                setCheckbox('ranson-ast', true);
                if (stalenessTracker && astResult.observation) {
                    stalenessTracker.trackObservation(
                        '#ranson-ast',
                        astResult.observation,
                        LOINC_CODES.AST,
                        'AST'
                    );
                }
            }

            // LDH > 350 IU/L
            const ldhResult = await fhirDataService.getObservation(LOINC_CODES.LDH, {
                trackStaleness: true,
                stalenessLabel: 'LDH'
            });

            if (ldhResult.value !== null && ldhResult.value > 350) {
                setCheckbox('ranson-ldh', true);
                if (stalenessTracker && ldhResult.observation) {
                    stalenessTracker.trackObservation(
                        '#ranson-ldh',
                        ldhResult.observation,
                        LOINC_CODES.LDH,
                        'LDH'
                    );
                }
            }

            // Calcium < 8.0 mg/dL
            const calciumResult = await fhirDataService.getObservation(LOINC_CODES.CALCIUM, {
                trackStaleness: true,
                stalenessLabel: 'Calcium'
            });

            if (calciumResult.value !== null) {
                let val = calciumResult.value;
                // Convert mmol/L to mg/dL if needed
                if (calciumResult.unit === 'mmol/L') {
                    val = val * 4.008;
                }
                if (val < 8.0) {
                    setCheckbox('ranson-calcium', true);
                }
                if (stalenessTracker && calciumResult.observation) {
                    stalenessTracker.trackObservation(
                        '#ranson-calcium',
                        calciumResult.observation,
                        LOINC_CODES.CALCIUM,
                        'Calcium'
                    );
                }
            }
        } catch (error) {
            console.warn('Error auto-populating Ranson score:', error);
        }
    }
};

export const ransonScore = createScoringCalculator(config);
