/**
 * tPA (Alteplase) Dosing Calculator for Ischemic Stroke
 *
 * Formula:
 *   Total Dose = 0.9 mg/kg (Maximum 90 mg)
 *   Bolus Dose = 10% of total dose (over 1 minute)
 *   Infusion Dose = 90% of total dose (over 60 minutes)
 *
 * Note: If weight > 100 kg, max total dose is 90 mg
 *
 * Reference:
 * NINDS rt-PA Stroke Study Group. N Engl J Med. 1995;333(24):1581-1587.
 */
export const calculateTpaDosing = values => {
    const weight = Number(values['tpa-weight']);
    if (!weight || isNaN(weight) || weight <= 0) {
        return null;
    }
    // If weight > 100 kg, cap at 100 kg (max dose 90 mg)
    const effectiveWeight = weight > 100 ? 100 : weight;
    const totalDose = effectiveWeight * 0.9;
    const bolusDose = totalDose * 0.1;
    const infusionDose = totalDose * 0.9;
    const isCapped = weight > 100;
    const results = [
        {
            label: 'Total Dose',
            value: totalDose.toFixed(2),
            unit: 'mg',
            interpretation: isCapped ? '(Capped at 90 mg max)' : '',
            alertClass: isCapped ? 'warning' : 'info'
        },
        {
            label: 'Bolus Dose (10%)',
            value: bolusDose.toFixed(2),
            unit: 'mg',
            interpretation: 'Give over 1 minute'
        },
        {
            label: 'Infusion Dose (90%)',
            value: infusionDose.toFixed(2),
            unit: 'mg',
            interpretation: 'Infuse over 60 minutes'
        }
    ];
    return results;
};
