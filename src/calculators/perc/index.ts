/**
 * PERC Rule for Pulmonary Embolism Calculator
 *
 * 使用 Score Calculator 工廠函數
 * 已整合 FHIRDataService，使用 dataRequirements 和 customInitialize
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { uiBuilder } from '../../ui-builder.js';

const config: ScoringCalculatorConfig = {
    inputType: 'checkbox',
    id: 'perc',
    title: 'PERC Rule for Pulmonary Embolism',
    description: 'Rules out PE if no criteria are present and pre-test probability is ≤15%.',
    infoAlert:
        '<strong>Important:</strong> PERC is only valid when pre-test probability for PE is ≤15%.',
    sections: [
        {
            title: 'PERC Criteria',
            icon: '📋',
            options: [
                { id: 'age50', label: 'Age ≥ 50 years', value: 1 },
                { id: 'hr100', label: 'Heart rate ≥ 100 bpm', value: 1 },
                { id: 'o2sat', label: 'Room air SaO₂ < 95%', value: 1 },
                { id: 'hemoptysis', label: 'Hemoptysis (coughing up blood)', value: 1 },
                { id: 'exogenous-estrogen', label: 'Exogenous estrogen use', value: 1 },
                {
                    id: 'prior-dvt-pe',
                    label: 'History of DVT or PE',
                    value: 1,
                    // SNOMED codes: DVT (128053003), PE (59282003)
                    conditionCode: '59282003'
                },
                { id: 'unilateral-swelling', label: 'Unilateral leg swelling', value: 1 },
                {
                    id: 'trauma-surgery',
                    label: 'Recent trauma or surgery requiring hospitalization',
                    value: 1
                }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 0,
            risk: 'PE may be ruled out',
            category: 'PERC Negative',
            severity: 'success',
            recommendation: 'No further testing is indicated if pre-test probability is low (≤15%).'
        },
        {
            minScore: 1,
            maxScore: 999,
            risk: 'PE is NOT ruled out',
            category: 'PERC Positive',
            severity: 'danger',
            recommendation: 'Further testing (e.g., D-dimer, imaging) should be considered.'
        }
    ],

    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'If any of the following is/are present, PE cannot be ruled out:',
        footnotes: [
            'Age ≥50.',
            'HR ≥100.',
            'O₂ sat on room air <95%.',
            'Unilateral leg swelling.',
            'Hemoptysis.',
            'Recent trauma or surgery.',
            'Prior PE or DVT.',
            'Hormone use (oral contraceptives, hormone replacement or estrogenic hormones use in males or female patients).'
        ]
    },

    // 自定義結果渲染
    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        const criteriaMet = score;
        let resultTitle = '';
        let interpretation = '';
        let alertClass: 'success' | 'danger' = 'success';

        if (criteriaMet === 0) {
            resultTitle = 'PERC Negative';
            interpretation =
                'PE may be ruled out. No further testing is indicated if pre-test probability is low (≤15%).';
            alertClass = 'success';
        } else {
            resultTitle = 'PERC Positive';
            interpretation =
                'The rule is positive. PE is NOT ruled out. Further testing (e.g., D-dimer, imaging) should be considered.';
            alertClass = 'danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Status',
                value: resultTitle,
                alertClass: `ui-alert-${alertClass}`
            })}
            ${
                criteriaMet > 0
                    ? uiBuilder.createResultItem({
                          label: 'Criteria Met',
                          value: `${criteriaMet} / 8`
                      })
                    : ''
            }
            ${uiBuilder.createAlert({
                type: alertClass,
                message: `<strong>Result:</strong> ${interpretation}`
            })}
        `;
    },

    // 使用 customInitialize 進行 FHIR 自動填充
    customInitialize: async (client, patient, container, calculate) => {
        const setCheckbox = (id: string, checked: boolean) => {
            const box = container.querySelector(`#${id}`) as HTMLInputElement;
            if (box) {
                box.checked = checked;
                box.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // 使用 FHIRDataService 獲取年齡
        const age = fhirDataService.getPatientAge();
        if (age !== null && age >= 50) {
            setCheckbox('age50', true);
        }

        if (!fhirDataService.isReady()) {
            return;
        }

        const stalenessTracker = fhirDataService.getStalenessTracker();

        try {
            // 獲取心率
            const hrResult = await fhirDataService.getObservation(LOINC_CODES.HEART_RATE, {
                trackStaleness: true,
                stalenessLabel: 'Heart Rate'
            });

            if (hrResult.value !== null && hrResult.value >= 100) {
                setCheckbox('hr100', true);
                if (stalenessTracker && hrResult.observation) {
                    stalenessTracker.trackObservation(
                        '#hr100',
                        hrResult.observation,
                        LOINC_CODES.HEART_RATE,
                        'Heart Rate'
                    );
                }
            }

            // 獲取氧飽和度
            const o2Result = await fhirDataService.getObservation(LOINC_CODES.OXYGEN_SATURATION, {
                trackStaleness: true,
                stalenessLabel: 'O2 Saturation'
            });

            if (o2Result.value !== null && o2Result.value < 95) {
                setCheckbox('o2sat', true);
                if (stalenessTracker && o2Result.observation) {
                    stalenessTracker.trackObservation(
                        '#o2sat',
                        o2Result.observation,
                        LOINC_CODES.OXYGEN_SATURATION,
                        'O2 Saturation'
                    );
                }
            }

            // 獲取 PE 病史（條件）
            const peConditions = await fhirDataService.getConditions(['59282003', '128053003']);
            if (peConditions.length > 0) {
                setCheckbox('prior-dvt-pe', true);
            }
        } catch (error) {
            console.warn('Error auto-populating PERC:', error);
        }
    }
};

export const perc = createScoringCalculator(config);
