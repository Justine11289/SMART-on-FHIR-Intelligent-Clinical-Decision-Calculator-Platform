/**
 * AHA PREVENT CVD Risk Calculator
 *
 * Uses Unified Formula Calculator factory function.
 * Predicts 10-year risk of total cardiovascular disease.
 *
 * Reference: Khan SS, et al. Development and Validation of the
 * American Heart Association's PREVENT Equations. Circulation. 2024.
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { preventCvdCalculation } from './calculation.js';

export const preventCVD = createUnifiedFormulaCalculator({
    id: 'prevent-cvd',
    title: 'AHA PREVENT CVD Risk Calculator',
    description:
        'Predicts 10-year risk of total cardiovascular disease (atherosclerotic CVD + heart failure) using the AHA PREVENT equations.',

    infoAlert:
        'Valid for ages 30-79. Not applicable to patients with established CVD. The minimum uACR value accepted is 0.1 mg/g.',

    autoPopulateAge: 'prevent-age',
    autoPopulateGender: 'prevent-gender',

    sections: [
        {
            title: 'Patient Characteristics',
            icon: '👤',
            fields: [
                {
                    id: 'prevent-age',
                    label: 'Age',
                    unit: 'years',
                    min: 30,
                    max: 79,
                    validationType: 'age'
                },
                {
                    type: 'radio',
                    id: 'prevent-gender',
                    label: 'Sex',
                    options: [
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' }
                    ]
                },
                { type: 'checkbox', id: 'prevent-smoker', label: 'Current Smoker' },
                { type: 'checkbox', id: 'prevent-diabetes', label: 'Diabetes' },
                { type: 'checkbox', id: 'prevent-antihtn', label: 'Using Antihypertensive Drugs' },
                { type: 'checkbox', id: 'prevent-statin', label: 'Using Statins' }
            ]
        },
        {
            title: 'Clinical Measurements',
            icon: '🩺',
            fields: [
                {
                    id: 'prevent-sbp',
                    label: 'Systolic BP',
                    unit: 'mmHg',
                    validationType: 'systolicBP'
                },
                {
                    id: 'prevent-cholesterol',
                    label: 'Total Cholesterol',
                    step: 0.1,
                    unitToggle: {
                        type: 'cholesterol',
                        units: ['mmol/L', 'mg/dL'],
                        default: 'mmol/L'
                    },
                    validationType: 'totalCholesterol',
                    loincCode: LOINC_CODES.TOTAL_CHOLESTEROL
                },
                {
                    id: 'prevent-hdl',
                    label: 'HDL Cholesterol',
                    step: 0.1,
                    unitToggle: {
                        type: 'cholesterol',
                        units: ['mmol/L', 'mg/dL'],
                        default: 'mmol/L'
                    },
                    validationType: 'hdl',
                    loincCode: LOINC_CODES.HDL_CHOLESTEROL
                },
                {
                    id: 'prevent-egfr',
                    label: 'eGFR',
                    unit: 'mL/min/1.73m²',
                    validationType: 'egfr',
                    loincCode: LOINC_CODES.EGFR
                }
            ]
        }
    ],

    resultTitle: 'PREVENT 10-Year CVD Risk',

    complexCalculate: preventCvdCalculation,

    formulaSection: {
        show: true,
        title: 'PREVENT EQUATIONS FORMULA',
        calculationNote:
            'The model coefficients to calculate 10-year total CVD risk are as follows:',
        tableHeaders: ['Variable', 'Transformation', 'Female', 'Male'],
        rows: [
            ['Age, years', 'cage = (age − 55)/10', '0.7939', '0.7689'],
            ['Cholesterol, mmol/L', 'cnhdl = tc − hdl − 3.5', '0.0305', '0.0736'],
            ['', 'chdl = (hdl − 1.3)/0.3', '-0.1607', '-0.0954'],
            ['SBP', 'csbp = (min(SBP, 110) − 110)/20', '-0.2394', '-0.4347'],
            ['', 'csbp2 = (max(SBP, 110) − 130)/20', '0.36', '0.3363'],
            ['Diabetes', 'yes = 1, no = 0', '0.8668', '0.7693'],
            ['Current smoker', 'yes = 1, no = 0', '0.5361', '0.4387'],
            ['eGFR', 'cegfr = (min(eGFR, 60) − 60)/−15', '0.6046', '0.5379'],
            ['', 'cegfr2 = (max(eGFR, 60) − 90)/−15', '0.0434', '0.0165'],
            ['Using antihtn drugs', 'yes = 1, no = 0', '0.3152', '0.2889'],
            ['Using statins', 'yes = 1, no = 0', '-0.1478', '-0.1337'],
            ['SBP*antihtn interaction', 'csbp2*antihtn', '-0.0664', '-0.0476'],
            ['Cholesterol*statin interaction', 'cnhdl*statin', '0.1198', '0.1503'],
            ['Age*cholesterol interaction', 'cage*cnhdl', '-0.082', '-0.0518'],
            ['', 'cage*chdl', '0.0307', '0.0191'],
            ['Age*SBP interaction', 'cage*csbp2', '-0.0946', '-0.1049'],
            ['Age*diabetes interaction', 'cage*diabetes', '-0.2706', '-0.2252'],
            ['Age*smoking interaction', 'cage*smoking', '-0.0787', '-0.0895'],
            ['Age*eGFR interaction', 'cage*cegfr', '-0.1638', '-0.1543'],
            ['Constant', '', '-3.3077', '-3.0312']
        ],
        footnotes: [
            'Risk, % = e^x / (1 + e^x) × 100',
            'where x = Σ[β × (transformed variables)]',
            'BMI is only used as a predictor for heart failure risk calculation. Per study authors, the indicated range (with max allowed value of 39.9) was chosen based on past work in the Pooled Cohort Equations to Prevent Heart Failure (PCP-HF) study.'
        ]
    },

    references: [
        "Khan SS, Matsushita K, Sang Y, et al. Development and Validation of the American Heart Association's PREVENT Equations. <em>Circulation</em>. 2024;149(6):430-449.",
        'Predicting Risk of cardiovascular disease EVENTs (PREVENT) Calculator. <a href="https://professional.heart.org/en/guidelines-and-statements/prevent-calculator" target="_blank">AHA Professional Heart</a>'
    ],

    fhirAutoPopulate: [
        {
            fieldId: 'prevent-cholesterol',
            loincCode: LOINC_CODES.CHOLESTEROL_TOTAL,
            targetUnit: 'mmol/L',
            unitType: 'cholesterol',
            formatter: v => v.toFixed(2)
        },
        {
            fieldId: 'prevent-hdl',
            loincCode: LOINC_CODES.HDL,
            targetUnit: 'mmol/L',
            unitType: 'cholesterol',
            formatter: v => v.toFixed(2)
        },
        { fieldId: 'prevent-egfr', loincCode: LOINC_CODES.EGFR, formatter: v => v.toFixed(0) }
    ],

    customInitialize: async (client, patient, container, calculate) => {
        if (!fhirDataService.isReady()) {
            return;
        }

        try {
            const bpResult = await fhirDataService.getBloodPressure({ trackStaleness: true });

            if (bpResult.systolic !== null) {
                const sbpInput = container.querySelector('#prevent-sbp') as HTMLInputElement;
                if (sbpInput) {
                    sbpInput.value = bpResult.systolic.toFixed(0);
                    sbpInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        } catch (error) {
            console.warn('Error fetching blood pressure for PREVENT:', error);
        }
    }
});
