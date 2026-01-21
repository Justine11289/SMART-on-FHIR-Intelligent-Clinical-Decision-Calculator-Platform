export function bmiBsaCalculation(values) {
    const weightInput = values['bmi-bsa-weight'];
    const heightInput = values['bmi-bsa-height'];
    if (weightInput === undefined ||
        weightInput === null ||
        weightInput === '' ||
        heightInput === undefined ||
        heightInput === null ||
        heightInput === '') {
        return [];
    }
    const weightKg = Number(weightInput);
    const heightCm = Number(heightInput);
    // SaMD Protocol TC-003: Zero Division / Invalid Input Prevention
    if (isNaN(weightKg) || isNaN(heightCm) || weightKg <= 0 || heightCm <= 0) {
        return [];
    }
    // BMI Calculation: kg / m^2
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    // BSA Calculation (Du Bois): 0.007184 * W^0.425 * H^0.725
    const bsa = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
    // Interpretations
    let interpretation = '';
    let alertClass = 'info';
    if (bmi < 18.5) {
        interpretation = 'Underweight';
        alertClass = 'warning';
    }
    else if (bmi < 25) {
        interpretation = 'Normal weight';
        alertClass = 'success';
    }
    else if (bmi < 30) {
        interpretation = 'Overweight';
        alertClass = 'warning';
    }
    else if (bmi < 35) {
        interpretation = 'Obese (Class I)';
        alertClass = 'danger';
    }
    else if (bmi < 40) {
        interpretation = 'Obese (Class II)';
        alertClass = 'danger';
    }
    else {
        interpretation = 'Obese (Class III)';
        alertClass = 'danger';
    }
    return [
        {
            label: 'Body Mass Index (BMI)',
            value: Number(bmi.toFixed(1)),
            unit: 'kg/m²',
            interpretation: interpretation,
            alertClass: alertClass
        },
        {
            label: 'Body Surface Area (BSA)',
            value: Number(bsa.toFixed(2)),
            unit: 'm²',
            interpretation: 'Du Bois Formula'
        }
    ];
}
