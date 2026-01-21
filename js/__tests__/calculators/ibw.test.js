import { calculateIBW } from '../../calculators/ibw/calculation.js';
describe('IBW Calculator Logic', () => {
    test('Calculate IBW for Male (height > 60 in)', () => {
        const values = {
            'ibw-gender': 'male',
            'ibw-height': 177.8, // 70 inches
            'ibw-actual': 70
        };
        const results = calculateIBW(values);
        // IBW = 50 + 2.3 * (70 - 60) = 50 + 23 = 73 kg
        expect(results).not.toBeNull();
        expect(results[0].value).toBe('73.0');
        expect(results[0].unit).toBe('kg');
        // Actual weight 70 < IBW 73 -> alert about underweight
        const alert = results.find(r => r.label === '__ALERT__');
        expect(alert).toBeDefined();
        expect(alert.alertClass).toBe('warning');
        expect(alert.value).toContain('below IBW');
    });
    test('Calculate IBW for Female (height > 60 in)', () => {
        const values = {
            'ibw-gender': 'female',
            'ibw-height': 162.56, // 64 inches
            'ibw-actual': 55
        };
        const results = calculateIBW(values);
        // IBW = 45.5 + 2.3 * (64 - 60) = 45.5 + 9.2 = 54.7 kg
        expect(results).not.toBeNull();
        expect(results[0].value).toBe('54.7');
        // Actual weight 55 > IBW 54.7 -> Adjusted BW (ABW)
        const abw = results.find(r => r.label === 'Adjusted Body Weight (ABW)');
        expect(abw).toBeDefined();
        // ABW = 54.7 + 0.4 * (55 - 54.7) = 54.7 + 0.12 = 54.82 -> 54.8
        expect(abw.value).toBe('54.8');
    });
    test('Obese patient alert and ABW', () => {
        const values = {
            'ibw-gender': 'male',
            'ibw-height': 177.8, // 70 inches
            'ibw-actual': 100
        };
        const results = calculateIBW(values);
        // IBW = 73 kg
        // ABW = 73 + 0.4 * (100 - 73) = 73 + 10.8 = 83.8 kg
        const abw = results.find(r => r.label === 'Adjusted Body Weight (ABW)');
        expect(abw.value).toBe('83.8');
        const alert = results.find(r => r.label === '__ALERT__');
        expect(alert.alertClass).toBe('info');
        expect(alert.value).toContain('above IBW');
    });
    test('Height <= 60 inches (5 feet)', () => {
        const values = {
            'ibw-gender': 'male',
            'ibw-height': 152.4, // 60 inches
            'ibw-actual': 60
        };
        const results = calculateIBW(values);
        // IBW = base 50 kg
        expect(results[0].value).toBe('50.0');
    });
    test('Missing height returns null', () => {
        const values = {
            'ibw-gender': 'male',
            'ibw-actual': 70
        };
        expect(calculateIBW(values)).toBeNull();
    });
});
