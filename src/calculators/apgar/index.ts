/**
 * APGAR Score Calculator
 *
 * 使用 Radio Score Calculator 工廠函數遷移
 * Assesses neonates 1 and 5 minutes after birth.
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

export const apgarConfig: ScoringCalculatorConfig = {
    id: 'apgar',
    title: 'APGAR Score',
    description: 'Assesses neonates 1 and 5 minutes after birth.',
    infoAlert: 'Score is usually recorded at 1 and 5 minutes after birth.',
    sections: [
        {
            id: 'apgar-appearance',
            title: 'Appearance (Skin Color)',
            icon: '👶',
            options: [
                { value: '2', label: 'Normal color all over (hands and feet are pink)' },
                { value: '1', label: 'Normal color (but hands and feet are blue)', checked: true },
                { value: '0', label: 'Blue-gray or pale all over' }
            ]
        },
        {
            id: 'apgar-pulse',
            title: 'Pulse (Heart Rate)',
            icon: '💓',
            options: [
                { value: '2', label: '> 100 bpm', checked: true },
                { value: '1', label: '< 100 bpm' },
                { value: '0', label: 'Absent (no pulse)' }
            ]
        },
        {
            id: 'apgar-grimace',
            title: 'Grimace (Reflex Irritability)',
            icon: '😣',
            options: [
                {
                    value: '2',
                    label: 'Pulling away, sneezes, coughs, or cries with stimulation',
                    checked: true
                },
                { value: '1', label: 'Facial movement only (grimace) with stimulation' },
                { value: '0', label: 'Absent (no response to stimulation)' }
            ]
        },
        {
            id: 'apgar-activity',
            title: 'Activity (Muscle Tone)',
            icon: '💪',
            options: [
                { value: '2', label: 'Active, spontaneous movement', checked: true },
                { value: '1', label: 'Arms and legs flexed with little movement' },
                { value: '0', label: 'No movement, "floppy" tone' }
            ]
        },
        {
            id: 'apgar-respiration',
            title: 'Respiration (Breathing Rate & Effort)',
            icon: '🫁',
            options: [
                { value: '2', label: 'Normal rate and effort, good cry', checked: true },
                { value: '1', label: 'Slow or irregular breathing, weak cry' },
                { value: '0', label: 'Absent (no breathing)' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 7,
            maxScore: 10,
            label: 'Reassuring (Normal)',
            severity: 'success',
            description: 'Baby is in good condition. Continue routine care and monitoring.'
        },
        {
            minScore: 4,
            maxScore: 6,
            label: 'Moderately Abnormal',
            severity: 'warning',
            description:
                'May need some intervention. Consider stimulation, oxygen, or airway clearance.'
        },
        {
            minScore: 0,
            maxScore: 3,
            label: 'Low (Critical)',
            severity: 'danger',
            description: 'Immediate medical intervention required. Begin neonatal resuscitation.'
        }
    ],
    formulaSection: {
        show: true,
        interpretationTitle: 'Facts & Figures',
        tableHeaders: ['Score', 'Interpretation'],
        interpretations: [
            { score: '≥7', interpretation: 'Generally normal', severity: 'success' },
            { score: '4-6', interpretation: 'Fairly low', severity: 'warning' },
            {
                score: '≤3',
                interpretation: 'Critically low, needs intervention',
                severity: 'danger'
            }
        ]
    },
    customResultRenderer: (score, sectionScores) => {
        const riskLevels = [
            {
                minScore: 7,
                maxScore: 10,
                label: 'Reassuring (Normal)',
                severity: 'success' as const
            },
            {
                minScore: 4,
                maxScore: 6,
                label: 'Moderately Abnormal',
                severity: 'warning' as const
            },
            { minScore: 0, maxScore: 3, label: 'Low (Critical)', severity: 'danger' as const }
        ];

        const riskLevel =
            riskLevels.find(r => score >= r.minScore && score <= r.maxScore) || riskLevels[2];

        // Build component breakdown
        const components = [
            { key: 'apgar-appearance', name: 'A (Appearance)' },
            { key: 'apgar-pulse', name: 'P (Pulse)' },
            { key: 'apgar-grimace', name: 'G (Grimace)' },
            { key: 'apgar-activity', name: 'A (Activity)' },
            { key: 'apgar-respiration', name: 'R (Respiration)' }
        ];

        const breakdownHTML = components
            .map(c => `<span>${c.name}: ${sectionScores[c.key] ?? '-'}</span>`)
            .join('');

        let interpretation = '';
        if (score >= 7) {
            interpretation = 'Baby is in good condition. Continue routine care and monitoring.';
        } else if (score >= 4) {
            interpretation =
                'May need some intervention. Consider stimulation, oxygen, or airway clearance.';
        } else {
            interpretation =
                'Immediate medical intervention required. Begin neonatal resuscitation.';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total APGAR Score',
                value: score.toString(),
                unit: '/ 10 points',
                interpretation: riskLevel.label,
                alertClass: `ui-alert-${riskLevel.severity}`
            })}
            <div class="result-item mt-10 component-breakdown">
                ${breakdownHTML}
            </div>
            ${uiBuilder.createAlert({
                type: riskLevel.severity,
                message: `<strong>Recommendation:</strong> ${interpretation}`
            })}
        `;
    }
};

export const apgarScore = createScoringCalculator(apgarConfig);
