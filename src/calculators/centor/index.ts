/**
 * Centor Score (Modified/McIsaac) for Strep Pharyngitis Calculator
 *
 * 使用 Yes/No Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { uiBuilder } from '../../ui-builder.js';

const config: ScoringCalculatorConfig = {
    inputType: 'yesno',
    id: 'centor',
    title: 'Centor Score (Modified/McIsaac) for Strep Pharyngitis',
    description:
        'Estimates probability that pharyngitis is streptococcal, and suggests management course.',
    sectionTitle: 'Clinical Criteria',
    sectionIcon: '🩺',
    questions: [
        { id: 'centor-exudates', label: 'Tonsillar exudates or swelling', points: 1 },
        { id: 'centor-nodes', label: 'Swollen, tender anterior cervical nodes', points: 1 },
        { id: 'centor-fever', label: 'Temperature > 38°C (100.4°F)', points: 1 },
        { id: 'centor-cough', label: 'Absence of cough', points: 1 }
    ],
    riskLevels: [
        {
            minScore: -1,
            maxScore: 0,
            label: '<10% probability',
            severity: 'success',
            recommendation: 'No antibiotic or throat culture necessary.'
        },
        {
            minScore: 1,
            maxScore: 1,
            label: '≈17% probability',
            severity: 'success',
            recommendation: 'No antibiotic or throat culture necessary.'
        },
        {
            minScore: 2,
            maxScore: 2,
            label: '≈35% probability',
            severity: 'warning',
            recommendation: 'Consider throat culture or rapid antigen testing.'
        },
        {
            minScore: 3,
            maxScore: 3,
            label: '≈56% probability',
            severity: 'warning',
            recommendation:
                'Consider throat culture or rapid antigen testing. May treat empirically.'
        },
        {
            minScore: 4,
            maxScore: 999,
            label: '>85% probability',
            severity: 'danger',
            recommendation: 'Empiric antibiotic treatment is justified.'
        }
    ],
    customResultRenderer: (score: number): string => {
        let probability = '';
        let recommendation = '';
        let alertClass: 'success' | 'warning' | 'danger' = 'success';

        if (score <= 0) {
            probability = '<10%';
            recommendation = 'No antibiotic or throat culture necessary.';
            alertClass = 'success';
        } else if (score === 1) {
            probability = '≈17%';
            recommendation = 'No antibiotic or throat culture necessary.';
            alertClass = 'success';
        } else if (score === 2) {
            probability = '≈35%';
            recommendation = 'Consider throat culture or rapid antigen testing.';
            alertClass = 'warning';
        } else if (score === 3) {
            probability = '≈56%';
            recommendation =
                'Consider throat culture or rapid antigen testing. May treat empirically.';
            alertClass = 'warning';
        } else {
            probability = '>85%';
            recommendation = 'Empiric antibiotic treatment is justified.';
            alertClass = 'danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Score',
                value: score.toString(),
                unit: '/ 5 points',
                interpretation: `Probability of Strep: ${probability}`,
                alertClass: `ui-alert-${alertClass}`
            })}
            
            ${uiBuilder.createAlert({
                type: alertClass,
                message: `<strong>Recommendation:</strong> ${recommendation}`
            })}
        `;
    }
};

// 創建基礎計算器
const baseCalculator = createScoringCalculator(config);

// 導出帶有年齡選項和 FHIR 自動填入的計算器
export const centor = {
    id: 'centor',
    title: config.title,
    description: config.description,

    generateHTML(): string {
        // 先用基礎計算器生成 HTML
        let html = baseCalculator.generateHTML();

        // 在結果框之前插入年齡區塊
        const ageSection = uiBuilder.createSection({
            title: 'McIsaac Modification (Age)',
            icon: '🎂',
            content: uiBuilder.createRadioGroup({
                name: 'centor-age',
                options: [
                    { value: '1', label: 'Age 3-14 years (+1)' },
                    { value: '0', label: 'Age 15-44 years (+0)', checked: true },
                    { value: '-1', label: 'Age ≥ 45 years (-1)' }
                ]
            })
        });

        // 插入年齡區塊在 error-container 之前
        html = html.replace(
            '<div id="centor-error-container"></div>',
            `${ageSection}<div id="centor-error-container"></div>`
        );

        // Formula Section
        const formulaSection = uiBuilder.createSection({
            title: 'Formula',
            icon: '📐',
            content: `
                <p class="calculation-note mb-15">Addition of the selected points:</p>
                ${uiBuilder.createTable({
                    headers: ['Criteria', 'Option', 'Points'],
                    rows: [
                        ['<strong>Age</strong>', '3-14 years', '+1'],
                        ['', '15-44 years', '0'],
                        ['', '≥45 years', '-1'],
                        ['<strong>Exudate or swelling on tonsils</strong>', 'No', '0'],
                        ['', 'Yes', '+1'],
                        [
                            '<strong>Tender/swollen anterior cervical lymph nodes</strong>',
                            'No',
                            '0'
                        ],
                        ['', 'Yes', '+1'],
                        ['<strong>Temp >38°C (100.4°F)</strong>', 'No', '0'],
                        ['', 'Yes', '+1'],
                        ['<strong>Cough</strong>', 'Cough present', '0'],
                        ['', 'Cough absent', '+1']
                    ]
                })}
            `
        });

        // Facts & Figures Section
        const factsSection = uiBuilder.createSection({
            title: 'Facts & Figures',
            icon: '📊',
            content: `
                <p class="mb-10"><strong>Interpretation:</strong></p>
                ${uiBuilder.createTable({
                    headers: ['Centor Score', 'Probability of strep pharyngitis', 'Recommendation'],
                    rows: [
                        ['0', '1-2.5%', 'No further testing or antibiotics.'],
                        ['1', '5-10%', 'No further testing or antibiotics.'],
                        ['2', '11-17%', 'Optional rapid strep testing and/or culture.'],
                        ['3', '28-35%', 'Consider rapid strep testing and/or culture.'],
                        [
                            '≥4',
                            '51-53%',
                            'Consider rapid strep testing and/or culture. Empiric antibiotics may be appropriate depending on the specific scenario.'
                        ]
                    ],
                    stickyFirstColumn: true
                })}
            `
        });

        // 在 HTML 最後加入 Formula 和 Facts 區塊
        html += formulaSection + factsSection;

        return html;
    },

    initialize(client: unknown, patient: any, container: HTMLElement): void {
        uiBuilder.initializeComponents(container);

        // Initialize FHIRDataService
        fhirDataService.initialize(client as any, patient as any, container);

        const setRadioValue = (name: string, value: string): void => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement | null;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // 計算函數
        const calculate = (): void => {
            let score = 0;

            // 計算臨床標準分數
            (config.questions || []).forEach(q => {
                const radio = container.querySelector(
                    `input[name="${q.id}"]:checked`
                ) as HTMLInputElement | null;
                if (radio) {
                    score += parseInt(radio.value) || 0;
                }
            });

            // 計算年齡分數
            const ageRadio = container.querySelector(
                'input[name="centor-age"]:checked'
            ) as HTMLInputElement | null;
            if (ageRadio) {
                score += parseInt(ageRadio.value) || 0;
            }

            // 使用自定義渲染器
            const resultBox = document.getElementById('centor-result');
            if (resultBox) {
                const resultContent = resultBox.querySelector('.ui-result-content');
                if (resultContent && config.customResultRenderer) {
                    resultContent.innerHTML = config.customResultRenderer(score, {});
                }
                resultBox.classList.add('show');
            }
        };

        // 綁定事件
        container.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', calculate);
        });

        // 使用 FHIRDataService 自動填入年齡
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            if (age >= 3 && age <= 14) {
                setRadioValue('centor-age', '1');
            } else if (age >= 45) {
                setRadioValue('centor-age', '-1');
            } else {
                setRadioValue('centor-age', '0');
            }
        }

        // 初始計算
        calculate();
    }
};
