/**
 * HEART Score for Major Cardiac Events Calculator
 *
 * 使用 Radio Score Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { uiBuilder } from '../../ui-builder.js';
import { SNOMED_CODES, LOINC_CODES } from '../../fhir-codes.js';

export const heartScoreConfig: ScoringCalculatorConfig = {
    id: 'heart-score',
    title: 'HEART Score for Major Cardiac Events',
    description:
        'Predicts 6-week risk of major adverse cardiac events in patients with chest pain.',
    infoAlert:
        '<strong>Inclusion Criteria:</strong> Patients ≥21 years old with symptoms suggestive of ACS. <strong>Do not use if:</strong> new ST-elevation ≥1 mm, hypotension, life expectancy <1 year, or noncardiac illness requiring admission.',
    sections: [
        {
            id: 'heart-history',
            title: 'History',
            icon: '📋',
            options: [
                { value: '0', label: 'Slightly suspicious (low risk features)', checked: true },
                { value: '1', label: 'Moderately suspicious (mixture)' },
                { value: '2', label: 'Highly suspicious (classic angina)' }
            ]
        },
        {
            id: 'heart-ecg',
            title: 'EKG',
            icon: '📊',
            options: [
                { value: '0', label: 'Normal', checked: true },
                { value: '1', label: 'Non-specific repolarization disturbance' },
                { value: '2', label: 'Significant ST deviation' }
            ]
        },
        {
            id: 'heart-age',
            title: 'Age',
            icon: '👤',
            options: [
                { value: '0', label: '< 45 years', checked: true },
                { value: '1', label: '45-64 years' },
                { value: '2', label: '≥ 65 years' }
            ]
        },
        {
            id: 'heart-risk',
            title: 'Risk Factors',
            icon: '⚡',
            subtitle:
                'HTN, hyperlipidemia, DM, obesity (BMI>30), smoking, family history, atherosclerotic disease',
            options: [
                { value: '0', label: 'No known risk factors', checked: true },
                { value: '1', label: '1-2 risk factors' },
                { value: '2', label: '≥3 risk factors or history of atherosclerotic disease' }
            ]
        },
        {
            id: 'heart-troponin',
            title: 'Initial Troponin',
            icon: '🔬',
            subtitle: 'Use local assay cutoffs',
            options: [
                { value: '0', label: '≤ normal limit', checked: true },
                { value: '1', label: '1-3× normal limit' },
                { value: '2', label: '> 3× normal limit' }
            ]
        }
    ],
    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Addition of the selected points:'
    },

    riskLevels: [
        {
            minScore: 0,
            maxScore: 3,
            label: 'Low Risk (0-3)',
            severity: 'success',
            description: '0.9-1.7% MACE risk. Supports early discharge.'
        },
        {
            minScore: 4,
            maxScore: 6,
            label: 'Moderate Risk (4-6)',
            severity: 'warning',
            description: '12-16.6% MACE risk. Admit for clinical observation and further testing.'
        },
        {
            minScore: 7,
            maxScore: 10,
            label: 'High Risk (7-10)',
            severity: 'danger',
            description: '50-65% MACE risk. Candidate for early invasive measures.'
        }
    ],

    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        let riskCategory = '';
        let maceRate = '';
        let recommendation = '';
        let alertClass: 'success' | 'warning' | 'danger' = 'success';

        if (score <= 3) {
            riskCategory = 'Low Risk (0-3)';
            maceRate = '0.9-1.7%';
            recommendation = 'Supports early discharge.';
            alertClass = 'success';
        } else if (score <= 6) {
            riskCategory = 'Moderate Risk (4-6)';
            maceRate = '12-16.6%';
            recommendation = 'Admit for clinical observation and further testing.';
            alertClass = 'warning';
        } else {
            riskCategory = 'High Risk (7-10)';
            maceRate = '50-65%';
            recommendation = 'Candidate for early invasive measures.';
            alertClass = 'danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total HEART Score',
                value: score.toString(),
                unit: '/ 10 points',
                interpretation: riskCategory,
                alertClass: `ui-alert-${alertClass}`
            })}
            ${uiBuilder.createResultItem({
                label: 'Risk of Major Adverse Cardiac Event (6-week)',
                value: maceRate,
                alertClass: `ui-alert-${alertClass}`
            })}
            
            ${uiBuilder.createAlert({
                type: alertClass,
                message: `<strong>Recommendation:</strong> ${recommendation}`
            })}
        `;
    },

    // 使用 customInitialize 處理年齡分層邏輯和風險因子
    customInitialize: async (client, patient, container) => {
        // Initialize FHIR service
        if (!fhirDataService.isReady()) return;

        const setRadioValue = (name: string, value: string): void => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // 1. Age
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            if (age < 45) {
                setRadioValue('heart-age', '0');
            } else if (age <= 64) {
                setRadioValue('heart-age', '1');
            } else {
                setRadioValue('heart-age', '2');
            }
        }

        try {
            // 2. Risk Factors
            // Definition: HTN, hyperlipidemia, DM, obesity (BMI>30), smoking, family history, atherosclerotic disease

            // Check Atherosclerotic Disease first (Automatic +2 if present)
            // Includes: CAD, PAD, Stroke, TIA, Previous MI, Previous Cardiac Surgery (CABG/PCI)
            const atheroscleroticCodes = [
                SNOMED_CODES.CORONARY_ARTERY_DISEASE,
                SNOMED_CODES.ISCHEMIC_HEART_DISEASE,
                SNOMED_CODES.PERIPHERAL_ARTERY_DISEASE,
                SNOMED_CODES.STROKE,
                SNOMED_CODES.TIA,
                SNOMED_CODES.PREVIOUS_MI,
                SNOMED_CODES.PREVIOUS_CARDIAC_SURGERY,
                SNOMED_CODES.MYOCARDIAL_INFARCTION,
                SNOMED_CODES.CABG,
                SNOMED_CODES.PCI
            ];

            const hasAtherosclerosis = await fhirDataService.hasCondition(atheroscleroticCodes);

            if (hasAtherosclerosis) {
                setRadioValue('heart-risk', '2'); // ≥3 risk factors or history of atherosclerotic disease
                return; // Priority rule met
            }

            // Count other risk factors
            let riskCount = 0;

            // HTN
            if (await fhirDataService.hasCondition([SNOMED_CODES.HYPERTENSION])) riskCount++;

            // Hyperlipidemia
            if (await fhirDataService.hasCondition([SNOMED_CODES.HYPERLIPIDEMIA])) riskCount++;

            // Diabetes
            if (
                await fhirDataService.hasCondition([
                    SNOMED_CODES.DIABETES_MELLITUS,
                    SNOMED_CODES.DIABETES_TYPE_1,
                    SNOMED_CODES.DIABETES_TYPE_2
                ])
            )
                riskCount++;

            // Smoking
            if (
                await fhirDataService.hasCondition([
                    SNOMED_CODES.SMOKING_STATUS,
                    SNOMED_CODES.SMOKING
                ])
            )
                riskCount++;

            // Family History
            if (await fhirDataService.hasCondition([SNOMED_CODES.FAMILY_HISTORY_CAD])) riskCount++;

            // Obesity (BMI > 30)
            const bmi = await fhirDataService.getObservation(LOINC_CODES.BMI);
            const isObese =
                (bmi.value !== null && bmi.value > 30) ||
                (await fhirDataService.hasCondition([SNOMED_CODES.OBESITY]));
            if (isObese) riskCount++;

            // Select appropriate option based on count
            if (riskCount >= 3) {
                setRadioValue('heart-risk', '2');
            } else if (riskCount >= 1) {
                setRadioValue('heart-risk', '1');
            } else {
                setRadioValue('heart-risk', '0');
            }
        } catch (error) {
            console.warn('HEART Score FHIR auto-population failed:', error);
        }
    }
};

// 創建基礎計算器
const baseCalculator = createScoringCalculator(heartScoreConfig);

// 導出帶有詳細 Formula 表格的計算器
export const heartScore = {
    ...baseCalculator,

    generateHTML(): string {
        const html = baseCalculator.generateHTML();

        // 添加詳細 Formula 表格
        const formulaTable = `
            ${uiBuilder.createSection({
                title: 'Scoring Criteria',
                icon: '📋',
                content:
                    uiBuilder.createTable({
                        headers: ['', '0 points', '1 point', '2 points'],
                        rows: [
                            [
                                '<strong>History<sup>1</sup></strong>',
                                'Slightly suspicious',
                                'Moderately suspicious',
                                'Highly suspicious'
                            ],
                            [
                                '<strong>EKG</strong>',
                                'Normal',
                                'Non-specific repolarization disturbance<sup>2</sup>',
                                'Significant ST deviation<sup>3</sup>'
                            ],
                            ['<strong>Age (years)</strong>', '<45', '45–64', '≥65'],
                            [
                                '<strong>Risk factors<sup>4</sup></strong>',
                                'No known risk factors',
                                '1–2 risk factors',
                                '≥3 risk factors or history of atherosclerotic disease'
                            ],
                            [
                                '<strong>Initial troponin<sup>5</sup></strong>',
                                '≤normal limit',
                                '1–3× normal limit',
                                '>3× normal limit'
                            ]
                        ],
                        stickyFirstColumn: true
                    }) +
                    `
                    <div class="table-note text-sm text-muted mt-10">
                        <p><sup>1</sup> History: Slightly suspicious = nonspecific symptoms; Moderately suspicious = traditional symptoms; Highly suspicious = typical chest pain.</p>
                        <p><sup>2</sup> Includes LBBB, pacemaker rhythm, LVH, repolarization changes.</p>
                        <p><sup>3</sup> ST depression or elevation ≥1mm in ≥2 contiguous leads.</p>
                        <p><sup>4</sup> Risk factors: HTN, hyperlipidemia, DM, obesity (BMI>30), smoking, family history, atherosclerotic disease.</p>
                        <p><sup>5</sup> Use local assay normal limits.</p>
                    </div>
                `
            })}
        `;

        return html + formulaTable;
    }
};
