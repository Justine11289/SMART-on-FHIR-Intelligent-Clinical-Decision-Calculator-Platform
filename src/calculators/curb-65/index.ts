/**
 * CURB-65 Score for Pneumonia Severity Calculator
 *
 * 使用 Yes/No Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { UnitConverter } from '../../unit-converter.js';
import { uiBuilder } from '../../ui-builder.js';

export const curb65Config: ScoringCalculatorConfig = {
    inputType: 'yesno',
    id: 'curb-65',
    title: 'CURB-65 Score for Pneumonia Severity',
    description:
        'Estimates mortality of community-acquired pneumonia to help determine inpatient vs. outpatient treatment.',
    infoAlert: 'Check all criteria that apply. Score automatically calculates.',
    sectionTitle: 'CURB-65 Criteria',
    sectionIcon: '🫁',
    questions: [
        {
            id: 'curb-confusion',
            label: '<strong>C</strong>onfusion (new disorientation to person, place, or time)',
            points: 1
        },
        {
            id: 'curb-bun',
            label: '<strong>U</strong>rea > 7 mmol/L (BUN > 19 mg/dL)',
            points: 1,
            // 使用觀察值閾值判斷
            observationCriteria: {
                code: LOINC_CODES.BUN,
                condition: (value: number) => value > 19 // 假設單位是 mg/dL
            }
        },
        {
            id: 'curb-rr',
            label: '<strong>R</strong>espiratory Rate ≥30 breaths/min',
            points: 1,
            observationCriteria: {
                code: LOINC_CODES.RESPIRATORY_RATE,
                condition: (value: number) => value >= 30
            }
        },
        {
            id: 'curb-bp',
            label: '<strong>B</strong>lood Pressure (SBP < 90 or DBP ≤60 mmHg)',
            points: 1
        },
        { id: 'curb-age', label: 'Age ≥<strong>65</strong> years', points: 1 }
    ],
    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'The CURB-65 Score is calculated by the addition of the selected points:',
        scoringCriteria: [
            { criteria: 'Confusion', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '1' },
            { criteria: 'Urea > 7 mmol/L (BUN > 19 mg/dL)', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '1' },
            { criteria: 'Respiratory rate ≥30/min', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '1' },
            { criteria: 'Blood pressure (SBP <90 mm Hg or DBP ≤60 mm Hg)', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '1' },
            { criteria: 'Age ≥65', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '1' }
        ],
        interpretationTitle: 'FACTS & FIGURES',
        tableHeaders: ['CURB-65 Score', 'Mortality Risk', 'Treatment'],
        interpretations: [
            {
                score: '0',
                category: 'Low',
                interpretation: 'Likely suitable for home treatment',
                severity: 'success'
            },
            {
                score: '1 or 2',
                category: 'Intermediate',
                interpretation: 'Consider hospital referral',
                severity: 'warning'
            },
            {
                score: '3 or 4',
                category: 'High',
                interpretation: 'Urgent hospital admission',
                severity: 'danger'
            }
        ]
    },
    riskLevels: [
        {
            minScore: 0,
            maxScore: 0,
            label: 'Low Risk',
            severity: 'success',
            recommendation: 'Low risk (0.6% mortality), consider outpatient treatment.'
        },
        {
            minScore: 1,
            maxScore: 1,
            label: 'Low Risk',
            severity: 'success',
            recommendation: 'Low risk (2.7% mortality), consider outpatient treatment.'
        },
        {
            minScore: 2,
            maxScore: 2,
            label: 'Moderate Risk',
            severity: 'warning',
            recommendation:
                'Moderate risk (6.8% mortality), consider short inpatient hospitalization or closely supervised outpatient treatment.'
        },
        {
            minScore: 3,
            maxScore: 3,
            label: 'High Risk',
            severity: 'danger',
            recommendation: 'Severe pneumonia (14% mortality); manage in hospital.'
        },
        {
            minScore: 4,
            maxScore: 5,
            label: 'Very High Risk',
            severity: 'danger',
            recommendation:
                'Severe pneumonia (27.8% mortality); manage in hospital and assess for ICU admission.'
        }
    ],

    customResultRenderer: (score: number): string => {
        const mortalityRates: Record<number, string> = {
            0: '0.6%',
            1: '2.7%',
            2: '6.8%',
            3: '14.0%',
            4: '27.8%',
            5: '27.8%'
        };

        const recommendations: Record<number, { text: string; level: string }> = {
            0: { text: 'Low risk, consider outpatient treatment.', level: 'success' },
            1: { text: 'Low risk, consider outpatient treatment.', level: 'success' },
            2: {
                text: 'Moderate risk, consider short inpatient hospitalization or closely supervised outpatient treatment.',
                level: 'warning'
            },
            3: { text: 'Severe pneumonia; manage in hospital.', level: 'danger' },
            4: {
                text: 'Severe pneumonia; manage in hospital and assess for ICU admission.',
                level: 'danger'
            },
            5: {
                text: 'Severe pneumonia; manage in hospital and assess for ICU admission.',
                level: 'danger'
            }
        };

        const mortality = mortalityRates[score] || '27.8%';
        const rec = recommendations[score] || recommendations[5];
        const alertClass = `ui-alert-${rec.level}`;
        const riskLabel =
            score <= 1
                ? 'Low Risk'
                : score === 2
                  ? 'Moderate Risk'
                  : score === 3
                    ? 'High Risk'
                    : 'Very High Risk';

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Score',
                value: score.toString(),
                unit: '/ 5 points',
                interpretation: riskLabel,
                alertClass: alertClass
            })}
            
            ${uiBuilder.createResultItem({
                label: '30-Day Mortality Risk',
                value: mortality
            })}
            ${uiBuilder.createAlert({
                type: rec.level as 'success' | 'warning' | 'danger',
                message: `<strong>Recommendation:</strong> ${rec.text}`
            })}
        `;
    },

    // 使用 customInitialize 處理年齡和血壓組合邏輯
    customInitialize: async (client, patient, container, calculate) => {
        const setRadioValue = (name: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // 自動填充年齡
        const age = fhirDataService.getPatientAge();
        if (age !== null && age >= 65) {
            setRadioValue('curb-age', '1');
        }

        if (!fhirDataService.isReady()) {
            return;
        }

        const stalenessTracker = fhirDataService.getStalenessTracker();

        try {
            // 獲取血壓（使用 blood pressure panel）
            const bpResult = await fhirDataService.getBloodPressure({
                trackStaleness: true
            });

            const sbpLow = bpResult.systolic !== null && bpResult.systolic < 90;
            const dbpLow = bpResult.diastolic !== null && bpResult.diastolic <= 60;

            if (sbpLow || dbpLow) {
                setRadioValue('curb-bp', '1');
            }

            // BUN 需要單位轉換
            const bunResult = await fhirDataService.getObservation(LOINC_CODES.BUN, {
                trackStaleness: true,
                stalenessLabel: 'BUN'
            });

            if (bunResult.value !== null) {
                const unit = bunResult.unit || 'mg/dL';
                const bunMgDl = UnitConverter.convert(bunResult.value, unit, 'mg/dL', 'bun');
                if (bunMgDl !== null && bunMgDl > 19) {
                    setRadioValue('curb-bun', '1');
                    if (stalenessTracker && bunResult.observation) {
                        stalenessTracker.trackObservation(
                            'input[name="curb-bun"]',
                            bunResult.observation,
                            LOINC_CODES.BUN,
                            'BUN'
                        );
                    }
                }
            }
        } catch (error) {
            console.warn('Error auto-populating CURB-65:', error);
        }
    }
};

// 創建並導出計算器
export const curb65 = createScoringCalculator(curb65Config);
