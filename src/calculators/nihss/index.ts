/**
 * NIH Stroke Scale/Score (NIHSS) Calculator
 *
 * 使用 Radio Score Calculator 工廠函數遷移
 * Quantifies stroke severity and monitors for neurological changes over time.
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

const config: ScoringCalculatorConfig = {
    id: 'nihss',
    title: 'NIH Stroke Scale/Score (NIHSS)',
    description: 'Quantifies stroke severity and monitors for neurological changes over time.',
    infoAlert:
        '<strong>Clinical Use:</strong> Perform assessments within 24 hours of symptom onset and repeat serially to monitor progression or recovery.',
    sections: [
        {
            id: 'nihss-1a',
            title: '1a. Level of Consciousness',
            options: [
                { value: '0', label: '0 - Alert', checked: true },
                { value: '1', label: '1 - Not alert, but arousable by minor stimulation' },
                { value: '2', label: '2 - Not alert, requires repeated stimulation to attend' },
                { value: '3', label: '3 - Unresponsive, or reflex motor responses only' }
            ]
        },
        {
            id: 'nihss-1b',
            title: '1b. LOC Questions (Month, Age)',
            options: [
                { value: '0', label: '0 - Answers both correctly', checked: true },
                { value: '1', label: '1 - Answers one correctly' },
                { value: '2', label: '2 - Answers neither correctly' }
            ]
        },
        {
            id: 'nihss-1c',
            title: '1c. LOC Commands (Open/close eyes, grip/release hand)',
            options: [
                { value: '0', label: '0 - Performs both correctly', checked: true },
                { value: '1', label: '1 - Performs one correctly' },
                { value: '2', label: '2 - Performs neither correctly' }
            ]
        },
        {
            id: 'nihss-2',
            title: '2. Best Gaze',
            options: [
                { value: '0', label: '0 - Normal', checked: true },
                { value: '1', label: '1 - Partial gaze palsy' },
                { value: '2', label: '2 - Forced deviation' }
            ]
        },
        {
            id: 'nihss-3',
            title: '3. Visual Fields',
            options: [
                { value: '0', label: '0 - No visual loss', checked: true },
                { value: '1', label: '1 - Partial hemianopia' },
                { value: '2', label: '2 - Complete hemianopia' },
                { value: '3', label: '3 - Bilateral hemianopia' }
            ]
        },
        {
            id: 'nihss-4',
            title: '4. Facial Palsy',
            options: [
                { value: '0', label: '0 - Normal', checked: true },
                { value: '1', label: '1 - Minor paralysis' },
                { value: '2', label: '2 - Partial paralysis' },
                { value: '3', label: '3 - Complete paralysis of one or both sides' }
            ]
        },
        {
            id: 'nihss-5a',
            title: '5a. Motor Arm - Left',
            options: [
                { value: '0', label: '0 - No drift', checked: true },
                { value: '1', label: '1 - Drift' },
                { value: '2', label: '2 - Some effort against gravity' },
                { value: '3', label: '3 - No effort against gravity, but moves' },
                { value: '4', label: '4 - No movement' }
            ]
        },
        {
            id: 'nihss-5b',
            title: '5b. Motor Arm - Right',
            options: [
                { value: '0', label: '0 - No drift', checked: true },
                { value: '1', label: '1 - Drift' },
                { value: '2', label: '2 - Some effort against gravity' },
                { value: '3', label: '3 - No effort against gravity, but moves' },
                { value: '4', label: '4 - No movement' }
            ]
        },
        {
            id: 'nihss-6a',
            title: '6a. Motor Leg - Left',
            options: [
                { value: '0', label: '0 - No drift', checked: true },
                { value: '1', label: '1 - Drift' },
                { value: '2', label: '2 - Some effort against gravity' },
                { value: '3', label: '3 - No effort against gravity, but moves' },
                { value: '4', label: '4 - No movement' }
            ]
        },
        {
            id: 'nihss-6b',
            title: '6b. Motor Leg - Right',
            options: [
                { value: '0', label: '0 - No drift', checked: true },
                { value: '1', label: '1 - Drift' },
                { value: '2', label: '2 - Some effort against gravity' },
                { value: '3', label: '3 - No effort against gravity, but moves' },
                { value: '4', label: '4 - No movement' }
            ]
        },
        {
            id: 'nihss-7',
            title: '7. Limb Ataxia',
            options: [
                { value: '0', label: '0 - Absent', checked: true },
                { value: '1', label: '1 - Present in one limb' },
                { value: '2', label: '2 - Present in two or more limbs' }
            ]
        },
        {
            id: 'nihss-8',
            title: '8. Sensory',
            options: [
                { value: '0', label: '0 - Normal', checked: true },
                { value: '1', label: '1 - Mild-to-moderate loss' },
                { value: '2', label: '2 - Severe-to-total loss' }
            ]
        },
        {
            id: 'nihss-9',
            title: '9. Best Language',
            options: [
                { value: '0', label: '0 - No aphasia', checked: true },
                { value: '1', label: '1 - Mild-to-moderate aphasia' },
                { value: '2', label: '2 - Severe aphasia' },
                { value: '3', label: '3 - Mute, global aphasia' }
            ]
        },
        {
            id: 'nihss-10',
            title: '10. Dysarthria',
            options: [
                { value: '0', label: '0 - Normal articulation', checked: true },
                { value: '1', label: '1 - Mild-to-moderate dysarthria' },
                { value: '2', label: '2 - Severe dysarthria (unintelligible)' }
            ]
        },
        {
            id: 'nihss-11',
            title: '11. Extinction and Inattention (Neglect)',
            options: [
                { value: '0', label: '0 - No neglect', checked: true },
                { value: '1', label: '1 - Partial neglect' },
                { value: '2', label: '2 - Complete neglect' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 0,
            label: 'No Stroke',
            severity: 'success',
            description: 'No stroke symptoms detected.'
        },
        {
            minScore: 1,
            maxScore: 4,
            label: 'Minor Stroke',
            severity: 'info',
            description: 'Minor stroke. Consider outpatient management with close follow-up.'
        },
        {
            minScore: 5,
            maxScore: 15,
            label: 'Moderate Stroke',
            severity: 'warning',
            description: 'Moderate stroke. Requires inpatient monitoring and treatment.'
        },
        {
            minScore: 16,
            maxScore: 20,
            label: 'Moderate-to-Severe Stroke',
            severity: 'danger',
            description:
                'Moderate-to-severe stroke. Intensive monitoring and intervention required.'
        },
        {
            minScore: 21,
            maxScore: 999,
            label: 'Severe Stroke',
            severity: 'danger',
            description: 'Severe stroke. Critical care and aggressive intervention needed.'
        }
    ],
    references: [
        'Brott T, Adams HP Jr, Olinger CP, et al. Measurements of acute cerebral infarction: a clinical examination scale. <em>Stroke</em>. 1989;20(7):864-870.'
    ],
    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        let severity = '';
        let alertClass: 'success' | 'info' | 'warning' | 'danger' = 'success';
        let interpretation = '';

        if (score === 0) {
            severity = 'No Stroke';
            alertClass = 'success';
            interpretation = 'No stroke symptoms detected.';
        } else if (score <= 4) {
            severity = 'Minor Stroke';
            alertClass = 'info';
            interpretation = 'Minor stroke. Consider outpatient management with close follow-up.';
        } else if (score <= 15) {
            severity = 'Moderate Stroke';
            alertClass = 'warning';
            interpretation = 'Moderate stroke. Requires inpatient monitoring and treatment.';
        } else if (score <= 20) {
            severity = 'Moderate-to-Severe Stroke';
            alertClass = 'danger';
            interpretation =
                'Moderate-to-severe stroke. Intensive monitoring and intervention required.';
        } else {
            severity = 'Severe Stroke';
            alertClass = 'danger';
            interpretation = 'Severe stroke. Critical care and aggressive intervention needed.';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Score',
                value: score.toString(),
                unit: '/ 42 points',
                interpretation: severity,
                alertClass: `ui-alert-${alertClass}`
            })}
            
            ${uiBuilder.createAlert({
                type: alertClass,
                message: interpretation
            })}
        `;
    }
};

export const nihss = createScoringCalculator(config);
