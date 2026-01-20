import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateHOMAIR } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const homaIrConfig: FormulaCalculatorConfig = {
    id: 'homa-ir',
    title: 'HOMA-IR (Homeostatic Model Assessment for Insulin Resistance)',
    description: 'Approximates insulin resistance.',
    infoAlert:
        `<strong>Interpretation:</strong>` +
        uiBuilder.createList({
            items: [
                '<strong>< 1.9:</strong> Optimal insulin sensitivity',
                '<strong>1.9 - 2.9:</strong> Early insulin resistance is likely',
                '<strong>> 2.9:</strong> High likelihood of insulin resistance'
            ]
        }),
    sections: [
        {
            title: 'Parameters',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'homa-glucose',
                    label: 'Fasting Glucose',
                    placeholder: 'e.g. 100',
                    unitConfig: {
                        type: 'glucose',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'glucose',
                    loincCode: LOINC_CODES.FASTING_GLUCOSE,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'homa-insulin',
                    label: 'Fasting Insulin',
                    placeholder: 'e.g. 10',
                    unitConfig: {
                        type: 'insulin',
                        units: ['µU/mL', 'pmol/L'],
                        default: 'µU/mL'
                    },
                    validationType: 'insulin',
                    loincCode: LOINC_CODES.INSULIN_LEVEL,
                    standardUnit: 'µU/mL',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'HOMA-IR',
            formula:
                '<span class="formula-fraction"><span class="numerator">Fasting Glucose (mg/dL) × Fasting Insulin (µU/mL)</span><span class="denominator">405</span></span>'
        }
    ],
    calculate: calculateHOMAIR
};

export const homaIr = createUnifiedFormulaCalculator(homaIrConfig);
