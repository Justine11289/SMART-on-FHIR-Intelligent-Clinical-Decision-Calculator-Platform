/**
 * ASCVD Risk Calculator with Therapy Impact
 *
 * Implements 2013 ACC/AHA Pooled Cohort Equations
 * Valid for ages 40-79 years
 *
 * Improvements based on DEVELOPER_GUIDE.md:
 * - Added snomedCode for condition auto-detection
 * - Added autoPopulateGender
 * - Restructured to use sections
 * - Added formulaSection and reference
 * - Uses uiBuilder for all UI elements
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { ascvdCalculationPure, calculatePCE, type AscvdPatient } from './calculation.js';

// Module-level state for therapy impact calculation
let currentBaselineRisk = 0;
let currentPatientData: AscvdPatient | null = null;

// ==========================================
// Exported Calculation Wrapper
// ==========================================

export const ascvdCalculation = (values: Record<string, any>) => {
    // Reset state
    currentBaselineRisk = 0;
    currentPatientData = null;

    const { results, risk, patient } = ascvdCalculationPure(values);

    // Update module state for therapy impact
    currentBaselineRisk = risk;
    currentPatientData = patient;

    return results;
};

// ==========================================
// Calculator Configuration
// ==========================================

export const ascvd = createUnifiedFormulaCalculator({
    id: 'ascvd',
    title: 'ASCVD Risk Calculator with Therapy Impact',
    description:
        'Determines 10-year risk of hard ASCVD and calculates the impact of various therapies on risk reduction.',
    infoAlert: `
        <strong>2013 ACC/AHA Pooled Cohort Equations</strong>
        ${uiBuilder.createList({
            items: [
                'Valid for ages 40-79 years',
                'Estimates 10-year risk of first hard ASCVD event',
                'Hard ASCVD = nonfatal MI, CHD death, or fatal/nonfatal stroke'
            ],
            type: 'ul'
        })}
    `,

    // Auto-populate from FHIR
    autoPopulateAge: 'ascvd-age',
    autoPopulateGender: 'ascvd-gender',

    // ==========================================
    // Sections (Improved Structure)
    // ==========================================
    sections: [
        {
            title: 'Known ASCVD',
            icon: '❤️',
            fields: [
                {
                    id: 'known-ascvd',
                    label: 'Known Clinical ASCVD?',
                    type: 'checkbox',
                    helpText: 'History of MI, stroke, or PAD'
                }
            ]
        },
        {
            title: 'Patient Demographics',
            icon: '👤',
            fields: [
                {
                    id: 'ascvd-age',
                    label: 'Age',
                    type: 'number',
                    unit: 'years',
                    min: 40,
                    max: 79,
                    validationType: 'age',
                    required: false
                },
                {
                    type: 'radio',
                    name: 'ascvd-gender',
                    label: 'Sex',
                    options: [
                        { value: 'male', label: 'Male', checked: true },
                        { value: 'female', label: 'Female' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'ascvd-race',
                    label: 'Race',
                    options: [
                        { value: 'white', label: 'White', checked: true },
                        { value: 'aa', label: 'African American' },
                        { value: 'other', label: 'Other' }
                    ]
                }
            ]
        },
        {
            title: 'Lipid Panel',
            icon: '🧪',
            fields: [
                {
                    id: 'ascvd-tc',
                    label: 'Total Cholesterol',
                    type: 'number',
                    loincCode: LOINC_CODES.CHOLESTEROL_TOTAL,
                    unitConfig: {
                        type: 'totalCholesterol',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'totalCholesterol',
                    required: false
                },
                {
                    id: 'ascvd-hdl',
                    label: 'HDL Cholesterol',
                    type: 'number',
                    loincCode: LOINC_CODES.HDL,
                    unitConfig: { type: 'hdl', units: ['mg/dL', 'mmol/L'], default: 'mg/dL' },
                    validationType: 'hdl',
                    required: false
                }
            ]
        },
        {
            title: 'Blood Pressure',
            icon: '💓',
            fields: [
                {
                    id: 'ascvd-sbp',
                    label: 'Systolic Blood Pressure',
                    type: 'number',
                    unit: 'mmHg',
                    loincCode: LOINC_CODES.SYSTOLIC_BP,
                    validationType: 'systolicBP',
                    min: 50,
                    max: 300,
                    required: false
                },
                {
                    type: 'radio',
                    name: 'ascvd-htn',
                    label: 'On Hypertension Treatment?',
                    snomedCode: SNOMED_CODES.HYPERTENSION,
                    options: [
                        { value: 'no', label: 'No', checked: true },
                        { value: 'yes', label: 'Yes' }
                    ]
                }
            ]
        },
        {
            title: 'Risk Factors',
            icon: '⚠️',
            fields: [
                {
                    type: 'radio',
                    name: 'ascvd-dm',
                    label: 'Diabetes?',
                    snomedCode: SNOMED_CODES.DIABETES_TYPE_2,
                    options: [
                        { value: 'no', label: 'No', checked: true },
                        { value: 'yes', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'ascvd-smoker',
                    label: 'Current Smoker?',
                    snomedCode: SNOMED_CODES.SMOKING,
                    options: [
                        { value: 'no', label: 'No', checked: true },
                        { value: 'yes', label: 'Yes' }
                    ]
                }
            ]
        }
    ],

    calculate: ascvdCalculation,

    // ==========================================
    // Formula Documentation
    // ==========================================
    formulaSection: {
        show: true,
        title: 'Pooled Cohort Equations',
        calculationNote:
            'Risk = 1 - S₀^exp(IndividualSum - MeanCoefficient), where S₀ is baseline survival',
        scoringCriteria: [
            { criteria: 'Variable', points: 'Weight', isHeader: true },
            { criteria: 'Age (ln)', points: 'Race/Sex-specific' },
            { criteria: 'Total Cholesterol (ln)', points: 'Race/Sex-specific' },
            { criteria: 'HDL Cholesterol (ln)', points: 'Race/Sex-specific' },
            { criteria: 'Systolic BP (ln)', points: 'Treated vs Untreated' },
            { criteria: 'Current Smoker', points: '+' },
            { criteria: 'Diabetes', points: '+' }
        ]
    },

    // ==========================================
    // Reference Section
    // ==========================================
    reference: `
        ${uiBuilder.createSection({
            title: 'Risk Stratification',
            icon: '📊',
            content: uiBuilder.createTable({
                headers: ['10-Year Risk', 'Category', 'Recommendation'],
                rows: [
                    ['<5%', 'Low', 'Lifestyle modifications'],
                    ['5-7.4%', 'Borderline', 'Consider moderate-intensity statin'],
                    ['7.5-19.9%', 'Intermediate', 'Moderate-intensity statin'],
                    ['≥20%', 'High', 'High-intensity statin']
                ]
            })
        })}
        
        ${uiBuilder.createSection({
            title: 'Reference',
            icon: '📚',
            content: `
                <p>Goff DC Jr, Lloyd-Jones DM, Bennett G, et al. 
                2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk. 
                <em>Circulation</em>. 2014;129:S49-S73.</p>
            `
        })}
    `,

    // ==========================================
    // Footer: Therapy Impact Section
    // ==========================================
    footerHTML: `
        <div id="therapy-impact-section" class="therapy-section ui-hidden" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            ${uiBuilder.createSection({
                title: '🎯 Therapy Impact Analysis',
                content: `
                    <div class="alert alert-info">Baseline Risk: <span id="therapy-baseline-risk">--</span>%</div>
                    <h5>Select Therapy Options:</h5>
                    
                    <div class="therapy-group">
                        ${uiBuilder.createCheckbox({ id: 'statin-therapy', label: 'Statin Therapy', checked: true })}
                        <div class="therapy-details" id="statin-details">
                            ${uiBuilder.createSelect({
                                id: 'statin-intensity',
                                label: 'Intensity',
                                options: [
                                    {
                                        value: 'moderate',
                                        label: 'Moderate-Intensity (30-50% LDL↓)'
                                    },
                                    { value: 'high', label: 'High-Intensity (≥50% LDL↓)' },
                                    { value: 'low', label: 'Low-Intensity (<30% LDL↓)' }
                                ]
                            })}
                        </div>
                    </div>
                    
                    <div class="therapy-group">
                        ${uiBuilder.createCheckbox({ id: 'lifestyle-mods', label: 'Lifestyle Modifications' })}
                        <div class="therapy-details ui-hidden" id="lifestyle-details">
                            ${uiBuilder.createCheckbox({ id: 'smoking-cessation', label: 'Smoking Cessation' })}
                            ${uiBuilder.createCheckbox({ id: 'bp-control', label: 'BP Control (target <130/80)' })}
                        </div>
                    </div>
                    
                    <div class="therapy-group">
                        ${uiBuilder.createCheckbox({ id: 'additional-therapy', label: 'Additional Therapies' })}
                        <div class="therapy-details ui-hidden" id="additional-details">
                            ${uiBuilder.createSelect({
                                id: 'additional-options',
                                label: 'Option',
                                options: [
                                    { value: 'ezetimibe', label: 'Ezetimibe (+15-20% LDL↓)' },
                                    { value: 'pcsk9', label: 'PCSK9 Inhibitor (+50-60% LDL↓)' },
                                    { value: 'aspirin', label: 'Low-dose Aspirin' }
                                ]
                            })}
                        </div>
                    </div>
                    
                    <button id="calculate-therapy-impact" class="ui-btn ui-btn-primary ui-btn-block mt-15">📊 Calculate Therapy Impact</button>
                    <div id="therapy-results" class="therapy-results ui-hidden"></div>
                `
            })}
        </div>
    `,

    // ==========================================
    // Custom Initialization
    // ==========================================
    customInitialize: (client, patient, container, calculateFn) => {
        // Toggle UI logic for therapy options
        const toggleVisibility = (triggerId: string, targetId: string) => {
            const trigger = container.querySelector(`#${triggerId}`) as HTMLInputElement;
            const target = container.querySelector(`#${targetId}`) as HTMLElement;
            if (trigger && target) {
                trigger.addEventListener('change', () => {
                    target.classList.toggle('ui-hidden', !trigger.checked);
                });
            }
        };

        toggleVisibility('statin-therapy', 'statin-details');
        toggleVisibility('lifestyle-mods', 'lifestyle-details');
        toggleVisibility('additional-therapy', 'additional-details');

        // Show therapy section when risk is calculated
        const therapySection = container.querySelector('#therapy-impact-section') as HTMLElement;
        const baselineDisplay = container.querySelector('#therapy-baseline-risk') as HTMLElement;
        const resultBox = container.querySelector('#ascvd-result');

        if (resultBox) {
            const observer = new MutationObserver(() => {
                if (resultBox.classList.contains('show') && currentBaselineRisk > 0) {
                    if (therapySection) therapySection.classList.remove('ui-hidden');
                    if (baselineDisplay)
                        baselineDisplay.textContent = currentBaselineRisk.toFixed(1);
                } else {
                    if (therapySection) therapySection.classList.add('ui-hidden');
                }
            });
            observer.observe(resultBox, { attributes: true, attributeFilter: ['class'] });
        }

        // Calculate Therapy Impact Button
        const calcBtn = container.querySelector('#calculate-therapy-impact');
        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                const resultsEl = container.querySelector('#therapy-results') as HTMLElement;
                if (!resultsEl || !currentPatientData) return;

                if (currentBaselineRisk <= 0) {
                    resultsEl.innerHTML = uiBuilder.createAlert({
                        type: 'danger',
                        message: 'Calculate baseline risk first.'
                    });
                    resultsEl.classList.remove('ui-hidden');
                    return;
                }

                // Copy patient data for modification
                const modPatient = { ...currentPatientData };
                const interventions: string[] = [];

                // Apply Statin Effect
                const statinInput = container.querySelector('#statin-therapy') as HTMLInputElement;
                if (statinInput?.checked) {
                    const intensity = (
                        container.querySelector('#statin-intensity') as HTMLSelectElement
                    ).value;
                    let ldlRed = 0.25; // low
                    if (intensity === 'high') ldlRed = 0.5;
                    if (intensity === 'moderate') ldlRed = 0.4;

                    const estimatedTrig = 150;
                    const currentLDL = modPatient.tc - modPatient.hdl - estimatedTrig / 5;
                    const treatedLDL = currentLDL * (1 - ldlRed);
                    modPatient.tc = treatedLDL + modPatient.hdl + estimatedTrig / 5;
                    interventions.push(intensity + '-intensity statin');
                }

                // Apply Lifestyle Modifications
                const lifestyleInput = container.querySelector(
                    '#lifestyle-mods'
                ) as HTMLInputElement;
                if (lifestyleInput?.checked) {
                    const stopSmoke = container.querySelector(
                        '#smoking-cessation'
                    ) as HTMLInputElement;
                    if (stopSmoke?.checked && modPatient.isSmoker) {
                        modPatient.isSmoker = false;
                        interventions.push('Smoking cessation');
                    }
                    const bpControl = container.querySelector('#bp-control') as HTMLInputElement;
                    if (bpControl?.checked && modPatient.sbp > 130) {
                        modPatient.sbp = 130;
                        modPatient.onHtnTx = true;
                        interventions.push('BP Control (<130/80)');
                    }
                }

                // Apply Additional Therapies
                const addInput = container.querySelector('#additional-therapy') as HTMLInputElement;
                if (addInput?.checked) {
                    const opt = (
                        container.querySelector('#additional-options') as HTMLSelectElement
                    ).value;
                    if (opt === 'ezetimibe' || opt === 'pcsk9') {
                        const red = opt === 'ezetimibe' ? 0.175 : 0.55;
                        const estimatedTrig = 150;
                        const currentLDL = modPatient.tc - modPatient.hdl - estimatedTrig / 5;
                        const treatedLDL = currentLDL * (1 - red);
                        modPatient.tc = treatedLDL + modPatient.hdl + estimatedTrig / 5;
                        interventions.push(opt === 'pcsk9' ? 'PCSK9 Inhibitor' : 'Ezetimibe');
                    }
                }

                // Recalculate Risk
                const newRisk = calculatePCE(modPatient);
                const arr = Math.max(0, currentBaselineRisk - newRisk);
                const nnt = arr > 0 ? Math.round(100 / arr) : 'N/A';

                // Render Results using uiBuilder
                resultsEl.innerHTML = `
                    ${uiBuilder.createResultItem({
                        label: 'Treated Risk',
                        value: newRisk.toFixed(1),
                        unit: '%',
                        interpretation: `Absolute Risk Reduction: ${arr.toFixed(1)}%`,
                        alertClass: 'success'
                    })}
                    ${uiBuilder.createResultItem({
                        label: 'Number Needed to Treat (10yr)',
                        value: String(nnt),
                        interpretation:
                            nnt !== 'N/A'
                                ? `Treat ${nnt} patients for 10 years to prevent 1 event`
                                : 'No risk reduction with selected interventions',
                        alertClass: 'info'
                    })}
                    <div class="mt-10 text-muted small">
                        <strong>Interventions:</strong> ${interventions.join(', ') || 'None selected'}
                    </div>
                `;
                resultsEl.classList.remove('ui-hidden');
            });
        }
    }
});
