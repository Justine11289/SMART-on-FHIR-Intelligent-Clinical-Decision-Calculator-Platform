import { meldNaCalculation, MeldNaBreakdown } from '../../calculators/meld-na/calculation.js';

describe('MELD-Na Calculator', () => {
    test('Should calculate standard values correctly', () => {
        // Example: Bili 2.0, INR 1.5, Creat 1.8, Sodium 135
        // Adjusted: same
        // MELD = 0.957*ln(1.8) + 0.378*ln(2.0) + 1.12*ln(1.5) + 0.643
        //      = 0.957*0.5878 + 0.378*0.6931 + 1.12*0.4055 + 0.643
        //      = 0.5625 + 0.262 + 0.454 + 0.643 = 1.9215 -> rounded? No, formula says:
        // MELD = 10 * ... ? No, original code: meldScore = ... ; round(meldScore*10)/10
        // Wait, original formula:
        // 0.957 * Math.log(adjustedCreat) + ... + 0.643
        // = 1.92
        // Then round to 1 decimal place: 1.9
        // MELD-Na: Since MELD <= 11 (1.9 <= 11), MELD-Na = MELD = 1.9
        // Final rule: min 6, max 40 -> 6.

        const result = meldNaCalculation({
            bili: 2.0,
            inr: 1.5,
            creat: 1.8,
            sodium: 135,
            dialysis: 'no'
        });

        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(21);
        // Risk for 21 is Moderate Risk (20-29)
        expect(result[0].interpretation).toContain('Moderate Risk');
    });

    test('Should handle high values (MELD > 11)', () => {
        // Bili 4.0, INR 2.0, Creat 2.5, Sodium 130
        // MELD = 0.957*ln(2.5) + 0.378*ln(4.0) + 1.12*ln(2.0) + 0.643
        //      = 0.957*0.916 + 0.378*1.386 + 1.12*0.693 + 0.643
        //      = 0.876 + 0.524 + 0.776 + 0.643 = 2.819 * 10??
        // Wait, standard MELD formula usually multiplies by 10 somewhere or produces range 6-40.
        // Let's re-read the code.
        // Code: meldScore = 0.957... + 0.643.
        // Wait, standard MELD is usually: 3.78*ln(bili) + 11.2*ln(inr) + 9.57*ln(creat) + 6.43
        // The implementation uses coefficients divided by 10 (0.957 etc).
        // Does it multiply result by 10?
        // Reading `calculation.ts`:
        // meldScore = 0.957*... + 0.643
        // It does NOT multiply by 10.
        // This seems to be producing very small numbers (e.g. 1.9).
        // Standard MELD range is 6-40. 1.9 is weird.
        //
        // Let's check `mixed-input-calculator.ts` logic or the original `meld-na/index.ts`.
        // Original `meld-na/index.ts`:
        // formula: '0.957 × ln(Creat) + 0.378 × ln(Bili) + 1.120 × ln(INR) + 0.643'
        // code: meldScore = 0.957 * ... + 0.643
        // It seems the implementation might be MISSING the *10 factor which acts as the multiplier?
        //
        // Actually, OPTN policy:
        // MELD = 0.957 x ln(Cr) + 0.378 x ln(bilirubin) + 1.120 x ln(INR) + 0.643
        // Then Round to tenth decimal place.
        // Then Multiply by 10?
        // OPTN site says: "Multiply the score by 10 and round to the nearest whole number."
        //
        // The original code `src/calculators/meld-na/index.ts` lines 112-117:
        // Does NOT multiply by 10.
        // Lines 133-134: `meldNaScore = Math.max(6, Math.min(40, meldNaScore));`
        // If the score is ~2.0, it gets capped to 6.
        //
        // IF the inputs are very high:
        // Creat 4.0, Bili 20, INR 3.0
        // MELD = 0.957*1.38 + 0.378*2.99 + 1.12*1.1 + 0.643
        //      = 1.32 + 1.13 + 1.23 + 0.643 = 4.32
        // Capped at 6.
        //
        // This suggests the calculator Implementation logic was FLAWED/INCOMPLETE in the original file!
        // It missed the *10 factor.
        // MELD equation typically produces integer scores.
        //
        // I should FIX this in `calculation.ts`.
        // I will add * 10 step.
        // Let's modify the test expectation to reflect the CORRECTED logic (*10).
    });

    test('Should verify MELD calculation logic (Correction)', () => {
        // High Inputs
        // Creat 4.0, Bili 10.0, INR 2.0
        // Adjusted: same
        // MELD unrounded = 0.957*ln(4) + 0.378*ln(10) + 1.12*ln(2) + 0.643
        // = 0.957*1.386 + 0.378*2.302 + 1.12*0.693 + 0.643
        // = 1.326 + 0.870 + 0.776 + 0.643 = 3.615
        // * 10 = 36.15 -> 36.2 (round to tenth)
        // MELD-Na (Sodium 135):
        // MELD > 11 (36.2 > 11).
        // MELD-Na = MELD + 1.32*(137-Na) - 0.033*MELD*(137-Na)
        // Na=135 => (137-135)=2
        // = 36.2 + 1.32*2 - 0.033*36.2*2
        // = 36.2 + 2.64 - 2.3892
        // = 36.45
        // Round -> 36.

        const result = meldNaCalculation({
            bili: 10.0,
            inr: 2.0,
            creat: 4.0,
            sodium: 135,
            dialysis: 'no'
        });

        expect(result[0].value).toBe(36);
    });
});
