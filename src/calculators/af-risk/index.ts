/**
 * AF Stroke/Bleed Risk (CHA₂DS₂-VASc & HAS-BLED)
 *
 * 使用 Radio Score Calculator 工廠函數
 * 心房顫動患者中風和出血風險綜合評估
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';

export const afRiskConfig: ScoringCalculatorConfig = {
    id: 'af-risk',
    title: 'AF Stroke/Bleed Risk (CHA₂DS₂-VASc & HAS-BLED)',
    description: 'Combined assessment of stroke and bleeding risk in atrial fibrillation patients.',

    sections: [
        // CHA₂DS₂-VASc Factors
        {
            id: 'chf',
            title: '💓 CHA₂DS₂-VASc Score (Stroke Risk)',
            subtitle: 'Congestive Heart Failure (+1)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'htn',
            title: 'Hypertension (+1)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'age75',
            title: 'Age ≥ 75 years (+2)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '2', label: 'Yes (+2)' }
            ]
        },
        {
            id: 'dm',
            title: 'Diabetes Mellitus (+1)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'stroke',
            title: 'Stroke / TIA / Thromboembolism (+2)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '2', label: 'Yes (+2)' }
            ]
        },
        {
            id: 'vasc',
            title: 'Vascular Disease (+1)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'age65',
            title: 'Age 65-74 years (+1)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'female',
            title: 'Female Gender (+1)',
            options: [
                { value: '0', label: 'No (Male)', checked: true },
                { value: '1', label: 'Yes (Female) (+1)' }
            ]
        },
        // HAS-BLED Factors
        {
            id: 'hasbled-htn',
            title: '🩸 HAS-BLED Score (Bleeding Risk)',
            subtitle: 'Hypertension (uncontrolled, SBP > 160)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-renal',
            title: 'Abnormal renal function',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-liver',
            title: 'Abnormal liver function',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-stroke',
            title: 'Stroke',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-bleed',
            title: 'Bleeding history or predisposition',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-inr',
            title: 'Labile INRs',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-elderly',
            title: 'Elderly (age > 65 years)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-drugs',
            title: 'Concomitant drugs (e.g., NSAIDs, antiplatelets)',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        },
        {
            id: 'hasbled-alcohol',
            title: 'Alcohol abuse',
            options: [
                { value: '0', label: 'No', checked: true },
                { value: '1', label: 'Yes (+1)' }
            ]
        }
    ],

    riskLevels: [
        { minScore: 0, maxScore: 2, label: 'Low Combined Risk', severity: 'success' },
        { minScore: 3, maxScore: 5, label: 'Moderate Combined Risk', severity: 'warning' },
        { minScore: 6, maxScore: 999, label: 'High Combined Risk', severity: 'danger' }
    ],

    formulaSection: {
        show: true,
        title: 'Scoring Systems',
        calculationNote: 'Two separate scoring systems are calculated:',
        scoringCriteria: [
            { criteria: 'CHA₂DS₂-VASc (Stroke Risk)', isHeader: true },
            { criteria: 'C - Congestive Heart Failure', points: '+1' },
            { criteria: 'H - Hypertension', points: '+1' },
            { criteria: 'A₂ - Age ≥75 years', points: '+2' },
            { criteria: 'D - Diabetes Mellitus', points: '+1' },
            { criteria: 'S₂ - Stroke/TIA/TE', points: '+2' },
            { criteria: 'V - Vascular Disease', points: '+1' },
            { criteria: 'A - Age 65-74 years', points: '+1' },
            { criteria: 'Sc - Sex category (Female)', points: '+1' },
            { criteria: 'HAS-BLED (Bleeding Risk)', isHeader: true },
            { criteria: 'H - Hypertension (uncontrolled)', points: '+1' },
            { criteria: 'A - Abnormal renal/liver function', points: '+1-2' },
            { criteria: 'S - Stroke', points: '+1' },
            { criteria: 'B - Bleeding', points: '+1' },
            { criteria: 'L - Labile INRs', points: '+1' },
            { criteria: 'E - Elderly (>65)', points: '+1' },
            { criteria: 'D - Drugs or Alcohol', points: '+1-2' }
        ],
        interpretationTitle: 'Treatment Recommendations',
        tableHeaders: ['Score', 'Recommendation'],
        interpretations: [
            {
                score: 'CHA₂DS₂-VASc 0 (male) / 1 (female)',
                interpretation: 'Antithrombotic therapy may be omitted',
                severity: 'success'
            },
            {
                score: 'CHA₂DS₂-VASc 1 (male) / 2 (female)',
                interpretation: 'Oral anticoagulation should be considered',
                severity: 'warning'
            },
            {
                score: 'CHA₂DS₂-VASc ≥2 (male) / ≥3 (female)',
                interpretation: 'Oral anticoagulation is recommended',
                severity: 'warning'
            },
            {
                score: 'HAS-BLED ≥3',
                interpretation: 'High bleeding risk - use caution with anticoagulants',
                severity: 'danger'
            }
        ]
    },

    customResultRenderer: (score: number, sectionScores: Record<string, number>) => {
        // Calculate CHA₂DS₂-VASc Score
        const cha2Ids = ['chf', 'htn', 'age75', 'dm', 'stroke', 'vasc', 'age65', 'female'];
        let cha2ds2vasc_score = 0;
        cha2Ids.forEach(id => {
            cha2ds2vasc_score += sectionScores[id] || 0;
        });

        // Age double-counting correction
        const age75Yes = (sectionScores['age75'] || 0) > 0;
        const age65Yes = (sectionScores['age65'] || 0) > 0;
        if (age75Yes && age65Yes) {
            cha2ds2vasc_score -= 1;
        }

        // Calculate HAS-BLED Score
        const hasBledIds = [
            'hasbled-htn',
            'hasbled-renal',
            'hasbled-liver',
            'hasbled-stroke',
            'hasbled-bleed',
            'hasbled-inr',
            'hasbled-elderly',
            'hasbled-drugs',
            'hasbled-alcohol'
        ];
        let hasbled_score = 0;
        hasBledIds.forEach(id => {
            hasbled_score += sectionScores[id] || 0;
        });

        // Check if female
        const isFemale = (sectionScores['female'] || 0) === 1;

        // Adjust threshold for OAC recommendation
        // Men score >=2, Women score >=3 → OAC recommended (female already has +1 from gender)
        const strokeRiskScoreForOAC = isFemale ? cha2ds2vasc_score - 1 : cha2ds2vasc_score;

        let recommendation = '';
        let alertClass = 'success';

        if (strokeRiskScoreForOAC >= 2) {
            recommendation = 'Oral anticoagulation is recommended.';
            alertClass = 'warning';
        } else if (strokeRiskScoreForOAC === 1) {
            recommendation = 'Oral anticoagulation should be considered.';
            alertClass = 'warning';
        } else {
            recommendation = 'Antithrombotic therapy may be omitted.';
            alertClass = 'success';
        }

        let bleedNote = '';
        if (hasbled_score >= 3) {
            bleedNote = uiBuilder.createAlert({
                type: 'danger',
                message:
                    '<strong>⚠️ High Bleeding Risk:</strong> HAS-BLED score is ≥3. Use anticoagulants with caution, address modifiable bleeding risk factors, and schedule regular follow-up.'
            });
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'CHA₂DS₂-VASc Score (Stroke Risk)',
                value: cha2ds2vasc_score.toString(),
                unit: '/ 9 points'
            })}
            ${uiBuilder.createResultItem({
                label: 'HAS-BLED Score (Bleeding Risk)',
                value: hasbled_score.toString(),
                unit: '/ 9 points'
            })}
            
            ${uiBuilder.createAlert({
                type: alertClass as 'success' | 'warning' | 'danger' | 'info',
                message: `<strong>Recommendation:</strong> ${recommendation}`
            })}
            ${bleedNote}
        `;
    },

    customInitialize: async (client, patient, container, calculate) => {
        fhirDataService.initialize(client, patient, container);

        const setRadioValue = (name: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // Pre-fill based on patient age
        const age = fhirDataService.getPatientAge() || 0;

        if (age >= 75) {
            setRadioValue('age75', '2');
        } else if (age >= 65) {
            setRadioValue('age65', '1');
        }

        if (age > 65) {
            setRadioValue('hasbled-elderly', '1');
        }

        // Pre-fill based on patient gender
        const gender = fhirDataService.getPatientGender();
        if (gender === 'female') {
            setRadioValue('female', '1');
        }

        if (!client) return;

        try {
            // Check blood pressure for hypertension
            const bpResult = await fhirDataService.getBloodPressure({ trackStaleness: true });
            if (bpResult.systolic !== null && bpResult.systolic > 160) {
                setRadioValue('hasbled-htn', '1');
                setRadioValue('htn', '1');
            }

            calculate();
        } catch (e) {
            console.warn('FHIR data fetch failed:', e);
        }
    }
};

export const afRisk = createScoringCalculator(afRiskConfig);
