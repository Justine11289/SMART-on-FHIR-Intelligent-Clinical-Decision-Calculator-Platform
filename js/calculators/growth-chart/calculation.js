/**
 * Calculate Z-score using LMS method or legacy estimation
 * @param ageMonths - Age in months
 * @param value - Measurement value
 * @param cdcDataArray - CDC reference data array
 * @returns Z-score or null if calculation not possible
 */
export function calculateZScore(ageMonths, value, cdcDataArray) {
    if (!cdcDataArray || cdcDataArray.length === 0) {
        return null;
    }
    // Find closest age point in CDC data
    const closestPoint = cdcDataArray.reduce((prev, curr) => Math.abs(curr.Agemos - ageMonths) < Math.abs(prev.Agemos - ageMonths) ? curr : prev);
    if (Math.abs(closestPoint.Agemos - ageMonths) > 1) {
        return null; // Too far from reference point
    }
    // Use LMS Method for precise calculation
    if (closestPoint.L !== undefined &&
        closestPoint.M !== undefined &&
        closestPoint.S !== undefined) {
        const L = closestPoint.L;
        const M = closestPoint.M;
        const S = closestPoint.S;
        if (value <= 0) {
            return null;
        }
        if (Math.abs(L) < 0.01) {
            return Math.log(value / M) / S;
        }
        else {
            return (Math.pow(value / M, L) - 1) / (L * S);
        }
    }
    // Approximate Z-score using P50 and standard deviation estimation (Legacy Fallback)
    const p50 = closestPoint.P50;
    const p5 = closestPoint.P5;
    const p95 = closestPoint.P95;
    if (p50 === undefined || p5 === undefined || p95 === undefined) {
        return null;
    }
    // Rough estimate: assume normal distribution where P5 ≈ -1.645 SD, P95 ≈ +1.645 SD
    const sdEstimate = (p95 - p5) / (2 * 1.645);
    return (value - p50) / sdEstimate;
}
/**
 * Estimate percentile from Z-score
 * @param zscore - Z-score value
 * @returns Percentile string or empty string
 */
export function estimatePercentile(zscore) {
    if (zscore === null) {
        return '';
    }
    if (zscore <= -2.33)
        return '3';
    if (zscore <= -1.645)
        return '5';
    if (zscore <= -1.28)
        return '10';
    if (zscore <= -0.674)
        return '25';
    if (zscore <= 0)
        return '50';
    if (zscore <= 0.674)
        return '75';
    if (zscore <= 1.28)
        return '90';
    if (zscore <= 1.645)
        return '95';
    if (zscore <= 2.33)
        return '97';
    return '>97';
}
/**
 * Calculate BMI data from height and weight measurements
 * @param heightData - Array of height measurements
 * @param weightData - Array of weight measurements
 * @returns Array of BMI data points
 */
export function calculateBmiData(heightData, weightData) {
    if (heightData.length === 0 || weightData.length === 0) {
        return [];
    }
    const bmiData = [];
    weightData.forEach(w => {
        const closestHeight = heightData.reduce((prev, curr) => Math.abs(curr.ageMonths - w.ageMonths) < Math.abs(prev.ageMonths - w.ageMonths)
            ? curr
            : prev);
        if (Math.abs(closestHeight.ageMonths - w.ageMonths) < 0.5) {
            const heightInMeters = closestHeight.value / 100;
            if (heightInMeters > 0) {
                const bmi = w.value / (heightInMeters * heightInMeters);
                bmiData.push({ ageMonths: w.ageMonths, value: bmi });
            }
        }
    });
    return bmiData;
}
/**
 * Calculate growth velocity between last two measurements
 * @param type - Measurement type label
 * @param measurements - Array of measurements
 * @param unit - Unit string for display
 * @param multiplier - Value multiplier (e.g., 1000 for kg to g)
 * @returns HTML string for velocity display
 */
export function calculateVelocity(type, measurements, unit, multiplier = 1) {
    if (measurements.length < 2) {
        return '';
    }
    const recent = measurements.slice(-2);
    const timeDiff = recent[1].ageMonths - recent[0].ageMonths;
    const valueDiff = (recent[1].value - recent[0].value) * multiplier;
    if (timeDiff <= 0) {
        return '';
    }
    const velocity = valueDiff / timeDiff;
    const timeStr = timeDiff < 2 ? `${timeDiff.toFixed(1)} month` : `${timeDiff.toFixed(1)} months`;
    return `
        <div class="velocity-item">
            <strong>${type} Velocity:</strong>
            <div class="velocity-value ${velocity > 0 ? 'text-success' : 'text-danger'}">
                ${velocity > 0 ? '+' : ''}${velocity.toFixed(1)} ${unit}
            </div>
            <small class="text-muted">over last ${timeStr}</small>
        </div>
    `;
}
/**
 * Format age in months to human-readable string
 * @param ageMonths - Age in months
 * @returns Formatted age string (e.g., "2y 3m" or "5m")
 */
export function formatAge(ageMonths) {
    const years = Math.floor(ageMonths / 12);
    const months = Math.round(ageMonths % 12);
    return years > 0 ? `${years}y ${months}m` : `${months}m`;
}
