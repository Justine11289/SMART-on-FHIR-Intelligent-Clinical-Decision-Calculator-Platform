export const calculateIBW = values => {
    const heightCm = Number(values['ibw-height']);
    const actualWeight = Number(values['ibw-actual']);
    const gender = values['ibw-gender'];
    if (!heightCm || isNaN(heightCm))
        return null;
    const heightIn = heightCm / 2.54;
    const isMale = gender === 'male';
    let ibw = 0;
    if (heightIn > 60) {
        ibw = isMale ? 50 + 2.3 * (heightIn - 60) : 45.5 + 2.3 * (heightIn - 60);
    }
    else {
        // For height <= 5 feet, base weight is used
        ibw = isMale ? 50 : 45.5;
    }
    if (ibw <= 0)
        return null;
    const results = [
        {
            label: 'Ideal Body Weight (IBW)',
            value: ibw.toFixed(1),
            unit: 'kg'
        }
    ];
    if (actualWeight && actualWeight > 0) {
        let alertType = 'info';
        let alertMsg = '';
        if (actualWeight > ibw) {
            const adjBw = ibw + 0.4 * (actualWeight - ibw);
            const percentOver = (((actualWeight - ibw) / ibw) * 100).toFixed(0);
            results.push({
                label: 'Adjusted Body Weight (ABW)',
                value: adjBw.toFixed(1),
                unit: 'kg'
            });
            alertType = 'info';
            alertMsg = `Actual weight is ${percentOver}% above IBW. Use ABW for drug dosing in obese patients.`;
        }
        else if (actualWeight < ibw) {
            const percentUnder = (((ibw - actualWeight) / ibw) * 100).toFixed(0);
            alertType = 'warning';
            alertMsg = `Actual weight is ${percentUnder}% below IBW. Use actual body weight for drug dosing.`;
        }
        else {
            alertType = 'success';
            alertMsg = 'Actual weight is at ideal body weight. Use IBW for drug dosing.';
        }
        results.push({
            label: '__ALERT__',
            value: alertMsg,
            alertClass: alertType
        });
    }
    return results;
};
