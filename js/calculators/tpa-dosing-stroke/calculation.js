/**
 * tPA Dosing for Acute Stroke Calculator
 *
 * Formula:
 *   Total Dose = 0.9 mg/kg (Maximum 90 mg)
 *   Bolus Dose = 10% of total dose (over 1 minute)
 *   Infusion Dose = 90% of total dose (over 60 minutes)
 *
 * Eligibility:
 *   Time from symptom onset ≤ 4.5 hours for IV tPA
 *
 * Reference:
 * NINDS rt-PA Stroke Study Group. N Engl J Med. 1995;333(24):1581-1587.
 */
export const calculateTpaDosingStroke = values => {
    const weight = Number(values['tpa-stroke-weight']);
    const onset = values['tpa-stroke-onset'] !== undefined ? Number(values['tpa-stroke-onset']) : null;
    if (!weight || isNaN(weight) || weight <= 0) {
        return null;
    }
    // Dosing Logic - cap at 100 kg for max 90 mg dose
    const effectiveWeight = weight > 100 ? 100 : weight;
    const totalDose = effectiveWeight * 0.9;
    const bolusDose = totalDose * 0.1;
    const infusionDose = totalDose * 0.9;
    const infusionRate = infusionDose; // mg/hour (since it's over 60 mins)
    const isCapped = weight > 100;
    // Eligibility Logic
    let eligibilityStatus = 'unknown';
    if (onset !== null && !isNaN(onset)) {
        eligibilityStatus = onset <= 4.5 ? 'eligible' : 'ineligible';
    }
    const results = [
        {
            label: 'Eligibility Status',
            value: eligibilityStatus,
            unit: '',
            alertClass: eligibilityStatus === 'eligible'
                ? 'success'
                : eligibilityStatus === 'ineligible'
                    ? 'danger'
                    : 'warning',
            eligibilityStatus
        },
        {
            label: 'Total Dose',
            value: totalDose.toFixed(1),
            unit: 'mg',
            interpretation: isCapped ? '0.9 mg/kg, max 90 mg (Capped)' : '0.9 mg/kg, max 90 mg',
            alertClass: isCapped ? 'warning' : 'info'
        },
        {
            label: 'Step 1: IV Bolus',
            value: bolusDose.toFixed(1),
            unit: 'mg',
            interpretation: 'IV push over 1 minute'
        },
        {
            label: 'Step 2: Continuous Infusion',
            value: infusionDose.toFixed(1),
            unit: 'mg',
            interpretation: `Rate: ${infusionRate.toFixed(1)} mg/hr over 60 minutes`
        }
    ];
    return results;
};
