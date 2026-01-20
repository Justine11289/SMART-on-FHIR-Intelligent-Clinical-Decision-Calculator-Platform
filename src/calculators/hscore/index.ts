/**
 * HScore for Reactive Hemophagocytic Syndrome
 *
 * 使用 Radio Score Calculator 工廠函數
 * 診斷反應性噬血細胞症候群
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';

// HScore 機率計算公式
const getProbability = (score: number): string => {
    const probability = 1 / (1 + Math.exp(-(-4.3 + 0.03 * score)));
    return (probability * 100).toFixed(1);
};

export const hscoreConfig: ScoringCalculatorConfig = {
    id: 'hscore',
    title: 'HScore for Reactive Hemophagocytic Syndrome',
    description: 'Diagnoses reactive hemophagocytic syndrome.',

    sections: [
        {
            id: 'hscore-immuno',
            title: 'Known underlying immunosuppression',
            subtitle: 'HIV positive or receiving long-term immunosuppressive therapy',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '18', label: 'Yes (+18)' }
            ]
        },
        {
            id: 'hscore-temp',
            title: 'Temperature, °F (°C)',
            loincCode: LOINC_CODES.TEMPERATURE,
            valueMapping: [
                { condition: v => v < 101.1, radioValue: '0' },
                { condition: v => v >= 101.1 && v <= 102.9, radioValue: '33' },
                { condition: v => v > 102.9, radioValue: '49' }
            ],
            options: [
                { value: '0', label: '<101.1 (<38.4) (0)', checked: true },
                { value: '33', label: '101.1-102.9 (38.4-39.4) (+33)' },
                { value: '49', label: '>102.9 (>39.4) (+49)' }
            ]
        },
        {
            id: 'hscore-organo',
            title: 'Organomegaly',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '23', label: 'Hepatomegaly or splenomegaly (+23)' },
                { value: '38', label: 'Hepatomegaly and splenomegaly (+38)' }
            ]
        },
        {
            id: 'hscore-cytopenias',
            title: 'Number of cytopenias',
            subtitle:
                'Defined as hemoglobin ≤9.2 g/dL, WBC ≤5,000/mm³, and/or platelets ≤110,000/mm³',
            options: [
                { value: '0', label: '1 lineage (0)', checked: true },
                { value: '24', label: '2 lineages (+24)' },
                { value: '34', label: '3 lineages (+34)' }
            ]
        },
        {
            id: 'hscore-ferritin',
            title: 'Ferritin, ng/mL (or μg/L)',
            loincCode: '2276-4',
            valueMapping: [
                { condition: v => v < 2000, radioValue: '0' },
                { condition: v => v >= 2000 && v <= 6000, radioValue: '35' },
                { condition: v => v > 6000, radioValue: '50' }
            ],
            options: [
                { value: '0', label: '<2,000 (0)', checked: true },
                { value: '35', label: '2,000-6,000 (+35)' },
                { value: '50', label: '>6,000 (+50)' }
            ]
        },
        {
            id: 'hscore-trig',
            title: 'Triglycerides, mg/dL (mmol/L)',
            loincCode: LOINC_CODES.TRIGLYCERIDES,
            valueMapping: [
                { condition: v => v < 132.7, radioValue: '0' },
                { condition: v => v >= 132.7 && v <= 354, radioValue: '44' },
                { condition: v => v > 354, radioValue: '64' }
            ],
            options: [
                { value: '0', label: '<132.7 (<1.5) (0)', checked: true },
                { value: '44', label: '132.7-354 (1.5-4) (+44)' },
                { value: '64', label: '>354 (>4) (+64)' }
            ]
        },
        {
            id: 'hscore-fibrinogen',
            title: 'Fibrinogen, mg/dL (g/L)',
            loincCode: '3255-7',
            valueMapping: [
                { condition: v => v > 250, radioValue: '0' },
                { condition: v => v <= 250, radioValue: '30' }
            ],
            options: [
                { value: '0', label: '>250 (>2.5) (0)', checked: true },
                { value: '30', label: '≤250 (≤2.5) (+30)' }
            ]
        },
        {
            id: 'hscore-ast',
            title: 'AST, U/L',
            loincCode: LOINC_CODES.AST,
            valueMapping: [
                { condition: v => v < 30, radioValue: '0' },
                { condition: v => v >= 30, radioValue: '19' }
            ],
            options: [
                { value: '0', label: '<30 (0)', checked: true },
                { value: '19', label: '≥30 (+19)' }
            ]
        },
        {
            id: 'hscore-bma',
            title: 'Hemophagocytosis features on bone marrow aspirate',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '35', label: 'Yes (+35)' }
            ]
        }
    ],

    riskLevels: [
        {
            minScore: 0,
            maxScore: 168,
            label: 'Low Probability',
            severity: 'success',
            description: 'Low probability of hemophagocytic syndrome'
        },
        {
            minScore: 169,
            maxScore: 999,
            label: 'High Probability',
            severity: 'danger',
            description:
                'High probability of hemophagocytic syndrome (≥93% sensitivity, ≥86% specificity)'
        }
    ],

    formulaSection: {
        show: true,
        title: 'SCORING',
        calculationNote: 'Addition of the selected points:'
    },

    customResultRenderer: (score: number) => {
        const probability = getProbability(score);
        return `
            ${uiBuilder.createResultItem({
                label: 'HScore',
                value: score.toString(),
                unit: 'points'
            })}
            ${uiBuilder.createResultItem({
                label: 'Probability of Hemophagocytic Syndrome',
                value: probability,
                unit: '%'
            })}
            ${uiBuilder.createAlert({
                type: score >= 169 ? 'danger' : 'success',
                message:
                    score >= 169
                        ? '<strong>High probability</strong> of hemophagocytic syndrome (sensitivity 93%, specificity 86%)'
                        : '<strong>Low probability</strong> of hemophagocytic syndrome'
            })}
        `;
    },

    customInitialize: async (client, patient, container, calculate) => {
        if (!client) return;

        fhirDataService.initialize(client, patient, container);

        // Helper function to set radio based on value
        const setRadioFromValue = (
            groupName: string,
            value: number | null,
            ranges: Array<{ condition: (v: number) => boolean; value: string }>
        ) => {
            if (value === null) return;
            const range = ranges.find(r => r.condition(value));
            if (range) {
                const radio = container.querySelector(
                    `input[name="${groupName}"][value="${range.value}"]`
                ) as HTMLInputElement;
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        };

        try {
            // Calculate cytopenias count from lab values
            const [hgbResult, wbcResult, plateletsResult] = await Promise.all([
                fhirDataService.getObservation(LOINC_CODES.HEMOGLOBIN, {
                    trackStaleness: true,
                    stalenessLabel: 'Hemoglobin'
                }),
                fhirDataService.getObservation(LOINC_CODES.WBC, {
                    trackStaleness: true,
                    stalenessLabel: 'WBC'
                }),
                fhirDataService.getObservation(LOINC_CODES.PLATELETS, {
                    trackStaleness: true,
                    stalenessLabel: 'Platelets'
                })
            ]);

            let cytopeniaCount = 0;
            if (hgbResult.value !== null && hgbResult.value <= 9.2) cytopeniaCount++;
            if (wbcResult.value !== null && wbcResult.value <= 5) cytopeniaCount++;
            if (plateletsResult.value !== null && plateletsResult.value <= 110) cytopeniaCount++;

            setRadioFromValue('hscore-cytopenias', cytopeniaCount, [
                { condition: v => v <= 1, value: '0' },
                { condition: v => v === 2, value: '24' },
                { condition: v => v >= 3, value: '34' }
            ]);

            // Temperature (convert to Fahrenheit)
            const tempResult = await fhirDataService.getObservation(LOINC_CODES.TEMPERATURE, {
                trackStaleness: true,
                stalenessLabel: 'Temperature',
                targetUnit: 'degF',
                unitType: 'temperature'
            });
            if (tempResult.value !== null) {
                setRadioFromValue('hscore-temp', tempResult.value, [
                    { condition: v => v < 101.1, value: '0' },
                    { condition: v => v >= 101.1 && v <= 102.9, value: '33' },
                    { condition: v => v > 102.9, value: '49' }
                ]);
            }

            // Ferritin
            const ferritinResult = await fhirDataService.getObservation('2276-4', {
                trackStaleness: true,
                stalenessLabel: 'Ferritin'
            });
            if (ferritinResult.value !== null) {
                setRadioFromValue('hscore-ferritin', ferritinResult.value, [
                    { condition: v => v < 2000, value: '0' },
                    { condition: v => v >= 2000 && v <= 6000, value: '35' },
                    { condition: v => v > 6000, value: '50' }
                ]);
            }

            // Triglycerides
            const trigResult = await fhirDataService.getObservation(LOINC_CODES.TRIGLYCERIDES, {
                trackStaleness: true,
                stalenessLabel: 'Triglycerides'
            });
            if (trigResult.value !== null) {
                setRadioFromValue('hscore-trig', trigResult.value, [
                    { condition: v => v < 132.7, value: '0' },
                    { condition: v => v >= 132.7 && v <= 354, value: '44' },
                    { condition: v => v > 354, value: '64' }
                ]);
            }

            // Fibrinogen
            const fibResult = await fhirDataService.getObservation('3255-7', {
                trackStaleness: true,
                stalenessLabel: 'Fibrinogen',
                targetUnit: 'mg/dL',
                unitType: 'fibrinogen'
            });
            if (fibResult.value !== null) {
                setRadioFromValue('hscore-fibrinogen', fibResult.value, [
                    { condition: v => v > 250, value: '0' },
                    { condition: v => v <= 250, value: '30' }
                ]);
            }

            // AST
            const astResult = await fhirDataService.getObservation(LOINC_CODES.AST, {
                trackStaleness: true,
                stalenessLabel: 'AST'
            });
            if (astResult.value !== null) {
                setRadioFromValue('hscore-ast', astResult.value, [
                    { condition: v => v < 30, value: '0' },
                    { condition: v => v >= 30, value: '19' }
                ]);
            }

            calculate();
        } catch (e) {
            console.warn('FHIR data fetch failed:', e);
        }
    }
};

// 創建基礎計算器
const baseCalculator = createScoringCalculator(hscoreConfig);

// 導出帶有詳細 Facts 表格的計算器
export const hscore = {
    ...baseCalculator,

    generateHTML(): string {
        const html = baseCalculator.generateHTML();

        // 添加 Facts & Figures 區塊
        const factsSection = `
            ${uiBuilder.createSection({
                title: 'FACTS & FIGURES',
                icon: '📊',
                content: `
                    <p class="mb-10">Interpretation:</p>
                    ${uiBuilder.createTable({
                        headers: ['HScore', 'Probability of hemophagocytic syndrome'],
                        rows: [
                            ['≤90', '<1%'],
                            ['91-100', '~1%'],
                            ['101-110', '1-3%'],
                            ['111-120', '3-5%'],
                            ['121-130', '5-9%'],
                            ['131-140', '9-16%'],
                            ['141-150', '16-25%'],
                            ['151-160', '25-40%'],
                            ['161-170', '40-54%'],
                            ['171-180', '54-70%'],
                            ['181-190', '70-80%'],
                            ['191-200', '80-88%'],
                            ['201-210', '88-93%'],
                            ['211-220', '93-96%'],
                            ['221-230', '96-98%'],
                            ['231-240', '98-99%'],
                            ['≥241', '>99%']
                        ]
                    })}
                    <p class="table-note text-sm text-muted mt-10">
                        Note: the best cutoff value for the HScore was 169, corresponding to a sensitivity of 93%, specificity of 86%, and accurate classification of 90% of patients.
                    </p>
                `
            })}
        `;

        return html + factsSection;
    }
};
