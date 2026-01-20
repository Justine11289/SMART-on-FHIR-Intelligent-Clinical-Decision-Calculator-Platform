/**
 * SOFA Score for Sepsis Organ Failure Calculator
 *
 * 使用 Radio Score Calculator 工廠函數
 * 已整合 FHIRDataService 進行自動填充
 */

import { createScoringCalculator, ScoringCalculatorConfig } from '../shared/scoring-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { UnitConverter } from '../../unit-converter.js';
import { uiBuilder } from '../../ui-builder.js';

export const sofaConfig: ScoringCalculatorConfig = {
    id: 'sofa',
    title: 'SOFA Score for Sepsis Organ Failure',
    description:
        'Sequential Organ Failure Assessment (SOFA) Score predicts ICU mortality based on lab results and clinical data.',
    infoAlert: `
        <h4>📊 Current Lab Values</h4>
        <div class="lab-values-grid">
            <div class="lab-value-item"><div class="lab-label">Platelets</div><div class="lab-value" id="current-platelets">Loading...</div></div>
            <div class="lab-value-item"><div class="lab-label">Creatinine</div><div class="lab-value" id="current-creatinine">Loading...</div></div>
            <div class="lab-value-item"><div class="lab-label">Bilirubin</div><div class="lab-value" id="current-bilirubin">Loading...</div></div>
            <div class="lab-value-item"><div class="lab-label">PaO₂/FiO₂</div><div class="lab-value" id="current-pao2fio2">Manual entry</div></div>
        </div>
    `,
    sections: [
        {
            id: 'resp',
            title: 'Respiration - PaO₂/FiO₂ Ratio',
            subtitle: 'Mechanical ventilation or CPAP required for scores 3-4',
            options: [
                { value: '0', label: '≥400 (0)', checked: true },
                { value: '1', label: '<400 (+1)' },
                { value: '2', label: '<300 (+2)' },
                { value: '3', label: '<200 with respiratory support (+3)' },
                { value: '4', label: '<100 with respiratory support (+4)' }
            ]
        },
        {
            id: 'coag',
            title: 'Coagulation - Platelets',
            subtitle: 'Normal platelet count: 150-450 ×10³/μL',
            options: [
                { value: '0', label: '≥150 ×10³/μL (0)', checked: true },
                { value: '1', label: '<150 ×10³/μL (+1)' },
                { value: '2', label: '<100 ×10³/μL (+2)' },
                { value: '3', label: '<50 ×10³/μL (+3)' },
                { value: '4', label: '<20 ×10³/μL (+4)' }
            ]
        },
        {
            id: 'liver',
            title: 'Liver - Bilirubin',
            subtitle: 'Normal bilirubin: 0.2-1.2 mg/dL',
            options: [
                { value: '0', label: '<1.2 mg/dL (0)', checked: true },
                { value: '1', label: '1.2-1.9 mg/dL (+1)' },
                { value: '2', label: '2.0-5.9 mg/dL (+2)' },
                { value: '3', label: '6.0-11.9 mg/dL (+3)' },
                { value: '4', label: '≥12.0 mg/dL (+4)' }
            ]
        },
        {
            id: 'cardio',
            title: 'Cardiovascular - Hypotension & Vasopressors',
            subtitle: 'Vasopressor doses in μg/kg/min',
            options: [
                { value: '0', label: 'No hypotension (0)', checked: true },
                { value: '1', label: 'MAP <70 mmHg (+1)' },
                { value: '2', label: 'Dopamine ≤5 or Dobutamine (any) (+2)' },
                { value: '3', label: 'Dopamine >5 or Epi/NE ≤0.1 (+3)' },
                { value: '4', label: 'Dopamine >15 or Epi/NE >0.1 (+4)' }
            ]
        },
        {
            id: 'cns',
            title: 'Central Nervous System - GCS',
            subtitle: 'Normal GCS: 15 (Eye 4 + Verbal 5 + Motor 6)',
            options: [
                { value: '0', label: 'GCS 15 (0)', checked: true },
                { value: '1', label: 'GCS 13-14 (+1)' },
                { value: '2', label: 'GCS 10-12 (+2)' },
                { value: '3', label: 'GCS 6-9 (+3)' },
                { value: '4', label: 'GCS <6 (+4)' }
            ]
        },
        {
            id: 'renal',
            title: 'Renal - Creatinine / Urine Output',
            subtitle: 'Normal creatinine: 0.6-1.2 mg/dL',
            options: [
                { value: '0', label: '<1.2 mg/dL (0)', checked: true },
                { value: '1', label: '1.2-1.9 mg/dL (+1)' },
                { value: '2', label: '2.0-3.4 mg/dL (+2)' },
                { value: '3', label: '3.5-4.9 mg/dL or UO <500 mL/day (+3)' },
                { value: '4', label: '≥5.0 mg/dL or UO <200 mL/day (+4)' }
            ]
        }
    ],
    riskLevels: [
        {
            minScore: 0,
            maxScore: 6,
            label: 'Low Risk',
            severity: 'success',
            description: 'ICU Mortality: ~10%'
        },
        {
            minScore: 7,
            maxScore: 9,
            label: 'Moderate Risk',
            severity: 'warning',
            description: 'ICU Mortality: 15-20%'
        },
        {
            minScore: 10,
            maxScore: 12,
            label: 'High Risk',
            severity: 'danger',
            description: 'ICU Mortality: 40-50%'
        },
        {
            minScore: 13,
            maxScore: 24,
            label: 'Very High Risk',
            severity: 'danger',
            description: 'ICU Mortality: >80%'
        }
    ],
    customResultRenderer: (score: number, sectionScores: Record<string, number>): string => {
        let mortalityRisk = '';
        let mortalityPercentage = '';
        let alertClass: 'success' | 'warning' | 'danger' = 'success';

        if (score <= 6) {
            mortalityRisk = 'Low Risk';
            mortalityPercentage = '~10%';
            alertClass = 'success';
        } else if (score <= 9) {
            mortalityRisk = 'Moderate Risk';
            mortalityPercentage = '15-20%';
            alertClass = 'warning';
        } else if (score <= 12) {
            mortalityRisk = 'High Risk';
            mortalityPercentage = '40-50%';
            alertClass = 'danger';
        } else {
            mortalityRisk = 'Very High Risk';
            mortalityPercentage = '>80%';
            alertClass = 'danger';
        }

        return `
            ${uiBuilder.createResultItem({
                label: 'Total SOFA Score',
                value: score.toString(),
                unit: 'points',
                interpretation: `${mortalityRisk} (ICU Mortality: ${mortalityPercentage})`,
                alertClass: `ui-alert-${alertClass}`
            })}
            
            ${uiBuilder.createAlert({
                type: 'info',
                message:
                    '<strong>ΔSOFA Significance:</strong> An increase in SOFA score of ≥2 points indicates organ dysfunction and increased mortality risk.'
            })}
        `;
    },

    // 使用 FHIRDataService 進行自動填充
    customInitialize: async (client, patient, container, calculate): Promise<void> => {
        const setRadioValue = (name: string, value: string): void => {
            const radio = container.querySelector(
                `input[name="${name}"][value="${value}"]`
            ) as HTMLInputElement | null;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        if (!fhirDataService.isReady()) {
            // Mark all as not available if no client
            ['platelets', 'creatinine', 'bilirubin'].forEach(lab => {
                const el = container.querySelector(`#current-${lab}`);
                if (el) {
                    el.textContent = 'Not available';
                }
            });
            return;
        }

        const stalenessTracker = fhirDataService.getStalenessTracker();

        try {
            // Platelets
            const plateletsResult = await fhirDataService.getObservation(LOINC_CODES.PLATELETS, {
                trackStaleness: true,
                stalenessLabel: 'Platelets'
            });

            const plateletsEl = container.querySelector('#current-platelets');
            if (plateletsResult.value !== null) {
                const val = plateletsResult.value;
                if (plateletsEl) {
                    plateletsEl.textContent = `${val.toFixed(0)} ×10³/μL`;
                }

                if (stalenessTracker && plateletsResult.observation) {
                    stalenessTracker.trackObservation(
                        '#current-platelets',
                        plateletsResult.observation,
                        LOINC_CODES.PLATELETS,
                        'Platelets'
                    );
                }

                let radioValue = '0';
                if (val < 20) {
                    radioValue = '4';
                } else if (val < 50) {
                    radioValue = '3';
                } else if (val < 100) {
                    radioValue = '2';
                } else if (val < 150) {
                    radioValue = '1';
                }
                setRadioValue('sofa-coag', radioValue);
            } else if (plateletsEl) {
                plateletsEl.textContent = 'Not available';
            }
        } catch (e) {
            console.warn('Error fetching platelets:', e);
            const el = container.querySelector('#current-platelets');
            if (el) {
                el.textContent = 'Not available';
            }
        }

        try {
            // Creatinine
            const creatinineResult = await fhirDataService.getObservation(LOINC_CODES.CREATININE, {
                trackStaleness: true,
                stalenessLabel: 'Creatinine'
            });

            const creatinineEl = container.querySelector('#current-creatinine');
            if (creatinineResult.value !== null) {
                let val = creatinineResult.value;
                const unit = creatinineResult.unit || 'mg/dL';

                if (unit === 'mmol/L' || unit.toLowerCase() === 'umol/l') {
                    const converted = UnitConverter.convert(val, unit, 'mg/dL', 'creatinine');
                    if (converted !== null) {
                        val = converted;
                    }
                }

                if (creatinineEl) {
                    creatinineEl.textContent = `${val.toFixed(1)} mg/dL`;
                }

                if (stalenessTracker && creatinineResult.observation) {
                    stalenessTracker.trackObservation(
                        '#current-creatinine',
                        creatinineResult.observation,
                        LOINC_CODES.CREATININE,
                        'Creatinine'
                    );
                }

                let radioValue = '0';
                if (val >= 5.0) {
                    radioValue = '4';
                } else if (val >= 3.5) {
                    radioValue = '3';
                } else if (val >= 2.0) {
                    radioValue = '2';
                } else if (val >= 1.2) {
                    radioValue = '1';
                }
                setRadioValue('sofa-renal', radioValue);
            } else if (creatinineEl) {
                creatinineEl.textContent = 'Not available';
            }
        } catch (e) {
            console.warn('Error fetching creatinine:', e);
            const el = container.querySelector('#current-creatinine');
            if (el) {
                el.textContent = 'Not available';
            }
        }

        try {
            // Bilirubin
            const bilirubinResult = await fhirDataService.getObservation(
                LOINC_CODES.BILIRUBIN_TOTAL,
                {
                    trackStaleness: true,
                    stalenessLabel: 'Bilirubin'
                }
            );

            const bilirubinEl = container.querySelector('#current-bilirubin');
            if (bilirubinResult.value !== null) {
                let val = bilirubinResult.value;
                const unit = bilirubinResult.unit || 'mg/dL';

                if (unit === 'mmol/L' || unit.toLowerCase() === 'umol/l') {
                    const converted = UnitConverter.convert(val, unit, 'mg/dL', 'bilirubin');
                    if (converted !== null) {
                        val = converted;
                    }
                }

                if (bilirubinEl) {
                    bilirubinEl.textContent = `${val.toFixed(1)} mg/dL`;
                }

                if (stalenessTracker && bilirubinResult.observation) {
                    stalenessTracker.trackObservation(
                        '#current-bilirubin',
                        bilirubinResult.observation,
                        LOINC_CODES.BILIRUBIN_TOTAL,
                        'Bilirubin'
                    );
                }

                let radioValue = '0';
                if (val >= 12.0) {
                    radioValue = '4';
                } else if (val >= 6.0) {
                    radioValue = '3';
                } else if (val >= 2.0) {
                    radioValue = '2';
                } else if (val >= 1.2) {
                    radioValue = '1';
                }
                setRadioValue('sofa-liver', radioValue);
            } else if (bilirubinEl) {
                bilirubinEl.textContent = 'Not available';
            }
        } catch (e) {
            console.warn('Error fetching bilirubin:', e);
            const el = container.querySelector('#current-bilirubin');
            if (el) {
                el.textContent = 'Not available';
            }
        }
    }
};

const baseCalculator = createScoringCalculator(sofaConfig);

// 導出帶有公式表格的計算器
export const sofa = {
    ...baseCalculator,

    generateHTML(): string {
        const html = baseCalculator.generateHTML();

        // Formula Section
        const formulaSection = `
            ${uiBuilder.createSection({
                title: 'FORMULA',
                icon: '📐',
                content: `
                    <p class="mb-15">Addition of the selected points:</p>
                    ${uiBuilder.createTable({
                        headers: ['Variable', 'Points'],
                        rows: [
                            ['<strong>PaO₂/FiO₂, mmHg</strong>', ''],
                            ['≥400', '0'],
                            ['300-399', '+1'],
                            ['200-299', '+2'],
                            ['<199 and NOT mechanically ventilated', '+2'],
                            ['100-199 and mechanically ventilated', '+3'],
                            ['<100 and mechanically ventilated', '+4'],
                            ['<strong>Platelets, ×10³/µL</strong>', ''],
                            ['≥150', '0'],
                            ['100-149', '+1'],
                            ['50-99', '+2'],
                            ['20-49', '+3'],
                            ['<20', '+4'],
                            [
                                '<strong><a href="#gcs" class="text-link">Glasgow Coma Scale</a></strong>',
                                ''
                            ],
                            ['15', '0'],
                            ['13-14', '+1'],
                            ['10-12', '+2'],
                            ['6-9', '+3'],
                            ['<6', '+4'],
                            ['<strong>Bilirubin, mg/dL (µmol/L)</strong>', ''],
                            ['<1.2 (<20)', '0'],
                            ['1.2-1.9 (20-32)', '+1'],
                            ['2.0-5.9 (33-101)', '+2'],
                            ['6.0-11.9 (102-204)', '+3'],
                            ['≥12.0 (≥204)', '+4'],
                            [
                                '<strong>Mean arterial pressure OR administration of vasoactive agents required (listed doses are in units of mcg/kg/min)</strong>',
                                ''
                            ],
                            ['No hypotension', '0'],
                            ['MAP <70 mmHg', '+1'],
                            ['DOPamine ≤5 or DOBUTamine (any dose)', '+2'],
                            ['DOPamine >5, EPINEPHrine ≤0.1, or norEPINEPHrine ≤0.1', '+3'],
                            ['DOPamine >15, EPINEPHrine >0.1, or norEPINEPHrine >0.1', '+4'],
                            ['<strong>Creatinine, mg/dL (µmol/L) (or urine output)</strong>', ''],
                            ['<1.2 (<110)', '0'],
                            ['1.2-1.9 (110-170)', '+1'],
                            ['2.0-3.4 (171-299)', '+2'],
                            ['3.5-4.9 (300-440) or UOP <500 mL/day', '+3'],
                            ['≥5.0 (>440) or UOP <200 mL/day', '+4']
                        ],
                        stickyFirstColumn: true
                    })}
                `
            })}
        `;

        // Facts & Figures Section
        const factsSection = `
            ${uiBuilder.createSection({
                title: 'FACTS & FIGURES',
                icon: '📊',
                content: `
                    <p class="mb-15"><strong>Interpretation:</strong></p>
                    ${uiBuilder.createTable({
                        headers: [
                            'SOFA Score',
                            'Mortality if initial score',
                            'Mortality if highest score'
                        ],
                        rows: [
                            ['0-1', '0.0%', '0.0%'],
                            ['2-3', '6.4%', '1.5%'],
                            ['4-5', '20.2%', '6.7%'],
                            ['6-7', '21.5%', '18.2%'],
                            ['8-9', '33.3%', '26.3%'],
                            ['10-11', '50.0%', '45.8%'],
                            ['12-14', '95.2%', '80.0%'],
                            ['>14', '95.2%', '89.7%']
                        ]
                    })}
                    
                    <h5 class="mt-20 mb-10">Mean SOFA Score Mortality:</h5>
                    ${uiBuilder.createTable({
                        headers: ['Mean SOFA Score', 'Mortality'],
                        rows: [
                            ['0-1.0', '1.2%'],
                            ['1.1-2.0', '5.4%'],
                            ['2.1-3.0', '20.0%'],
                            ['3.1-4.0', '36.1%'],
                            ['4.1-5.0', '73.1%'],
                            ['>5.1', '84.4%']
                        ]
                    })}
                `
            })}
        `;

        const referenceSection = uiBuilder.createReference({
            title: 'Reference',
            citations: [
                'Vincent JL, et al. The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure. <em>Intensive Care Med</em>. 1996;22(7):707-710.'
            ]
        });

        return html + formulaSection + factsSection + referenceSection;
    }
};
