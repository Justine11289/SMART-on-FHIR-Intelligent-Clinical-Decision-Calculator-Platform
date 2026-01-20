/**
 * CIWA-Ar for Alcohol Withdrawal Calculator
 *
 * 使用 Radio Score Calculator 工廠函數遷移
 * The CIWA-Ar objectifies severity of alcohol withdrawal.
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

export const ciwaArConfig: ScoringCalculatorConfig = {
    id: 'ciwa-ar',
    title: 'CIWA-Ar for Alcohol Withdrawal',
    description: 'The CIWA-Ar objectifies severity of alcohol withdrawal.',
    sections: [
        {
            id: 'nausea',
            title: 'Nausea/vomiting',
            subtitle: "Ask 'Do you feel sick to your stomach? Have you vomited?'",
            options: [
                { value: '0', label: 'No nausea and no vomiting (0)', checked: true },
                { value: '1', label: 'Mild nausea and no vomiting (1)' },
                { value: '2', label: '(More severe symptoms) (2)' },
                { value: '3', label: '(More severe symptoms) (3)' },
                { value: '4', label: 'Intermittent nausea with dry heaves (4)' },
                { value: '5', label: '(More severe symptoms) (5)' },
                { value: '6', label: '(More severe symptoms) (6)' },
                { value: '7', label: 'Constant nausea, frequent dry heaves and vomiting (7)' }
            ]
        },
        {
            id: 'tremor',
            title: 'Tremor',
            subtitle: 'Arms extended and fingers spread apart',
            options: [
                { value: '0', label: 'No tremor (0)', checked: true },
                { value: '1', label: 'Not visible, but can be felt fingertip to fingertip (1)' },
                { value: '2', label: '(More severe symptoms) (2)' },
                { value: '3', label: '(More severe symptoms) (3)' },
                { value: '4', label: "Moderate, with patient's arms extended (4)" },
                { value: '5', label: '(More severe symptoms) (5)' },
                { value: '6', label: '(More severe symptoms) (6)' },
                { value: '7', label: 'Severe, even with arms not extended (7)' }
            ]
        },
        {
            id: 'sweats',
            title: 'Paroxysmal Sweats',
            subtitle: 'Observation',
            options: [
                { value: '0', label: 'No sweat visible (0)', checked: true },
                { value: '1', label: 'Barely perceptible sweating, palms moist (1)' },
                { value: '2', label: '(More severe symptoms) (2)' },
                { value: '3', label: '(More severe symptoms) (3)' },
                { value: '4', label: 'Beads of sweat obvious on forehead (4)' },
                { value: '5', label: '(More severe symptoms) (5)' },
                { value: '6', label: '(More severe symptoms) (6)' },
                { value: '7', label: 'Drenching sweats (7)' }
            ]
        },
        {
            id: 'anxiety',
            title: 'Anxiety',
            subtitle: 'Ask "Do you feel nervous?"',
            options: [
                { value: '0', label: 'No anxiety, at ease (0)', checked: true },
                { value: '1', label: 'Mildly anxious (1)' },
                { value: '2', label: '(More severe symptoms) (2)' },
                { value: '3', label: '(More severe symptoms) (3)' },
                { value: '4', label: 'Moderately anxious, or guarded (4)' },
                { value: '5', label: '(More severe symptoms) (5)' },
                { value: '6', label: '(More severe symptoms) (6)' },
                { value: '7', label: 'Equivalent to acute panic states (7)' }
            ]
        },
        {
            id: 'agitation',
            title: 'Agitation',
            subtitle: 'Observation',
            options: [
                { value: '0', label: 'Normal activity (0)', checked: true },
                { value: '1', label: 'Somewhat more than normal activity (1)' },
                { value: '2', label: '(More severe symptoms) (2)' },
                { value: '3', label: '(More severe symptoms) (3)' },
                { value: '4', label: 'Moderately fidgety and restless (4)' },
                { value: '5', label: '(More severe symptoms) (5)' },
                { value: '6', label: '(More severe symptoms) (6)' },
                { value: '7', label: 'Paces back and forth, or constantly thrashes about (7)' }
            ]
        },
        {
            id: 'tactile',
            title: 'Tactile Disturbances',
            subtitle:
                'Ask "Have you any itching, pins and needles sensations, any burning, any numbness, or do you feel bugs crawling on or under your skin?"',
            options: [
                { value: '0', label: 'None (0)', checked: true },
                {
                    value: '1',
                    label: 'Very mild itching, pins and needles, burning or numbness (1)'
                },
                { value: '2', label: 'Mild itching, pins and needles, burning or numbness (2)' },
                {
                    value: '3',
                    label: 'Moderate itching, pins and needles, burning or numbness (3)'
                },
                { value: '4', label: 'Moderately severe hallucinations (4)' },
                { value: '5', label: 'Severe hallucinations (5)' },
                { value: '6', label: 'Extremely severe hallucinations (6)' },
                { value: '7', label: 'Continuous hallucinations (7)' }
            ]
        },
        {
            id: 'auditory',
            title: 'Auditory Disturbances',
            subtitle:
                'Ask "Are you more aware of sounds around you? Are they harsh? Do they frighten you? Are you hearing anything that is disturbing to you?"',
            options: [
                { value: '0', label: 'Not present (0)', checked: true },
                { value: '1', label: 'Very mild harshness or ability to frighten (1)' },
                { value: '2', label: 'Mild harshness or ability to frighten (2)' },
                { value: '3', label: 'Moderate harshness or ability to frighten (3)' },
                { value: '4', label: 'Moderately severe hallucinations (4)' },
                { value: '5', label: 'Severe hallucinations (5)' },
                { value: '6', label: 'Extremely severe hallucinations (6)' },
                { value: '7', label: 'Continuous hallucinations (7)' }
            ]
        },
        {
            id: 'visual',
            title: 'Visual Disturbances',
            subtitle:
                'Ask "Does the light appear to be too bright? Is its color different? Does it hurt your eyes? Are you seeing things you know are not there?"',
            options: [
                { value: '0', label: 'Not present (0)', checked: true },
                { value: '1', label: 'Very mild sensitivity (1)' },
                { value: '2', label: 'Mild sensitivity (2)' },
                { value: '3', label: 'Moderate sensitivity (3)' },
                { value: '4', label: 'Moderately severe hallucinations (4)' },
                { value: '5', label: 'Severe hallucinations (5)' },
                { value: '6', label: 'Extremely severe hallucinations (6)' },
                { value: '7', label: 'Continuous hallucinations (7)' }
            ]
        },
        {
            id: 'headache',
            title: 'Headache, Fullness in Head',
            subtitle:
                'Ask "Does your head feel different? Does it feel like there is a band around your head?" Do not rate dizziness or lightheadedness.',
            options: [
                { value: '0', label: 'Not present (0)', checked: true },
                { value: '1', label: 'Very mild (1)' },
                { value: '2', label: 'Mild (2)' },
                { value: '3', label: 'Moderate (3)' },
                { value: '4', label: 'Moderately severe (4)' },
                { value: '5', label: 'Severe (5)' },
                { value: '6', label: 'Very severe (6)' },
                { value: '7', label: 'Extremely severe (7)' }
            ]
        },
        {
            id: 'orientation',
            title: 'Orientation & Clouding of Sensorium',
            subtitle: 'Ask "What day is this? Where are you? Who am I?"',
            options: [
                { value: '0', label: 'Oriented and can do serial additions (0)', checked: true },
                { value: '1', label: 'Cannot do serial additions or is uncertain about date (1)' },
                { value: '2', label: 'Disoriented for date by no more than 2 calendar days (2)' },
                { value: '3', label: 'Disoriented for date by more than 2 calendar days (3)' },
                { value: '4', label: 'Disoriented for place and/or person (4)' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 8,
            label: 'Absent or minimal withdrawal',
            severity: 'success',
            description: 'Supportive care. Medication may not be necessary.'
        },
        {
            minScore: 9,
            maxScore: 19,
            label: 'Mild to moderate withdrawal',
            severity: 'warning',
            description: 'Medication is usually indicated.'
        },
        {
            minScore: 20,
            maxScore: 999,
            label: 'Severe withdrawal',
            severity: 'danger',
            description:
                'Medication is indicated. Consider ICU admission if score is very high or patient is unstable.'
        }
    ],

    formulaSection: {
        show: true,
        interpretationTitle: 'Facts & Figures',
        tableHeaders: ['Score', 'Withdrawal Level'],
        interpretations: [
            { score: '≤8', interpretation: 'Absent or minimal withdrawal', severity: 'success' },
            { score: '9-19', interpretation: 'Mild to moderate withdrawal', severity: 'warning' },
            { score: '≥20', interpretation: 'Severe withdrawal', severity: 'danger' }
        ]
    },
    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        let severity = '';
        let recommendation = '';
        let alertClass: 'success' | 'warning' | 'danger' = 'success';

        if (score <= 8) {
            severity = 'Absent or minimal withdrawal';
            recommendation = 'Supportive care. Medication may not be necessary.';
            alertClass = 'success';
        } else if (score <= 19) {
            severity = 'Mild to moderate withdrawal';
            recommendation = 'Medication is usually indicated.';
            alertClass = 'warning';
        } else {
            severity = 'Severe withdrawal';
            recommendation =
                'Medication is indicated. Consider ICU admission if score is very high or patient is unstable.';
            alertClass = 'danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'CIWA-Ar Score',
                value: score.toString(),
                unit: 'points',
                interpretation: severity,
                alertClass: `ui-alert-${alertClass}`
            })}
            
            ${uiBuilder.createAlert({
                type: alertClass,
                message: `<strong>Recommendation:</strong> ${recommendation}`
            })}
        `;
    }
};

export const ciwaAr = createScoringCalculator(ciwaArConfig);
