/**
 * EuroSCORE II Calculator
 *
 * Predicts operative mortality for cardiac surgery.
 * Uses logistic regression model with patient, cardiac, and procedural factors.
 *
 * Reference: Nashef SA, et al. EuroSCORE II. Eur J Cardiothorac Surg. 2012;41(4):734-744.
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { uiBuilder } from '../../ui-builder.js';
import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';
import { calculateEuroScoreII } from './calculation.js';

export const euroscoreII = createUnifiedFormulaCalculator({
    id: 'euroscore-ii',
    title: 'EuroSCORE II',
    description: 'Predicts operative mortality for cardiac surgery patients.',

    infoAlert: `
        <strong>EuroSCORE II</strong> is the current standard for cardiac surgery risk assessment.
        Enter all applicable risk factors to calculate predicted operative mortality.
    `,

    autoPopulateAge: 'es2-age',
    autoPopulateGender: 'es2-sex',

    sections: [
        // Section 1: Patient Factors
        {
            title: 'Patient Factors',
            icon: '👤',
            fields: [
                {
                    type: 'number',
                    id: 'es2-age',
                    label: 'Age',
                    unit: 'years',
                    placeholder: 'e.g., 65',
                    validationType: 'age',
                    required: true
                },
                {
                    type: 'radio',
                    name: 'es2-sex',
                    label: 'Sex',
                    options: [
                        { value: 'male', label: 'Male', checked: true },
                        { value: 'female', label: 'Female' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-renal',
                    label: 'Renal Function (Creatinine Clearance)',
                    loincCode: LOINC_CODES.EGFR,
                    options: [
                        { value: 'normal', label: '>85 mL/min (Normal)', checked: true },
                        { value: 'moderate', label: '51-85 mL/min (Moderate impairment)' },
                        { value: 'severe', label: '≤50 mL/min (Severe impairment)' },
                        { value: 'dialysis', label: 'On dialysis' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-diabetes',
                    label: 'Insulin-dependent Diabetes Mellitus',
                    snomedCode: SNOMED_CODES.DIABETES_TYPE_1,
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-pulmonary',
                    label: 'Chronic Pulmonary Dysfunction',
                    helpText: 'Long-term use of bronchodilators or steroids for lung disease',
                    snomedCode: SNOMED_CODES.COPD,
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-neuro',
                    label: 'Neurological/Musculoskeletal Dysfunction',
                    helpText: 'Severely affecting mobility',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-critical',
                    label: 'Critical Preoperative State',
                    helpText:
                        'VT/VF, cardiac massage, ventilation, inotropes, IABP, VAD, anuria/oliguria',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                }
            ]
        },

        // Section 2: Cardiac Factors
        {
            title: 'Cardiac Factors',
            icon: '❤️',
            fields: [
                {
                    type: 'radio',
                    name: 'es2-nyha',
                    label: 'NYHA Class',
                    options: [
                        { value: '1', label: 'Class I - No symptoms', checked: true },
                        { value: '2', label: 'Class II - Symptoms on moderate exertion' },
                        { value: '3', label: 'Class III - Symptoms on light exertion' },
                        { value: '4', label: 'Class IV - Symptoms at rest' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-ccs4',
                    label: 'CCS Class 4 Angina',
                    helpText: 'Unable to perform any activity without angina at rest',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-lvef',
                    label: 'LV Function (LVEF)',
                    loincCode: LOINC_CODES.LVEF,
                    options: [
                        { value: 'good', label: 'Good (≥51%)', checked: true },
                        { value: 'moderate', label: 'Moderate (31-50%)' },
                        { value: 'poor', label: 'Poor (21-30%)' },
                        { value: 'very-poor', label: 'Very poor (≤20%)' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-recent-mi',
                    label: 'Recent MI (≤90 days)',
                    snomedCode: SNOMED_CODES.MYOCARDIAL_INFARCTION,
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-pa-pressure',
                    label: 'Pulmonary Artery Systolic Pressure',
                    snomedCode: SNOMED_CODES.PULMONARY_HYPERTENSION,
                    options: [
                        { value: 'normal', label: '<31 mmHg', checked: true },
                        { value: 'moderate', label: '31-54 mmHg' },
                        { value: 'high', label: '≥55 mmHg' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-arteriopathy',
                    label: 'Extracardiac Arteriopathy',
                    helpText:
                        'Claudication, carotid >50% stenosis, amputation, aortic intervention',
                    snomedCode: SNOMED_CODES.PERIPHERAL_ARTERY_DISEASE,
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-previous-surgery',
                    label: 'Previous Cardiac Surgery',
                    helpText: '≥1 prior operation opening the pericardium',
                    snomedCode: SNOMED_CODES.PREVIOUS_CARDIAC_SURGERY,
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-endocarditis',
                    label: 'Active Endocarditis',
                    helpText: 'On antibiotics at time of surgery',
                    snomedCode: SNOMED_CODES.ENDOCARDITIS,
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                }
            ]
        },

        // Section 3: Procedural Factors
        {
            title: 'Procedural Factors',
            icon: '🔪',
            fields: [
                {
                    type: 'radio',
                    name: 'es2-urgency',
                    label: 'Urgency of Operation',
                    options: [
                        { value: 'elective', label: 'Elective - Routine admission', checked: true },
                        { value: 'urgent', label: 'Urgent - Cannot be discharged' },
                        { value: 'emergency', label: 'Emergency - Before next working day' },
                        { value: 'salvage', label: 'Salvage - CPR en route to OR' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-procedure-weight',
                    label: '"Weight" of Procedure',
                    options: [
                        { value: 'cabg', label: 'Isolated CABG', checked: true },
                        { value: 'non-cabg', label: 'Non-CABG single major procedure' },
                        { value: '2-procedures', label: '2 major procedures (e.g., CABG + valve)' },
                        { value: '3-or-more', label: '≥3 major procedures' }
                    ]
                },
                {
                    type: 'radio',
                    name: 'es2-thoracic-aorta',
                    label: 'Thoracic Aorta Surgery',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'EuroSCORE II Formula',
        calculationNote:
            'Predicted mortality = e<sup>y</sup> / (1 + e<sup>y</sup>), where y = -5.324537 + Σβᵢxᵢ',
        scoringCriteria: [
            { criteria: 'Patient Factors', isHeader: true },
            { criteria: 'Age (if >60 years)', points: '+0.0285 per year' },
            { criteria: 'Female sex', points: '+0.22' },
            { criteria: 'Renal impairment (CrCl 51-85)', points: '+0.30' },
            { criteria: 'Renal impairment (CrCl ≤50)', points: '+0.86' },
            { criteria: 'On dialysis', points: '+0.64' },
            { criteria: 'IDDM', points: '+0.35' },
            { criteria: 'Chronic pulmonary dysfunction', points: '+0.19' },
            { criteria: 'Neuro/mobility impairment', points: '+0.24' },
            { criteria: 'Critical preop state', points: '+1.09' },

            { criteria: 'Cardiac Factors', isHeader: true },
            { criteria: 'NYHA II/III/IV', points: '+0.11/0.30/0.56' },
            { criteria: 'CCS class 4', points: '+0.22' },
            { criteria: 'LVEF 31-50% / 21-30% / ≤20%', points: '+0.32/0.81/0.93' },
            { criteria: 'Recent MI', points: '+0.15' },
            { criteria: 'PA pressure 31-54 / ≥55', points: '+0.18/0.35' },
            { criteria: 'Arteriopathy', points: '+0.54' },
            { criteria: 'Previous cardiac surgery', points: '+1.12' },
            { criteria: 'Active endocarditis', points: '+0.62' },

            { criteria: 'Procedural Factors', isHeader: true },
            { criteria: 'Urgency (Urgent/Emergency/Salvage)', points: '+0.32/0.70/1.36' },
            { criteria: 'Non-CABG single / 2 proc / ≥3 proc', points: '+0.01/0.55/0.97' },
            { criteria: 'Thoracic aorta', points: '+0.65' }
        ]
    },

    resultTitle: 'Predicted Mortality',

    complexCalculate: calculateEuroScoreII,

    reference: `
        ${uiBuilder.createSection({
            title: 'Risk Stratification',
            icon: '📊',
            content: uiBuilder.createTable({
                headers: ['Mortality', 'Risk Category'],
                rows: [
                    ['<2%', 'Low Risk'],
                    ['2-5%', 'Moderate Risk'],
                    ['5-10%', 'High Risk'],
                    ['>10%', 'Very High Risk']
                ]
            })
        })}

        ${uiBuilder.createSection({
            title: 'Reference',
            icon: '📚',
            content:
                '<p>Nashef SA, et al. EuroSCORE II. <em>Eur J Cardiothorac Surg</em>. 2012;41(4):734-744.</p>'
        })}
    `
});
