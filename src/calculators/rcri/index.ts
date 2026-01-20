/**
 * Revised Cardiac Risk Index (RCRI) for Pre-Operative Risk Calculator
 *
 * 使用 Yes/No Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES, SNOMED_CODES, RXNORM_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { UnitConverter } from '../../unit-converter.js';
import { uiBuilder } from '../../ui-builder.js';

const config: ScoringCalculatorConfig = {
    inputType: 'yesno',
    id: 'rcri',
    title: 'Revised Cardiac Risk Index for Pre-Operative Risk',
    description: 'Estimates risk of cardiac complications after noncardiac surgery.',
    sectionTitle: 'RCRI Factors',
    sectionIcon: '❤️',
    questions: [
        {
            id: 'rcri-surgery',
            label: 'High-risk surgery (intraperitoneal, intrathoracic, suprainguinal vascular)',
            points: 1
        },
        {
            id: 'rcri-ihd',
            label: 'History of Ischemic Heart Disease (MI or positive stress test)',
            points: 1
        },
        { id: 'rcri-hf', label: 'History of Congestive Heart Failure', points: 1 },
        { id: 'rcri-cvd', label: 'History of Cerebrovascular Disease (stroke or TIA)', points: 1 },
        { id: 'rcri-insulin', label: 'Preoperative treatment with insulin', points: 1 },
        { id: 'rcri-creatinine', label: 'Preoperative serum creatinine > 2.0 mg/dL', points: 1 }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 0,
            label: 'Class I (Low Risk)',
            severity: 'success',
            description: '0.4% risk of major cardiac complications'
        },
        {
            minScore: 1,
            maxScore: 1,
            label: 'Class II (Low Risk)',
            severity: 'success',
            description: '0.9% risk of major cardiac complications'
        },
        {
            minScore: 2,
            maxScore: 2,
            label: 'Class III (Moderate Risk)',
            severity: 'warning',
            description: '6.6% risk of major cardiac complications'
        },
        {
            minScore: 3,
            maxScore: 999,
            label: 'Class IV (High Risk)',
            severity: 'danger',
            description: '11% risk of major cardiac complications'
        }
    ],
    references: [
        'Lee, T. H., Marcantonio, E. R., Mangione, C. M., Thomas, E. J., Polanczyk, C. A., Cook, E. F., ... & Goldman, L. (1999). Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. <em>Circulation</em>, 100(10), 1043-1049.'
    ],
    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Addition of the selected points:',
        scoringCriteria: [
            {
                criteria:
                    '<strong>High-risk surgery</strong><div class="text-sm text-muted">Intraperitoneal; intrathoracic; suprainguinal vascular</div>',
                points: '+1'
            },
            {
                criteria:
                    '<strong>History of ischemic heart disease</strong><div class="text-sm text-muted">History of myocardial infarction (MI); history of positive exercise test; current chest pain considered due to myocardial ischemia; use of nitrate therapy or ECG with pathological Q waves</div>',
                points: '+1'
            },
            {
                criteria:
                    '<strong>History of congestive heart failure</strong><div class="text-sm text-muted">Pulmonary edema, bilateral rales, or S3 gallop; paroxysmal nocturnal dyspnea; chest x-ray (CXR) showing pulmonary vascular redistribution</div>',
                points: '+1'
            },
            {
                criteria:
                    '<strong>History of cerebrovascular disease</strong><div class="text-sm text-muted">Prior transient ischemic attack (TIA) or stroke</div>',
                points: '+1'
            },
            {
                criteria: '<strong>Pre-operative treatment with insulin</strong>',
                points: '+1'
            },
            {
                criteria: '<strong>Pre-operative creatinine >2 mg/dL / 176.8 µmol/L</strong>',
                points: '+1'
            }
        ],
        interpretationTitle: 'FACTS & FIGURES',
        tableHeaders: ['RCRI Score', 'Approximate Risk of Major Cardiac Event (95% CI)*'],
        interpretations: [
            { score: '0', interpretation: '0.5%' },
            { score: '1', interpretation: '1.1%' },
            { score: '2', interpretation: '5%' },
            { score: '≥3', interpretation: '10%' }
        ],
        footnotes: [
            'Interpretation per the original 1999 study. Values are based on a combination of derivation and validation sets.'
        ]
    },
    customResultRenderer: (score: number): string => {
        const riskData: Record<
            number,
            { risk: string; rate: string; level: 'success' | 'warning' | 'danger' }
        > = {
            0: { risk: 'Class I (Low Risk)', rate: '0.4%', level: 'success' },
            1: { risk: 'Class II (Low Risk)', rate: '0.9%', level: 'success' },
            2: { risk: 'Class III (Moderate Risk)', rate: '6.6%', level: 'warning' }
        };

        const data = riskData[score] || {
            risk: 'Class IV (High Risk)',
            rate: '11%',
            level: 'danger' as const
        };
        const alertClass = `ui-alert-${data.level}`;

        return `
            ${uiBuilder.createResultItem({
                label: 'Total Score',
                value: score.toString(),
                unit: '/ 6 points',
                interpretation: data.risk,
                alertClass: alertClass
            })}
            
            ${uiBuilder.createAlert({
                type: data.level,
                message: `Major Cardiac Complications Rate: <strong>${data.rate}</strong>`
            })}
        `;
    },

    // 使用 customInitialize 處理 FHIR 自動填充
    customInitialize: async (client, patient, container, calculate) => {
        const setRadioValue = (name: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        if (!fhirDataService.isReady()) {
            return;
        }

        const stalenessTracker = fhirDataService.getStalenessTracker();

        try {
            // 自動填入 Creatinine > 2.0 mg/dL
            const crResult = await fhirDataService.getObservation(LOINC_CODES.CREATININE, {
                trackStaleness: true,
                stalenessLabel: 'Creatinine'
            });

            if (crResult.value !== null) {
                const unit = crResult.unit || 'mg/dL';
                const crMgDl = UnitConverter.convert(crResult.value, unit, 'mg/dL', 'creatinine');

                if (crMgDl !== null && crMgDl > 2.0) {
                    setRadioValue('rcri-creatinine', '1');
                    if (stalenessTracker && crResult.observation) {
                        stalenessTracker.trackObservation(
                            'input[name="rcri-creatinine"]',
                            crResult.observation,
                            LOINC_CODES.CREATININE,
                            'Serum Creatinine'
                        );
                    }
                }
            }

            // 檢測相關病史
            const conditionsToCheck = [
                {
                    codes: [
                        SNOMED_CODES.MYOCARDIAL_INFARCTION,
                        SNOMED_CODES.PREVIOUS_MI,
                        SNOMED_CODES.ISCHEMIC_HEART_DISEASE
                    ],
                    inputName: 'rcri-ihd'
                }, // IHD, MI
                {
                    codes: [SNOMED_CODES.HEART_FAILURE, SNOMED_CODES.CONGESTIVE_HEART_FAILURE],
                    inputName: 'rcri-hf'
                }, // Heart failure
                {
                    codes: [SNOMED_CODES.STROKE, SNOMED_CODES.TIA],
                    inputName: 'rcri-cvd'
                } // Stroke, TIA
            ];

            for (const condition of conditionsToCheck) {
                const hasCondition = await fhirDataService.hasCondition(condition.codes);
                if (hasCondition) {
                    setRadioValue(condition.inputName, '1');
                }
            }

            // 檢測胰島素使用
            const onInsulin = await fhirDataService.isOnMedication([RXNORM_CODES.INSULIN]); // Insulin RxNorm
            if (onInsulin) {
                setRadioValue('rcri-insulin', '1');
            }
        } catch (error) {
            console.warn('Error auto-populating RCRI:', error);
        }
    }
};

export const rcri = createScoringCalculator(config);
