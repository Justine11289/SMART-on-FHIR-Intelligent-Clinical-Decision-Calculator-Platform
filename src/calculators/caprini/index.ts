/**
 * Caprini Score for Venous Thromboembolism (2005)
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateAge } from '../../utils.js';
import { uiBuilder } from '../../ui-builder.js';
import { calculateCaprini } from './calculation.js';
import type { FormulaCalculatorConfig, InputConfig } from '../../types/calculator-formula.js';

const riskFactors = {
    '1 Point': [
        { id: 'minor-surgery', label: 'Minor surgery planned' },
        { id: 'major-surgery', label: 'Major open surgery (>45 min)' },
        { id: 'laparoscopy', label: 'Laparoscopic surgery (>45 min)' },
        { id: 'arthroscopy', label: 'Arthroscopic surgery' },
        { id: 'bmi', label: 'BMI > 25 kg/m²' },
        { id: 'swollen-legs', label: 'Swollen legs (current)' },
        { id: 'varicose', label: 'Varicose veins' },
        { id: 'sepsis', label: 'Sepsis (<1 month)' },
        {
            id: 'pneumonia',
            label: 'Serious lung disease incl. pneumonia (<1 month)'
        },
        { id: 'bed-rest', label: 'Confined to bed (>72 hours)' },
        { id: 'cast', label: 'Immobilizing plaster cast' },
        { id: 'central-venous', label: 'Central venous access' }
    ],
    '2 Points': [{ id: 'malignancy', label: 'Malignancy (present or previous)' }],
    '3 Points': [
        { id: 'history-vte', label: 'History of VTE' },
        { id: 'family-history-vte', label: 'Family history of VTE' },
        { id: 'thrombophilia', label: 'Thrombophilia (e.g., Factor V Leiden)' }
    ],
    '5 Points': [
        { id: 'stroke-paralysis', label: 'Stroke with paralysis (<1 month)' },
        {
            id: 'elective-hip-knee',
            label: 'Elective major lower extremity arthroplasty'
        },
        {
            id: 'hip-pelvis-fracture',
            label: 'Hip, pelvis, or leg fracture (<1 month)'
        },
        { id: 'spinal-cord-injury', label: 'Acute spinal cord injury (<1 month)' }
    ]
};

const sections = [
    {
        title: 'Age',
        icon: '📅',
        fields: [
            {
                type: 'radio',
                id: 'age',
                label: 'Patient Age',
                options: [
                    { value: '0', label: 'Age < 41', checked: true },
                    { value: '1', label: 'Age 41-60 (+1)' },
                    { value: '2', label: 'Age 61-74 (+2)' },
                    { value: '3', label: 'Age ≥ 75 (+3)' }
                ]
            }
        ] as InputConfig[]
    }
];

// Helper to generate input configs for risk factors
const generateRiskInputs = (
    factors: { id: string; label: string }[],
    points: number
): InputConfig[] => {
    return factors.map(f => ({
        type: 'radio',
        id: f.id,
        label: f.label,
        options: [
            { value: '0', label: 'No', checked: true },
            { value: String(points), label: `Yes (+${points})` }
        ]
    }));
};

for (const [group, factors] of Object.entries(riskFactors)) {
    const points = parseInt(group.split(' ')[0]);
    sections.push({
        title: `${group} Risk Factors`,
        icon: '⚠️',
        fields: generateRiskInputs(factors, points)
    });
}

const config: FormulaCalculatorConfig = {
    id: 'caprini',
    title: 'Caprini Score for Venous Thromboembolism (2005)',
    description: 'Stratifies VTE risk in surgical patients, guiding prophylaxis decisions.',
    sections: sections,

    formulaSection: {
        show: true,
        title: 'Facts & Figures',
        calculationNote: 'Score interpretation:',
        tableHeaders: [
            'Caprini Score',
            'Risk category',
            'Risk percent*',
            'Recommended prophylaxis**',
            'Duration'
        ],
        rows: [
            [
                '0',
                'Lowest',
                'Minimal',
                'Early frequent ambulation only, OR at discretion',
                'During hospitalization'
            ],
            [
                '1–2',
                'Low',
                'Minimal',
                'Pneumatic compression devices ± stockings',
                'During hospitalization'
            ],
            [
                '3–4',
                'Moderate',
                '0.7%',
                'Pneumatic compression ± stockings',
                'During hospitalization'
            ],
            ['5–6', 'High', '1.8%', 'Pneumatic compression AND Heparin/LMWH', '7–10 days total'],
            ['7–8', 'High', '4.0%', 'Pneumatic compression AND Heparin/LMWH', '7–10 days total'],
            ['≥9', 'Highest', '10.7%', 'Pneumatic compression AND Heparin/LMWH', '30 days total']
        ],
        footnotes: [
            '*Percent represents VTE risk without prophylaxis. From Bahl 2010.',
            '**Adapted from Gould 2012.'
        ]
    },

    calculate: calculateCaprini,

    customResultRenderer: results => {
        let html = '';
        results.forEach(item => {
            if (item.label === 'Recommendation' && item.alertPayload) {
                html += uiBuilder.createAlert(item.alertPayload);
            } else {
                html += uiBuilder.createResultItem({
                    label: item.label,
                    value: item.value as string,
                    unit: item.unit,
                    interpretation: item.interpretation,
                    alertClass: item.alertClass ? `ui-alert-${item.alertClass}` : ''
                });
            }
        });
        return html;
    },

    customInitialize: async (client, patient, container, calculate) => {
        const setValue = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement;
            if (input) {
                // Not standard input, radio group
            }
            const radio = container.querySelector(
                `input[name="${id}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        if (patient && (patient as any).birthDate) {
            const age = calculateAge((patient as any).birthDate);
            let ageScore = '0';
            if (age >= 75) {
                ageScore = '3';
            } else if (age >= 61) {
                ageScore = '2';
            } else if (age >= 41) {
                ageScore = '1';
            }
            setValue('age', ageScore);
        }

        // No async data fetching in original, but good to trigger calculate
        calculate();
    }
};

export const caprini = createUnifiedFormulaCalculator(config);
