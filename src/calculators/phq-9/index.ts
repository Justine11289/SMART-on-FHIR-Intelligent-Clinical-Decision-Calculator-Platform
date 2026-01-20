/**
 * PHQ-9 (Patient Health Questionnaire-9)
 *
 * 使用 Radio Group 工廠函數重構
 * 代碼從 144 行減少到約 100 行
 */

import { createScoringCalculator } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

// PHQ-9 問題列表
const questions = [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
    'Trouble concentrating on things, such as reading the newspaper or watching television',
    'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
    'Thoughts that you would be better off dead or of hurting yourself in some way'
];

// 共用選項
const frequencyOptions = [
    { value: '0', label: 'Not at all (+0)', checked: true },
    { value: '1', label: 'Several days (+1)' },
    { value: '2', label: 'More than half the days (+2)' },
    { value: '3', label: 'Nearly every day (+3)' }
];

export const phq9 = createScoringCalculator({
    id: 'phq-9',
    title: 'PHQ-9 (Patient Health Questionnaire-9)',
    description: 'Screens for depression and monitors treatment response.',

    infoAlert:
        '<strong>Instructions:</strong> Over the last 2 weeks, how often have you been bothered by any of the following problems?',

    // 動態生成 9 個問題區塊
    sections: questions.map((q, i) => ({
        id: `phq9-q${i}`,
        title: `${i + 1}. ${q}`,
        options: frequencyOptions.map(opt => ({ ...opt })) // 複製選項避免共享引用
    })),

    riskLevels: [
        {
            minScore: 0,
            maxScore: 4,
            label: 'Minimal depression',
            severity: 'success',
            description: 'Monitor, may not require treatment.'
        },
        {
            minScore: 5,
            maxScore: 9,
            label: 'Mild depression',
            severity: 'info',
            description: 'Consider counseling, follow-up, and/or pharmacotherapy.'
        },
        {
            minScore: 10,
            maxScore: 14,
            label: 'Moderate depression',
            severity: 'warning',
            description: 'Consider counseling, follow-up, and/or pharmacotherapy.'
        },
        {
            minScore: 15,
            maxScore: 19,
            label: 'Moderately severe depression',
            severity: 'danger',
            description: 'Active treatment with pharmacotherapy and/or psychotherapy recommended.'
        },
        {
            minScore: 20,
            maxScore: 27,
            label: 'Severe depression',
            severity: 'danger',
            description: 'Active treatment with pharmacotherapy and/or psychotherapy recommended.'
        }
    ],

    // 自定義結果渲染器
    customResultRenderer: score => {
        let severity = '';
        let alertClass = '';
        let recommendation = '';

        if (score <= 4) {
            severity = 'Minimal depression';
            alertClass = 'ui-alert-success';
            recommendation = 'Monitor, may not require treatment.';
        } else if (score <= 9) {
            severity = 'Mild depression';
            alertClass = 'ui-alert-info';
            recommendation = 'Consider counseling, follow-up, and/or pharmacotherapy.';
        } else if (score <= 14) {
            severity = 'Moderate depression';
            alertClass = 'ui-alert-warning';
            recommendation = 'Consider counseling, follow-up, and/or pharmacotherapy.';
        } else if (score <= 19) {
            severity = 'Moderately severe depression';
            alertClass = 'ui-alert-danger';
            recommendation =
                'Active treatment with pharmacotherapy and/or psychotherapy recommended.';
        } else {
            severity = 'Severe depression';
            alertClass = 'ui-alert-danger';
            recommendation =
                'Active treatment with pharmacotherapy and/or psychotherapy recommended.';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Score',
                value: score.toString(),
                unit: '/ 27 points',
                interpretation: severity,
                alertClass: alertClass
            })}
            
            ${uiBuilder.createAlert({
                type: alertClass.replace('ui-alert-', '') as
                    | 'success'
                    | 'info'
                    | 'warning'
                    | 'danger',
                message: `<strong>Recommendation:</strong> ${recommendation}`
            })}
        `;
    }
});
