/**
 * APACHE II Calculator
 *
 * 使用 Unified Formula Calculator 工廠函數
 * 計算 ICU 死亡風險
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { apacheIiCalculation } from './calculation.js';

export const apacheIi = createUnifiedFormulaCalculator({
    id: 'apache-ii',
    title: 'APACHE II',
    description: 'Calculates APACHE II score for ICU mortality.',

    infoAlert:
        'Enter physiologic values from the first 24 hours of ICU admission. Use the worst value for each parameter.',

    autoPopulateAge: 'apache-ii-age',

    sections: [
        {
            title: 'Chronic Health Status',
            subtitle: 'History of severe organ insufficiency or immunocompromised',
            fields: [
                {
                    name: 'chronic',
                    label: '',
                    options: [
                        {
                            value: '5',
                            label: 'Yes - Non-operative or emergency postoperative (+5)',
                            checked: true
                        },
                        { value: '2', label: 'Yes - Elective postoperative (+2)' },
                        { value: '0', label: 'No (0)' }
                    ]
                }
            ]
        },
        {
            title: 'Demographics & Vital Signs',
            fields: [
                { id: 'apache-ii-age', label: 'Age', unit: 'years', validationType: 'age' },
                {
                    id: 'apache-ii-temp',
                    label: 'Temperature',
                    step: 0.1,
                    placeholder: '36.1 - 37.8',
                    loincCode: LOINC_CODES.TEMPERATURE,
                    validationType: 'temperature',
                    unitToggle: { type: 'temperature', units: ['C', 'F'], default: 'C' }
                },
                {
                    id: 'apache-ii-sbp',
                    label: 'SBP (Optional)',
                    placeholder: 'Systolic',
                    unit: 'mmHg',
                    required: false,
                    validationType: 'systolicBP',
                    loincCode: LOINC_CODES.SYSTOLIC_BP
                },
                {
                    id: 'apache-ii-dbp',
                    label: 'DBP (Optional)',
                    placeholder: 'Diastolic',
                    unit: 'mmHg',
                    required: false,
                    validationType: 'diastolicBP',
                    loincCode: LOINC_CODES.DIASTOLIC_BP
                },
                {
                    id: 'apache-ii-map',
                    label: 'Mean Arterial Pressure',
                    unit: 'mmHg',
                    placeholder: '70 - 100',
                    validationType: 'map',
                    helpText: 'Auto-calculated if SBP and DBP are provided'
                },
                {
                    id: 'apache-ii-hr',
                    label: 'Heart Rate',
                    unit: 'bpm',
                    placeholder: '60 - 100',
                    validationType: 'heartRate',
                    loincCode: LOINC_CODES.HEART_RATE
                },
                {
                    id: 'apache-ii-rr',
                    label: 'Respiratory Rate',
                    unit: 'breaths/min',
                    placeholder: '12 - 20',
                    validationType: 'respiratoryRate',
                    loincCode: LOINC_CODES.RESPIRATORY_RATE
                }
            ]
        },
        {
            title: 'Laboratory Values',
            fields: [
                {
                    id: 'apache-ii-ph',
                    label: 'Arterial pH',
                    step: 0.01,
                    placeholder: '7.38 - 7.44',
                    validationType: 'pH',
                    loincCode: LOINC_CODES.PH
                },
                {
                    id: 'apache-ii-sodium',
                    label: 'Sodium',
                    placeholder: '136 - 145',
                    loincCode: LOINC_CODES.SODIUM,
                    unitToggle: { type: 'sodium', units: ['mmol/L', 'mEq/L'], default: 'mmol/L' }
                },
                {
                    id: 'apache-ii-potassium',
                    label: 'Potassium',
                    step: 0.1,
                    placeholder: '3.5 - 5.2',
                    loincCode: LOINC_CODES.POTASSIUM,
                    unitToggle: { type: 'potassium', units: ['mmol/L', 'mEq/L'], default: 'mmol/L' }
                },
                {
                    id: 'apache-ii-creatinine',
                    label: 'Creatinine',
                    step: 0.1,
                    placeholder: '0.7 - 1.3',
                    loincCode: LOINC_CODES.CREATININE,
                    unitToggle: { type: 'creatinine', units: ['mg/dL', 'µmol/L'], default: 'mg/dL' }
                },
                {
                    id: 'apache-ii-hct',
                    label: 'Hematocrit',
                    unit: '%',
                    step: 0.1,
                    placeholder: '36 - 51',
                    validationType: 'hematocrit',
                    loincCode: LOINC_CODES.HEMATOCRIT
                },
                {
                    id: 'apache-ii-wbc',
                    label: 'WBC Count',
                    unit: 'x 10⁹/L',
                    step: 0.1,
                    placeholder: '3.7 - 10.7',
                    validationType: 'wbc',
                    loincCode: LOINC_CODES.WBC
                },
                {
                    name: 'arf',
                    label: 'Acute Renal Failure',
                    helpText: 'Double creatinine points if ARF is present',
                    options: [
                        { value: '1', label: 'Yes (Double Points)' },
                        { value: '0', label: 'No', checked: true }
                    ]
                }
            ]
        },
        {
            title: 'Neurological Assessment',
            fields: [
                {
                    id: 'apache-ii-gcs',
                    label: 'Glasgow Coma Scale',
                    unit: 'points',
                    placeholder: '3 - 15',
                    validationType: 'gcs',
                    loincCode: LOINC_CODES.GCS
                }
            ]
        },
        {
            title: 'Oxygenation',
            fields: [
                {
                    name: 'oxy_method',
                    label: 'Measurement Method',
                    options: [
                        {
                            value: 'fio2_pao2',
                            label: 'FiO₂ ≥ 0.5 (uses A-a gradient)',
                            checked: true
                        },
                        { value: 'pao2_only', label: 'FiO₂ < 0.5 (uses PaO₂ only)' }
                    ]
                },
                {
                    id: 'apache-ii-fio2',
                    label: 'FiO₂',
                    step: 0.01,
                    placeholder: 'e.g. 0.5',
                    validationType: 'fiO2',
                    loincCode: LOINC_CODES.FIO2
                },
                {
                    id: 'apache-ii-pao2',
                    label: 'PaO₂',
                    unit: 'mmHg',
                    validationType: 'paO2',
                    loincCode: LOINC_CODES.PO2
                },
                {
                    id: 'apache-ii-paco2',
                    label: 'PaCO₂',
                    unit: 'mmHg',
                    validationType: 'paCO2',
                    loincCode: LOINC_CODES.PCO2
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'APACHE II Scoring Criteria',
        calculationNote:
            'Total Score = Acute Physiology Score (APS) + Age Points + Chronic Health Points',
        scoringCriteria: [
            // Age
            { criteria: 'Age (years)', isHeader: true },
            { criteria: '≤44', points: '0' },
            { criteria: '45-54', points: '+2' },
            { criteria: '55-64', points: '+3' },
            { criteria: '65-74', points: '+5' },
            { criteria: '>74', points: '+6' },

            // Chronic Health Status
            {
                criteria: 'History of severe organ insufficiency or immunocompromised',
                isHeader: true
            },
            { criteria: 'Yes, nonoperative or emergency postoperative', points: '+5' },
            { criteria: 'Yes, elective postoperative', points: '+2' },
            { criteria: 'No', points: '0' },

            // Temperature
            { criteria: 'Rectal Temperature (°C)', isHeader: true },
            { criteria: '≥41', points: '+4' },
            { criteria: '39 to <41', points: '+3' },
            { criteria: '38.5 to <39', points: '+1' },
            { criteria: '36 to <38.5', points: '0' },
            { criteria: '34 to <36', points: '+1' },
            { criteria: '32 to <34', points: '+2' },
            { criteria: '30 to <32', points: '+3' },
            { criteria: '<30', points: '+4' },

            // Mean Arterial Pressure
            { criteria: 'Mean Arterial Pressure (mmHg)', isHeader: true },
            { criteria: '>159', points: '+4' },
            { criteria: '130-159', points: '+3' },
            { criteria: '110-129', points: '+2' },
            { criteria: '70-109', points: '0' },
            { criteria: '50-69', points: '+2' },
            { criteria: '≤49', points: '+4' },

            // Heart Rate
            { criteria: 'Heart Rate (beats/min)', isHeader: true },
            { criteria: '≥180', points: '+4' },
            { criteria: '140 to <180', points: '+3' },
            { criteria: '110 to <140', points: '+2' },
            { criteria: '70 to <110', points: '0' },
            { criteria: '55 to <70', points: '+2' },
            { criteria: '40 to <55', points: '+3' },
            { criteria: '<40', points: '+4' },

            // Respiratory Rate
            { criteria: 'Respiratory Rate (breaths/min)', isHeader: true },
            { criteria: '≥50', points: '+4' },
            { criteria: '35 to <50', points: '+3' },
            { criteria: '25 to <35', points: '+1' },
            { criteria: '12 to <25', points: '0' },
            { criteria: '10 to <12', points: '+1' },
            { criteria: '6 to <10', points: '+2' },
            { criteria: '<6', points: '+4' },

            // Oxygenation
            {
                criteria: 'Oxygenation (use PaO₂ if FiO₂ <50%, otherwise use A-a gradient)',
                isHeader: true
            },
            { criteria: 'A-a gradient ≥500', points: '+4' },
            { criteria: 'A-a gradient 350-499', points: '+3' },
            { criteria: 'A-a gradient 200-349', points: '+2' },
            {
                criteria: 'A-a gradient <200 (if FiO₂ ≥50%) or PaO₂ >70 (if FiO₂ <50%)',
                points: '0'
            },
            { criteria: 'PaO₂ 61-70', points: '+1' },
            { criteria: 'PaO₂ 55-60', points: '+3' },
            { criteria: 'PaO₂ <55', points: '+4' },

            // Arterial pH
            { criteria: 'Arterial pH', isHeader: true },
            { criteria: '≥7.70', points: '+4' },
            { criteria: '7.60 to <7.70', points: '+3' },
            { criteria: '7.50 to <7.60', points: '+1' },
            { criteria: '7.33 to <7.50', points: '0' },
            { criteria: '7.25 to <7.33', points: '+2' },
            { criteria: '7.15 to <7.25', points: '+3' },
            { criteria: '<7.15', points: '+4' },

            // Serum Sodium
            { criteria: 'Serum Sodium (mmol/L)', isHeader: true },
            { criteria: '≥180', points: '+4' },
            { criteria: '160 to <180', points: '+3' },
            { criteria: '155 to <160', points: '+2' },
            { criteria: '150 to <155', points: '+1' },
            { criteria: '130 to <150', points: '0' },
            { criteria: '120 to <130', points: '+2' },
            { criteria: '111 to <120', points: '+3' },
            { criteria: '<111', points: '+4' },

            // Serum Potassium
            { criteria: 'Serum Potassium (mmol/L)', isHeader: true },
            { criteria: '≥7.0', points: '+4' },
            { criteria: '6.0 to <7.0', points: '+3' },
            { criteria: '5.5 to <6.0', points: '+1' },
            { criteria: '3.5 to <5.5', points: '0' },
            { criteria: '3.0 to <3.5', points: '+1' },
            { criteria: '2.5 to <3.0', points: '+2' },
            { criteria: '<2.5', points: '+4' },

            // Serum Creatinine
            { criteria: 'Serum Creatinine (mg/dL)', isHeader: true },
            { criteria: '≥3.5 and ACUTE renal failure*', points: '+8' },
            { criteria: '2.0 to <3.5 and ACUTE renal failure', points: '+6' },
            { criteria: '≥3.5 and CHRONIC renal failure', points: '+4' },
            { criteria: '1.5 to <2.0 and ACUTE renal failure', points: '+4' },
            { criteria: '2.0 to <3.5 and CHRONIC renal failure', points: '+3' },
            { criteria: '1.5 to <2.0 and CHRONIC renal failure', points: '+2' },
            { criteria: '0.6 to <1.5', points: '0' },
            { criteria: '<0.6', points: '+2' },

            // Hematocrit
            { criteria: 'Hematocrit (%)', isHeader: true },
            { criteria: '≥60', points: '+4' },
            { criteria: '50 to <60', points: '+2' },
            { criteria: '46 to <50', points: '+1' },
            { criteria: '30 to <46', points: '0' },
            { criteria: '20 to <30', points: '+2' },
            { criteria: '<20', points: '+4' },

            // WBC
            { criteria: 'WBC Count (x10⁹/L)', isHeader: true },
            { criteria: '≥40', points: '+4' },
            { criteria: '20 to <40', points: '+2' },
            { criteria: '15 to <20', points: '+1' },
            { criteria: '3 to <15', points: '0' },
            { criteria: '1 to <3', points: '+2' },
            { criteria: '<1', points: '+4' },

            // GCS
            { criteria: 'Glasgow Coma Scale (GCS)', isHeader: true },
            { criteria: '15', points: '0' },
            { criteria: '14', points: '+1' },
            { criteria: '13', points: '+2' },
            { criteria: '10-12', points: '+3' },
            { criteria: '6-9', points: '+6' },
            { criteria: '3-5', points: '+9' }
        ],
        footnotes: [
            '*Acute renal failure was not defined in the original study. Use clinical judgment to determine if patient has acute kidney injury.',
            'Score calculated from worst values in the first 24 hours of ICU admission.'
        ]
    },

    resultTitle: 'APACHE II Score',

    // 使用導入的計算函數
    complexCalculate: apacheIiCalculation,

    customInitialize: (client, patient, container) => {
        // 1. MAP Calculation Logic
        const sbpInput = container.querySelector('#apache-ii-sbp') as HTMLInputElement;
        const dbpInput = container.querySelector('#apache-ii-dbp') as HTMLInputElement;
        const mapInput = container.querySelector('#apache-ii-map') as HTMLInputElement;

        const updateMap = () => {
            if (sbpInput && dbpInput && mapInput) {
                const sbp = parseFloat(sbpInput.value);
                const dbp = parseFloat(dbpInput.value);

                if (!isNaN(sbp) && !isNaN(dbp)) {
                    const map = (sbp + 2 * dbp) / 3;
                    mapInput.value = map.toFixed(0);
                    // Dispatch input event to trigger calculation
                    mapInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        };

        if (sbpInput) sbpInput.addEventListener('input', updateMap);
        if (dbpInput) dbpInput.addEventListener('input', updateMap);

        // 2. PaCO2 Visibility Logic
        const paco2Input = container.querySelector('#apache-ii-paco2') as HTMLInputElement;
        // Find the group (container for label + input wrapper) to hide everything
        const paco2Group = paco2Input?.closest('.ui-input-group') as HTMLElement;

        const updatePaco2Visibility = () => {
            const method = container.querySelector(
                'input[name="oxy_method"]:checked'
            ) as HTMLInputElement;
            if (method && paco2Group) {
                if (method.value === 'pao2_only') {
                    paco2Group.style.display = 'none';
                    // Reset value when hidden to avoid affecting calculation if logic didn't handle null
                    paco2Input.value = '';
                } else {
                    paco2Group.style.display = '';
                }
            }
        };

        // Attach to radio buttons
        const methodRadios = container.querySelectorAll('input[name="oxy_method"]');
        methodRadios.forEach(radio => {
            radio.addEventListener('change', updatePaco2Visibility);
        });

        // Initial check
        updatePaco2Visibility();
    },

    reference: `
        ${uiBuilder.createSection({
            title: 'Approximated In-Hospital Mortality Rates',
            icon: '📊',
            content: uiBuilder.createTable({
                headers: ['APACHE II Score', 'Nonoperative', 'Postoperative'],
                rows: [
                    ['0-4', '4%', '1%'],
                    ['5-9', '8%', '3%'],
                    ['10-14', '15%', '7%'],
                    ['15-19', '25%', '12%'],
                    ['20-24', '40%', '30%'],
                    ['25-29', '55%', '35%'],
                    ['30-34', '73%', '73%'],
                    ['>34', '85%', '88%']
                ]
            })
        })}

        ${uiBuilder.createSection({
            title: 'Reference',
            icon: '📚',
            content:
                '<p>Knaus, W. A., Draper, E. A., Wagner, D. P., & Zimmerman, J. E. (1985). APACHE II: a severity of disease classification system. <em>Critical care medicine</em>, 13(10), 818-829.</p>'
        })}
    `
});
