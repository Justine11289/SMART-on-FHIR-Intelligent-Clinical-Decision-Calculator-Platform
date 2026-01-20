/**
 * Duke Activity Status Index (DASI) Calculator
 *
 * 使用 Score Calculator 工廠函數
 * 功能容量評估計算器，不需要 FHIR 自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

export const dasiConfig: ScoringCalculatorConfig = {
    inputType: 'checkbox',
    id: 'dasi',
    title: 'Duke Activity Status Index (DASI)',
    description: 'Estimates functional capacity based on ability to perform daily activities.',
    infoAlert: 'Please check all activities you are <strong>able to perform</strong>:',
    sections: [
        {
            title: 'Activity Assessment',
            icon: '🏃',
            options: [
                {
                    id: 'dasi-care',
                    label: 'Can you take care of yourself (eating, dressing, bathing, using toilet)?',
                    value: 2.75
                },
                {
                    id: 'dasi-walk-indoors',
                    label: 'Can you walk indoors, such as around your house?',
                    value: 1.75
                },
                {
                    id: 'dasi-walk-flat',
                    label: 'Can you walk a block or two on level ground?',
                    value: 2.75
                },
                {
                    id: 'dasi-climb-stairs',
                    label: 'Can you climb a flight of stairs or walk up a hill?',
                    value: 5.5
                },
                { id: 'dasi-run', label: 'Can you run a short distance?', value: 8.0 },
                {
                    id: 'dasi-light-housework',
                    label: 'Can you do light work around the house (dusting, washing dishes)?',
                    value: 2.7
                },
                {
                    id: 'dasi-moderate-housework',
                    label: 'Can you do moderate work (vacuuming, sweeping, carrying groceries)?',
                    value: 3.5
                },
                {
                    id: 'dasi-heavy-housework',
                    label: 'Can you do heavy work (scrubbing floors, lifting/moving heavy furniture)?',
                    value: 8.0
                },
                {
                    id: 'dasi-yardwork',
                    label: 'Can you do yardwork (raking leaves, weeding, pushing mower)?',
                    value: 4.5
                },
                { id: 'dasi-sex', label: 'Can you have sexual relations?', value: 5.25 },
                {
                    id: 'dasi-recreation-mild',
                    label: 'Can you participate in mild recreational activities (bowling, dancing)?',
                    value: 6.0
                },
                {
                    id: 'dasi-recreation-strenuous',
                    label: 'Can you participate in strenuous sports (swimming, tennis, basketball)?',
                    value: 7.5
                }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 9.7,
            risk: 'Poor',
            category: 'Poor',
            severity: 'danger',
            recommendation: '< 4 METs: Poor functional capacity'
        },
        {
            minScore: 9.8,
            maxScore: 28.2,
            risk: 'Moderate',
            category: 'Moderate',
            severity: 'warning',
            recommendation: '4-7 METs: Moderate functional capacity'
        },
        {
            minScore: 28.3,
            maxScore: 58.2,
            risk: 'Good',
            category: 'Good',
            severity: 'success',
            recommendation: '> 7 METs: Good functional capacity'
        }
    ],
    formulaSection: {
        show: true,
        title: 'Formula & Interpretation',
        calculationNote: 'Sum of points for all activities you can perform.',
        footnotes: [
            '<strong>VO₂peak</strong> = (0.43 × DASI) + 9.6 mL/kg/min',
            '<strong>METs</strong> = VO₂peak / 3.5'
        ],
        interpretationTitle: 'Functional Capacity Categories',
        tableHeaders: ['METs', 'DASI Score', 'Functional Capacity'],
        interpretations: [
            { score: '< 4', category: '< 9.7', interpretation: 'Poor', severity: 'danger' },
            { score: '4-7', category: '9.7-28.2', interpretation: 'Moderate', severity: 'warning' },
            { score: '> 7', category: '> 28.2', interpretation: 'Good', severity: 'success' }
        ]
    },
    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        const vo2peak = 0.43 * score + 9.6;
        const mets = vo2peak / 3.5;

        let interpretation = '';
        let alertClass: 'success' | 'warning' | 'danger' = 'success';

        if (mets < 4) {
            interpretation = 'Poor functional capacity';
            alertClass = 'danger';
        } else if (mets < 7) {
            interpretation = 'Moderate functional capacity';
            alertClass = 'warning';
        } else {
            interpretation = 'Good functional capacity';
            alertClass = 'success';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'DASI Score',
                value: score.toFixed(2),
                unit: '/ 58.2 points'
            })}
            ${uiBuilder.createResultItem({
                label: 'Estimated VO₂ peak',
                value: vo2peak.toFixed(1),
                unit: 'mL/kg/min'
            })}
            ${uiBuilder.createResultItem({
                label: 'Estimated Peak METs',
                value: mets.toFixed(1),
                unit: '',
                interpretation: interpretation,
                alertClass: `ui-alert-${alertClass}`
            })}
        `;
    }
};

export const dasi = createScoringCalculator(dasiConfig);
