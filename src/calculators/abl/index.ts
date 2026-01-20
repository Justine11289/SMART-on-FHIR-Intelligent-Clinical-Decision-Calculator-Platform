import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateABL } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const ablConfig: FormulaCalculatorConfig = {
    id: 'abl',
    title: 'Maximum Allowable Blood Loss (ABL) Without Transfusion',
    description:
        'Calculates the allowable blood loss for a patient before a transfusion may be indicated.',
    sections: [
        {
            title: 'Patient Category',
            icon: '👤',
            fields: [
                {
                    type: 'select',
                    id: 'abl-age-category',
                    label: 'Category',
                    options: [
                        { value: '75', label: 'Adult man (75 mL/kg)' },
                        { value: '65', label: 'Adult woman (65 mL/kg)' },
                        { value: '80', label: 'Infant (80 mL/kg)' },
                        { value: '85', label: 'Neonate (85 mL/kg)' },
                        { value: '96', label: 'Premature neonate (96 mL/kg)' }
                    ],
                    helpText: 'Blood volume (mL/kg) varies by age and sex'
                }
            ]
        },
        {
            title: 'Parameters',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'abl-weight',
                    label: 'Weight',
                    placeholder: 'e.g., 70',
                    unitConfig: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
                    validationType: 'weight',
                    loincCode: LOINC_CODES.WEIGHT,
                    standardUnit: 'kg',
                    required: true
                },
                {
                    type: 'number',
                    id: 'abl-hgb-initial',
                    label: 'Initial Hemoglobin',
                    placeholder: 'e.g., 14',
                    step: 0.1,
                    unitConfig: {
                        type: 'hemoglobin',
                        units: ['g/dL', 'g/L', 'mmol/L'],
                        default: 'g/dL'
                    },
                    validationType: 'hemoglobin',
                    loincCode: LOINC_CODES.HEMOGLOBIN,
                    standardUnit: 'g/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'abl-hgb-final',
                    label: 'Target/Allowable Hemoglobin',
                    placeholder: 'e.g., 7',
                    step: 0.1,
                    unitConfig: {
                        type: 'hemoglobin',
                        units: ['g/dL', 'g/L', 'mmol/L'],
                        default: 'g/dL'
                    },
                    validationType: 'hemoglobin',
                    standardUnit: 'g/dL',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        { label: 'Estimated Blood Volume (EBV)', content: 'Weight (kg) × Blood Volume (mL/kg)' },
        {
            label: 'Allowable Blood Loss (ABL)',
            content: 'EBV × (Hgb<sub>initial</sub> - Hgb<sub>final</sub>) / Hgb<sub>average</sub>'
        },
        { label: 'Average Hgb', content: '(Hgb<sub>initial</sub> + Hgb<sub>final</sub>) / 2' }
    ],
    infoAlert: uiBuilder.createAlert({
        type: 'info',
        message:
            '<strong>Note:</strong> Initial hemoglobin must be greater than target hemoglobin for calculation.'
    }),
    customInitialize: (client, patient, container, calculate) => {
        // Auto-select category based on patient data
        const fhirDataService = (window as any).fhirDataService;
        if (fhirDataService) {
            const age = fhirDataService.getPatientAge?.() || 30;
            const gender = fhirDataService.getPatientGender?.();
            const categorySelect = container.querySelector(
                '#abl-age-category'
            ) as HTMLSelectElement;

            if (categorySelect) {
                if (age > 18) {
                    categorySelect.value = gender === 'female' ? '65' : '75';
                } else if (age <= 1) {
                    categorySelect.value = '80'; // Infant
                }
            }
        }
    },
    calculate: calculateABL
};

export const abl = createUnifiedFormulaCalculator(ablConfig);
