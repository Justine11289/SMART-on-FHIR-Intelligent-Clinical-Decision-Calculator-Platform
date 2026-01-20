// FHIR Data Loading Feedback System
// Provides visual feedback for FHIR data loading status

// ============================================================================
// Type Definitions
// ============================================================================

/** Status types for feedback indicators */
export type FeedbackStatus = 'loading' | 'success' | 'warning' | 'error' | 'info';

/** Data loading summary structure */
export interface DataLoadingSummary {
    loaded: string[];
    missing: Array<string | { id: string; label: string }>;
    failed: string[];
}

/** Specification for a data field to be loaded */
export interface DataFieldSpec {
    inputId: string;
    label: string;
    promise: Promise<any>;
    setValue?: (input: HTMLInputElement, data: any) => void;
}

/** Icons for each feedback status */
const STATUS_ICONS: Record<FeedbackStatus, string> = {
    loading: '⏳',
    success: '✓',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
};

/** CSS classes for each feedback status */
const STATUS_CLASSES: Record<FeedbackStatus, string> = {
    loading: 'fhir-status-loading',
    success: 'fhir-status-success',
    warning: 'fhir-status-warning',
    error: 'fhir-status-error',
    info: 'fhir-status-info'
};

// ============================================================================
// FHIRFeedback Class
// ============================================================================

/**
 * FHIRFeedback - Provides visual feedback for FHIR data loading status
 * Enhances UX by showing users when data is loaded, missing, or failed
 */
export class FHIRFeedback {
    private stylesInjected = false;

    // Dynamic tracking for missing fields
    private trackedFields: Map<string, { id: string; label: string }> = new Map();
    private currentMissingIds: Set<string> = new Set();
    private summaryContainer: HTMLElement | null = null;
    private boundInputHandlers: Map<string, (e: Event) => void> = new Map();

    constructor() {
        this.injectStyles();
    }

    /**
     * Inject CSS styles for feedback components
     * Loads external CSS file or injects minimal fallback
     */
    injectStyles(): void {
        if (typeof document === 'undefined' || this.stylesInjected) return;
        if (document.getElementById('fhir-feedback-styles')) {
            this.stylesInjected = true;
            return;
        }

        // Try to load external CSS
        const link = document.createElement('link');
        link.id = 'fhir-feedback-styles';
        link.rel = 'stylesheet';
        link.href = './css/fhir-feedback.css';
        document.head.appendChild(link);
        this.stylesInjected = true;
    }

    // ========================================================================
    // Core Indicator Methods
    // ========================================================================

    /**
     * Create a feedback indicator element
     * @private
     */
    private createIndicator(status: FeedbackStatus, tooltip: string): HTMLElement {
        const indicator = document.createElement('div');
        indicator.className = `fhir-feedback-indicator ${STATUS_CLASSES[status]}`;
        indicator.innerHTML = `
            <span>${STATUS_ICONS[status]}</span>
            <div class="fhir-feedback-tooltip">${tooltip}</div>
        `;
        return indicator;
    }

    /**
     * Show a feedback indicator on an input element
     * @private
     */
    private showIndicator(
        inputElement: HTMLElement,
        status: FeedbackStatus,
        tooltip: string,
        options: { autoRemove?: number; dismissOnInput?: boolean } = {}
    ): HTMLElement {
        this.removeAllIndicators(inputElement);
        const wrapper = this.ensureWrapper(inputElement);
        const indicator = this.createIndicator(status, tooltip);
        wrapper.appendChild(indicator);

        // Auto-remove after timeout
        if (options.autoRemove) {
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }, options.autoRemove);
        }

        // Dismiss on user input
        if (options.dismissOnInput) {
            const handler = () => {
                indicator.remove();
                this.updateSummaryOnInput(inputElement);
                inputElement.removeEventListener('input', handler);
                inputElement.removeEventListener('change', handler);
            };
            inputElement.addEventListener('input', handler);
            inputElement.addEventListener('change', handler);
        }

        return indicator;
    }

    // ========================================================================
    // Public Status Methods
    // ========================================================================

    /**
     * Show loading indicator
     */
    showLoading(inputElement: HTMLElement, label: string = 'data'): void {
        this.showIndicator(inputElement, 'loading', `Loading ${label} from EHR...`);
    }

    /**
     * Show success indicator (auto-removes after 5 seconds)
     */
    showSuccess(inputElement: HTMLElement, label: string = 'data', value: string = ''): void {
        const tooltip = `✓ ${label} loaded from EHR${value ? `: ${value}` : ''}`;
        this.showIndicator(inputElement, 'success', tooltip, { autoRemove: 5000 });
    }

    /**
     * Show warning indicator (dismisses on user input)
     */
    showWarning(
        inputElement: HTMLElement,
        label: string = 'data',
        message: string | null = null
    ): void {
        const tooltip = message || `⚠️ No ${label} found in EHR. Please enter manually.`;
        this.showIndicator(inputElement, 'warning', tooltip, { dismissOnInput: true });
    }

    /**
     * Show error indicator
     */
    showError(inputElement: HTMLElement, label: string = 'data', error: Error | null = null): void {
        const errorMsg = error?.message || 'Failed to load from EHR';
        this.showIndicator(inputElement, 'error', `❌ ${label}: ${errorMsg}`);
    }

    /**
     * Show info indicator
     */
    showInfo(inputElement: HTMLElement, message: string): void {
        this.showIndicator(inputElement, 'info', message);
    }

    // ========================================================================
    // Field Feedback
    // ========================================================================

    /**
     * Add inline field-level feedback message
     */
    addFieldFeedback(
        inputElement: HTMLElement,
        message: string,
        type: 'success' | 'warning' | 'info' = 'info'
    ): void {
        const inputGroup = inputElement.closest('.ui-input-group');
        if (!inputGroup) return;

        // Remove existing feedback
        inputGroup.querySelector('.fhir-field-feedback')?.remove();

        const icons = { success: '✓', warning: '⚠️', info: 'ℹ️' };
        const feedback = document.createElement('div');
        feedback.className = `fhir-field-feedback ${type}`;
        feedback.innerHTML = `
            <span class="icon">${icons[type]}</span>
            <span>${message}</span>
        `;

        const wrapper = inputElement.closest('.ui-input-wrapper, .fhir-feedback-wrapper');
        if (wrapper?.parentNode) {
            wrapper.parentNode.insertBefore(feedback, wrapper.nextSibling);
        } else if (inputElement.parentNode) {
            inputElement.parentNode.insertBefore(feedback, inputElement.nextSibling);
        }
    }

    // ========================================================================
    // Banner Methods
    // ========================================================================

    /**
     * Create a loading banner for the entire form
     */
    createLoadingBanner(
        container: HTMLElement,
        message: string = 'Loading patient data from EHR...'
    ): HTMLElement {
        const banner = document.createElement('div');
        banner.className = 'fhir-loading-banner';
        banner.id = 'fhir-loading-banner';
        banner.innerHTML = `
            <div class="spinner"></div>
            <span>${message}</span>
        `;

        const firstSection = container.querySelector('.ui-section, .section');
        container.insertBefore(banner, firstSection || container.firstChild);
        return banner;
    }

    /**
     * Remove loading banner
     */
    removeLoadingBanner(container: HTMLElement): void {
        const banner = container.querySelector('#fhir-loading-banner') as HTMLElement;
        if (banner) {
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 300);
        }
    }

    // ========================================================================
    // Summary Methods
    // ========================================================================

    /**
     * Create a summary notification showing what data was loaded/missing
     */
    createDataSummary(container: HTMLElement, summary: DataLoadingSummary): HTMLElement {
        const { loaded = [], missing = [], failed = [] } = summary;

        let type: 'success' | 'warning' | 'error' = 'success';
        let icon = '✓';
        let title = 'Patient data loaded successfully';

        if (failed.length > 0) {
            type = 'error';
            icon = '❌';
            title = 'Error loading some patient data';
        } else if (missing.length > 0) {
            type = 'warning';
            icon = '⚠️';
            title = 'Some patient data is missing';
        }

        const summaryDiv = document.createElement('div');
        summaryDiv.className = `fhir-data-summary ${type}`;
        summaryDiv.id = 'fhir-data-summary';

        let detailsHTML = '';

        if (loaded.length > 0) {
            detailsHTML += `<div class="details">Loaded: ${loaded.join(', ')}</div>`;
        }

        if (missing.length > 0) {
            const listItems = missing
                .map(item => {
                    if (typeof item === 'string') return `<li>${item}</li>`;
                    return `<li data-field-id="${item.id}">${item.label}</li>`;
                })
                .join('');
            detailsHTML += `
                <div class="details">
                    <strong>Please enter manually:</strong>
                    <ul class="missing-list">${listItems}</ul>
                </div>
            `;
        }

        if (failed.length > 0) {
            const listItems = failed.map(item => `<li>${item}</li>`).join('');
            detailsHTML += `
                <div class="details">
                    <strong>Failed to load:</strong>
                    <ul class="missing-list">${listItems}</ul>
                </div>
            `;
        }

        summaryDiv.innerHTML = `
            <div class="icon">${icon}</div>
            <div class="content">
                <div class="title">${title}</div>
                ${detailsHTML}
            </div>
        `;

        const firstSection = container.querySelector('.ui-section, .section');
        container.insertBefore(summaryDiv, firstSection || container.firstChild);
        return summaryDiv;
    }

    /**
     * Remove data summary
     */
    removeDataSummary(container: HTMLElement): void {
        container.querySelector('#fhir-data-summary')?.remove();
    }

    // ========================================================================
    // Data Loading Tracker
    // ========================================================================

    /**
     * Track and display FHIR data loading status
     */
    async trackDataLoading(
        container: HTMLElement,
        dataFields: DataFieldSpec[]
    ): Promise<DataLoadingSummary> {
        this.createLoadingBanner(container);

        const results: DataLoadingSummary = {
            loaded: [],
            missing: [],
            failed: []
        };

        // Show loading indicators
        dataFields.forEach(field => {
            const input = container.querySelector(`#${field.inputId}`) as HTMLElement;
            if (input) this.showLoading(input, field.label);
        });

        // Process all promises
        await Promise.allSettled(
            dataFields.map(async field => {
                const input = container.querySelector(`#${field.inputId}`) as HTMLInputElement;
                if (!input) return;

                try {
                    const data = await field.promise;
                    if (data && field.setValue) {
                        field.setValue(input, data);
                        this.showSuccess(input, field.label, input.value);
                        results.loaded.push(field.label);
                    } else {
                        this.showWarning(input, field.label);
                        results.missing.push({
                            id: field.inputId.replace(/^#/, ''),
                            label: field.label
                        });
                    }
                } catch (error: any) {
                    console.error(`Error loading ${field.label}:`, error);
                    this.showError(input, field.label, error);
                    results.failed.push(field.label);
                }
            })
        );

        this.removeLoadingBanner(container);
        this.createDataSummary(container, results);
        return results;
    }

    // ========================================================================
    // Private Helpers
    // ========================================================================

    /**
     * Ensure input is wrapped for positioning indicators
     * @private
     */
    private ensureWrapper(inputElement: HTMLElement): HTMLElement {
        let wrapper = inputElement.closest('.fhir-feedback-wrapper') as HTMLElement;

        if (!wrapper) {
            const existingWrapper = inputElement.closest('.ui-input-wrapper') as HTMLElement;
            if (existingWrapper && !existingWrapper.classList.contains('fhir-feedback-wrapper')) {
                existingWrapper.classList.add('fhir-feedback-wrapper');
                wrapper = existingWrapper;
            } else if (!existingWrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'fhir-feedback-wrapper';
                inputElement.parentNode?.insertBefore(wrapper, inputElement);
                wrapper.appendChild(inputElement);
            }
        }

        return wrapper;
    }

    /**
     * Remove all indicators from an input
     * @private
     */
    private removeAllIndicators(inputElement: HTMLElement): void {
        const wrapper = inputElement.closest('.fhir-feedback-wrapper, .ui-input-wrapper');
        wrapper?.querySelectorAll('.fhir-feedback-indicator').forEach(ind => ind.remove());
    }

    /**
     * Update summary when user fills in missing field
     * @private
     */
    private updateSummaryOnInput(inputElement: HTMLElement): void {
        const fieldId = inputElement.id;
        const input = inputElement as HTMLInputElement;
        const hasValue = input.value && input.value.trim() !== '';

        if (hasValue) {
            this.removeFieldFromMissingList(fieldId);
        } else {
            this.addFieldToMissingList(fieldId);
        }
    }

    /**
     * Remove a field from the missing list in the summary
     * @private
     */
    private removeFieldFromMissingList(fieldId: string): void {
        if (!this.currentMissingIds.has(fieldId)) return;

        this.currentMissingIds.delete(fieldId);

        const summaryItem = document.querySelector(
            `#fhir-data-summary li[data-field-id="${fieldId}"]`
        );
        if (summaryItem) {
            summaryItem.classList.add('removing');
            setTimeout(() => summaryItem.remove(), 300);
        }

        this.updateSummaryBannerState();
    }

    /**
     * Add a field back to the missing list in the summary
     * @private
     */
    private addFieldToMissingList(fieldId: string): void {
        if (this.currentMissingIds.has(fieldId)) return;

        const field = this.trackedFields.get(fieldId);
        if (!field) return;

        this.currentMissingIds.add(fieldId);

        const missingList = document.querySelector('#fhir-data-summary .missing-list');
        if (missingList) {
            const li = document.createElement('li');
            li.setAttribute('data-field-id', fieldId);
            li.textContent = field.label;
            li.classList.add('adding');
            missingList.appendChild(li);
            // Trigger reflow for animation
            void li.offsetHeight;
            li.classList.remove('adding');
        } else {
            // Need to recreate the summary banner
            this.recreateSummaryBanner();
        }

        this.updateSummaryBannerState();
    }

    /**
     * Update the summary banner state based on current missing fields
     * @private
     */
    private updateSummaryBannerState(): void {
        const summary = document.querySelector('#fhir-data-summary');
        if (!summary) return;

        const missingList = summary.querySelector('.missing-list');
        const missingCount = missingList?.children.length || 0;

        if (missingCount === 0) {
            // All fields filled - change to success state
            summary.className = 'fhir-data-summary success';
            const icon = summary.querySelector('.icon');
            const title = summary.querySelector('.title');
            if (icon) icon.textContent = '✓';
            if (title) title.textContent = 'All required data has been entered';

            // Hide the details section
            summary
                .querySelectorAll('.details')
                .forEach(d => ((d as HTMLElement).style.display = 'none'));

            // Auto-hide after 3 seconds
            setTimeout(() => {
                if (summary.classList.contains('success')) {
                    (summary as HTMLElement).style.opacity = '0';
                    setTimeout(() => summary.remove(), 300);
                }
            }, 3000);
        } else {
            // Still have missing fields - ensure warning state
            summary.className = 'fhir-data-summary warning';
            const icon = summary.querySelector('.icon');
            const title = summary.querySelector('.title');
            if (icon) icon.textContent = '⚠️';
            if (title) title.textContent = 'Some patient data is missing';

            // Show the details section
            summary
                .querySelectorAll('.details')
                .forEach(d => ((d as HTMLElement).style.display = ''));
        }
    }

    /**
     * Recreate the summary banner when fields become missing again
     * @private
     */
    private recreateSummaryBanner(): void {
        if (!this.summaryContainer || this.currentMissingIds.size === 0) return;

        // Remove existing banner if any
        this.removeDataSummary(this.summaryContainer);

        // Build missing list from current tracked missing IDs
        const missingFields: Array<{ id: string; label: string }> = [];
        this.currentMissingIds.forEach(id => {
            const field = this.trackedFields.get(id);
            if (field) missingFields.push(field);
        });

        if (missingFields.length > 0) {
            this.createDataSummary(this.summaryContainer, {
                loaded: [],
                missing: missingFields,
                failed: []
            });
        }
    }

    /**
     * Setup dynamic tracking for all input fields
     * Call this after createDataSummary to enable real-time updates
     */
    setupDynamicTracking(
        container: HTMLElement,
        missingFields: Array<string | { id: string; label: string }>
    ): void {
        this.summaryContainer = container;
        this.trackedFields.clear();
        this.currentMissingIds.clear();
        this.cleanupEventListeners();

        missingFields.forEach(field => {
            const fieldObj = typeof field === 'string' ? { id: field, label: field } : field;

            // Normalize ID: remove leading # if present
            const cleanId = fieldObj.id.replace(/^#/, '');
            const normalizedField = { id: cleanId, label: fieldObj.label };

            this.trackedFields.set(cleanId, normalizedField);
            this.currentMissingIds.add(cleanId);

            const input = container.querySelector(`#${cleanId}`) as HTMLInputElement;
            if (input) {
                const handler = () => this.updateSummaryOnInput(input);
                this.boundInputHandlers.set(cleanId, handler);
                input.addEventListener('input', handler);
                input.addEventListener('change', handler);
            }
        });
    }

    /**
     * Cleanup event listeners when no longer needed
     */
    private cleanupEventListeners(): void {
        if (!this.summaryContainer) return;

        this.boundInputHandlers.forEach((handler, fieldId) => {
            const input = this.summaryContainer?.querySelector(`#${fieldId}`) as HTMLInputElement;
            if (input) {
                input.removeEventListener('input', handler);
                input.removeEventListener('change', handler);
            }
        });
        this.boundInputHandlers.clear();
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const fhirFeedback = new FHIRFeedback();
export default FHIRFeedback;
