/**
 * GAD-7 (General Anxiety Disorder-7)
 *
 * 使用 Radio Group 工廠函數重構
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

// GAD-7 問題列表
const questions = [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid as if something awful might happen'
];

// 共用選項
const frequencyOptions = [
    { value: '0', label: 'Not at all (+0)', checked: true },
    { value: '1', label: 'Several days (+1)' },
    { value: '2', label: 'More than half the days (+2)' },
    { value: '3', label: 'Nearly every day (+3)' }
];

export const gad7Config: ScoringCalculatorConfig = {
    id: 'gad-7',
    title: 'GAD-7 (General Anxiety Disorder-7)',
    description: 'Screens for generalized anxiety disorder and monitors treatment response.',

    infoAlert:
        '<strong>Instructions:</strong> Over the last 2 weeks, how often have you been bothered by the following problems?',

    // 動態生成 7 個問題區塊
    sections: questions.map((q, i) => ({
        id: `gad7-q${i}`,
        title: `${i + 1}. ${q}`,
        options: frequencyOptions.map(opt => ({ ...opt }))
    })),

    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Addition of the selected points. Each question is scored 0-3:',
        scoringCriteria: [
            { criteria: 'Not at all', points: '0' },
            { criteria: 'Several days', points: '1' },
            { criteria: 'More than half the days', points: '2' },
            { criteria: 'Nearly every day', points: '3' }
        ],
        footnotes: ['Total score range: 0-21 points'],
        interpretationTitle: 'FACTS & FIGURES',
        tableHeaders: ['GAD-7 Score', 'Severity', 'Proposed Action'],
        interpretations: [
            {
                score: '0-4',
                category: 'Minimal',
                interpretation: 'Monitor; may not require treatment',
                severity: 'success'
            },
            {
                score: '5-9',
                category: 'Mild',
                interpretation: 'Watchful waiting; reassessment in 4 weeks',
                severity: 'info'
            },
            {
                score: '10-14',
                category: 'Moderate',
                interpretation: 'Active treatment with counseling and/or pharmacotherapy',
                severity: 'warning'
            },
            {
                score: '15-21',
                category: 'Severe',
                interpretation: 'Active treatment with pharmacotherapy and/or psychotherapy',
                severity: 'danger'
            }
        ]
    },

    riskLevels: [
        {
            minScore: 0,
            maxScore: 4,
            label: 'Minimal anxiety',
            severity: 'success',
            description: 'Monitor, may not require treatment.'
        },
        {
            minScore: 5,
            maxScore: 9,
            label: 'Mild anxiety',
            severity: 'info',
            description: 'Watchful waiting, reassessment in 4 weeks.'
        },
        {
            minScore: 10,
            maxScore: 14,
            label: 'Moderate anxiety',
            severity: 'warning',
            description: 'Active treatment with counseling and/or pharmacotherapy.'
        },
        {
            minScore: 15,
            maxScore: 21,
            label: 'Severe anxiety',
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
            severity = 'Minimal anxiety';
            alertClass = 'ui-alert-success';
            recommendation = 'Monitor, may not require treatment.';
        } else if (score <= 9) {
            severity = 'Mild anxiety';
            alertClass = 'ui-alert-info';
            recommendation = 'Watchful waiting, reassessment in 4 weeks.';
        } else if (score <= 14) {
            severity = 'Moderate anxiety';
            alertClass = 'ui-alert-warning';
            recommendation = 'Active treatment with counseling and/or pharmacotherapy.';
        } else {
            severity = 'Severe anxiety';
            alertClass = 'ui-alert-danger';
            recommendation =
                'Active treatment with pharmacotherapy and/or psychotherapy recommended.';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Score',
                value: score.toString(),
                unit: '/ 21 points',
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
};

export const gad7 = createScoringCalculator(gad7Config);
