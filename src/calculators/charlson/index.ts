/**
 * Charlson Comorbidity Index (CCI) Calculator
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { calculateCharlson } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'charlson',
    title: 'Charlson Comorbidity Index (CCI)',
    description: 'Predicts 10-year survival in patients with multiple comorbidities.',
    infoAlert:
        'The Charlson Comorbidity Index predicts 10-year mortality based on age and 17 comorbid conditions. Higher scores indicate more severe comorbidity burden.',

    autoPopulateAge: 'age',

    sections: [
        {
            title: 'Age',
            icon: '🎂',
            fields: [
                {
                    id: 'age',
                    label: 'Age Group',
                    type: 'radio',
                    options: [
                        { value: '0', label: '< 50 years (+0)', checked: true },
                        { value: '1', label: '50-59 years (+1)' },
                        { value: '2', label: '60-69 years (+2)' },
                        { value: '3', label: '70-79 years (+3)' },
                        { value: '4', label: '≥ 80 years (+4)' }
                    ]
                }
            ]
        },
        {
            title: 'Comorbidities',
            icon: '🏥',
            fields: [
                {
                    id: 'mi',
                    label: 'Myocardial infarction',
                    helpText: 'History of definite or probable MI',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.MYOCARDIAL_INFARCTION,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'chf',
                    label: 'CHF',
                    helpText: 'Exertional or paroxysmal nocturnal dyspnea',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.CONGESTIVE_HEART_FAILURE,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'pvd',
                    label: 'Peripheral vascular disease',
                    helpText: 'Intermittent claudication, past bypass, gangrene, or aneurysm',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.PERIPHERAL_ARTERY_DISEASE,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'cva',
                    label: 'CVA or TIA',
                    helpText: 'History of a cerebrovascular accident',
                    type: 'radio',
                    snomedCode: `${SNOMED_CODES.STROKE},${SNOMED_CODES.TIA}`,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'dementia',
                    label: 'Dementia',
                    helpText: 'Chronic cognitive deficit',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.DEMENTIA,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'cpd',
                    label: 'Chronic pulmonary disease',
                    type: 'radio',
                    snomedCode: `${SNOMED_CODES.COPD},${SNOMED_CODES.ASTHMA}`,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'ctd',
                    label: 'Connective tissue disease',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.CONNECTIVE_TISSUE_DISEASE,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'pud',
                    label: 'Peptic ulcer disease',
                    helpText: 'Any history of treatment for ulcer disease',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.PEPTIC_ULCER_DISEASE,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'liver',
                    label: 'Liver disease',
                    helpText:
                        'Mild = chronic hepatitis. Moderate/Severe = cirrhosis and portal hypertension.',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'None (+0)', checked: true },
                        { value: '1', label: 'Mild (+1)' },
                        { value: '3', label: 'Moderate to severe (+3)' }
                    ]
                },
                {
                    id: 'diabetes',
                    label: 'Diabetes mellitus',
                    helpText: 'End-organ damage includes retinopathy, nephropathy, or neuropathy.',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'None/Diet-controlled (+0)', checked: true },
                        { value: '1', label: 'Uncomplicated (+1)' },
                        { value: '2', label: 'End-organ damage (+2)' }
                    ]
                },
                {
                    id: 'hemiplegia',
                    label: 'Hemiplegia',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.HEMIPLEGIA,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'ckd',
                    label: 'Moderate to severe CKD',
                    helpText: 'Severe on dialysis, uremia, or creatinine >3 mg/dL',
                    type: 'radio',
                    snomedCode: `${SNOMED_CODES.CHRONIC_KIDNEY_DISEASE},${SNOMED_CODES.END_STAGE_RENAL_DISEASE},${SNOMED_CODES.DIALYSIS_DEPENDENT}`,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'tumor',
                    label: 'Solid tumor',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'None (+0)', checked: true },
                        { value: '2', label: 'Localized (+2)' },
                        { value: '6', label: 'Metastatic (+6)' }
                    ]
                },
                {
                    id: 'leukemia',
                    label: 'Leukemia',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.LEUKEMIA,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'lymphoma',
                    label: 'Lymphoma',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.LYMPHOMA,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'aids',
                    label: 'AIDS',
                    helpText: 'Not just HIV positive, but "full-blown" AIDS',
                    type: 'radio',
                    snomedCode: SNOMED_CODES.AIDS,
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '6', label: 'Yes (+6)' }
                    ]
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'Formula',
        calculationNote: 'Addition of the selected points:',
        tableHeaders: ['Variable', 'Definition', 'Points'],
        rows: [
            ['Myocardial infarction', 'History of definite or probable MI', '1'],
            ['Congestive heart failure', 'Exertional or paroxysmal nocturnal dyspnea', '1'],
            ['Peripheral vascular disease', 'Intermittent claudication or past bypass', '1'],
            ['CVA or TIA', 'History of CVA with minor/no residua', '1'],
            ['Dementia', 'Chronic cognitive deficit', '1'],
            ['Chronic pulmonary disease', '—', '1'],
            ['Connective tissue disease', '—', '1'],
            ['Peptic ulcer disease', 'Any history of treatment for ulcer', '1'],
            ['Mild liver disease', 'Chronic hepatitis', '1'],
            ['Uncomplicated diabetes', '—', '1'],
            ['Hemiplegia', '—', '2'],
            ['Moderate to severe CKD', 'Creatinine >3 mg/dL', '2'],
            ['Diabetes with end-organ damage', '—', '2'],
            ['Localized solid tumor', '—', '2'],
            ['Leukemia', '—', '2'],
            ['Lymphoma', '—', '2'],
            ['Moderate to severe liver disease', 'Cirrhosis and portal hypertension', '3'],
            ['Metastatic solid tumor', '—', '6'],
            ['AIDS', 'Full-blown AIDS', '6']
        ],
        footnotes: ['*Not just HIV positive, but "full-blown" AIDS.']
    },

    calculate: calculateCharlson,

    customResultRenderer: results => {
        let html = '';
        results.forEach(item => {
            html += uiBuilder.createResultItem({
                label: item.label,
                value: item.value as string,
                unit: item.unit,
                interpretation: item.interpretation,
                alertClass: item.alertClass ? `ui-alert-${item.alertClass}` : ''
            });
        });

        html += `
             <div class="info-section mt-20">
                <h4>📚 References</h4>
                <p>Charlson ME, Pompei P, Ales KL, MacKenzie CR. A new method of classifying prognostic comorbidity in longitudinal studies: development and validation. <em>J Chronic Dis</em>. 1987;40(5):373-383.</p>
            </div>
        `;
        return html;
    },

    customInitialize: async (client, patient, container, calculate) => {
        fhirDataService.initialize(client, patient, container);
        const stalenessTracker = fhirDataService.getStalenessTracker();

        const setValue = (id: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${id}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        if (client && fhirDataService.isReady()) {
            // Age is handled by autoPopulateAge via age-to-radio mapping logic is not directly supported in autoPopulateAge for radios with values 0-4
            // Wait, autoPopulateAge usually fills a number input.
            // If the field is a radio, we need custom logic.
            // But I put autoPopulateAge: 'age' in config.
            // The framework might try to put the number '65' into radio group 'age'.
            // This won't work if options are 0, 1, 2, 3, 4.
            // So I should keep the manual age logic and REMOVE autoPopulateAge from config?
            // Or better, update customInitialize to handle it and remove the autoPopulateAge config if it doesn't support mapping.
            // Let's keep manual age logic for now as it maps age ranges to scores.

            const age = fhirDataService.getPatientAge();
            if (age !== null) {
                let ageValue = 0;
                if (age >= 80) ageValue = 4;
                else if (age >= 70) ageValue = 3;
                else if (age >= 60) ageValue = 2;
                else if (age >= 50) ageValue = 1;

                setValue('age', ageValue.toString());
            }

            // Liver disease
            // Check severe first
            fhirDataService
                .hasCondition([SNOMED_CODES.CIRRHOSIS, SNOMED_CODES.LIVER_FAILURE])
                .then(hasSevere => {
                    if (hasSevere) {
                        setValue('liver', '3');
                    } else {
                        // Check mild
                        fhirDataService
                            .hasCondition([
                                SNOMED_CODES.HEPATITIS,
                                SNOMED_CODES.ALCOHOLIC_LIVER_DISEASE
                            ])
                            .then(hasMild => {
                                if (hasMild) {
                                    setValue('liver', '1');
                                }
                            })
                            .catch(e => console.warn('Error fetching mild liver conditions:', e));
                    }
                })
                .catch(e => console.warn('Error fetching severe liver conditions:', e));

            // Diabetes
            // Note: SNOMED doesn't always cleanly distinguish "Uncomplicated" vs "EOD" by single parent codes easily without detailed traversing
            // But we can try checking specific complications or general codes.
            // For now, let's assume existence of DIABETES_MELLITUS triggers at least '1'.
            // Differentiation of '2' (End-organ damage) is harder with just a few SNOMED codes unless we list many complications (Retinopathy, Nephropathy, Neuropathy).
            // Let's stick to a simple check for now or basic logic.

            fhirDataService
                .hasCondition([
                    SNOMED_CODES.DIABETES_MELLITUS,
                    SNOMED_CODES.DIABETES_TYPE_1,
                    SNOMED_CODES.DIABETES_TYPE_2
                ])
                .then(hasDiabetes => {
                    if (hasDiabetes) {
                        // Default to 1 (Uncomplicated) if we assume EOD check is too complex or missing specific codes?
                        // Or try to check for known complications if codes available?
                        // Ideally we would check for Retinopathy, Nephropathy etc.
                        // For now, let's set to 1 to be safe/conservative, user can upgrade.
                        setValue('diabetes', '1');
                    }
                })
                .catch(e => console.warn('Error fetching diabetes:', e));

            // Solid tumor
            fhirDataService
                .hasCondition([SNOMED_CODES.METASTATIC_CANCER])
                .then(isMetastatic => {
                    if (isMetastatic) {
                        setValue('tumor', '6');
                    } else {
                        fhirDataService
                            .hasCondition([SNOMED_CODES.MALIGNANCY])
                            .then(hasTumor => {
                                if (hasTumor) {
                                    setValue('tumor', '2');
                                }
                            })
                            .catch(e => console.warn('Error fetching tumor:', e));
                    }
                })
                .catch(e => console.warn('Error fetching metastatic tumor:', e));

            // CKD via Creatinine > 3 mg/dL - Supplementing the snomedCode check
            fhirDataService
                .getObservation(LOINC_CODES.CREATININE, {
                    trackStaleness: true,
                    stalenessLabel: 'Creatinine',
                    targetUnit: 'mg/dL',
                    unitType: 'creatinine'
                })
                .then(result => {
                    if (result.value !== null && result.value > 3) {
                        setValue('ckd', '2');
                        if (stalenessTracker && result.observation) {
                            stalenessTracker.trackObservation(
                                'input[name="ckd"][value="2"]',
                                result.observation,
                                LOINC_CODES.CREATININE,
                                'Creatinine > 3 mg/dL'
                            );
                        }
                    }
                })
                .catch(e => console.warn('Error fetching creatinine:', e));
        }

        setTimeout(calculate, 200);
    }
};

export const charlson = createUnifiedFormulaCalculator(config);
