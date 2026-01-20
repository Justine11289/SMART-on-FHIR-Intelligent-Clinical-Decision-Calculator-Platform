import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula.js';

export const calculateIntraopFluid: SimpleCalculateFn = values => {
    const weightKg = Number(values['ifd-weight']);
    const npoHours = Number(values['ifd-npo']);
    const traumaLevel = Number(values['ifd-trauma']);

    if (
        !weightKg ||
        !npoHours ||
        !traumaLevel ||
        isNaN(weightKg) ||
        isNaN(npoHours) ||
        isNaN(traumaLevel)
    ) {
        return null;
    }

    if (weightKg <= 10) {
        return null; // Weight must be > 10 kg for this calculator
    }

    // 4-2-1 Rule for Maintenance
    // First 10kg: 4ml/kg/hr -> 40ml
    // Second 10kg: 2ml/kg/hr -> 20ml (Total 60ml for 20kg)
    // Remaining: 1ml/kg/hr
    const maintenanceRate =
        weightKg > 20 ? weightKg + 40 : weightKg > 10 ? 40 + (weightKg - 10) * 2 : weightKg * 4;

    const npoDeficit = maintenanceRate * npoHours;
    const traumaLossRate = traumaLevel * weightKg;

    // Hour-by-hour
    // 1st hour: 50% deficit + maint + trauma
    // 2nd hour: 25% deficit + maint + trauma
    // 3rd hour: 25% deficit + maint + trauma
    // 4th+ hour: maint + trauma
    const firstHourFluids = npoDeficit / 2 + maintenanceRate + traumaLossRate;
    const secondHourFluids = npoDeficit / 4 + maintenanceRate + traumaLossRate;
    const thirdHourFluids = npoDeficit / 4 + maintenanceRate + traumaLossRate;
    const fourthHourFluids = maintenanceRate + traumaLossRate;

    const results: FormulaResultItem[] = [
        {
            label: 'Hourly Maintenance Fluid',
            value: maintenanceRate.toFixed(0),
            unit: 'mL/hr'
        },
        {
            label: 'NPO Fluid Deficit',
            value: npoDeficit.toFixed(0),
            unit: 'mL'
        },
        {
            label: '1st Hour Fluids',
            value: firstHourFluids.toFixed(0),
            unit: 'mL/hr',
            interpretation: '50% Deficit + Maint + Trauma'
        },
        {
            label: '2nd Hour Fluids',
            value: secondHourFluids.toFixed(0),
            unit: 'mL/hr',
            interpretation: '25% Deficit + Maint + Trauma'
        },
        {
            label: '3rd Hour Fluids',
            value: thirdHourFluids.toFixed(0),
            unit: 'mL/hr',
            interpretation: '25% Deficit + Maint + Trauma'
        },
        {
            label: '4th Hour & Beyond',
            value: fourthHourFluids.toFixed(0),
            unit: 'mL/hr',
            interpretation: 'Maintenance + Trauma'
        }
    ];

    return results;
};
