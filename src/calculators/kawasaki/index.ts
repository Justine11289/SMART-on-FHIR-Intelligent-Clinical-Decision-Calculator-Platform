/**
 * Kawasaki Disease Diagnostic Criteria
 *
 * 使用 Radio Score Calculator 工廠函數
 * 根據臨床標準診斷川崎病
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

export const kawasakiConfig: ScoringCalculatorConfig = {
    id: 'kawasaki',
    title: 'Kawasaki Disease Diagnostic Criteria',
    description: 'Diagnoses Kawasaki Disease based on clinical criteria.',

    infoAlert:
        '<strong>Classic Kawasaki Disease:</strong> Fever for ≥5 days PLUS ≥4 of 5 principal clinical features.',

    sections: [
        {
            id: 'kawasaki-fever',
            title: 'Fever for ≥5 days',
            subtitle: 'Required for classic Kawasaki Disease diagnosis',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes' }
            ]
        },
        {
            id: 'kawasaki-extrem',
            title: 'Changes in extremities',
            subtitle:
                'Acute: Erythema of palms/soles, edema of hands/feet. Subacute: Periungual peeling.',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes' }
            ]
        },
        {
            id: 'kawasaki-exanthem',
            title: 'Polymorphous exanthem',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes' }
            ]
        },
        {
            id: 'kawasaki-conjunctival',
            title: 'Bilateral bulbar conjunctival injection',
            subtitle: 'Without exudate',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes' }
            ]
        },
        {
            id: 'kawasaki-oral',
            title: 'Changes in lips and oral cavity',
            subtitle: 'Erythema, lips cracking, strawberry tongue',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes' }
            ]
        },
        {
            id: 'kawasaki-lymph',
            title: 'Cervical lymphadenopathy',
            subtitle: '>1.5 cm diameter, usually unilateral',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes' }
            ]
        }
    ],

    riskLevels: [
        { minScore: 0, maxScore: 4, label: 'Criteria Not Met', severity: 'warning' },
        { minScore: 5, maxScore: 6, label: 'Kawasaki Disease', severity: 'danger' }
    ],

    formulaSection: {
        show: true,
        title: 'Diagnostic Criteria',
        calculationNote: 'Classic Kawasaki Disease requires:',
        scoringCriteria: [
            { criteria: 'Fever for ≥5 days (required)', points: 'Required' },
            { criteria: 'Principal Clinical Features', isHeader: true },
            { criteria: 'Changes in extremities', points: '+1' },
            { criteria: 'Polymorphous exanthem', points: '+1' },
            { criteria: 'Bilateral conjunctival injection', points: '+1' },
            { criteria: 'Changes in lips/oral cavity', points: '+1' },
            { criteria: 'Cervical lymphadenopathy', points: '+1' }
        ],
        interpretationTitle: 'Interpretation',
        tableHeaders: ['Criteria Met', 'Diagnosis'],
        interpretations: [
            {
                score: 'Fever + ≥4 features',
                interpretation: 'Classic Kawasaki Disease',
                severity: 'danger'
            },
            {
                score: 'Fever + 2-3 features',
                interpretation: 'Consider Incomplete Kawasaki Disease',
                severity: 'warning'
            },
            {
                score: 'No fever or <2 features',
                interpretation: 'Criteria not met',
                severity: 'info'
            }
        ],
        footnotes: [
            'Incomplete Kawasaki Disease should be considered in children with prolonged unexplained fever and fewer than 4 principal features.',
            'Echocardiography should be performed in all suspected cases.'
        ]
    },

    customResultRenderer: (score: number, sectionScores: Record<string, number>) => {
        const hasFever = (sectionScores['kawasaki-fever'] || 0) === 1;

        // Count principal features (all except fever)
        const featureCount =
            (sectionScores['kawasaki-extrem'] || 0) +
            (sectionScores['kawasaki-exanthem'] || 0) +
            (sectionScores['kawasaki-conjunctival'] || 0) +
            (sectionScores['kawasaki-oral'] || 0) +
            (sectionScores['kawasaki-lymph'] || 0);

        let interpretation = '';
        let alertType: 'info' | 'warning' | 'danger' = 'info';

        if (!hasFever) {
            interpretation =
                'Fever for ≥5 days is required for diagnosis of classic Kawasaki Disease.';
            alertType = 'warning';
        } else if (featureCount >= 4) {
            interpretation =
                '<strong>Positive for Kawasaki Disease</strong> (Fever + ≥4 principal features). Start IVIG treatment promptly.';
            alertType = 'danger';
        } else if (featureCount >= 2) {
            interpretation = `Fever + ${featureCount}/5 features. <strong>Consider Incomplete Kawasaki Disease</strong> if clinical suspicion is high. Obtain echocardiography.`;
            alertType = 'warning';
        } else {
            interpretation = `Criteria Not Met (Fever + ${featureCount}/5 features). Consider alternative diagnoses.`;
            alertType = 'info';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Fever Present',
                value: hasFever ? 'Yes' : 'No'
            })}
            ${uiBuilder.createResultItem({
                label: 'Principal Features Present',
                value: `${featureCount} / 5`
            })}
            ${uiBuilder.createAlert({
                type: alertType,
                message: interpretation
            })}
        `;
    }
};

export const kawasaki = createScoringCalculator(kawasakiConfig);
