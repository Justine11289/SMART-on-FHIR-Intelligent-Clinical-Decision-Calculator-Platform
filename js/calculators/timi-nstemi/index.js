/**
 * TIMI Risk Score for UA/NSTEMI Calculator
 *
 * 使用 Yes/No Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */
import { createScoringCalculator } from '../shared/scoring-calculator.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { uiBuilder } from '../../ui-builder.js';
import { SNOMED_CODES, RXNORM_CODES } from '../../fhir-codes.js';
export const timiNstemiConfig = {
    inputType: 'yesno',
    id: 'timi-nstemi',
    title: 'TIMI Risk Score for UA/NSTEMI',
    description: 'Estimates mortality for patients with unstable angina and non-ST elevation MI.',
    infoAlert: `
        <h4>📊 Risk Stratification (14-day events)</h4>
        ${uiBuilder.createTable({
        headers: ['Score', 'Risk', 'Event Rate'],
        rows: [
            ['0-2', 'Low', '5-8%'],
            ['3-4', 'Intermediate', '13-20%'],
            ['5-7', 'High', '26-41%']
        ]
    })}
    `,
    questions: [
        {
            id: 'timi-age',
            label: 'Age ≥ 65',
            points: 1,
            description: 'Patient is 65 years or older'
        },
        {
            id: 'timi-cad-risk',
            label: '≥ 3 CAD Risk Factors',
            points: 1,
            description: 'Hypertension, hypercholesterolemia, diabetes, family history of CAD, or current smoker'
        },
        {
            id: 'timi-known-cad',
            label: 'Known CAD (Stenosis ≥ 50%)',
            points: 1,
            description: 'Prior angiogram showing ≥ 50% stenosis'
        },
        {
            id: 'timi-asa',
            label: 'ASA Use in Past 7 Days',
            points: 1,
            description: 'Aspirin use within the last week'
        },
        {
            id: 'timi-angina',
            label: 'Severe Angina (≥ 2 episodes in 24h)',
            points: 1,
            description: 'At least 2 angina episodes in the last 24 hours'
        },
        {
            id: 'timi-ekg',
            label: 'EKG ST Changes ≥ 0.5mm',
            points: 1,
            description: 'ST segment deviation of 0.5mm or more'
        },
        {
            id: 'timi-marker',
            label: 'Positive Cardiac Marker',
            points: 1,
            description: 'Elevated Troponin or CK-MB'
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 2,
            label: 'Low Risk',
            severity: 'success',
            description: '14-Day Event Rate: 5-8%. Conservative management; medical therapy optimization; outpatient follow-up; consider stress testing.'
        },
        {
            minScore: 3,
            maxScore: 4,
            label: 'Intermediate Risk',
            severity: 'warning',
            description: '14-Day Event Rate: 13-20%. Intensive medical therapy; consider early invasive strategy; dual antiplatelet therapy; close monitoring.'
        },
        {
            minScore: 5,
            maxScore: 7,
            label: 'High Risk',
            severity: 'danger',
            description: '14-Day Event Rate: 26-41%. Early invasive strategy; urgent cardiology consultation; aggressive antiplatelet therapy; consider GP IIb/IIIa inhibitors.'
        }
    ],
    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Addition of the selected points:',
        tableHeaders: ['Variable', 'Points'],
        scoringCriteria: [
            { criteria: 'Age ≥65', points: '1' },
            { criteria: '≥3 CAD risk factors*', points: '1' },
            { criteria: 'Known CAD (stenosis ≥50%)', points: '1' },
            { criteria: 'ASA use in past 7 days', points: '1' },
            { criteria: 'Severe angina (≥2 episodes in 24 hrs)', points: '1' },
            { criteria: 'EKG ST changes ≥0.5mm', points: '1' },
            { criteria: 'Positive cardiac marker', points: '1' }
        ],
        footnotes: [
            '*Risk factors for CAD: Family history of CAD, hypertension, hypercholesterolemia, diabetes, or current smoker (thanks to Jeff Geske at Mayo for this update!)'
        ]
    },
    references: [
        'Antman EM, et al. The TIMI risk score for unstable angina/non-ST elevation MI: A method for prognostication and therapeutic decision making. <em>JAMA</em>. 2000;284(7):835-842.'
    ],
    customResultRenderer: (score) => {
        let risk = '';
        let eventRate = '';
        let alertClass = 'success';
        let recommendation = '';
        if (score <= 2) {
            risk = 'Low Risk';
            eventRate = '5-8%';
            alertClass = 'success';
            recommendation =
                'Conservative management; medical therapy optimization; outpatient follow-up; consider stress testing.';
        }
        else if (score <= 4) {
            risk = 'Intermediate Risk';
            eventRate = '13-20%';
            alertClass = 'warning';
            recommendation =
                'Intensive medical therapy; consider early invasive strategy; dual antiplatelet therapy; close monitoring.';
        }
        else {
            risk = 'High Risk';
            eventRate = '26-41%';
            alertClass = 'danger';
            recommendation =
                'Early invasive strategy; urgent cardiology consultation; aggressive antiplatelet therapy; consider GP IIb/IIIa inhibitors.';
        }
        return `
            ${uiBuilder.createResultItem({
            label: 'Total Score',
            value: score.toString(),
            unit: '/ 7 points',
            interpretation: risk,
            alertClass: `ui-alert-${alertClass}`
        })}
            ${uiBuilder.createResultItem({
            label: '14-Day Event Rate',
            value: eventRate,
            unit: '',
            alertClass: `ui-alert-${alertClass}`
        })}
            
            ${uiBuilder.createAlert({
            type: alertClass,
            message: `<strong>Recommendation:</strong> ${recommendation}`
        })}
        `;
    },
    // 使用 customInitialize 處理 FHIR 自動填充
    customInitialize: async (client, patient, container, calculate) => {
        const setYes = (name) => {
            const radio = container.querySelector(`input[name="${name}"][value="1"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
        // 自動填充年齡
        const age = fhirDataService.getPatientAge();
        if (age !== null && age >= 65) {
            setYes('timi-age');
        }
        if (!fhirDataService.isReady()) {
            return;
        }
        try {
            // 檢測已知冠心病
            const hasCAD = await fhirDataService.hasCondition([
                SNOMED_CODES.CORONARY_ARTERY_DISEASE,
                SNOMED_CODES.ISCHEMIC_HEART_DISEASE
            ]);
            if (hasCAD) {
                setYes('timi-known-cad');
            }
            // 檢測 CAD 風險因素
            let riskFactorCount = 0;
            // 高血壓
            const hasHTN = await fhirDataService.hasCondition([SNOMED_CODES.HYPERTENSION]);
            if (hasHTN) {
                riskFactorCount++;
            }
            // 高血脂
            const hasHyperlipidemia = await fhirDataService.hasCondition([
                SNOMED_CODES.HYPERLIPIDEMIA
            ]);
            if (hasHyperlipidemia) {
                riskFactorCount++;
            }
            // 糖尿病
            const hasDM = await fhirDataService.hasCondition([
                SNOMED_CODES.DIABETES_MELLITUS,
                SNOMED_CODES.DIABETES_TYPE_1,
                SNOMED_CODES.DIABETES_TYPE_2
            ]);
            if (hasDM) {
                riskFactorCount++;
            }
            if (riskFactorCount >= 3) {
                setYes('timi-cad-risk');
            }
            // 檢測阿斯匹靈使用
            const onAspirin = await fhirDataService.isOnMedication([RXNORM_CODES.ASPIRIN]);
            if (onAspirin) {
                setYes('timi-asa');
            }
        }
        catch (error) {
            console.warn('Error auto-populating TIMI-NSTEMI:', error);
        }
    }
};
export const timiNstemi = createScoringCalculator(timiNstemiConfig);
