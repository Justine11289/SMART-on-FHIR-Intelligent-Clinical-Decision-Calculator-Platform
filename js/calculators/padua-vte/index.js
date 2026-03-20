/**
 * Padua Prediction Score for Risk of VTE Calculator
 *
 * 使用 Yes/No Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */
import { createScoringCalculator } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
export const paduaVTE = createScoringCalculator({
    inputType: 'yesno',
    id: 'padua-vte',
    title: 'Padua Prediction Score for Risk of VTE',
    description: 'Determines anticoagulation need in hospitalized patients by risk of VTE.',
    sectionTitle: 'Risk Factors',
    sectionIcon: '🩸',
    questions: [
        { id: 'padua-cancer', label: 'Active cancer', points: 3 },
        {
            id: 'padua-prev-vte',
            label: 'Previous VTE (excluding superficial vein thrombosis)',
            points: 3
        },
        {
            id: 'padua-mobility',
            label: 'Reduced mobility (bedrest with bathroom privileges for ≥3 days)',
            points: 3
        },
        { id: 'padua-thromb', label: 'Known thrombophilic condition', points: 3 },
        { id: 'padua-trauma', label: 'Recent (≤1 month) trauma and/or surgery', points: 2 },
        { id: 'padua-age', label: 'Age ≥70 years', points: 1 },
        { id: 'padua-heart-resp', label: 'Heart and/or respiratory failure', points: 1 },
        { id: 'padua-mi-stroke', label: 'Acute MI or ischemic stroke', points: 1 },
        {
            id: 'padua-infection',
            label: 'Acute infection and/or rheumatologic disorder',
            points: 1
        },
        { id: 'padua-obesity', label: 'Obesity (BMI ≥30 kg/m²)', points: 1 },
        { id: 'padua-hormonal', label: 'Ongoing hormonal treatment', points: 1 }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 3,
            label: 'Low Risk for VTE',
            severity: 'success',
            recommendation: 'Pharmacologic prophylaxis may not be necessary.'
        },
        {
            minScore: 4,
            maxScore: 999,
            label: 'High Risk for VTE',
            severity: 'danger',
            recommendation: 'Pharmacologic prophylaxis is recommended.'
        }
    ],
    formulaSection: {
        show: true,
        title: 'FACTS & FIGURES',
        calculationNote: 'Score interpretation:',
        footnotes: [
            '<strong>Padua Score ≥4 points</strong> – Pharmacologic prophylaxis is indicated. If high risk of bleeding, use mechanical prophylaxis.',
            '<strong>Padua Score <4 points</strong> – Pharmacologic prophylaxis is <em>not</em> indicated, consider using mechanical prophylaxis.'
        ]
    },
    // 使用 customInitialize 處理年齡和 BMI 自動填充
    customInitialize: async (client, patient, container, calculate) => {
        const setRadioValue = (name, value) => {
            const radio = container.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
        // 自動填充年齡
        const age = fhirDataService.getPatientAge();
        if (age !== null && age >= 70) {
            setRadioValue('padua-age', '1');
        }
        if (!fhirDataService.isReady()) {
            return;
        }
        const stalenessTracker = fhirDataService.getStalenessTracker();
        try {
            // 自動填充 BMI
            const bmiResult = await fhirDataService.getObservation(LOINC_CODES.BMI, {
                trackStaleness: true,
                stalenessLabel: 'BMI'
            });
            if (bmiResult.value !== null && bmiResult.value >= 30) {
                setRadioValue('padua-obesity', '1');
                if (stalenessTracker && bmiResult.observation) {
                    stalenessTracker.trackObservation('input[name="padua-obesity"]', bmiResult.observation, LOINC_CODES.BMI, 'BMI ≥ 30');
                }
            }
            // 自動檢測相關病史
            const conditionsToCheck = [
                { codes: ['363346000'], inputName: 'padua-cancer' }, // Cancer
                { codes: ['111293003'], inputName: 'padua-prev-vte' }, // VTE
                { codes: ['234467004'], inputName: 'padua-thromb' }, // Thrombophilia
                { codes: ['84114007'], inputName: 'padua-heart-resp' }, // Heart failure
                { codes: ['22298006'], inputName: 'padua-mi-stroke' } // MI
            ];
            for (const condition of conditionsToCheck) {
                const hasCondition = await fhirDataService.hasCondition(condition.codes);
                if (hasCondition) {
                    setRadioValue(condition.inputName, '1');
                }
            }
        }
        catch (error) {
            console.warn('Error auto-populating Padua VTE:', error);
        }
    }
});
