/**
 * Endotracheal Tube (ETT) Depth and Tidal Volume Calculator
 *
 * Formulas:
 *   ETT Depth (at lips) = Height (cm) / 10 + 5
 *
 *   IBW (Male) = 50 + 2.3 × (Height in inches - 60)
 *   IBW (Female) = 45.5 + 2.3 × (Height in inches - 60)
 *
 *   Tidal Volume = IBW × 6-8 mL/kg (lung-protective ventilation)
 *
 * Reference:
 * ARDSNet protocol for lung-protective ventilation
 */

import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateETT: SimpleCalculateFn = values => {
    const heightCm = Number(values['ett-height']);
    const gender = values['ett-gender'] as string;

    if (!heightCm || isNaN(heightCm)) {
        return null;
    }

    // ETT Depth Calculation (Height/10 + 5)
    const ettDepth = heightCm / 10 + 5;

    // Ideal Body Weight (IBW) Calculation
    const heightIn = heightCm / 2.54;
    const heightInOver5Ft = Math.max(0, heightIn - 60);

    let ibw: number;
    if (gender === 'male') {
        ibw = 50 + 2.3 * heightInOver5Ft;
    } else {
        ibw = 45.5 + 2.3 * heightInOver5Ft;
    }

    // Tidal Volume Calculation (6-8 mL/kg of IBW)
    const tidalVolumeLow = ibw * 6;
    const tidalVolumeHigh = ibw * 8;

    const results: FormulaResultItem[] = [
        {
            label: 'Estimated ETT Depth (at lips)',
            value: ettDepth.toFixed(1),
            unit: 'cm',
            interpretation: 'Verify with chest X-ray or capnography'
        },
        {
            label: 'Ideal Body Weight (IBW)',
            value: ibw.toFixed(1),
            unit: 'kg'
        },
        {
            label: 'Target Tidal Volume (6-8 mL/kg)',
            value: `${tidalVolumeLow.toFixed(0)} - ${tidalVolumeHigh.toFixed(0)}`,
            unit: 'mL',
            interpretation: 'Lung-protective ventilation range'
        }
    ];

    return results;
};
