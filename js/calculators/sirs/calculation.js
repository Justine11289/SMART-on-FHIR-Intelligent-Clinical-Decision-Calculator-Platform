export function sirsCalculation(values) {
    const tempInput = values['temp'];
    const hrInput = values['hr'];
    // RR or PaCO2
    const rrInput = values['rr'];
    const paco2Input = values['paco2'];
    // WBC or Bands
    const wbcInput = values['wbc'];
    const bandsInput = values['bands'];
    const infectionInput = values['infection'];
    const hypotensionInput = values['hypotension'];
    if (tempInput === undefined ||
        hrInput === undefined ||
        (rrInput === undefined && paco2Input === undefined) ||
        (wbcInput === undefined && bandsInput === undefined)) {
        return [];
    }
    const temp = Number(tempInput);
    const hr = Number(hrInput);
    const rr = rrInput ? Number(rrInput) : null;
    const paco2 = paco2Input ? Number(paco2Input) : null;
    const wbc = wbcInput ? Number(wbcInput) : null;
    const bands = bandsInput ? Number(bandsInput) : null;
    if (isNaN(temp) || isNaN(hr))
        return [];
    if (rr !== null && isNaN(rr))
        return [];
    if (paco2 !== null && isNaN(paco2))
        return [];
    if (wbc !== null && isNaN(wbc))
        return [];
    if (bands !== null && isNaN(bands))
        return [];
    let criteriaMet = 0;
    const metDetails = [];
    // 1. Temperature > 38°C or < 36°C
    if (temp > 38 || temp < 36) {
        criteriaMet++;
        metDetails.push('Abnormal Temperature');
    }
    // 2. Heart Rate > 90 bpm
    if (hr > 90) {
        criteriaMet++;
        metDetails.push('Tachycardia (>90 bpm)');
    }
    // 3. RR > 20 or PaCO2 < 32 mmHg
    if ((rr !== null && rr > 20) || (paco2 !== null && paco2 < 32)) {
        criteriaMet++;
        metDetails.push('Tachypnea or Hypocapnia');
    }
    // 4. WBC > 12000 or < 4000 or > 10% Bands
    const leukocytosis = wbc !== null && wbc > 12; // assuming K/uL inputs
    const leukopenia = wbc !== null && wbc < 4;
    const bandemia = bands !== null && bands > 10;
    if (leukocytosis || leukopenia || bandemia) {
        criteriaMet++;
        metDetails.push('Abnormal WBC Count or Bandemia');
    }
    const hasInfection = infectionInput === 'yes';
    const hasHypotension = hypotensionInput === 'yes';
    let diagnosis = 'Normal';
    let alertClass = 'success';
    let description = 'SIRS criteria not met (< 2 criteria).';
    let recommendations = 'Continue routine monitoring.';
    if (criteriaMet >= 2) {
        if (hasInfection) {
            if (hasHypotension) {
                diagnosis = 'Septic Shock';
                description = 'Sepsis with persistent hypotension.';
                alertClass = 'danger';
                recommendations = 'Urgent ICU admission; Vasopressor support; Aggressive fluids.';
            }
            else {
                diagnosis = 'Sepsis';
                description = 'SIRS with confirmed/suspected infection.';
                alertClass = 'danger';
                recommendations = 'Immediate antibiotics; Source control; Fluid resuscitation.';
            }
        }
        else {
            diagnosis = 'SIRS';
            description = 'Systemic Inflammatory Response Syndrome.';
            alertClass = 'warning';
            recommendations = 'Investigate cause; Enhanced monitoring.';
        }
    }
    return [
        {
            label: 'Diagnosis',
            value: 0, // Placeholder numeric
            unit: '',
            interpretation: diagnosis,
            alertClass: alertClass,
            alertPayload: {
                criteriaCount: criteriaMet,
                metDetails,
                description,
                recommendations
            }
        }
    ];
}
