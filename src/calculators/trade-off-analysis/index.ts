/**
 * Trade-off Analysis Calculator
 *
 * Based on: Urban P, Giustino G, et al.
 * "Trade-Off in Thrombotic Risk Between Bleeding and Stent Thrombosis
 *  or Myocardial Infarction After PCI in High Bleeding Risk Patients"
 * JAMA Cardiology, 2021
 */

import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { LOINC_CODES, SNOMED_CODES } from '../../fhir-codes.js';
import type { CalculatorModule } from '../../types/index.js';
import {
    RISK_FACTORS,
    calculateBleedingRisk,
    calculateIschemicRisk,
    determineRiskZone,
    TRADE_OFF_SLOPES
} from './risk-factors.js';
import { createTradeOffChart, updateChartPosition, renderZoneLegend } from './chart-renderer.js';

let currentChart: any = null;

/**
 * Generate the calculator HTML
 */
function generateHTML(): string {
    // Risk factor checkboxes grouped by affected risk type
    const bleedingOnlyFactors = RISK_FACTORS.filter(
        f => f.bleedingHR !== null && f.ischemicHR === null && !f.group
    );
    const ischemicOnlyFactors = RISK_FACTORS.filter(
        f => f.ischemicHR !== null && f.bleedingHR === null && !f.group
    );
    const bothFactors = RISK_FACTORS.filter(
        f => f.bleedingHR !== null && f.ischemicHR !== null && !f.group
    );

    // Grouped factors (mutually exclusive)
    const hbFactors = RISK_FACTORS.filter(f => f.group === 'hemoglobin');
    const egfrFactors = RISK_FACTORS.filter(f => f.group === 'egfr');

    // Convert factor to uiBuilder format
    const toRiskFactorItem = (
        factor: (typeof RISK_FACTORS)[0],
        type: 'checkbox' | 'radio' = 'checkbox',
        groupName?: string,
        isDefault = false
    ) =>
        uiBuilder.createRiskFactorItem({
            id: `factor-${factor.id}`,
            label: factor.label,
            type,
            name: groupName,
            checked: isDefault,
            bleedingHR: factor.bleedingHR,
            ischemicHR: factor.ischemicHR,
            dataFactorId: factor.id
        });

    return `
        <!-- Styles moved to css/pages/_trade-off-analysis.css -->

        
        <div class="calculator-header">
            <h1>Risk Trade-off Analysis</h1>
            <p class="subtitle">Bleeding vs. Ischemic Risk</p>
            <p class="description">Calculates and visualizes the trade-off between bleeding and ischemic risks after PCI in high bleeding risk patients.</p>
        </div>
        
        ${uiBuilder.createAlert({
            type: 'info',
            message:
                'Select the applicable risk factors below. The chart will update in real-time to show patient position relative to trade-off lines.'
        })}
        
        <div class="trade-off-container">
            <div class="chart-section">
                <div class="chart-container" id="trade-off-chart-container">
                    <p class="loading-text">Loading chart...</p>
                </div>
                
                <div class="vertical-bar-chart">
                    <div class="vertical-bar-item">
                        <div class="vertical-bar-wrapper">
                            <div class="vertical-bar-fill bleeding" id="bleeding-risk-bar">
                                <span id="bleeding-bar-text">5.7%</span>
                            </div>
                        </div>
                        <div class="vertical-bar-label">1-Year Bleeding Risk</div>
                        <div class="vertical-bar-value bleeding" id="bleeding-risk-value">5.7%</div>
                    </div>
                    <div class="vertical-bar-item">
                        <div class="vertical-bar-wrapper">
                            <div class="vertical-bar-fill ischemic" id="ischemic-risk-bar">
                                <span id="ischemic-bar-text">5.3%</span>
                            </div>
                        </div>
                        <div class="vertical-bar-label">1-Year Ischemic Risk</div>
                        <div class="vertical-bar-value ischemic" id="ischemic-risk-value">5.3%</div>
                    </div>
                </div>
                
                <div id="result-zone-container"></div>
                
                ${renderZoneLegend()}
            </div>
            
            <div class="factors-container">
                <h3 class="factor-group-title">🧪 Hemoglobin Level</h3>
                ${hbFactors.map(f => toRiskFactorItem(f, 'radio', 'hemoglobin-group', f.id === 'hb_gte_13')).join('')}
                
                <h3 class="factor-group-title">🧪 eGFR Level</h3>
                ${egfrFactors.map(f => toRiskFactorItem(f, 'radio', 'egfr-group', f.id === 'egfr_gte_60')).join('')}
                
                <h3 class="factor-group-title">🩸 Affects Bleeding Risk Only</h3>
                ${bleedingOnlyFactors.map(f => toRiskFactorItem(f)).join('')}
                
                <h3 class="factor-group-title">💔 Affects Ischemic Risk Only</h3>
                ${ischemicOnlyFactors.map(f => toRiskFactorItem(f)).join('')}
                
                <h3 class="factor-group-title">⚠️ Affects Both Risks</h3>
                ${bothFactors.map(f => toRiskFactorItem(f)).join('')}
            </div>
        </div>
        
        ${uiBuilder.createSection({
            title: 'Reference',
            icon: '📚',
            content: `
                <p><strong>Source:</strong> Urban P, Giustino G, et al. "Trade-Off in Thrombotic Risk Between Bleeding and Stent Thrombosis or Myocardial Infarction After PCI in High Bleeding Risk Patients." <em>JAMA Cardiology</em>, 2021.</p>
                <p><strong>Mortality Hazard Ratios:</strong></p>
                ${uiBuilder.createList({
                    items: [
                        'MI/ST → HR for death: 6.1 (95% CI: 4.8-7.7)',
                        'BARC 3-5 bleeding → HR for death: 3.7 (95% CI: 2.9-4.8)'
                    ]
                })}
                <p><strong>Mortality-weighted slope:</strong> ${TRADE_OFF_SLOPES.MORTALITY_WEIGHTED.toFixed(2)}</p>
            `
        })}
    `;
}

/**
 * Get selected factor IDs from checkboxes
 */
function getSelectedFactorIds(): string[] {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('[data-factor-id]:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.factorId || '');
}

/**
 * Update the calculation and chart
 */
function updateCalculation(): void {
    const selectedFactors = getSelectedFactorIds();

    const bleedingRisk = calculateBleedingRisk(selectedFactors);
    const ischemicRisk = calculateIschemicRisk(selectedFactors);

    // Update displayed values
    const bleedingEl = document.getElementById('bleeding-risk-value');
    const ischemicEl = document.getElementById('ischemic-risk-value');

    if (bleedingEl) bleedingEl.textContent = `${bleedingRisk.toFixed(1)}%`;
    if (ischemicEl) ischemicEl.textContent = `${ischemicRisk.toFixed(1)}%`;

    // Update vertical bar visualization
    const bleedingBar = document.getElementById('bleeding-risk-bar');
    const ischemicBar = document.getElementById('ischemic-risk-bar');
    const bleedingBarText = document.getElementById('bleeding-bar-text');
    const ischemicBarText = document.getElementById('ischemic-bar-text');

    // Scale bars: 80% risk = 100% height
    const bleedingHeight = Math.min((bleedingRisk / 80) * 100, 100);
    const ischemicHeight = Math.min((ischemicRisk / 80) * 100, 100);

    if (bleedingBar) {
        bleedingBar.style.height = `${bleedingHeight}%`;
    }
    if (bleedingBarText) {
        bleedingBarText.textContent = `${bleedingRisk.toFixed(1)}%`;
    }
    if (ischemicBar) {
        ischemicBar.style.height = `${ischemicHeight}%`;
    }
    if (ischemicBarText) {
        ischemicBarText.textContent = `${ischemicRisk.toFixed(1)}%`;
    }

    // Update chart
    if (currentChart) {
        updateChartPosition(currentChart, bleedingRisk, ischemicRisk);
    }

    // Update result zone
    const zoneResult = determineRiskZone(bleedingRisk, ischemicRisk);
    const resultContainer = document.getElementById('result-zone-container');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="result-zone ${zoneResult.zone}">
                <strong>${
                    zoneResult.zone === 'ischemic_dominant'
                        ? '💔 Ischemic Dominant'
                        : zoneResult.zone === 'bleeding_dominant'
                          ? '🩸 Bleeding Dominant'
                          : '⚖️ Equivalent Risk'
                }</strong>
                <p>${zoneResult.recommendation}</p>
            </div>
        `;
    }
}

/**
 * Initialize the calculator
 */
function initialize(_client: unknown, _patient: unknown, _container: HTMLElement): void {
    // Initialize data service with current context
    fhirDataService.initialize(_client, _patient, _container);

    // Add change listeners to all checkboxes
    const checkboxes = document.querySelectorAll<HTMLInputElement>('[data-factor-id]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateCalculation);
    });

    // Initialize chart
    setTimeout(() => {
        currentChart = createTradeOffChart({
            containerId: 'trade-off-chart-container',
            bleedingRisk: 5.7, // baseline
            ischemicRisk: 5.3 // baseline
        });
        updateCalculation();

        // Auto-populate after chart is ready
        autoPopulate();
    }, 100);
}

/**
 * Auto-populate from FHIR data
 */
async function autoPopulate(): Promise<void> {
    try {
        // Get age
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            if (age >= 65) {
                const ageCheckbox = document.getElementById('factor-age_65') as HTMLInputElement;
                if (ageCheckbox) {
                    ageCheckbox.checked = true;
                }
            }
        }

        // Get all SNOMED codes we care about
        const snomedCodesToCheck = [
            SNOMED_CODES.DIABETES_MELLITUS,
            SNOMED_CODES.DIABETES_TYPE_1,
            SNOMED_CODES.DIABETES_TYPE_2,
            SNOMED_CODES.MYOCARDIAL_INFARCTION,
            SNOMED_CODES.CIRRHOSIS,
            SNOMED_CODES.MALIGNANCY,
            SNOMED_CODES.COPD,
            SNOMED_CODES.SMOKING
        ];
        // Check for conditions
        const conditions = (await fhirDataService.getConditions(snomedCodesToCheck)) || [];

        for (const condition of conditions) {
            const code = condition.code?.coding?.[0]?.code;
            if (!code) continue;

            // Map SNOMED codes to factor checkboxes
            const snomedToFactor: Record<string, string> = {
                [SNOMED_CODES.DIABETES_MELLITUS]: 'diabetes',
                [SNOMED_CODES.DIABETES_TYPE_1]: 'diabetes',
                [SNOMED_CODES.DIABETES_TYPE_2]: 'diabetes',
                [SNOMED_CODES.MYOCARDIAL_INFARCTION]: 'prior_mi',
                [SNOMED_CODES.CIRRHOSIS]: 'liver_cancer_surgery',
                [SNOMED_CODES.MALIGNANCY]: 'liver_cancer_surgery',
                [SNOMED_CODES.COPD]: 'copd',
                [SNOMED_CODES.SMOKING]: 'current_smoker'
            };

            const factorId = snomedToFactor[code];
            if (factorId) {
                const checkbox = document.getElementById(`factor-${factorId}`) as HTMLInputElement;
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        }

        // Get lab values for Hb and eGFR categorization
        const [hbObs, egfrObs] = await Promise.all([
            fhirDataService.getObservation(LOINC_CODES.HEMOGLOBIN),
            fhirDataService.getObservation(LOINC_CODES.EGFR)
        ]);

        if (hbObs?.value) {
            const hb = hbObs.value;
            if (hb < 11) {
                const checkbox = document.getElementById('factor-hb_lt_11') as HTMLInputElement;
                if (checkbox) checkbox.checked = true;
            } else if (hb < 13) {
                const checkbox = document.getElementById('factor-hb_11_13') as HTMLInputElement;
                if (checkbox) checkbox.checked = true;
            }
        }

        if (egfrObs?.value) {
            const egfr = egfrObs.value;
            if (egfr < 30) {
                const checkbox = document.getElementById('factor-egfr_lt_30') as HTMLInputElement;
                if (checkbox) checkbox.checked = true;
            } else if (egfr < 60) {
                const checkbox = document.getElementById('factor-egfr_30_59') as HTMLInputElement;
                if (checkbox) checkbox.checked = true;
            }
        }

        // Recalculate with auto-populated values
        updateCalculation();
    } catch (error) {
        console.warn('Trade-off auto-populate failed:', error);
    }
}

export const tradeOffAnalysis: CalculatorModule = {
    id: 'trade-off-analysis',
    title: 'Risk Trade-off Analysis',
    description: 'Bleeding vs. Ischemic Risk Trade-off for DAPT Decision',
    generateHTML,
    initialize
};
