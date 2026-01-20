import {
    createUnifiedFormulaCalculator,
    FormulaCalculatorConfig
} from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';

export const hepScoreConfig: FormulaCalculatorConfig = {
    id: '4ts-hit',
    title: 'HIT Expert Probability (HEP) Score for Heparin-Induced Thrombocytopenia',
    description: 'Pre-test clinical scoring model for HIT based on broad expert opinion.',
    infoAlert: 'Select the type of HIT onset and complete all clinical criteria below.',

    sections: [
        {
            title: 'HIT Onset Type',
            fields: [
                {
                    id: 'hit_onset_type',
                    label: 'Type of HIT onset suspected',
                    type: 'radio',
                    options: [
                        { value: 'typical', label: 'Typical onset', checked: true },
                        { value: 'rapid', label: 'Rapid onset (re-exposure)' }
                    ]
                }
            ]
        },
        {
            title: 'Thrombocytopenia Features',
            fields: [
                {
                    id: 'platelet_fall_magnitude',
                    label: 'Magnitude of platelet count fall',
                    type: 'radio',
                    options: [
                        { label: '<30% (-1)', value: '-1' },
                        { label: '30-50% (+1)', value: '1' },
                        { label: '>50% (+3)', value: '3' }
                    ]
                },
                // Typical Onset Specific
                {
                    id: 'timing_typical',
                    label: 'Timing of platelet count fall (Typical Onset)',
                    type: 'radio',
                    options: [
                        { label: 'Fall begins <4 days after heparin exposure (-2)', value: '-2' },
                        { label: 'Fall begins 4 days after heparin exposure (+2)', value: '2' },
                        { label: 'Fall begins 5-10 days after heparin exposure (+3)', value: '3' },
                        { label: 'Fall begins 11-14 days after heparin exposure (+2)', value: '2' },
                        { label: 'Fall begins >14 days after heparin exposure (-1)', value: '-1' }
                    ]
                },
                // Rapid Onset Specific
                {
                    id: 'timing_rapid',
                    label: 'Timing of platelet count fall (Rapid Onset)',
                    type: 'radio',
                    options: [
                        {
                            label: 'Fall begins <48 hours after heparin re-exposure (+2)',
                            value: '2'
                        },
                        {
                            label: 'Fall begins ≥48 hours after heparin re-exposure (-1)',
                            value: '-1'
                        }
                    ]
                },
                {
                    id: 'nadir_platelet',
                    label: 'Nadir platelet count',
                    type: 'radio',
                    options: [
                        { label: '≤20 x 10⁹/L (-2)', value: '-2' },
                        { label: '>20 x 10⁹/L (+2)', value: '2' }
                    ]
                },
                // Typical Onset Specific
                {
                    id: 'thrombosis_typical',
                    label: 'Thrombosis (Typical Onset)',
                    type: 'radio',
                    options: [
                        { label: 'New VTE/ATE ≥4 days after heparin exposure (+3)', value: '3' },
                        {
                            label: 'Progression of pre-existing VTE/ATE while receiving heparin (+2)',
                            value: '2'
                        },
                        { label: 'None (0)', value: '0', checked: true }
                    ]
                },
                // Rapid Onset Specific
                {
                    id: 'thrombosis_rapid',
                    label: 'Thrombosis (Rapid Onset)',
                    type: 'radio',
                    options: [
                        { label: 'New VTE/ATE after heparin exposure (+3)', value: '3' },
                        {
                            label: 'Progression of pre-existing VTE/ATE while receiving heparin (+2)',
                            value: '2'
                        },
                        { label: 'None (0)', value: '0', checked: true }
                    ]
                },
                {
                    id: 'skin_necrosis',
                    label: 'Skin necrosis at subcutaneous heparin injection sites',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (+3)', value: '3' }
                    ]
                },
                {
                    id: 'systemic_reaction',
                    label: 'Acute systemic reaction after IV heparin bolus',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (+2)', value: '2' }
                    ]
                },
                {
                    id: 'bleeding',
                    label: 'Presence of bleeding, petechiae or extensive bruising',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (-1)', value: '-1' }
                    ]
                }
            ]
        },
        {
            title: 'Other Causes',
            fields: [
                {
                    id: 'chronic_thrombocytopenia',
                    label: 'Presence of chronic thrombocytopenic disorder',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (-1)', value: '-1' }
                    ]
                },
                {
                    id: 'new_medication',
                    label: 'Newly initiated non-heparin medication known to cause thrombocytopenia',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (-1)', value: '-1' }
                    ]
                },
                {
                    id: 'severe_infection',
                    label: 'Severe infection',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (-2)', value: '-2' }
                    ]
                },
                {
                    id: 'dic',
                    label: 'Severe DIC (fibrinogen <100 mg/dL and D-dimer >5 µg/mL)',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (-2)', value: '-2' }
                    ]
                },
                {
                    id: 'arterial_device',
                    label: 'Indwelling intra-arterial device (e.g. IABP, VAD, ECMO)',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (-2)', value: '-2' }
                    ]
                },
                {
                    id: 'cardiopulmonary_bypass',
                    label: 'Cardiopulmonary bypass within previous 96 hours',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (-1)', value: '-1' }
                    ]
                },
                {
                    id: 'no_other_cause',
                    label: 'No other apparent cause',
                    type: 'radio',
                    options: [
                        { label: 'No (0)', value: '0', checked: true },
                        { label: 'Yes (+3)', value: '3' }
                    ]
                }
            ]
        }
    ],

    complexCalculate: (getValue, getStdValue, getRadioValue) => {
        const type = getRadioValue('hit_onset_type');
        let score = 0;

        // Common
        score += parseInt(getRadioValue('platelet_fall_magnitude') || '0');
        score += parseInt(getRadioValue('nadir_platelet') || '0');
        score += parseInt(getRadioValue('skin_necrosis') || '0');
        score += parseInt(getRadioValue('systemic_reaction') || '0');
        score += parseInt(getRadioValue('bleeding') || '0');
        score += parseInt(getRadioValue('chronic_thrombocytopenia') || '0');
        score += parseInt(getRadioValue('new_medication') || '0');
        score += parseInt(getRadioValue('severe_infection') || '0');
        score += parseInt(getRadioValue('dic') || '0');
        score += parseInt(getRadioValue('arterial_device') || '0');
        score += parseInt(getRadioValue('cardiopulmonary_bypass') || '0');
        score += parseInt(getRadioValue('no_other_cause') || '0');

        // Conditional
        if (type === 'typical') {
            score += parseInt(getRadioValue('timing_typical') || '0');
            score += parseInt(getRadioValue('thrombosis_typical') || '0');
        } else {
            score += parseInt(getRadioValue('timing_rapid') || '0');
            score += parseInt(getRadioValue('thrombosis_rapid') || '0');
        }

        // Interpretation
        let severity: 'success' | 'warning' | 'danger' = 'success';
        let interp = 'Low Probability (≤ -1)';
        let desc = 'Scores ≤ -1 suggest a lower probability of HIT.';

        if (score >= 4) {
            severity = 'danger';
            interp = 'High Probability (≥ 4)';
            desc = 'Scores ≥ 4 are >90% sensitive for HIT. Strongly consider HIT diagnosis.';
        } else if (score >= 0) {
            severity = 'warning';
            interp = 'Intermediate Probability (0-3)';
            desc = 'Intermediate probability of HIT. Consider further testing.';
        }

        return {
            score: score,
            interpretation: interp,
            severity: severity,
            additionalResults: [{ label: 'Description', value: desc }]
        };
    },

    customInitialize: (client, patient, container, calculateFn) => {
        const typeRadios = container.querySelectorAll('input[name="hit_onset_type"]');

        const updateVisibility = () => {
            const type = (
                container.querySelector('input[name="hit_onset_type"]:checked') as HTMLInputElement
            )?.value;

            // Helpers
            const setVisible = (id: string, show: boolean) => {
                // Find .ui-radio-group via input name
                const el = container.querySelector(`input[name="${id}"]`);
                // We need to hide the entire group wrapper generated by uiBuilder
                // Usually it's a div.ui-input-group or similar context
                const group = el?.closest('.ui-input-group');
                if (group) {
                    (group as HTMLElement).style.display = show ? '' : 'none';
                }
            };

            const isTypical = type === 'typical';

            setVisible('timing_typical', isTypical);
            setVisible('thrombosis_typical', isTypical);

            setVisible('timing_rapid', !isTypical);
            setVisible('thrombosis_rapid', !isTypical);
        };

        typeRadios.forEach(r =>
            r.addEventListener('change', () => {
                updateVisibility();
                // Recalculate will happen automatically via unified calculator listeners
            })
        );

        updateVisibility();
    },

    references: [
        'Cuker A, et al. The HIT Expert Probability (HEP) Score. <em>J Thromb Haemost</em>. 2010.'
    ]
};

export const hepScore = createUnifiedFormulaCalculator(hepScoreConfig);
