// Module for tracking and warning about stale (outdated) lab values and vital signs
import { getLoincName } from './fhir-codes.js';
/**
 * Default staleness threshold: 3 months in milliseconds
 */
const DEFAULT_STALENESS_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
/**
 * Staleness warning tracking class
 * Tracks stale observations for a calculator instance
 */
export class DataStalenessTracker {
    constructor(options = {}) {
        this.thresholdMs = options.thresholdMs || DEFAULT_STALENESS_THRESHOLD_MS;
        this.staleItems = new Map(); // Map<fieldId, { code, date, label, ageInDays }>
        this.container = null;
        this.warningContainerId = options.warningContainerId || 'staleness-warnings';
    }
    /**
     * Set the container for this tracker
     * @param {HTMLElement} container - The calculator container
     */
    setContainer(container) {
        this.container = container;
        this._ensureWarningContainer();
    }
    /**
     * Check if an observation is stale
     * @param {Object} observation - FHIR Observation resource
     * @returns {Object|null} - Staleness info { isStale, date, ageInDays } or null if no date
     */
    checkStaleness(observation) {
        if (!observation)
            return null;
        // FHIR Observation date can be in:
        // - effectiveDateTime (single point in time)
        // - effectiveInstant (precise point in time)
        // - effectivePeriod.start or effectivePeriod.end
        // - issued (when the observation was made available)
        const dateStr = observation.effectiveDateTime ||
            observation.effectiveInstant ||
            observation.effectivePeriod?.end ||
            observation.effectivePeriod?.start ||
            observation.issued;
        if (!dateStr)
            return null;
        const observationDate = new Date(dateStr);
        const now = new Date();
        const ageMs = now.getTime() - observationDate.getTime();
        const ageInDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
        return {
            isStale: ageMs > this.thresholdMs,
            date: observationDate,
            dateStr: this._formatDate(observationDate),
            ageInDays: ageInDays,
            ageFormatted: this._formatAge(ageInDays)
        };
    }
    /**
     * Track an observation for a specific field
     * @param {string} fieldId - The input field ID
     * @param {Object} observation - FHIR Observation resource
     * @param {string} code - LOINC code for the observation
     * @param {string} customLabel - Optional custom label
     * @returns {Object|null} - Staleness info if stale, null otherwise
     */
    trackObservation(fieldId, observation, code, customLabel = null) {
        const stalenessInfo = this.checkStaleness(observation);
        if (stalenessInfo && stalenessInfo.isStale) {
            const label = customLabel || getLoincName(code) || code;
            this.staleItems.set(fieldId, {
                code,
                label: this._capitalizeLabel(label || ''),
                date: stalenessInfo.date,
                dateStr: stalenessInfo.dateStr,
                ageInDays: stalenessInfo.ageInDays,
                ageFormatted: stalenessInfo.ageFormatted
            });
            this._updateWarningDisplay();
            return stalenessInfo;
        }
        else {
            // Remove from stale items if it was previously stale but now updated
            if (this.staleItems.has(fieldId)) {
                this.staleItems.delete(fieldId);
                this._updateWarningDisplay();
            }
        }
        return stalenessInfo;
    }
    /**
     * Clear tracking for a field
     * @param {string} fieldId - The input field ID
     */
    clearField(fieldId) {
        if (this.staleItems.has(fieldId)) {
            this.staleItems.delete(fieldId);
            this._updateWarningDisplay();
        }
    }
    /**
     * Clear all stale tracking
     */
    clearAll() {
        this.staleItems.clear();
        this._updateWarningDisplay();
    }
    /**
     * Get count of stale items
     * @returns {number}
     */
    getStaleCount() {
        return this.staleItems.size;
    }
    /**
     * Get all stale items as array
     * @returns {Array}
     */
    getStaleItems() {
        return Array.from(this.staleItems.entries()).map(([fieldId, info]) => ({
            fieldId,
            ...info
        }));
    }
    /**
     * Ensure the warning container exists in the DOM
     * @private
     */
    _ensureWarningContainer() {
        if (!this.container)
            return;
        let warningContainer = this.container.querySelector(`#${this.warningContainerId}`);
        if (!warningContainer) {
            warningContainer = document.createElement('div');
            warningContainer.id = this.warningContainerId;
            warningContainer.className = 'staleness-warning-container';
            // Insert at the top of the calculator (after header if exists)
            const header = this.container.querySelector('.calculator-header');
            if (header && header.nextSibling && header.parentNode) {
                header.parentNode.insertBefore(warningContainer, header.nextSibling);
            }
            else {
                this.container.insertBefore(warningContainer, this.container.firstChild);
            }
        }
    }
    /**
     * Update the warning display
     * @private
     */
    _updateWarningDisplay() {
        if (!this.container)
            return;
        const warningContainer = this.container.querySelector(`#${this.warningContainerId}`);
        if (!warningContainer)
            return;
        if (this.staleItems.size === 0) {
            warningContainer.innerHTML = '';
            warningContainer.style.display = 'none';
            return;
        }
        warningContainer.style.display = 'block';
        const items = this.getStaleItems();
        const itemsHtml = items
            .map(item => `
            <li class="staleness-item" data-field="${item.fieldId}">
                <strong>${item.label}</strong>: 
                <span class="staleness-date">${item.dateStr}</span>
                <span class="staleness-age">(${item.ageFormatted})</span>
            </li>
        `)
            .join('');
        warningContainer.innerHTML = `
            <div class="staleness-warning ui-alert ui-alert-warning">
                <span class="ui-alert-icon">⚠️</span>
                <div class="ui-alert-content">
                    <strong>Stale Data Warning</strong>
                    <p style="margin: 8px 0 8px 0; font-size: 1.2rem;">
                        The following auto-populated values are older than 3 months. Please verify if updates are needed:
                    </p>
                    <ul class="staleness-list" style="margin: 0; padding-left: 20px;">
                        ${itemsHtml}
                    </ul>
                </div>
            </div>
        `;
    }
    /**
     * Format date for display
     * @private
     */
    _formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    /**
     * Format age in days to human-readable format
     * @private
     */
    _formatAge(days) {
        if (days >= 365) {
            const years = Math.floor(days / 365);
            const months = Math.floor((days % 365) / 30);
            if (months > 0) {
                return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''} ago`;
            }
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
        else if (days >= 30) {
            const months = Math.floor(days / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        else {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }
    /**
     * Capitalize label properly
     * @private
     */
    _capitalizeLabel(label) {
        return label
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}
/**
 * Helper function to get observation date from FHIR Observation
 * @param {Object} observation - FHIR Observation resource
 * @returns {Date|null}
 */
export function getObservationDate(observation) {
    if (!observation)
        return null;
    const dateStr = observation.effectiveDateTime ||
        observation.effectiveInstant ||
        observation.effectivePeriod?.end ||
        observation.effectivePeriod?.start ||
        observation.issued;
    return dateStr ? new Date(dateStr) : null;
}
/**
 * Check if an observation is stale (older than threshold)
 * @param {Object} observation - FHIR Observation resource
 * @param {number} thresholdMs - Staleness threshold in milliseconds (default: 90 days)
 * @returns {boolean}
 */
export function isObservationStale(observation, thresholdMs = DEFAULT_STALENESS_THRESHOLD_MS) {
    const date = getObservationDate(observation);
    if (!date)
        return false;
    return new Date().getTime() - date.getTime() > thresholdMs;
}
/**
 * Create a staleness tracker for a calculator
 * @param {Object} options - Tracker options
 * @returns {DataStalenessTracker}
 */
export function createStalenessTracker(options = {}) {
    return new DataStalenessTracker(options);
}
// Load external CSS for staleness warnings
if (typeof document !== 'undefined') {
    if (!document.getElementById('staleness-warning-styles')) {
        const link = document.createElement('link');
        link.id = 'staleness-warning-styles';
        link.rel = 'stylesheet';
        link.href = './css/data-staleness.css';
        document.head.appendChild(link);
    }
}
export default {
    DataStalenessTracker,
    createStalenessTracker,
    getObservationDate,
    isObservationStale
};
