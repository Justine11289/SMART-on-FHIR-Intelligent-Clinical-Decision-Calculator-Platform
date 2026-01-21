import { calculateMAP } from '../../calculators/map/calculation.js';
describe('MAP Calculator', () => {
    describe('Calculation Logic', () => {
        // Formula: (SBP + 2 * DBP) / 3
        test('Normal Range: 120/80', () => {
            const input = {
                'map-sbp': 120,
                'map-dbp': 80
            };
            const result = calculateMAP(input);
            expect(result).not.toBeNull();
            if (result) {
                // (120 + 160) / 3 = 93.333
                expect(result[0].value).toBe('93.3');
                expect(result[0].interpretation).toBe('Normal');
            }
        });
        test('Low Range: 90/50', () => {
            const input = {
                'map-sbp': 90,
                'map-dbp': 50
            };
            const result = calculateMAP(input);
            // (90 + 100) / 3 = 63.333
            expect(result[0].value).toBe('63.3');
            expect(result[0].interpretation).toBe('Below Normal');
        });
        test('Critically Low: 80/40', () => {
            const input = {
                'map-sbp': 80,
                'map-dbp': 40
            };
            const result = calculateMAP(input);
            // (80 + 80) / 3 = 53.333
            expect(result[0].value).toBe('53.3');
            expect(result[0].interpretation).toBe('Critically Low (Shock Risk)');
        });
        test('High Range: 160/90', () => {
            const input = {
                'map-sbp': 160,
                'map-dbp': 90
            };
            const result = calculateMAP(input);
            // (160 + 180) / 3 = 113.333
            expect(result[0].value).toBe('113.3');
            expect(result[0].interpretation).toBe('Elevated (Hypertension)');
        });
        test('Invalid Input: SBP <= DBP', () => {
            const input = {
                'map-sbp': 80,
                'map-dbp': 80
            };
            expect(calculateMAP(input)).toBeNull();
            const input2 = {
                'map-sbp': 70,
                'map-dbp': 80
            };
            expect(calculateMAP(input2)).toBeNull();
        });
        test('Missing inputs should return null', () => {
            const input = {
                'map-sbp': 120
            };
            expect(calculateMAP(input)).toBeNull();
        });
    });
    /*
    describe('Calculator Configuration', () => {
        test('Should use correct ValidationTypes', () => {
            const sbpInput = mapConfig.inputs!.find((f: any) => f.id === 'map-sbp');
            const dbpInput = mapConfig.inputs!.find((f: any) => f.id === 'map-dbp');
            
            expect(sbpInput).toBeDefined();
            expect(dbpInput).toBeDefined();
            
            expect(sbpInput.validationType).toBe('systolicBP');
            expect(dbpInput.validationType).toBe('diastolicBP');
        });

        test('Should use correct LOINC Codes', () => {
            const sbpInput = mapConfig.inputs!.find((f: any) => f.id === 'map-sbp');
            const dbpInput = mapConfig.inputs!.find((f: any) => f.id === 'map-dbp');
            
            expect(sbpInput.loincCode).toBe('8480-6');
            expect(dbpInput.loincCode).toBe('8462-4');
        });
    });
    */
});
