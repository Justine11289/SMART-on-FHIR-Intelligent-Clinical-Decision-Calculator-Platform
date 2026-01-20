/**
 * Fractional Excretion of Urea (FEUrea) Calculator
 *
 * 使用 UnifiedFormulaCalculator 工廠函數
 * 用於評估急性腎損傷（AKI）的病因，特別是在使用利尿劑的患者中
 */

import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { calculateFEUrea } from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

export const feureaConfig: FormulaCalculatorConfig = {
    id: 'feurea',
    title: 'Fractional Excretion of Urea (FEUrea)',
    description:
        'Determines if renal failure is due to prerenal or intrinsic pathology, especially useful in patients on diuretics.',
    infoAlert:
        '<p>FEUrea is particularly useful when FENa is unreliable (e.g., patients on diuretics, contrast nephropathy, or early obstruction).</p>' +
        uiBuilder.createAlert({
            type: 'info',
            message:
                '<strong>Advantage:</strong> Unlike FENa, FEUrea is not significantly affected by diuretic use.'
        }),
    sections: [
        {
            title: 'Laboratory Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'feurea-serum-cr',
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
                },
                {
                    type: 'number',
                    id: 'feurea-urine-urea',
                    label: 'Urine Urea Nitrogen',
                    placeholder: 'e.g., 200',
                    unitConfig: {
                        type: 'bun',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'bun',
                    loincCode: LOINC_CODES.URINE_UREA_NITROGEN,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'feurea-serum-urea',
                    label: 'Serum Urea Nitrogen (BUN)',
                    placeholder: 'e.g., 20',
                    unitConfig: {
                        type: 'bun',
                        units: ['mg/dL', 'mmol/L'],
                        default: 'mg/dL'
                    },
                    validationType: 'bun',
                    loincCode: LOINC_CODES.BUN,
                    standardUnit: 'mg/dL',
                    required: true
                },
                {
                    type: 'number',
                    id: 'feurea-urine-cr',
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
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'FEUrea (%)',
            formula:
                '<span class="formula-fraction"><span class="numerator">Serum<sub>Cr</sub> × U<sub>Urea</sub></span><span class="denominator">Serum<sub>Urea</sub> × U<sub>Cr</sub></span></span> × 100'
        }
    ],
    calculate: calculateFEUrea,
    customResultRenderer: results => {
        const mainResult = results[0];
        const noteResult = results[1];

        if (!mainResult) return '';

        let html = uiBuilder.createResultItem({
            label: mainResult.label,
            value: mainResult.value.toString(),
            unit: mainResult.unit,
            interpretation: mainResult.interpretation,
            alertClass: mainResult.alertClass ? `ui-alert-${mainResult.alertClass}` : ''
        });

        if (noteResult && noteResult.value) {
            html += uiBuilder.createAlert({
                type: noteResult.alertClass as any,
                message: noteResult.value.toString()
            });
        }

        // Add comparison table
        html += uiBuilder.createSection({
            title: 'FACTS & FIGURES',
            icon: '📊',
            content: `
                <p class="mb-15">This test can provide similar information to the <a href="#fena" class="text-link">FENa</a> equation, but can still be used in patients on diuretic therapy (diuretics alter the sodium concentration, making the FENa equation unusable).</p>
                ${uiBuilder.createTable({
                    headers: ['', 'Prerenal', 'Intrinsic renal', 'Postrenal'],
                    rows: [
                        ['FENa', '<1%', '>1%', '>4%'],
                        ['FEUrea', '≤ 35%', '>50%', 'N/A']
                    ],
                    stickyFirstColumn: true
                })}
            `
        });

        return html;
    },
    reference: uiBuilder.createReference({
        citations: [
            'Carvounis CP, Nisar S, Guro-Razuman S. Significance of the fractional excretion of urea in the differential diagnosis of acute renal failure. <em>Kidney Int</em>. 2002;62(6):2223-9.'
        ]
    })
};

export const feurea = createUnifiedFormulaCalculator(feureaConfig);
