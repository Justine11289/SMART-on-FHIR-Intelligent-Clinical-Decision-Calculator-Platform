import { SimpleCalculateFn } from '../../types/calculator-formula.js';

export const calculateMaintenanceFluids: SimpleCalculateFn = values => {
    const weightKg = Number(values['weight-fluids']);

    if (!weightKg || weightKg <= 0) return null;

    let hourlyRate = 0;

    // Holliday-Segar Method
    if (weightKg <= 10) {
        // 4 mL/kg/hr for first 10kg
        hourlyRate = weightKg * 4;
    } else if (weightKg <= 20) {
        // 40 mL/hr for first 10kg + 2 mL/kg/hr for next 10kg
        hourlyRate = 10 * 4 + (weightKg - 10) * 2;
    } else {
        // 60 mL/hr for first 20kg + 1 mL/kg/hr for each kg > 20
        hourlyRate = 10 * 4 + 10 * 2 + (weightKg - 20) * 1;
    }

    const dailyRate = hourlyRate * 24;

    return [
        {
            label: 'IV Fluid Rate (Hourly)',
            value: hourlyRate.toFixed(1),
            unit: 'mL/hr'
        },
        {
            label: 'Total Daily Fluids',
            value: dailyRate.toFixed(1),
            unit: 'mL/day'
        }
    ];
};
