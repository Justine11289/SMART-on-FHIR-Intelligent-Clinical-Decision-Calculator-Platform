import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateMaintenanceFluids } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const maintenanceFluidsConfig: FormulaCalculatorConfig = {
    id: 'maintenance-fluids',
    title: 'Maintenance Fluids Calculations',
    description:
        'Calculates maintenance fluid requirements by weight using the Holliday-Segar method.',
    inputs: [
        {
            id: 'weight-fluids',
            label: 'Weight',
            type: 'number',
            standardUnit: 'kg',
            unitConfig: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
            validationType: 'weight',
            loincCode: LOINC_CODES.WEIGHT,
            min: 0.1,
            max: 500,
            placeholder: 'e.g., 70',
            required: true
        }
    ],
    formulas: [
        { label: 'First 10 kg', formula: '4 mL/kg/hr' },
        { label: 'Next 10 kg (11-20 kg)', formula: '2 mL/kg/hr' },
        { label: 'Each kg above 20 kg', formula: '1 mL/kg/hr' },
        { label: 'Daily Total', formula: 'Hourly Rate × 24' }
    ],
    calculate: calculateMaintenanceFluids,
    footerHTML: uiBuilder.createAlert({
        type: 'warning',
        message: `
            <h5>⚠️ Important Notes:</h5>
            ${uiBuilder.createList({
                items: [
                    'This calculates <strong>maintenance fluids only</strong>, not replacement for deficits or ongoing losses',
                    'The Holliday-Segar method is widely used in pediatric and adult medicine',
                    'Adjust based on clinical conditions, renal function, and fluid losses',
                    'Consider insensible losses (respiratory, skin) and urine output',
                    'For critically ill patients, may need additional adjustment (e.g., 50-75% of calculated)'
                ]
            })}
        `
    })
};

export const maintenanceFluids = createUnifiedFormulaCalculator(maintenanceFluidsConfig);
