/**
 * Trade-off Analysis Chart Renderer
 * Renders the log-scale scatter plot with trade-off zones
 * Based on: Urban P, Giustino G, et al. JAMA Cardiology, 2021
 */

import { TRADE_OFF_SLOPES } from './risk-factors.js';

declare const Chart: any;

export interface TradeOffChartConfig {
    containerId: string;
    bleedingRisk: number;
    ischemicRisk: number;
}

/**
 * Create the trade-off analysis scatter chart
 * Matches paper Figure 4B with log scale 1.25 to 80
 */
export function createTradeOffChart(config: TradeOffChartConfig): any {
    const { containerId, bleedingRisk, ischemicRisk } = config;

    const container = document.getElementById(containerId);
    if (!container) return null;

    // Clear previous chart
    container.innerHTML =
        '<canvas id="trade-off-chart-canvas" style="max-height: 500px;"></canvas>';
    const canvas = document.getElementById('trade-off-chart-canvas') as HTMLCanvasElement;
    if (!canvas) return null;

    // Generate line data points matching paper's range
    const xValues = [1.25, 2.5, 5, 10, 20, 50, 80];
    const equalLineData = xValues.map(x => ({ x, y: x }));
    // y = x / 1.65 for mortality-weighted line (ischemic risk that equals bleeding risk considering mortality weight)
    const mortalityLineData = xValues.map(x => ({ x, y: x / TRADE_OFF_SLOPES.MORTALITY_WEIGHTED }));

    // Custom plugin to draw colored background zones
    const zonePlugin = {
        id: 'zonePlugin',
        beforeDatasetsDraw(chart: any) {
            const {
                ctx,
                chartArea: { left, right, top, bottom },
                scales: { x, y }
            } = chart;

            ctx.save();

            // Orange zone (bottom-right): below mortality-weighted line (y < x/1.65)
            // This is where bleeding risk dominates
            ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
            ctx.beginPath();
            ctx.moveTo(left, bottom);
            for (let i = 0; i <= 100; i++) {
                const xVal = 1.25 * Math.pow(80 / 1.25, i / 100);
                const yVal = xVal / TRADE_OFF_SLOPES.MORTALITY_WEIGHTED;
                const clampedY = Math.max(1.25, Math.min(80, yVal));
                const px = x.getPixelForValue(xVal);
                const py = y.getPixelForValue(clampedY);
                if (i === 0) ctx.moveTo(px, bottom);
                ctx.lineTo(px, py);
            }
            ctx.lineTo(right, bottom);
            ctx.closePath();
            ctx.fill();

            // Teal zone (top-left): above equal trade-off line (y > x)
            // This is where ischemic risk dominates
            ctx.fillStyle = 'rgba(13, 148, 136, 0.2)';
            ctx.beginPath();
            ctx.moveTo(left, top);
            for (let i = 0; i <= 100; i++) {
                const xVal = 1.25 * Math.pow(80 / 1.25, i / 100);
                const yVal = xVal;
                const clampedY = Math.max(1.25, Math.min(80, yVal));
                const px = x.getPixelForValue(xVal);
                const py = y.getPixelForValue(clampedY);
                if (i === 0) ctx.moveTo(left, py);
                ctx.lineTo(px, py);
            }
            ctx.lineTo(right, top);
            ctx.lineTo(left, top);
            ctx.closePath();
            ctx.fill();

            // Gray zone (middle): between the two lines
            // Equivalent risk zone
            ctx.fillStyle = 'rgba(107, 114, 128, 0.15)';
            ctx.beginPath();
            // Start from mortality line (bottom boundary of gray)
            for (let i = 0; i <= 100; i++) {
                const xVal = 1.25 * Math.pow(80 / 1.25, i / 100);
                const yVal = xVal / TRADE_OFF_SLOPES.MORTALITY_WEIGHTED;
                const clampedY = Math.max(1.25, Math.min(80, yVal));
                const px = x.getPixelForValue(xVal);
                const py = y.getPixelForValue(clampedY);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            // Then follow equal line back (top boundary of gray)
            for (let i = 100; i >= 0; i--) {
                const xVal = 1.25 * Math.pow(80 / 1.25, i / 100);
                const yVal = xVal;
                const clampedY = Math.max(1.25, Math.min(80, yVal));
                const px = x.getPixelForValue(xVal);
                const py = y.getPixelForValue(clampedY);
                ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    };

    const chartConfig = {
        type: 'scatter',
        plugins: [zonePlugin],
        data: {
            datasets: [
                // Patient position (red dot)
                {
                    label: 'Patient Position',
                    data: [{ x: bleedingRisk, y: ischemicRisk }],
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 2,
                    pointRadius: 12,
                    pointHoverRadius: 14,
                    pointStyle: 'circle'
                },
                // Equal trade-off line (y = x) - black line
                {
                    label: 'Equal Trade-off (y=x)',
                    data: equalLineData,
                    type: 'line',
                    borderColor: '#1f2937',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                // Mortality-weighted trade-off line - orange line
                {
                    label: `Mortality-Weighted (y=x/${TRADE_OFF_SLOPES.MORTALITY_WEIGHTED.toFixed(1)})`,
                    data: mortalityLineData,
                    type: 'line',
                    borderColor: '#f97316',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            if (context.datasetIndex === 0) {
                                return `Bleeding: ${context.parsed.x.toFixed(1)}%, Ischemic: ${context.parsed.y.toFixed(1)}%`;
                            }
                            return context.dataset.label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'logarithmic',
                    min: 1.25,
                    max: 80,
                    title: {
                        display: true,
                        text: 'Predicted 1-y risk of BARC types 3-5 bleeding, %',
                        font: { weight: 'bold', size: 11 }
                    },
                    grid: {
                        color: 'rgba(128, 128, 128, 0.2)'
                    },
                    ticks: {
                        callback: function (value: number) {
                            const allowedValues = [1.25, 2.5, 5, 10, 20, 50, 80];
                            if (allowedValues.includes(value)) {
                                return value;
                            }
                            return '';
                        }
                    }
                },
                y: {
                    type: 'logarithmic',
                    min: 1.25,
                    max: 80,
                    title: {
                        display: true,
                        text: 'Predicted 1-y risk of MI and/or ST, %',
                        font: { weight: 'bold', size: 11 }
                    },
                    grid: {
                        color: 'rgba(128, 128, 128, 0.2)'
                    },
                    ticks: {
                        callback: function (value: number) {
                            const allowedValues = [1.25, 2.5, 5, 10, 20, 50, 80];
                            if (allowedValues.includes(value)) {
                                return value;
                            }
                            return '';
                        }
                    }
                }
            }
        }
    };

    return new Chart(canvas, chartConfig);
}

/**
 * Update chart with new patient position
 */
export function updateChartPosition(chart: any, bleedingRisk: number, ischemicRisk: number): void {
    if (!chart) return;

    // Clamp values to chart range
    const clampedBleeding = Math.max(1.25, Math.min(80, bleedingRisk));
    const clampedIschemic = Math.max(1.25, Math.min(80, ischemicRisk));

    chart.data.datasets[0].data = [{ x: clampedBleeding, y: clampedIschemic }];
    chart.update();
}

/**
 * Render zone legend HTML
 */
export function renderZoneLegend(): string {
    return `
        <div class="trade-off-legend">
            <div class="legend-item">
                <span class="legend-color" style="background: rgba(13, 148, 136, 0.3);"></span>
                <span><strong>Teal Area:</strong> Above equal trade-off line (y=x). Ischemic risk is higher than bleeding risk.</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: rgba(107, 114, 128, 0.3);"></span>
                <span><strong>Gray Area:</strong> Between equal (1:1) and mortality-weighted lines. Considering that MI/ST has ${TRADE_OFF_SLOPES.MORTALITY_WEIGHTED.toFixed(1)}× higher associated mortality, risks can be considered equivalent.</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: rgba(249, 115, 22, 0.3);"></span>
                <span><strong>Orange Area:</strong> Below mortality-weighted line (y=x/${TRADE_OFF_SLOPES.MORTALITY_WEIGHTED.toFixed(1)}). Bleeding risk dominates when considering associated mortality.</span>
            </div>
        </div>
    `;
}
