import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateFENa } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
export const fenaConfig = {
    id: 'fena',
    title: 'Fractional Excretion of Sodium (FENa)',
    description: 'Determines if renal failure is due to prerenal or intrinsic pathology.',
    infoAlert: '<p>Use in the context of acute kidney injury (AKI) / acute renal failure to differentiate prerenal azotemia from acute tubular necrosis (ATN).</p>' +
        uiBuilder.createAlert({
            type: 'warning',
            message: '<strong>Limitations:</strong> FENa is unreliable in patients on diuretics. Consider Fractional Excretion of Urea (FEUrea) instead.'
        }),
    sections: [
        {
            title: 'Laboratory Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'fena-urine-na',
                    label: 'Urine Sodium',
                    placeholder: 'e.g. 20',
                    unitConfig: {
                        type: 'urineSodium',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'urineSodium',
                    loincCode: LOINC_CODES.URINE_SODIUM,
                    standardUnit: 'mEq/L',
                    required: true
                },
                {
                    type: 'number',
                    id: 'fena-serum-na',
                    label: 'Serum Sodium',
                    placeholder: 'e.g. 140',
                    unitConfig: {
                        type: 'sodium',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'sodium',
                    loincCode: LOINC_CODES.SODIUM,
                    standardUnit: 'mEq/L',
                    required: true
                },
                {
                    type: 'number',
                    id: 'fena-urine-creat',
                    label: 'Urine Creatinine',
                    placeholder: 'e.g., 100',
                    unitConfig: {
                        type: 'urineCreatinine',
                        units: ['mg/dL', 'µmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'urineCreatinine',
                    loincCode: LOINC_CODES.URINE_CREATININE,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'fena-serum-creat',
                    label: 'Serum Creatinine',
                    placeholder: 'e.g., 1.0',
                    unitConfig: {
                        type: 'creatinine',
                        units: ['mg/dL', 'µmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'creatinine',
                    loincCode: LOINC_CODES.CREATININE,
                    standardUnit: 'mg/dL',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'FENa (%)',
            formula: '<span class="formula-fraction"><span class="numerator">Urine Na × Serum Cr</span><span class="denominator">Serum Na × Urine Cr</span></span> × 100',
            notes: 'Units: Na (mEq/L), Cr (mg/dL or µmol/L)'
        }
    ],
    calculate: calculateFENa
};
export const fena = createUnifiedFormulaCalculator(fenaConfig);
