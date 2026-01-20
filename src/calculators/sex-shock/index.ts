/**
 * SEX-SHOCK Risk Score for Cardiogenic Shock
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateSexShock } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

// Define the coefficient table HTML separately for cleaner config
const coefficientsTableHTML = uiBuilder.createSection({
    title: 'Model Coefficients',
    icon: '📊',
    content: `
        ${uiBuilder.createTable({
            headers: ['Models', 'SEX-SHOCK', '', 'SEX-SHOCK<sub>light</sub>', ''],
            rows: [
                [
                    '<strong>Coefficients</strong>',
                    '<strong>Females</strong>',
                    '<strong>Males</strong>',
                    '<strong>Females</strong>',
                    '<strong>Males</strong>'
                ],
                ['(Intercept)', '-7.0804', '-7.9666', '-7.1019', '-8.0009'],
                ['CRP (mg/L)*', '0.0915', '0.0696', '0.0946', '0.0774'],
                ['Creatinine (μmol/L)*', '0.6092', '0.6040', '0.6274', '0.6276'],
                ['ST-segment elevation', '0.0328', '0.768', '0.0172', '0.7445'],
                ['LVEF 35%-50%*', '-1.0953', '-1.2722', '-1.1636', '-1.2994'],
                ['LVEF <50%*', '-1.9474', '-2.0153', '-2.0078', '-2.0677'],
                ['Age >70 years', '0.1825', '0.2635', '0.2758', '0.2939'],
                ['Presentation as cardiac arrest', '1.2567', '1.1459', '1.2132', '1.1394'],
                ['Killip class III*', '1.0503', '0.6849', '1.1277', '0.7185'],
                ['Heart rate >90/min', '0.2408', '0.5386', '0.2610', '0.5346'],
                ['SBP <125 and PP <45 mmHg', '0.8192', '0.7062', '0.8429', '0.7071'],
                ['Glycemia >10 mmol/L', '0.4019', '0.8375', '0.4223', '0.8176'],
                ['Culprit lesion of the left main**', '0.6397', '0.9036', 'NA', 'NA'],
                ['Post-PCI TIMI flow <3**', '0.7198', '0.4966', 'NA', 'NA']
            ],
            stickyFirstColumn: true
        })}
        <p class="table-note text-sm text-muted mt-10">
            *p=1, No=0<br>
            **Only required for SEX-SHOCK (full model). SEX-SHOCK<sub>light</sub> relies on non-PCI related variables only.<br>
            *Note that CRP and creatinine are log₂-transformed (CRP − log₂(original value + 1); creatinine − log₂(original value)) in the SEX-SHOCK models.
        </p>
    `
});

const formulaHTML = uiBuilder.createSection({
    title: 'FORMULA',
    icon: '📐',
    content: `
        <p class="mb-15">Equations are as follows (sex-stratified α coefficients are listed in the table below):</p>
        ${uiBuilder.createFormulaSection({
            hideTitle: true,
            items: [
                {
                    label: 'SEX-SHOCK Score',
                    formula:
                        'Y = (Intercept) + α × log₂(CRP, mg/L + 1) + α × log₂(Creatinine, μmol/L) + α × ST-Segment elevation + α × LVEF 35%-50% + α × LVEF <50% + α × Age >70 years + α × Presentation as cardiac arrest + α × Killip class III + α × Heart rate >90/min + α × SBP <125 and PP <45 mmHg + α × Glycemia >10 mmol/L + α × Culprit lesion of the left main* + α × Post-PCI TIMI flow <3*'
                },
                {
                    label: 'SEX-SHOCK<sub>light</sub> Score',
                    formula:
                        'Y = (Intercept) + α × log₂(CRP, mg/L + 1) + α × log₂(Creatinine, μmol/L) + α × ST-Segment elevation + α × LVEF 35%-50% + α × LVEF <50% + α × Age >70 years + α × Presentation as cardiac arrest + α × Killip class III + α × Heart rate >90/min + α × SBP <125 and PP <45 mmHg + α × Glycemia >10 mmol/L'
                },
                {
                    label: 'Risk %',
                    formula:
                        '<span class="formula-fraction"><span class="numerator">1</span><span class="denominator">1 + e<sup>−Y</sup></span></span> × 100'
                }
            ]
        })}
    `
});

const config: FormulaCalculatorConfig = {
    id: 'sex-shock',
    title: 'SEX-SHOCK Risk Score for Cardiogenic Shock',
    description:
        'Calculates the risk of in-hospital cardiogenic shock in patients with acute coronary syndrome (ACS).',

    infoAlert:
        '<strong>Validation Notice:</strong> Use caution in patients who have not undergone PCI.',

    sections: [
        {
            title: 'Patient Characteristics',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'sex-shock-age',
                    label: 'Age > 70 years',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-sex',
                    label: 'Sex',
                    options: [
                        { value: '0', label: 'Male', checked: true },
                        { value: '1', label: 'Female' }
                    ]
                }
            ]
        },
        {
            title: 'Clinical Presentation',
            icon: '🏥',
            fields: [
                {
                    type: 'radio',
                    id: 'sex-shock-arrest',
                    label: 'Cardiac Arrest at Presentation',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-killip',
                    label: 'Killip Class III (Acute Pulmonary Edema)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-hr',
                    label: 'Heart Rate > 90 bpm',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-bp',
                    label: 'Low BP (SBP < 125) & Pulse Pressure < 45 mmHg',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                }
            ]
        },
        {
            title: 'Angiographic & ECG Findings',
            icon: '💓',
            fields: [
                {
                    type: 'radio',
                    id: 'sex-shock-pci', // Note: This input is in UI but not used in calculation as per original logic!
                    // I will leave it here as it was in original.
                    label: 'PCI Not Performed',
                    options: [
                        { value: '0', label: 'PCI Done', checked: true },
                        { value: '1', label: 'No PCI' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-timi',
                    label: 'Post-PCI TIMI Flow < 3',
                    options: [
                        { value: '0', label: 'No (TIMI 3)', checked: true },
                        { value: '1', label: 'Yes (< 3)' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-left-main',
                    label: 'Left Main Culprit Lesion',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-st',
                    label: 'ST-Elevation on ECG',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'sex-shock-lvef',
                    label: 'Left Ventricular EF',
                    options: [
                        { value: '55', label: '> 50%' },
                        { value: '42.5', label: '35-50%' },
                        { value: '30', label: '< 35%', checked: true }
                    ]
                }
            ]
        },
        {
            title: 'Laboratory Values',
            icon: '🧪',
            fields: [
                {
                    type: 'radio',
                    id: 'sex-shock-glycemia',
                    label: 'Glucose > 10 mmol/L (> 180 mg/dL)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'number',
                    id: 'sex-shock-creatinine',
                    label: 'Creatinine',
                    unit: 'mg/dL',
                    step: 0.1,
                    min: 0,
                    placeholder: 'e.g. 1.2',
                    validationType: 'creatinine'
                },
                {
                    type: 'number',
                    id: 'sex-shock-crp',
                    label: 'C-Reactive Protein',
                    unit: 'mg/L',
                    step: 0.1,
                    min: 0,
                    placeholder: 'e.g. 5.0'
                }
            ]
        }
    ],

    calculate: calculateSexShock,

    // Append custom sections to footer
    footerHTML: formulaHTML + coefficientsTableHTML,

    customInitialize: async (client, patient, container, calculate) => {
        // Initialize basic services
        fhirDataService.initialize(client, patient, container);

        // Helper to set radio
        const setRadioValue = (id: string, value: string) => {
            // In unified-formula, radio inputs use 'name' which is usually 'id' in config if distinct,
            // or 'name' prop. In my config above, I replaced 'name' with 'id' property in InputConfig.
            // Unified calculator generates name="{id}" by default if name not specified.
            // So selector should be input[name="{id}"][value="{value}"]
            const radio = container.querySelector(
                `input[name="${id}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        const setValue = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement;
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        // Auto-populate age
        const age = fhirDataService.getPatientAge();
        if (age !== null && age > 70) {
            setRadioValue('sex-shock-age', '1');
        }

        // Auto-populate gender
        const gender = fhirDataService.getPatientGender();
        if (gender === 'female') {
            setRadioValue('sex-shock-sex', '1');
        }

        if (!client) return;

        try {
            // Heart Rate
            const hrResult = await fhirDataService.getObservation(LOINC_CODES.HEART_RATE, {
                trackStaleness: true,
                stalenessLabel: 'Heart Rate'
            });
            if (hrResult.value !== null && hrResult.value > 90) {
                setRadioValue('sex-shock-hr', '1');
            }

            // Creatinine
            const creatResult = await fhirDataService.getObservation(LOINC_CODES.CREATININE, {
                trackStaleness: true,
                stalenessLabel: 'Creatinine',
                targetUnit: 'mg/dL',
                unitType: 'creatinine'
            });
            if (creatResult.value !== null) {
                setValue('sex-shock-creatinine', creatResult.value.toFixed(1));
            }

            // CRP
            const crpResult = await fhirDataService.getObservation(LOINC_CODES.CRP, {
                trackStaleness: true,
                stalenessLabel: 'CRP'
            });
            if (crpResult.value !== null) {
                setValue('sex-shock-crp', crpResult.value.toFixed(1));
            }

            calculate();
        } catch (e) {
            console.warn('FHIR data fetch failed:', e);
        }
    }
};

export const sexShock = createUnifiedFormulaCalculator(config);
