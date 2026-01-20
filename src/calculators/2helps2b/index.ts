/**
 * 2HELPS2B Score for Seizure Risk
 *
 * 使用新的工廠函數重構
 * 代碼從 183 行減少到約 80 行，更易維護
 *
 * 參考文獻：
 * Struck, A. F., et al. (2017). Association of an Electroencephalography-Based
 * Risk Score With Seizure Probability in Hospitalized Patients.
 * JAMA Neurology, 74(12), 1419–1424.
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';

export const helps2bConfig: ScoringCalculatorConfig = {
    inputType: 'checkbox',
    id: '2helps2b',
    title: '2HELPS2B Score',
    description:
        'Estimates seizure risk in acutely ill patients undergoing continuous EEG (cEEG), based on the 2HELPS2B score and seizure probability table.',

    // 提示訊息
    infoAlert:
        '<strong>📋 EEG Risk Factors</strong><br>Select all that apply from the continuous EEG (cEEG) findings:',

    // 評分區塊
    sections: [
        {
            title: 'EEG Findings',
            icon: '🧠',
            options: [
                { id: 'freq-gt-2hz', label: 'Frequency > 2Hz (+1)', value: 1 },
                {
                    id: 'sporadic-epileptiform',
                    label: 'Sporadic epileptiform discharges (+1)',
                    value: 1
                },
                { id: 'lpd-bipd-lrda', label: 'LPD / BIPD / LRDA (+1)', value: 1 },
                { id: 'plus-features', label: 'Plus features (+1)', value: 1 },
                { id: 'prior-seizure', label: 'Prior seizure (+1)', value: 1 },
                { id: 'birds', label: 'Brief ictal rhythmic discharges (BIRDs) (+2)', value: 2 }
            ]
        }
    ],

    // 風險等級對應表
    riskLevels: [
        { minScore: 0, maxScore: 0, risk: '< 5%', category: 'Very Low', severity: 'success' },
        { minScore: 1, maxScore: 1, risk: '12%', category: 'Low', severity: 'success' },
        { minScore: 2, maxScore: 2, risk: '27%', category: 'Moderate', severity: 'warning' },
        { minScore: 3, maxScore: 3, risk: '50%', category: 'Moderate-High', severity: 'warning' },
        { minScore: 4, maxScore: 4, risk: '73%', category: 'High', severity: 'danger' },
        { minScore: 5, maxScore: 5, risk: '88%', category: 'Very High', severity: 'danger' },
        {
            minScore: 6,
            maxScore: 999,
            risk: '> 95%',
            category: 'Extremely High',
            severity: 'danger'
        }
    ],

    // 公式說明 - 使用新的統一格式
    formulaSection: {
        show: true,
        title: 'Scoring Criteria',
        calculationNote: 'Select applicable EEG findings. Each finding adds to the total score:',
        scoringCriteria: [
            { criteria: 'Frequency > 2 Hz', points: '+1' },
            { criteria: 'Sporadic epileptiform discharges', points: '+1' },
            { criteria: 'LPD (Lateralized Periodic Discharges) / BIPD / LRDA', points: '+1' },
            {
                criteria: 'Plus features (superimposed fast activity or rhythmic delta)',
                points: '+1'
            },
            { criteria: 'Prior seizure (before cEEG monitoring)', points: '+1' },
            { criteria: 'BIRDs (Brief Ictal Rhythmic Discharges)', points: '+2' }
        ],
        interpretationTitle: 'Seizure Probability by Score',
        tableHeaders: ['Score', 'Seizure Risk', 'Risk Category'],
        interpretations: [
            { score: '0', category: '< 5%', interpretation: 'Very Low', severity: 'success' },
            { score: '1', category: '12%', interpretation: 'Low', severity: 'success' },
            { score: '2', category: '27%', interpretation: 'Moderate', severity: 'warning' },
            { score: '3', category: '50%', interpretation: 'Moderate-High', severity: 'warning' },
            { score: '4', category: '73%', interpretation: 'High', severity: 'danger' },
            { score: '5', category: '88%', interpretation: 'Very High', severity: 'danger' },
            { score: '≥6', category: '> 95%', interpretation: 'Extremely High', severity: 'danger' }
        ]
    },

    // 參考文獻
    references: [
        'Struck, A. F., et al. (2017). Association of an Electroencephalography-Based Risk Score With Seizure Probability in Hospitalized Patients. <em>JAMA Neurology</em>, 74(12), 1419–1424.'
    ]
};

export const helps2bScore = createScoringCalculator(helps2bConfig);
