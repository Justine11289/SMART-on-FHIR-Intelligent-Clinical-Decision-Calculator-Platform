/**
 * Endotracheal Tube (ETT) Depth and Tidal Volume Calculator
 */

import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateETT } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const ettConfig: FormulaCalculatorConfig = {
    id: 'ett',
    title: 'Endotracheal Tube (ETT) Depth and Tidal Volume Calculator',
    description:
        'Calculates estimated ETT depth and tidal volume based on patient height and gender.',
    infoAlert:
        '<strong>Note:</strong> These are initial estimates. Adjust based on chest X-ray, end-tidal CO₂, and clinical assessment.',
    sections: [
        {
            title: 'Patient Data',
            icon: '👤',
            fields: [
                {
                    type: 'number',
                    id: 'ett-height',
                    label: 'Height',
                    placeholder: 'e.g., 170',
                    unitConfig: { type: 'height', units: ['cm', 'in'], default: 'cm' },
                    validationType: 'height',
                    loincCode: LOINC_CODES.HEIGHT,
                    standardUnit: 'cm',
                    required: true
                },
                {
                    type: 'radio',
                    id: 'ett-gender',
                    label: 'Gender',
                    options: [
                        { label: 'Male', value: 'male', checked: true },
                        { label: 'Female', value: 'female' }
                    ]
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'ETT Depth (at lips)',
            formula: 'Height (cm) / 10 + 5',
            notes: 'Estimates depth of tube at the lips in cm'
        },
        { label: 'IBW (Male)', formula: '50 + 2.3 × (Height in inches - 60)' },
        { label: 'IBW (Female)', formula: '45.5 + 2.3 × (Height in inches - 60)' },
        {
            label: 'Tidal Volume',
            formula: 'IBW × 6-8 mL/kg',
            notes: 'Lung-protective ventilation target'
        }
    ],
    footerHTML: `
        <div class="info-section">
            <h4>📋 Clinical Pearls</h4>
            ${uiBuilder.createList({
                items: [
                    'Confirm ETT placement with capnography and chest X-ray',
                    'Tube tip should be 3-5 cm above the carina',
                    'Use lung-protective ventilation (6-8 mL/kg IBW) for ARDS patients'
                ]
            })}
        </div>
    `,
    autoPopulateGender: 'ett-gender',
    calculate: calculateETT
};

export const ett = createUnifiedFormulaCalculator(ettConfig);
