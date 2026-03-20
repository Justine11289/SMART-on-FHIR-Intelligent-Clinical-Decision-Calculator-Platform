export const calculateMAP = values => {
    const sbp = Number(values['map-sbp']);
    const dbp = Number(values['map-dbp']);
    if (!sbp || !dbp)
        return null;
    // Logic check: SBP must be greater than DBP
    if (sbp <= dbp)
        return null;
    // MAP = (SBP + 2 * DBP) / 3
    const map = (sbp + 2 * dbp) / 3;
    let interpretation = '';
    let alertClass = 'info';
    if (map < 60) {
        interpretation = 'Critically Low (Shock Risk)';
        alertClass = 'danger';
    }
    else if (map < 70) {
        interpretation = 'Below Normal';
        alertClass = 'warning';
    }
    else if (map <= 100) {
        interpretation = 'Normal';
        alertClass = 'success';
    }
    else {
        interpretation = 'Elevated (Hypertension)';
        alertClass = 'danger';
    }
    return [
        {
            label: 'Mean Arterial Pressure',
            value: map.toFixed(1),
            unit: 'mmHg',
            interpretation: interpretation,
            alertClass: alertClass
        }
    ];
};
