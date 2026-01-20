/**
 * Gupta Perioperative Risk for Myocardial Infarction or Cardiac Arrest (MICA)
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateGuptaMica } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'gupta-mica',
    title: 'Gupta Perioperative Risk for Myocardial Infarction or Cardiac Arrest (MICA)',
    description:
        'Predicts risk of MI or cardiac arrest after surgery. Formula: Cardiac risk, % = [1/(1+e^-x)] × 100 where x = -5.25 + sum of selected variables.',

    autoPopulateAge: 'mica-age',

    sections: [
        {
            title: 'Patient Demographics',
            fields: [
                {
                    type: 'number',
                    id: 'mica-age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: 'Enter age',
                    validationType: 'age'
                }
            ]
        },
        {
            title: 'Clinical Status',
            fields: [
                {
                    type: 'select',
                    id: 'mica-status',
                    label: 'Functional Status',
                    options: [
                        { value: '0', label: 'Independent' },
                        { value: '0.65', label: 'Partially Dependent' },
                        { value: '1.03', label: 'Totally Dependent' }
                    ]
                },
                {
                    type: 'select',
                    id: 'mica-asa',
                    label: 'ASA Class',
                    helpText: 'Physical status classification',
                    loincCode: LOINC_CODES.ASA_PHYSICAL_STATUS,
                    options: [
                        { value: '-6.17', label: 'Class 1 - Normal healthy patient' },
                        { value: '-3.29', label: 'Class 2 - Mild systemic disease' },
                        { value: '1.80', label: 'Class 3 - Severe systemic disease' },
                        {
                            value: '4.29',
                            label: 'Class 4 - Severe systemic disease (threat to life)'
                        },
                        { value: '0', label: 'Class 5 - Moribund' }
                    ]
                }
            ]
        },
        {
            title: 'Laboratory Values',
            fields: [
                {
                    type: 'number',
                    id: 'mica-creat',
                    label: 'Creatinine',
                    unit: 'mg/dL',
                    step: 0.1,
                    placeholder: 'Enter creatinine',
                    validationType: 'creatinine',
                    loincCode: LOINC_CODES.CREATININE
                }
            ]
        },
        {
            title: 'Type of Procedure',
            fields: [
                {
                    type: 'select',
                    id: 'mica-procedure',
                    label: 'Surgical Procedure Type',
                    options: [
                        { value: '-0.74', label: 'Urology' },
                        { value: '-1.63', label: 'Breast' },
                        { value: '-0.25', label: 'Bariatric' },
                        { value: '0', label: 'Hernia (ventral, inguinal, femoral)' },
                        { value: '0.14', label: 'Skin' },
                        { value: '0.59', label: 'Neck (thyroid/parathyroid)' },
                        { value: '0.59', label: 'Gallbladder, appendix, intestine, or colon' },
                        { value: '0.60', label: 'Orthopedic and non-vascular extremity' },
                        { value: '0.63', label: 'Non-neurological thoracic' },
                        { value: '0.71', label: 'ENT (except thyroid/parathyroid)' },
                        { value: '0.74', label: 'Spine' },
                        { value: '0.96', label: 'Peripheral vascular' },
                        { value: '1.13', label: 'Other abdominal' },
                        { value: '1.14', label: 'Intestinal' },
                        { value: '1.31', label: 'Cardiac' },
                        { value: '1.39', label: 'Foregut or hepatopancreaticobiliary' },
                        { value: '1.48', label: 'Brain' }
                    ]
                }
            ]
        }
    ],

    resultTitle: 'Gupta MICA Risk Assessment',

    formulaSection: {
        show: true,
        type: 'list',
        title: 'FORMULA',
        scoringCriteria: [
            { criteria: 'Cardiac risk, % = e<sup>x</sup> / (1 + e<sup>x</sup>)', points: '' },
            {
                criteria: 'Where x = −5.25 + sum of the values of the selected variables.',
                points: ''
            }
        ]
    },

    calculate: calculateGuptaMica,

    customResultRenderer: results => {
        let html = '';

        // Find specific items
        const riskItem = results.find(r => r.label === 'Cardiac Risk');
        const descItem = results.find(r => r.label === 'Risk Description');
        const componentsItem = results.find(r => r.label === 'Formula Components');

        if (riskItem) {
            html += uiBuilder.createResultItem({
                label: riskItem.label,
                value: riskItem.value as string,
                unit: riskItem.unit,
                interpretation: riskItem.interpretation,
                alertClass: riskItem.alertClass ? `ui-alert-${riskItem.alertClass}` : ''
            });
        }

        if (descItem && descItem.alertPayload) {
            html += uiBuilder.createAlert(descItem.alertPayload);
        }

        if (componentsItem && componentsItem.alertPayload) {
            html += uiBuilder.createSection({
                title: 'Formula Components',
                content: componentsItem.alertPayload.message
            });
        }

        return html;
    },

    footerHTML: `
        <div class="ui-section mt-20">
            <div class="ui-section-title">Variable Coefficients</div>
            ${uiBuilder.createTable({
                headers: ['Variable', 'Options', 'Value'],
                rows: [
                    ['<strong>Age per year of increase</strong>', '', 'Age × 0.02'],
                    ['<strong>Functional status</strong>', 'Independent', '0'],
                    ['', 'Partially dependent', '0.65'],
                    ['', 'Totally dependent', '1.03'],
                    ['<strong>ASA Class</strong>', '1: normal healthy patient', '−5.17'],
                    ['', '2: mild systemic disease', '−3.29'],
                    ['', '3: severe systemic disease', '−1.92'],
                    ['', '4: severe systemic disease that is a constant threat to life*', '−0.95'],
                    ['', '5: moribund, not expected to survive without surgery', '0'],
                    ['<strong>Creatinine</strong>', 'Normal (<1.5 mg/dL, 133 µmol/L)', '0'],
                    ['', 'Elevated (≥1.5 mg/dL, 133 µmol/L)', '0.61'],
                    ['', 'Unknown', '−0.10'],
                    ['<strong>Type of procedure</strong>', 'Anorectal', '−0.16'],
                    ['', 'Aortic', '1.60'],
                    ['', 'Bariatric', '−0.25'],
                    ['', 'Brain', '1.40'],
                    ['', 'Breast', '−1.61'],
                    ['', 'Cardiac', '1.01'],
                    ['', 'ENT (except thyroid/parathyroid)', '0.71'],
                    ['', 'Foregut or hepatopancreatobiliary', '1.39'],
                    ['', 'Gallbladder, appendix, adrenals, or spleen', '0.59'],
                    ['', 'Hernia (ventral, inguinal, femoral)', '0'],
                    ['', 'Intestinal', '1.14'],
                    ['', 'Neck (thyroid/parathyroid)', '0.18'],
                    ['', 'Obstetric/gynecologic', '0.76'],
                    ['', 'Orthopedic and non-vascular extremity', '0.80'],
                    ['', 'Other abdominal', '1.13'],
                    ['', 'Peripheral vascular**', '0.86'],
                    ['', 'Skin', '0.54'],
                    ['', 'Spine', '0.21'],
                    ['', 'Non-esophageal thoracic', '0.40'],
                    ['', 'Vein', '−1.09'],
                    ['', 'Urology', '−0.26']
                ],
                stickyFirstColumn: true
            })}
            <p class="table-note text-sm text-muted mt-10">
                *I.e., patient could die acutely without intervention.<br>
                **Non-aortic, non-vein vascular surgeries.
            </p>
        </div>
    `,

    customInitialize: async (client, patient, container, calculate) => {
        // Initialize FHIRDataService
        fhirDataService.initialize(client, patient, container);

        const setValue = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement | HTMLSelectElement;
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // Age is automatically handled by autoPopulateAge

        if (client) {
            try {
                const result = await fhirDataService.getObservation(LOINC_CODES.CREATININE, {
                    trackStaleness: true,
                    stalenessLabel: 'Creatinine',
                    targetUnit: 'mg/dL',
                    unitType: 'creatinine'
                });

                if (result.value !== null) {
                    setValue('mica-creat', result.value.toFixed(2));
                }
            } catch (e) {
                console.warn('Error fetching creatinine for Gupta MICA', e);
            }
        }

        calculate();
    }
};

export const guptaMica = createUnifiedFormulaCalculator(config);
