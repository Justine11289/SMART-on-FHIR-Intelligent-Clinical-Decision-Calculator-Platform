import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateLDL } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const ldlConfig: FormulaCalculatorConfig = {
    id: 'ldl',
    title: 'LDL Calculated',
    description:
        'Calculates LDL based on total and HDL cholesterol and triglycerides using the Friedewald equation.',
    inputs: [
        {
            id: 'ldl-tc',
            label: 'Total Cholesterol',
            type: 'number',
            standardUnit: 'mg/dL',
            unitConfig: { type: 'cholesterol', units: ['mg/dL', 'mmol/L'], default: 'mg/dL' },
            validationType: 'totalCholesterol',
            loincCode: LOINC_CODES.CHOLESTEROL_TOTAL,
            placeholder: 'Enter Total Cholesterol',
            min: 1,
            max: 1000,
            step: 1,
            required: true
        },
        {
            id: 'ldl-hdl',
            label: 'HDL Cholesterol',
            type: 'number',
            standardUnit: 'mg/dL',
            unitConfig: { type: 'cholesterol', units: ['mg/dL', 'mmol/L'], default: 'mg/dL' },
            validationType: 'hdl',
            loincCode: LOINC_CODES.HDL,
            placeholder: 'Enter HDL Cholesterol',
            min: 1,
            max: 200,
            step: 1,
            required: true
        },
        {
            id: 'ldl-trig',
            label: 'Triglycerides',
            type: 'number',
            standardUnit: 'mg/dL',
            unitConfig: { type: 'triglycerides', units: ['mg/dL', 'mmol/L'], default: 'mg/dL' },
            validationType: 'triglycerides',
            loincCode: LOINC_CODES.TRIGLYCERIDES,
            placeholder: 'Enter Triglycerides',
            min: 1,
            max: 2000,
            step: 1,
            required: true
        }
    ],
    formulas: [
        {
            label: 'Friedewald Equation',
            formula: 'LDL = Total Cholesterol - HDL - (Triglycerides / 5)'
        }
    ],
    calculate: calculateLDL,
    customResultRenderer: results => {
        const ldlRes = results[0];
        const ldlMmolRes = results[1];
        const trigVal = results[2].value as number;

        if (trigVal >= 400) {
            return uiBuilder.createAlert({
                type: 'danger',
                message:
                    '<strong>Cannot Calculate:</strong> Triglycerides ≥400 mg/dL. Friedewald equation is invalid. Please order Direct LDL.'
            });
        }

        return `
            ${uiBuilder.createResultItem({
                label: ldlRes.label,
                value: ldlRes.value.toString(),
                unit: ldlRes.unit,
                interpretation: ldlRes.interpretation,
                alertClass: ldlRes.alertClass ? `ui-alert-${ldlRes.alertClass}` : ''
            })}
            
            ${uiBuilder.createResultItem({
                label: ldlMmolRes.label,
                value: ldlMmolRes.value.toString(),
                unit: ldlMmolRes.unit
            })}
            
            <p class="text-sm text-muted mt-10">
                <strong>Note:</strong> All values in mg/dL
            </p>
            
            ${uiBuilder.createAlert({
                type: 'warning',
                message: `
                    <strong>Limitation:</strong> This formula is not accurate when triglycerides ≥400 mg/dL (≥4.52 mmol/L). 
                    Consider direct LDL measurement in such cases.
                `
            })}
            
            ${uiBuilder.createSection({
                title: 'LDL Cholesterol Goals (Adults)',
                content: uiBuilder.createTable({
                    headers: ['Category', 'mg/dL', 'mmol/L'],
                    rows: [
                        ['Optimal', '< 100', '< 2.59'],
                        ['Near Optimal', '100 - 129', '2.59 - 3.34'],
                        ['Borderline High', '130 - 159', '3.37 - 4.12'],
                        ['High', '160 - 189', '4.15 - 4.90'],
                        ['Very High', '≥ 190', '≥ 4.92']
                    ],
                    className: 'reference-table'
                })
            })}
        `;
    }
};

export const ldl = createUnifiedFormulaCalculator(ldlConfig);
