import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateEthanolConcentration } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const ethanolConcentrationConfig: FormulaCalculatorConfig = {
    id: 'ethanol-concentration',
    title: 'Estimated Ethanol (and Toxic Alcohol) Serum Concentration Based on Ingestion',
    description: 'Predicts ethanol concentration based on ingestion of alcohol.',
    infoAlert:
        '<h4>Clinical Reference</h4>' +
        uiBuilder.createList({
            items: [
                '<strong>Legal limit (US driving):</strong> 80 mg/dL (0.08%)',
                '<strong>Severe intoxication:</strong> Usually >300 mg/dL',
                '<strong>Potentially fatal:</strong> >400-500 mg/dL',
                '<strong>Metabolism rate:</strong> ~15-20 mg/dL/hour',
                '<strong>Peak time:</strong> 30-90 min after ingestion (empty stomach)'
            ]
        }),
    sections: [
        {
            title: 'Ingestion Details',
            fields: [
                {
                    type: 'number',
                    id: 'eth-amount',
                    label: 'Amount Ingested',
                    placeholder: 'e.g., 1.5',
                    unitConfig: { type: 'volume', units: ['fl oz', 'mL'], default: 'fl oz' },
                    validationType: 'volume',
                    standardUnit: 'mL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'eth-abv',
                    label: 'Alcohol by Volume',
                    unit: '%',
                    placeholder: '40',
                    step: 1,
                    validationType: 'abv',
                    required: true
                }
            ]
        },
        {
            title: 'Patient Information',
            icon: '👤',
            fields: [
                {
                    type: 'number',
                    id: 'eth-weight',
                    label: 'Patient Weight',
                    placeholder: '70',
                    unitConfig: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    standardUnit: 'kg',
                    required: true
                },
                {
                    type: 'radio',
                    id: 'eth-gender',
                    label: 'Gender',
                    options: [
                        { label: 'Male (Vd = 0.68 L/kg)', value: 'male', checked: true },
                        { label: 'Female (Vd = 0.55 L/kg)', value: 'female' }
                    ]
                }
            ]
        }
    ],
    formulas: [
        { label: 'Volume (mL)', formula: 'Amount (oz) × 29.57 OR Amount (mL)' },
        { label: 'Grams of Alcohol', formula: 'Volume (mL) × (ABV% / 100) × 0.789' },
        { label: 'Concentration (mg/dL)', formula: '(Grams × 1000) / (Weight (kg) × Vd × 10)' }
    ],
    footerHTML: `<p class="text-sm text-muted mt-10">
        <strong>Notes:</strong> Vd (Volume of Distribution): Male 0.68 L/kg, Female 0.55 L/kg. Ethanol density: 0.789 g/mL.
    </p>`,
    autoPopulateGender: 'eth-gender',
    calculate: calculateEthanolConcentration
};

export const ethanolConcentration = createUnifiedFormulaCalculator(ethanolConcentrationConfig);
