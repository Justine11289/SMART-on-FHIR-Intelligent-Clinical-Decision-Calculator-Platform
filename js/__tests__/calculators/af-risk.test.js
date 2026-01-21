/**
 * AF Risk Calculator Tests
 * Tests CHA2DS2-VASc and HAS-BLED combined logic
 */
import { describe, expect, test } from '@jest/globals';
import { afRiskConfig } from '../../calculators/af-risk/index.js';
import { calculateScoringResult } from '../../test-utils/scoring-test-utils.js';
describe('AF Risk Calculator', () => {
    // ==========================================
    // TC-001: Verification of Config Structure
    // ==========================================
    test('Config should have correct structure', () => {
        expect(afRiskConfig.id).toBe('af-risk');
        // Combined sections count
        expect(afRiskConfig.sections?.length).toBeGreaterThan(15);
    });
    // ==========================================
    // TC-002: Combined Score Calculation in Custom Renderer
    // ==========================================
    // Since this calculator uses customResultRenderer to derive two separate scores (CHA2DS2-VASc and HAS-BLED)
    // We will verify the logic by invoking customResultRenderer or manually verifying the logic mirrored here.
    // The safest way is to check the output of customResultRenderer if possible, or verify the inputs map correctly.
    test('CHA2DS2-VASc Logic Verification', () => {
        // Case: Congestive Heart Failure (+1)
        const resCHF = calculateScoringResult(afRiskConfig, { chf: '1' });
        expect(resCHF.sectionScores['chf']).toBe(1);
        // Case: Age >= 75 (+2)
        const resAge75 = calculateScoringResult(afRiskConfig, { age75: '2' });
        expect(resAge75.sectionScores['age75']).toBe(2);
        // Case: Stroke (+2)
        const resStroke = calculateScoringResult(afRiskConfig, { stroke: '2' });
        expect(resStroke.sectionScores['stroke']).toBe(2);
    });
    test('HAS-BLED Logic Verification', () => {
        // Case: Hypertension (+1)
        const resHtn = calculateScoringResult(afRiskConfig, { 'hasbled-htn': '1' });
        expect(resHtn.sectionScores['hasbled-htn']).toBe(1);
    });
    test('Custom Renderer Logic Check', () => {
        // We will manually test the logic defined in customResultRenderer
        // Logic:
        // strokeRiskScore = sum(CHA2DS2-VASc factors)
        // Age double counting check: if age75 and age65 both selected, subtract 1
        // strokeRiskScoreForOAC = female ? score - 1 : score
        const renderer = afRiskConfig.customResultRenderer;
        // Mock score input (total score doesn't matter much here, sectionScores do)
        // Scenario 1: Male, Age 70, HTN
        // Age 65-74 (+1), HTN (+1) => Score 2
        // OAC recommended
        const sectionScores1 = {
            age65: 1,
            htn: 1,
            female: 0
        };
        const output1 = renderer(2, sectionScores1);
        expect(output1).toContain('CHA₂DS₂-VASc Score (Stroke Risk)');
        // Expect the recommendation text
        expect(output1).toContain('Oral anticoagulation is recommended');
        // Scenario 2: Female, Age 70, HTN
        // Female (1), Age 65 (1), HTN (1) -> Score 3
        // Adjusted for OAC: 3 - 1 = 2 => Recommended
        const sectionScores2 = {
            age65: 1,
            htn: 1,
            female: 1
        };
        const output2 = renderer(3, sectionScores2);
        expect(output2).toContain('Oral anticoagulation is recommended');
        // Scenario 3: Female, Low Risk
        // Female (+1) => Score 1
        // Adjusted: 0 => Omitted
        const sectionScores3 = {
            female: 1
        };
        const output3 = renderer(1, sectionScores3);
        expect(output3).toContain('Antithrombotic therapy may be omitted');
        // Scenario 4: HAS-BLED High Risk
        // HTN (+1), Stroke (+1), Elderly (+1) => 3
        const sectionScores4 = {
            'hasbled-htn': 1,
            'hasbled-stroke': 1,
            'hasbled-elderly': 1
        };
        const output4 = renderer(3, sectionScores4);
        expect(output4).toContain('HAS-BLED Score (Bleeding Risk)');
        expect(output4).toContain('High Bleeding Risk');
    });
});
