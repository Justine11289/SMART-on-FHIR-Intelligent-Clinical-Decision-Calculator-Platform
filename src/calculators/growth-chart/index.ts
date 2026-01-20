import { cdcData, mapLmsToPercentileData, type PercentileDataPoint } from './cdc-data.js';
import {
    calculateZScore,
    estimatePercentile,
    calculateBmiData,
    calculateVelocity,
    formatAge,
    type GrowthDataPoint,
    type GrowthData
} from './calculation.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import type { CalculatorModule } from '../../types/index.js';

// Declare Chart.js type assuming it's available globally
declare const Chart: any;

export const growthChart: CalculatorModule = {
    id: 'growth-chart',
    title: 'Pediatric Growth Chart',
    description:
        "Plots patient's growth data (height, weight, BMI) against standard growth curves.",
    generateHTML: function () {
        return `
            <div class="calculator-header">
                <h3>${this.title}</h3>
                <p class="description">${this.description}</p>
            </div>
            
            <div class="growth-chart-stack">
                <div class="growth-chart-row">
                    <div class="chart-wrapper">
                        <div class="chart-header">
                            <h4>Height for Age</h4>
                            <div class="chart-status" id="height-status">Loading...</div>
                        </div>
                        <div class="chart-container">
                            <canvas id="growthChartCanvasHeight"></canvas>
                        </div>
                        <div class="chart-summary" id="height-summary"></div>
                    </div>
                    
                    <div class="chart-wrapper">
                        <div class="chart-header">
                            <h4>Weight for Age</h4>
                            <div class="chart-status" id="weight-status">Loading...</div>
                        </div>
                        <div class="chart-container">
                            <canvas id="growthChartCanvasWeight"></canvas>
                        </div>
                        <div class="chart-summary" id="weight-summary"></div>
                    </div>
                </div>
                
                <div class="chart-wrapper chart-wrapper--full">
                    <div class="chart-header">
                        <h4>BMI for Age</h4>
                        <div class="chart-status" id="bmi-status">Loading...</div>
                    </div>
                    <div class="chart-container">
                        <canvas id="growthChartCanvasBMI"></canvas>
                    </div>
                    <div class="chart-summary" id="bmi-summary"></div>
                    ${uiBuilder.createAlert({
                        type: 'info',
                        message:
                            '<strong>Note:</strong> BMI patterns in infants are normal - BMI typically peaks around 8-12 months, then decreases until age 5-6 years (adiposity rebound).'
                    })}
                </div>
            </div>

            ${uiBuilder.createSection({
                title: 'Chart Information',
                content: `
                    <ul>
                        <li><strong>Reference:</strong> CDC Growth Charts (2000)</li>
                        <li><strong>Age Range:</strong> Birth to 36 months</li>
                        <li><strong>Percentiles:</strong> P3, P5, P10, P25, P50, P75, P90, P95, P97</li>
                        <li><strong>P50 (Median):</strong> 50% of children are above/below this line</li>
                        <li><strong>Normal Range:</strong> Between P5 and P95 (green shaded area)</li>
                    </ul>
                `
            })}

            ${uiBuilder.createSection({
                title: 'Clinical Interpretation Guidelines',
                content: `
                    <div class="interpretation-grid">
                        <div class="interpretation-item">
                            <strong>Normal Growth:</strong>
                            <p>Child follows their established percentile curve consistently over time. Single measurements below P5 or above P95 may be normal for that child.</p>
                        </div>
                        <div class="interpretation-item">
                            <strong>Growth Concerns:</strong>
                            <p>Crossing two or more percentile lines (upward or downward), falling below P3, or above P97 consistently may warrant further evaluation.</p>
                        </div>
                        <div class="interpretation-item">
                            <strong>BMI Considerations:</strong>
                            <p>BMI interpretation differs in children. Use BMI-for-age percentiles, not adult BMI categories. Consider growth velocity and family history.</p>
                        </div>
                        <div class="interpretation-item">
                            <strong>Next Steps:</strong>
                            <p>Document measurements accurately, plot regularly, consider nutritional assessment, and evaluate for underlying conditions if growth faltering is observed.</p>
                        </div>
                    </div>
                `
            })}
        `;
    },
    initialize: function (client, patient, container) {
        uiBuilder.initializeComponents(container);

        // Initialize fhirDataService with the client and patient
        fhirDataService.initialize(client, patient, container);

        const heightCanvas = container.querySelector(
            '#growthChartCanvasHeight'
        ) as HTMLCanvasElement;
        const weightCanvas = container.querySelector(
            '#growthChartCanvasWeight'
        ) as HTMLCanvasElement;
        const bmiCanvas = container.querySelector('#growthChartCanvasBMI') as HTMLCanvasElement;

        // Note: calculateZScore, estimatePercentile, calculateBmiData, calculateVelocity, and formatAge
        // are now imported from './calculation.js'

        // Function to update chart status and summary
        function updateChartStatus(
            type: string,
            dataCount: number,
            latestValue: number | null,
            latestAge: number | null,
            cdcDataArray: any[]
        ) {
            const statusEl = container.querySelector(`#${type}-status`);
            const summaryEl = container.querySelector(`#${type}-summary`);

            if (!statusEl || !summaryEl) {
                return;
            }

            if (dataCount === 0) {
                statusEl.innerHTML = '<span class="status-warning">⚠️ No data available</span>';
                summaryEl.innerHTML =
                    '<p class="no-data">No measurements recorded for this patient.</p>';
                return;
            }

            statusEl.innerHTML = `<span class="status-success">✅ ${dataCount} measurement${dataCount > 1 ? 's' : ''}</span>`;

            if (
                latestValue !== null &&
                latestAge !== undefined &&
                latestAge !== null &&
                cdcDataArray &&
                cdcDataArray.length > 0
            ) {
                const zscore = calculateZScore(latestAge, latestValue, cdcDataArray);
                const percentileEstimate = estimatePercentile(zscore);

                let interpretation = '';
                if (zscore !== null) {
                    if (zscore < -2) {
                        interpretation = 'Below normal range';
                    } else if (zscore > 2) {
                        interpretation = 'Above normal range';
                    } else {
                        interpretation = 'Within normal range';
                    }
                }

                const years = Math.floor(latestAge / 12);
                const months = Math.round(latestAge % 12);
                const ageStr = years > 0 ? `${years}y ${months}m` : `${months}m`;

                summaryEl.innerHTML = `
                    <div class="latest-measurement">
                        <strong>Latest:</strong> ${latestValue.toFixed(1)} at ${ageStr}
                        ${zscore !== null ? `<br><strong>Z-score:</strong> ${zscore.toFixed(2)} (≈P${percentileEstimate})` : ''}
                        ${interpretation ? `<br><strong>Status:</strong> <span class="status-${zscore! < -2 || zscore! > 2 ? 'warning' : 'normal'}">${interpretation}</span>` : ''}
                    </div>
                `;
            }
        }

        async function getGrowthData(): Promise<GrowthData | null> {
            const patientData = fhirDataService.getPatient();

            if (!fhirDataService.isReady() || !patientData?.birthDate) {
                return { height: [], weight: [], head: [] };
            }

            const loincCodes = {
                height: LOINC_CODES.HEIGHT,
                weight: LOINC_CODES.WEIGHT,
                head: LOINC_CODES.HEAD_CIRCUMFERENCE
            };

            try {
                // Use fhirDataService to get all historical observations
                const [heightObs, weightObs, headObs] = await Promise.all([
                    fhirDataService.getAllObservations(loincCodes.height, { sortOrder: 'asc' }),
                    fhirDataService.getAllObservations(loincCodes.weight, { sortOrder: 'asc' }),
                    fhirDataService.getAllObservations(loincCodes.head, { sortOrder: 'asc' })
                ]);

                const birthDate = new Date(patientData.birthDate);

                const processObservations = (observations: any[]): GrowthDataPoint[] => {
                    return observations
                        .filter(
                            obs => obs.valueQuantity?.value !== undefined && obs.effectiveDateTime
                        )
                        .map(obs => ({
                            ageMonths:
                                (new Date(obs.effectiveDateTime).getTime() - birthDate.getTime()) /
                                (1000 * 60 * 60 * 24 * 30.4375),
                            value: obs.valueQuantity.value,
                            unit: obs.valueQuantity.unit
                        }))
                        .filter(item => item.ageMonths >= 0);
                };

                return {
                    height: processObservations(heightObs),
                    weight: processObservations(weightObs),
                    head: processObservations(headObs)
                };
            } catch (error) {
                console.error('Error fetching growth data:', error);
                const errorBox = document.createElement('div');
                errorBox.className = 'error-box';
                errorBox.textContent = 'An error occurred while fetching growth data.';
                container.appendChild(errorBox);
                return null;
            }
        }

        function createChart(
            canvas: any,
            title: string,
            patientData: GrowthDataPoint[],
            cdcPercentileData: any[],
            yAxisLabel: string,
            patientDataLabel: string
        ) {
            if (!cdcPercentileData || cdcPercentileData.length === 0) {
                // Handle case where there is no CDC data
                const patientDataset = {
                    label: patientDataLabel,
                    data: patientData.map(d => ({ x: d.ageMonths, y: d.value })),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                };

                if (canvas.chart) {
                    canvas.chart.destroy();
                }

                canvas.chart = new Chart(canvas.getContext('2d'), {
                    type: 'line',
                    data: { datasets: [patientDataset] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: title,
                                font: { size: 16, weight: 'bold' },
                                color: '#1f2937'
                            },
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    padding: 20
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#ffffff',
                                bodyColor: '#ffffff',
                                borderColor: '#2563eb',
                                borderWidth: 1,
                                callbacks: {
                                    title: function (context: any) {
                                        const ageMonths = context[0].parsed.x;
                                        const years = Math.floor(ageMonths / 12);
                                        const months = Math.round(ageMonths % 12);
                                        return `Age: ${years}y ${months}m`;
                                    },
                                    label: function (context: any) {
                                        return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} ${yAxisLabel.match(/\(([^)]+)\)/)?.[1] || ''}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: 'Age (Months)',
                                    font: { size: 14, weight: 'bold' }
                                },
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.1)'
                                }
                            },
                            y: {
                                type: 'linear',
                                position: 'left',
                                title: {
                                    display: true,
                                    text: yAxisLabel,
                                    font: { size: 14, weight: 'bold' }
                                },
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.1)'
                                }
                            }
                        }
                    }
                });
                return;
            }

            // Enhanced color scheme for percentiles
            const percentileConfig: any = {
                P3: { color: '#dc2626', alpha: 0.7, width: 1, dash: [5, 5] },
                P5: { color: '#ea580c', alpha: 0.8, width: 1.5, dash: [] },
                P10: { color: '#ca8a04', alpha: 0.8, width: 1, dash: [] },
                P25: { color: '#16a34a', alpha: 0.8, width: 1, dash: [] },
                P50: { color: '#0f172a', alpha: 1.0, width: 2.5, dash: [] },
                P75: { color: '#16a34a', alpha: 0.8, width: 1, dash: [] },
                P90: { color: '#ca8a04', alpha: 0.8, width: 1, dash: [] },
                P95: { color: '#ea580c', alpha: 0.8, width: 1.5, dash: [] },
                P97: { color: '#dc2626', alpha: 0.7, width: 1, dash: [5, 5] }
            };

            const cdcDatasets: any[] = [];
            const percentiles = ['P3', 'P5', 'P10', 'P25', 'P50', 'P75', 'P90', 'P95', 'P97'];

            // Create datasets for all available percentiles
            percentiles.forEach((percentile, index) => {
                if (cdcPercentileData[0] && cdcPercentileData[0][percentile] !== undefined) {
                    const config = percentileConfig[percentile];
                    cdcDatasets.push({
                        label: `CDC ${percentile}`,
                        data: cdcPercentileData.map(row => ({ x: row.Agemos, y: row[percentile] })),
                        borderColor: config.color,
                        backgroundColor: `${config.color}${Math.round(config.alpha * 255)
                            .toString(16)
                            .padStart(2, '0')}`,
                        borderWidth: config.width,
                        borderDash: config.dash,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        fill: false,
                        tension: 0.1
                    });
                }
            });

            // Add normal range fill between P5 and P95
            if (cdcPercentileData[0] && cdcPercentileData[0]['P5'] && cdcPercentileData[0]['P95']) {
                const p5Index = cdcDatasets.findIndex(ds => ds.label === 'CDC P5');
                const p95Index = cdcDatasets.findIndex(ds => ds.label === 'CDC P95');
                if (p5Index !== -1 && p95Index !== -1) {
                    cdcDatasets[p95Index].fill = {
                        target: p5Index,
                        above: 'rgba(34, 197, 94, 0.08)'
                    };
                }
            }

            // Enhanced patient data visualization
            const patientDataset = {
                label: patientDataLabel,
                data: patientData.map(d => ({ x: d.ageMonths, y: d.value })),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.2,
                order: 0 // Ensure patient data is rendered on top
            };

            if (canvas.chart) {
                canvas.chart.destroy();
            }

            canvas.chart = new Chart(canvas.getContext('2d'), {
                type: 'line',
                data: { datasets: [patientDataset, ...cdcDatasets] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: title,
                            font: { size: 16, weight: 'bold' },
                            color: '#1f2937',
                            padding: 20
                        },
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                filter: function (legendItem: any, chartData: any) {
                                    // Only show patient data and key percentiles in legend
                                    return (
                                        legendItem.text.includes('Patient') ||
                                        legendItem.text.includes('P5') ||
                                        legendItem.text.includes('P50') ||
                                        legendItem.text.includes('P95')
                                    );
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#2563eb',
                            borderWidth: 1,
                            callbacks: {
                                title: function (context: any) {
                                    const ageMonths = context[0].parsed.x;
                                    const years = Math.floor(ageMonths / 12);
                                    const months = Math.round(ageMonths % 12);
                                    return `Age: ${years}y ${months}m (${ageMonths.toFixed(1)} months)`;
                                },
                                label: function (context: any) {
                                    const unit = yAxisLabel.match(/\(([^)]+)\)/)?.[1] || '';
                                    const value = context.parsed.y.toFixed(1);
                                    let label = `${context.dataset.label}: ${value} ${unit}`;

                                    // Add Z-score calculation for patient data
                                    if (context.dataset.label.includes('Patient')) {
                                        const zscore = calculateZScore(
                                            context.parsed.x,
                                            context.parsed.y,
                                            cdcPercentileData
                                        );
                                        if (zscore !== null) {
                                            label += ` (Z-score: ${zscore.toFixed(2)})`;
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: {
                                display: true,
                                text: 'Age (Months)',
                                font: { size: 14, weight: 'bold' }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawTicks: true
                            },
                            ticks: {
                                callback: function (value: number) {
                                    const years = Math.floor(value / 12);
                                    const months = Math.round(value % 12);
                                    return years > 0
                                        ? `${years}y${months > 0 ? ` ${months}m` : ''}`
                                        : `${months}m`;
                                }
                            }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            title: {
                                display: true,
                                text: yAxisLabel,
                                font: { size: 14, weight: 'bold' }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    }
                }
            });
        }

        // Function to add growth velocity analysis
        function addGrowthVelocityAnalysis(
            container: HTMLElement,
            data: GrowthData,
            bmiData: GrowthDataPoint[]
        ) {
            const velocitySection = document.createElement('div');
            velocitySection.className = 'growth-velocity-section mt-20';
            velocitySection.innerHTML = uiBuilder.createSection({
                title: '📈 Growth Velocity Analysis',
                content: `
                    <div class="velocity-grid">
                        ${calculateVelocity('Height', data.height, 'cm/month')}
                        ${calculateVelocity('Weight', data.weight, 'g/month', 1000)}
                        ${bmiData.length >= 2 ? calculateVelocity('BMI', bmiData, 'kg/m²/month') : ''}
                    </div>
                `
            });
            container.appendChild(velocitySection);
        }

        getGrowthData().then(data => {
            if (data) {
                if (data.height.length === 0 && data.weight.length === 0) {
                    // Keep placeholder or show empty state
                    return;
                }

                // Filter patient data to relevant age range (slightly beyond 36m for context)
                const MAX_AGE_MONTHS = 40;
                const filteredHeight = data.height.filter(d => d.ageMonths <= MAX_AGE_MONTHS);
                const filteredWeight = data.weight.filter(d => d.ageMonths <= MAX_AGE_MONTHS);

                const bmiData = calculateBmiData(filteredHeight, filteredWeight);
                const filteredBMI = bmiData; // Already filtered because filtered height/weight used

                const gender = fhirDataService.getPatientGender() || 'female';

                // Get latest measurements
                const latestHeight =
                    filteredHeight.length > 0 ? filteredHeight[filteredHeight.length - 1] : null;
                const latestWeight =
                    filteredWeight.length > 0 ? filteredWeight[filteredWeight.length - 1] : null;
                const latestBMI =
                    filteredBMI.length > 0 ? filteredBMI[filteredBMI.length - 1] : null;

                // Use imported mapLmsToPercentileData helper

                // Create Height Chart (Legacy Format)
                const cdcHeightDataSet =
                    gender === 'female' ? cdcData.lenageinf_g : cdcData.lenageinf_b;
                const cdcHeightData = cdcHeightDataSet ? cdcHeightDataSet.data || [] : [];
                if (heightCanvas) {
                    createChart(
                        heightCanvas,
                        'Height for Age',
                        filteredHeight,
                        cdcHeightData,
                        'Height (cm)',
                        'Patient Height'
                    );
                    updateChartStatus(
                        'height',
                        filteredHeight.length,
                        latestHeight ? latestHeight.value : null,
                        latestHeight ? latestHeight.ageMonths : null,
                        cdcHeightData
                    );
                }

                // Create Weight Chart (New LMS Format)
                const cdcWeightDataRaw =
                    gender === 'female' ? cdcData.wtageinf.female : cdcData.wtageinf.male;
                const cdcWeightData = mapLmsToPercentileData(cdcWeightDataRaw || []);

                if (weightCanvas) {
                    createChart(
                        weightCanvas,
                        'Weight for Age',
                        filteredWeight,
                        cdcWeightData,
                        'Weight (kg)',
                        'Patient Weight'
                    );
                    updateChartStatus(
                        'weight',
                        filteredWeight.length,
                        latestWeight ? latestWeight.value : null,
                        latestWeight ? latestWeight.ageMonths : null,
                        cdcWeightData
                    );
                }

                // Create BMI Chart (Legacy Format)
                const cdcBmiDataSet =
                    gender === 'female' ? cdcData.bmiagerev_g : cdcData.bmiagerev_b;
                const cdcBmiData = cdcBmiDataSet ? cdcBmiDataSet.data || [] : [];
                if (bmiCanvas) {
                    createChart(
                        bmiCanvas,
                        'BMI for Age',
                        filteredBMI,
                        cdcBmiData,
                        'BMI (kg/m²)',
                        'Patient BMI'
                    );
                    updateChartStatus(
                        'bmi',
                        filteredBMI.length,
                        latestBMI ? latestBMI.value : null,
                        latestBMI ? latestBMI.ageMonths : null,
                        cdcBmiData
                    );
                }

                // Add growth velocity analysis
                if (data.height.length >= 2 || data.weight.length >= 2) {
                    addGrowthVelocityAnalysis(container, data, bmiData);
                }
            }
        });
    }
};
