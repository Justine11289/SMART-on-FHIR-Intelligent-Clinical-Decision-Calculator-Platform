/**
 * Steroid Conversion Calculator
 *
 * 使用 Conversion Calculator 工廠函數
 * 類固醇劑量等效換算
 */

import { createConversionCalculator } from '../shared/conversion-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

export const steroidConversion = createConversionCalculator({
    id: 'steroid-conversion',
    title: 'Steroid Conversion Calculator',
    description: 'Converts steroid dosages using dosing equivalencies.',

    drugs: [
        { id: 'cortisone', name: 'Cortisone', equivalentDose: 25 },
        { id: 'dexamethasone', name: 'Dexamethasone', equivalentDose: 0.75 },
        { id: 'hydrocortisone', name: 'Hydrocortisone', equivalentDose: 20 },
        { id: 'methylprednisolone', name: 'Methylprednisolone', equivalentDose: 4 },
        { id: 'prednisolone', name: 'Prednisolone', equivalentDose: 5 },
        { id: 'prednisone', name: 'Prednisone', equivalentDose: 5 },
        { id: 'triamcinolone', name: 'Triamcinolone', equivalentDose: 4 }
    ],

    unit: 'mg',

    conversionTable: {
        show: true,
        title: 'Steroid Equivalence Table',
        stickyFirstColumn: true
    },

    additionalInfo: `
        ${uiBuilder.createAlert({
            type: 'info',
            message: `
                <h4>Relative Potency Information</h4>
                ${uiBuilder.createList({
                    items: [
                        '<strong>Highest Potency:</strong> Dexamethasone (0.75 mg)',
                        '<strong>Medium Potency:</strong> Methylprednisolone (4 mg), Triamcinolone (4 mg)',
                        '<strong>Standard Potency:</strong> Prednisolone (5 mg), Prednisone (5 mg)',
                        '<strong>Lower Potency:</strong> Hydrocortisone (20 mg), Cortisone (25 mg)'
                    ]
                })}
                <h4>Clinical Pearls</h4>
                ${uiBuilder.createList({
                    items: [
                        '<strong>Hydrocortisone</strong> has significant mineralocorticoid activity - good for adrenal insufficiency',
                        '<strong>Prednisone</strong> requires hepatic conversion to prednisolone (active form)',
                        '<strong>Dexamethasone</strong> longest half-life (36-54 hrs) - useful once daily dosing'
                    ]
                })}
            `
        })}
    `
});
