/**
 * 4 A's Test (4AT) for Delirium Screening Calculator
 *
 * 使用 Radio Score Calculator 工廠函數遷移
 * Diagnoses delirium in older patients.
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';

export const fourAsDeliriumConfig: ScoringCalculatorConfig = {
    id: '4as-delirium',
    title: "4 A's Test (4AT) for Delirium Screening",
    description:
        'Diagnoses delirium in older patients. A rapid assessment tool for detection of delirium and cognitive impairment.',
    sections: [
        {
            id: 'alertness',
            title: '1. Alertness',
            subtitle: 'May ask patient to state name and address to help with rating',
            options: [
                {
                    value: '0',
                    label: 'Normal (fully alert, but not agitated, throughout assessment) (0)',
                    checked: true
                },
                {
                    value: '0',
                    label: 'Mild sleepiness for <10 seconds after waking, then normal (0)'
                },
                { value: '4', label: 'Clearly abnormal (+4)' }
            ]
        },
        {
            id: 'amt4',
            title: '2. AMT4 (Abbreviated Mental Test)',
            subtitle: 'Age, date of birth, place (name of the hospital or building), current year',
            options: [
                { value: '0', label: 'No mistakes (0)', checked: true },
                { value: '1', label: '1 mistake (+1)' },
                { value: '2', label: '≥2 mistakes or untestable (+2)' }
            ]
        },
        {
            id: 'attention',
            title: '3. Attention',
            subtitle: 'Instruct patient to list months in reverse order, starting at December',
            options: [
                { value: '0', label: 'Lists ≥7 months correctly (0)', checked: true },
                { value: '1', label: 'Starts but lists <7 months, or refuses to start (+1)' },
                {
                    value: '2',
                    label: 'Untestable (cannot start because unwell, drowsy, inattentive) (+2)'
                }
            ]
        },
        {
            id: 'acute_change',
            title: '4. Acute Change or Fluctuating Course',
            subtitle:
                'Evidence of significant change or fluctuation in mental status within the last 2 weeks and still persisting in the last 24 hours',
            options: [
                { value: '0', label: 'No (0)', checked: true },
                { value: '4', label: 'Yes (+4)' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 0,
            label: 'Delirium Unlikely',
            severity: 'success',
            description:
                'Delirium or severe cognitive impairment unlikely. Note that delirium is still possible if "acute change or fluctuating course" is questionable.'
        },
        {
            minScore: 1,
            maxScore: 3,
            label: 'Possible Cognitive Impairment',
            severity: 'warning',
            description: 'Possible cognitive impairment. Further investigation is required.'
        },
        {
            minScore: 4,
            maxScore: 12,
            label: 'Likely Delirium',
            severity: 'danger',
            description:
                'Likely delirium ± underlying cognitive impairment. Formal assessment for delirium is recommended.'
        }
    ],
    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Addition of the selected points:',
        scoringCriteria: [
            { criteria: '1. Alertness', isHeader: true },
            { criteria: 'Normal (fully alert, not agitated)', points: '0' },
            { criteria: 'Mild sleepiness for <10 seconds after waking, then normal', points: '0' },
            { criteria: 'Clearly abnormal', points: '+4' },
            { criteria: '2. AMT4 (Abbreviated Mental Test)', isHeader: true },
            { criteria: 'No mistakes', points: '0' },
            { criteria: '1 mistake', points: '+1' },
            { criteria: '≥2 mistakes or untestable', points: '+2' },
            { criteria: '3. Attention*', isHeader: true },
            { criteria: 'Lists ≥7 months correctly', points: '0' },
            { criteria: 'Starts but lists <7 months, or refuses to start', points: '+1' },
            { criteria: 'Untestable (unwell, drowsy, inattentive)', points: '+2' },
            { criteria: '4. Acute Change or Fluctuating Course**', isHeader: true },
            { criteria: 'No', points: '0' },
            { criteria: 'Yes', points: '+4' }
        ],
        footnotes: [
            '*Instruct patient to list months in reverse order, starting at December.',
            '**Evidence of significant change or fluctuation in mental status within the last 2 weeks and still persisting in the last 24 hours.'
        ],
        interpretationTitle: 'FACTS & FIGURES',
        tableHeaders: ['4AT Score', 'Level of Impairment'],
        interpretations: [
            {
                score: '≥4',
                interpretation: 'Possible delirium and/or cognitive impairment',
                severity: 'danger'
            },
            { score: '1-3', interpretation: 'Possible cognitive impairment', severity: 'warning' },
            {
                score: '0',
                interpretation:
                    'Delirium or severe cognitive impairment unlikely (but delirium still possible if "acute change or fluctuating course" information is incomplete)',
                severity: 'success'
            }
        ]
    },
    references: [
        'Bellelli G, et al. Validation of the 4AT, a new instrument for rapid delirium screening: a study in 234 hospitalised older people. <em>Age and Ageing</em>. 2014;43(4):496-502.'
    ]
};

export const fourAsDelirium = createScoringCalculator(fourAsDeliriumConfig);
