/**
 * NAFLD (Non-Alcoholic Fatty Liver Disease) Fibrosis Score
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateNafldFibrosisScore } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'nafld-fibrosis-score',
    title: 'NAFLD (Non-Alcoholic Fatty Liver Disease) Fibrosis Score',
    description: 'Estimates amount of scarring in the liver based on laboratory tests.',
    infoAlert: `
        <strong>Instructions:</strong> For use in patients with NAFLD to screen for advanced fibrosis.
    `,
    sections: [
        {
            title: 'Patient Demographics',
            icon: '👤',
            fields: [
                {
                    type: 'number',
                    id: 'age',
                    label: 'Age',
                    unit: 'years',
                    validationType: 'age'
                },
                {
                    type: 'number',
                    id: 'bmi',
                    label: 'BMI',
                    unit: 'kg/m²',
                    step: 0.1
                },
                {
                    type: 'radio',
                    id: 'diabetes',
                    label: 'Impaired Fasting Glucose / Diabetes',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes (+1.13 points)' }
                    ]
                }
            ]
        },
        {
            title: 'Laboratory Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'ast',
                    label: 'AST',
                    unit: 'U/L',
                    validationType: 'liverEnzyme'
                },
                {
                    type: 'number',
                    id: 'alt',
                    label: 'ALT',
                    unit: 'U/L',
                    validationType: 'liverEnzyme'
                },
                {
                    type: 'number',
                    id: 'platelet',
                    label: 'Platelet Count',
                    unitToggle: {
                        type: 'platelet',
                        units: ['×10⁹/L', 'K/µL'],
                        default: '×10⁹/L'
                    }
                },
                {
                    type: 'number',
                    id: 'albumin',
                    label: 'Albumin',
                    step: 0.1,
                    unitToggle: {
                        type: 'albumin',
                        units: ['g/dL', 'g/L'],
                        default: 'g/dL'
                    }
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'NAFLD Score',
            formula:
                '−1.675 + (0.037 × age [years]) + (0.094 × BMI [kg/m²]) + (1.13 × IFG/diabetes [yes = 1, no = 0]) + (0.99 × AST/ALT ratio) − (0.013 × platelet count [×10⁹/L]) − (0.66 × albumin [g/dL])'
        }
    ],
    formulaSection: {
        show: true,
        title: 'FACTS & FIGURES',
        tableHeaders: ['NAFLD Score', 'Correlated Fibrosis Severity'],
        interpretations: [
            { score: '< −1.455', interpretation: 'F0-F2', severity: 'success' },
            { score: '−1.455 – 0.675', interpretation: 'Indeterminant score', severity: 'warning' },
            { score: '> 0.675', interpretation: 'F3-F4', severity: 'danger' }
        ],
        footnotes: [
            '<strong>Fibrosis Severity Scale:</strong>',
            'F0 = no fibrosis',
            'F1 = mild fibrosis',
            'F2 = moderate fibrosis',
            'F3 = severe fibrosis',
            'F4 = cirrhosis'
        ]
    },
    calculate: calculateNafldFibrosisScore,

    customResultRenderer: results => {
        // We separate calculation results and alert message in calculation.ts
        // Item 0 is result, Item 1 is interpretation alert payload if present (Wait, calculation.ts returns full item)
        // Let's iterate result items.
        // If an item has alertPayload, render it as notification below.

        let alertHtml = '';
        const items = results
            .map(r => {
                if (r.label === 'Interpretation' && r.alertPayload) {
                    alertHtml = uiBuilder.createAlert(r.alertPayload);
                    return ''; // Don't show redundant item, or show it? original showed both result item (stage) AND alert.
                    // Original: Result Item (Interpretation: stage), then Alert (Interpretation: message).
                    // In calculation.ts:
                    // Item 0: Label: NAFLD Score, Interp: stage.
                    // Item 1: Label: Interpretation, Value: full message.
                    // Let's filter out Interpretation item for display as item, and just use it for the Alert HTML block.
                    return '';
                }

                return uiBuilder.createResultItem({
                    label: r.label,
                    value: r.value.toString(),
                    unit: r.unit,
                    interpretation: r.interpretation,
                    alertClass: r.alertClass ? `ui-alert-${r.alertClass}` : ''
                });
            })
            .join('');

        return items + alertHtml;
    },

    customInitialize: async (client, patient, container, calculate) => {
        fhirDataService.initialize(client, patient, container);

        const setVal = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement;
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        // Auto-populate age
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            setVal('age', age.toString());
        }

        if (!client) return;

        try {
            // BMI
            const bmiResult = await fhirDataService.getObservation(LOINC_CODES.BMI, {
                trackStaleness: true,
                stalenessLabel: 'BMI'
            });
            if (bmiResult.value !== null) {
                setVal('bmi', bmiResult.value.toFixed(1));
            }

            // AST
            const astResult = await fhirDataService.getObservation(LOINC_CODES.AST, {
                trackStaleness: true,
                stalenessLabel: 'AST'
            });
            if (astResult.value !== null) {
                setVal('ast', astResult.value.toFixed(0));
            }

            // ALT
            const altResult = await fhirDataService.getObservation(LOINC_CODES.ALT, {
                trackStaleness: true,
                stalenessLabel: 'ALT'
            });
            if (altResult.value !== null) {
                setVal('alt', altResult.value.toFixed(0));
            }

            // Platelets
            const pltResult = await fhirDataService.getObservation(LOINC_CODES.PLATELETS, {
                trackStaleness: true,
                stalenessLabel: 'Platelets',
                targetUnit: '10*9/L' // Check standard unit usage
            });
            if (pltResult.value !== null) {
                setVal('platelet', pltResult.value.toFixed(0));
            }

            // Albumin
            const albResult = await fhirDataService.getObservation(LOINC_CODES.ALBUMIN, {
                trackStaleness: true,
                stalenessLabel: 'Albumin',
                targetUnit: 'g/dL',
                unitType: 'albumin'
            });
            if (albResult.value !== null) {
                setVal('albumin', albResult.value.toFixed(1));
            }

            calculate();
        } catch (e) {
            console.warn('FHIR data fetch failed:', e);
        }
    }
};

export const nafldFibrosisScore = createUnifiedFormulaCalculator(config);
