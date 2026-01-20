import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateMAP } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const mapConfig: FormulaCalculatorConfig = {
    id: 'map',
    title: 'Mean Arterial Pressure (MAP)',
    description:
        'Calculates the average arterial pressure during one cardiac cycle, important for organ perfusion assessment.',
    inputs: [
        {
            id: 'map-sbp',
            label: 'Systolic BP',
            type: 'number',
            standardUnit: 'mmHg',
            unitConfig: { type: 'pressure', units: ['mmHg', 'kPa'], default: 'mmHg' },
            validationType: 'systolicBP',
            min: 50,
            max: 300,
            loincCode: LOINC_CODES.SYSTOLIC_BP,
            required: true
        },
        {
            id: 'map-dbp',
            label: 'Diastolic BP',
            type: 'number',
            standardUnit: 'mmHg',
            unitConfig: { type: 'pressure', units: ['mmHg', 'kPa'], default: 'mmHg' },
            validationType: 'diastolicBP',
            min: 30,
            max: 200,
            loincCode: LOINC_CODES.DIASTOLIC_BP,
            required: true
        }
    ],
    formulas: [
        { label: 'Formula', formula: 'MAP = DBP + (1/3 × (SBP - DBP))' },
        { label: 'Equivalent', formula: 'MAP = (SBP + 2 × DBP) / 3' }
    ],
    calculate: calculateMAP,
    customResultRenderer: results => {
        const res = results[0];
        if (!res) return '';

        const val = parseFloat(res.value as string);

        let note = '';
        if (val < 60)
            note = 'MAP <60 mmHg indicates severe hypotension and risk of organ hypoperfusion.';
        else if (val < 70) note = 'Borderline low MAP. Monitor closely.';
        else if (val <= 100) note = 'Normal MAP (70-100 mmHg) indicates adequate organ perfusion.';
        else note = 'Sustained MAP >100 mmHg requires management.';

        return `
            ${uiBuilder.createResultItem({
                label: res.label,
                value: res.value.toString(),
                unit: res.unit,
                interpretation: res.interpretation,
                alertClass: `ui-alert-${res.alertClass}`
            })}
            
            ${uiBuilder.createAlert({
                type: res.alertClass === 'success' ? 'info' : (res.alertClass as any),
                message: note
            })}
        `;
    }
};

export const map = createUnifiedFormulaCalculator(mapConfig);
