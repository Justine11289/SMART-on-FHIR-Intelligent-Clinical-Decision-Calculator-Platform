/**
 * Modified Early Warning Score (MEWS) Calculator
 *
 * 使用 Radio Score Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { uiBuilder } from '../../ui-builder.js';

export const mewsConfig: ScoringCalculatorConfig = {
    id: 'mews',
    title: 'Modified Early Warning Score (MEWS)',
    description:
        'Determines the degree of illness of a patient. Identifies patients at risk for clinical deterioration.',
    infoAlert:
        'Different hospitals may use different modifications of MEWS. Verify your institution protocols.',
    sections: [
        {
            id: 'mews-sbp',
            title: 'Systolic BP (mmHg)',
            icon: '🩸',
            options: [
                { value: '0', label: '101-199 mmHg', checked: true },
                { value: '1', label: '81-100 mmHg (+1)' },
                { value: '2', label: '71-80 or ≥200 mmHg (+2)' },
                { value: '3', label: '≤70 mmHg (+3)' }
            ]
        },
        {
            id: 'mews-hr',
            title: 'Heart Rate (bpm)',
            icon: '💓',
            options: [
                { value: '0', label: '51-100 bpm', checked: true },
                { value: '1', label: '41-50 or 101-110 bpm (+1)' },
                { value: '2', label: '<40 or 111-129 bpm (+2)' },
                { value: '3', label: '≥130 bpm (+3)' }
            ]
        },
        {
            id: 'mews-rr',
            title: 'Respiratory Rate (breaths/min)',
            icon: '🫁',
            options: [
                { value: '0', label: '9-14 bpm', checked: true },
                { value: '1', label: '15-20 bpm (+1)' },
                { value: '2', label: '<9 or 21-29 bpm (+2)' },
                { value: '3', label: '≥30 bpm (+3)' }
            ]
        },
        {
            id: 'mews-temp',
            title: 'Temperature',
            icon: '🌡️',
            options: [
                { value: '0', label: '35.0-38.4°C (95-101.1°F)', checked: true },
                { value: '2', label: '<35°C (<95°F) or ≥38.5°C (≥101.3°F) (+2)' }
            ]
        },
        {
            id: 'mews-avpu',
            title: 'AVPU Scale (Level of Consciousness)',
            icon: '🧠',
            options: [
                { value: '0', label: 'Alert', checked: true },
                { value: '1', label: 'Voice - Responds to voice (+1)' },
                { value: '2', label: 'Pain - Responds to pain (+2)' },
                { value: '3', label: 'Unresponsive (+3)' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 1,
            label: 'Low Risk',
            severity: 'success',
            description: 'Continue routine monitoring.'
        },
        {
            minScore: 2,
            maxScore: 3,
            label: 'Moderate Risk',
            severity: 'warning',
            description: 'Increase frequency of observations. Notify nurse in charge.'
        },
        {
            minScore: 4,
            maxScore: 4,
            label: 'Moderate-High Risk',
            severity: 'warning',
            description: 'Urgent call to doctor. Consider ICU assessment.'
        },
        {
            minScore: 5,
            maxScore: 999,
            label: 'High Risk',
            severity: 'danger',
            description: 'Emergency call to doctor. Immediate ICU assessment required.'
        }
    ],

    formulaSection: {
        show: true,
        title: 'FACTS & FIGURES',
        calculationNote: 'See formula table; below:',
        scoringCriteria: [
            { criteria: 'Systolic BP (mmHg)', isHeader: true },
            { criteria: '≤70', points: '+3' },
            { criteria: '71-80', points: '+2' },
            { criteria: '81-100', points: '+1' },
            { criteria: '101-199', points: '0' },
            { criteria: '≥200', points: '+2' },
            { criteria: 'Heart rate (beats per minute)', isHeader: true },
            { criteria: '<40', points: '+2' },
            { criteria: '41-50', points: '+1' },
            { criteria: '51-100', points: '0' },
            { criteria: '101-110', points: '+1' },
            { criteria: '111-129', points: '+2' },
            { criteria: '>130', points: '+3' },
            { criteria: 'Respiratory rate (breaths per minute)', isHeader: true },
            { criteria: '<9', points: '+2' },
            { criteria: '9-14', points: '0' },
            { criteria: '15-20', points: '+1' },
            { criteria: '21-29', points: '+2' },
            { criteria: '>30', points: '+3' },
            { criteria: 'Temperature in °C (°F)', isHeader: true },
            { criteria: '<35 (<95)', points: '+2' },
            { criteria: '35.0-38.4 (95-101.12)', points: '0' },
            { criteria: '>38.5 (101.3)', points: '+2' },
            { criteria: 'AVPU', isHeader: true },
            { criteria: 'Alert?', points: '0' },
            { criteria: 'Voice?', points: '+1' },
            { criteria: 'Pain?', points: '+2' },
            { criteria: 'Unresponsive?', points: '+3' }
        ],
        footnotes: [
            'A score ≥5 is statistically linked to increased likelihood of death or admission to an intensive care unit.',
            'For any single physiological parameter scored +3, consider higher level of care for patient.'
        ]
    },

    // 自定義結果渲染（包含危急參數警告）
    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        // 檢查是否有危急參數（+3 分）
        const hasCriticalParam = Object.values(sectionScores).some(v => v === 3);

        // 找到對應的風險等級
        let riskLabel = 'Low Risk';
        let riskSeverity: 'success' | 'warning' | 'danger' = 'success';
        let riskDescription = 'Continue routine monitoring.';

        if (score >= 5) {
            riskLabel = 'High Risk';
            riskSeverity = 'danger';
            riskDescription = 'Emergency call to doctor. Immediate ICU assessment required.';
        } else if (score === 4) {
            riskLabel = 'Moderate-High Risk';
            riskSeverity = 'warning';
            riskDescription = 'Urgent call to doctor. Consider ICU assessment.';
        } else if (score >= 2) {
            riskLabel = 'Moderate Risk';
            riskSeverity = 'warning';
            riskDescription = 'Increase frequency of observations. Notify nurse in charge.';
        }

        const criticalWarning = hasCriticalParam
            ? uiBuilder.createAlert({
                  type: 'danger',
                  message:
                      '<strong>Critical Parameter Alert:</strong> One or more parameters scored +3 points. Consider higher level of care regardless of total score.'
              })
            : '';

        return `
            ${uiBuilder.createResultItem({
                label: 'Total MEWS Score',
                value: score.toString(),
                unit: '/ 14 points',
                interpretation: riskLabel,
                alertClass: `ui-alert-${riskSeverity}`
            })}
            ${uiBuilder.createAlert({
                type: riskSeverity,
                message: `<strong>Recommendation:</strong> ${riskDescription}`
            })}
            ${criticalWarning}
        `;
    },

    // 使用 customInitialize 進行 FHIR 自動填充
    customInitialize: async (client, patient, container, calculate) => {
        if (!fhirDataService.isReady()) {
            return;
        }

        const stalenessTracker = fhirDataService.getStalenessTracker();

        const setRadioValue = (name: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        try {
            // 獲取血壓（使用 blood pressure panel）
            const bpResult = await fhirDataService.getBloodPressure({
                trackStaleness: true
            });

            if (bpResult.systolic !== null) {
                const sbp = bpResult.systolic;
                if (sbp <= 70) {
                    setRadioValue('mews-sbp', '3');
                } else if (sbp <= 80) {
                    setRadioValue('mews-sbp', '2');
                } else if (sbp <= 100) {
                    setRadioValue('mews-sbp', '1');
                } else if (sbp <= 199) {
                    setRadioValue('mews-sbp', '0');
                } else {
                    setRadioValue('mews-sbp', '2');
                }

                // Staleness tracking is handled by getBloodPressure()
            }

            // 獲取心率
            const hrResult = await fhirDataService.getObservation(LOINC_CODES.HEART_RATE, {
                trackStaleness: true,
                stalenessLabel: 'Heart Rate'
            });

            if (hrResult.value !== null) {
                const hr = hrResult.value;
                if (hr < 40) {
                    setRadioValue('mews-hr', '2');
                } else if (hr <= 50) {
                    setRadioValue('mews-hr', '1');
                } else if (hr <= 100) {
                    setRadioValue('mews-hr', '0');
                } else if (hr <= 110) {
                    setRadioValue('mews-hr', '1');
                } else if (hr <= 129) {
                    setRadioValue('mews-hr', '2');
                } else {
                    setRadioValue('mews-hr', '3');
                }

                if (stalenessTracker && hrResult.observation) {
                    stalenessTracker.trackObservation(
                        'input[name="mews-hr"]',
                        hrResult.observation,
                        LOINC_CODES.HEART_RATE,
                        'Heart Rate'
                    );
                }
            }

            // 獲取呼吸率
            const rrResult = await fhirDataService.getObservation(LOINC_CODES.RESPIRATORY_RATE, {
                trackStaleness: true,
                stalenessLabel: 'Respiratory Rate'
            });

            if (rrResult.value !== null) {
                const rr = rrResult.value;
                if (rr < 9) {
                    setRadioValue('mews-rr', '2');
                } else if (rr <= 14) {
                    setRadioValue('mews-rr', '0');
                } else if (rr <= 20) {
                    setRadioValue('mews-rr', '1');
                } else if (rr <= 29) {
                    setRadioValue('mews-rr', '2');
                } else {
                    setRadioValue('mews-rr', '3');
                }

                if (stalenessTracker && rrResult.observation) {
                    stalenessTracker.trackObservation(
                        'input[name="mews-rr"]',
                        rrResult.observation,
                        LOINC_CODES.RESPIRATORY_RATE,
                        'Respiratory Rate'
                    );
                }
            }

            // 獲取體溫
            const tempResult = await fhirDataService.getObservation(LOINC_CODES.TEMPERATURE, {
                trackStaleness: true,
                stalenessLabel: 'Temperature'
            });

            if (tempResult.value !== null) {
                let temp = tempResult.value;
                const unit = tempResult.unit;

                // 轉換華氏到攝氏
                if (unit === '[degF]' || unit === 'degF' || unit === 'F') {
                    temp = ((temp - 32) * 5) / 9;
                }

                if (temp < 35 || temp >= 38.5) {
                    setRadioValue('mews-temp', '2');
                } else {
                    setRadioValue('mews-temp', '0');
                }

                if (stalenessTracker && tempResult.observation) {
                    stalenessTracker.trackObservation(
                        'input[name="mews-temp"]',
                        tempResult.observation,
                        LOINC_CODES.TEMPERATURE,
                        'Temperature'
                    );
                }
            }
        } catch (error) {
            console.warn('Error auto-populating MEWS:', error);
        }
    }
};

export const mewsScore = createScoringCalculator(mewsConfig);
