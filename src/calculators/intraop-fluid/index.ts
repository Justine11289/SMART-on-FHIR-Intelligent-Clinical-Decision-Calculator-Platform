import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateIntraopFluid } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const intraopFluidConfig: FormulaCalculatorConfig = {
    id: 'intraop-fluid',
    title: 'Intraoperative Fluid Dosing in Adult Patients',
    description: 'Doses IV fluids intraoperatively.',
    infoAlert:
        uiBuilder.createAlert({
            type: 'warning',
            message:
                '<strong>IMPORTANT:</strong> This dosing tool is intended to assist with calculation, not to provide comprehensive or definitive drug information. Always double-check dosing.'
        }) +
        uiBuilder.createAlert({
            type: 'info',
            message:
                '<strong>INSTRUCTIONS:</strong> Use in patients undergoing surgery who weigh >10 kg and do not have conditions that could otherwise result in fluid overload such as heart failure, COPD, or kidney failure on dialysis.'
        }),
    sections: [
        {
            title: 'Patient Parameters',
            icon: '👤',
            fields: [
                {
                    type: 'number',
                    id: 'ifd-weight',
                    label: 'Weight',
                    placeholder: 'e.g., 70',
                    unitConfig: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    standardUnit: 'kg',
                    min: 10,
                    required: true
                },
                {
                    type: 'number',
                    id: 'ifd-npo',
                    label: 'Time spent NPO',
                    unit: 'hours',
                    placeholder: 'e.g., 8',
                    validationType: 'hours',
                    required: true
                }
            ]
        },
        {
            title: 'Surgical Factors',
            icon: '🔪',
            fields: [
                {
                    type: 'radio',
                    id: 'ifd-trauma',
                    label: 'Estimated severity of trauma to tissue',
                    options: [
                        {
                            value: '4',
                            label: 'Minimal (e.g. hernia repair, laparoscopy) (4 mL/kg/hr)'
                        },
                        { value: '6', label: 'Moderate (e.g. open cholecystectomy) (6 mL/kg/hr)' },
                        { value: '8', label: 'Severe (e.g. bowel resection) (8 mL/kg/hr)' }
                    ]
                }
            ]
        }
    ],
    formulas: [
        { label: 'Hourly maintenance fluid (mL/hr)', formula: 'body weight (kg) + 40 mL' },
        { label: 'NPO fluid deficit (mL)', formula: 'hourly maintenance × time spent NPO (hrs)' },
        { label: '1st hour fluids', formula: '½ NPO deficit + hourly maintenance + trauma loss' },
        { label: '2nd hour fluids', formula: '¼ NPO deficit + hourly maintenance + trauma loss' },
        { label: '3rd hour fluids', formula: '¼ NPO deficit + hourly maintenance + trauma loss' },
        { label: '4th hour+ fluids', formula: 'hourly maintenance + trauma loss' }
    ],
    footerHTML: `
        <p class="text-sm text-muted mt-15">*Estimated fluid loss from surgical trauma:</p>
        ${uiBuilder.createTable({
            headers: ['Severity', 'Example', 'Fluid Loss'],
            rows: [
                [
                    'Minimal',
                    'e.g. hernia repair, laparoscopy',
                    '2-4 mL/kg/hr (calculator uses 4 mL/kg/hr)'
                ],
                [
                    'Moderate',
                    'e.g. open cholecystectomy, open appendectomy',
                    '4-6 mL/kg/hr (calculator uses 6 mL/kg/hr)'
                ],
                ['Severe', 'e.g. bowel resection', '6-8 mL/kg/hr (calculator uses 8 mL/kg/hr)']
            ],
            stickyFirstColumn: true
        })}
    `,
    calculate: calculateIntraopFluid
};

export const intraopFluid = createUnifiedFormulaCalculator(intraopFluidConfig);
