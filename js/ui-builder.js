// Universal UI Component Builder for MedCalcEHR Calculators
import { UnitConverter } from './unit-converter.js';
/**
 * DOM element IDs used throughout the application
 */
const DOM_IDS = {
    CALCULATOR_CONTAINER: 'calculator-container',
    PAGE_TITLE: 'page-title',
    PATIENT_INFO: 'patient-info'
};
/**
 * UIBuilder - A comprehensive UI component generation system
 * Provides consistent styling and behavior across all calculators
 */
export class UIBuilder {
    /**
     * Escape HTML special characters to prevent XSS attacks
     * @param text - The text to escape
     * @returns Escaped HTML-safe string
     */
    escapeHtml(text) {
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, char => htmlEntities[char]);
    }
    /**
     * Create a section container
     * @param {Object} options - { title, subtitle, content }
     */
    createSection({ title, subtitle, icon, content = '' }) {
        const iconHTML = icon ? `<span class="section-icon">${icon}</span>` : '';
        return `
            <div class="ui-section">
                ${title ? `<div class="ui-section-title">${iconHTML}${title}</div>` : ''}
                ${subtitle ? `<div class="ui-section-subtitle">${subtitle}</div>` : ''}
                ${content}
            </div>
        `;
    }
    /**
     * Create a text input field
     * @param {Object} options - Configuration object
     */
    createInput({ id, label, type = 'number', placeholder = '', required = false, unit = null, unitToggle = null, // { type: 'weight', units: ['kg', 'lbs'] }
    helpText = '', min, max, step, defaultValue = '' }) {
        const requiredMark = required ? '<span class="required">*</span>' : '';
        // Only show static unit if unitToggle is not present (toggle button will handle unit display)
        const unitHTML = unit && !unitToggle ? `<span class="ui-input-unit">${unit}</span>` : '';
        const helpHTML = helpText ? `<div class="help-text">${helpText}</div>` : '';
        let attrs = `id="${id}" type="${type}" placeholder="${placeholder}"`;
        if (min !== undefined)
            attrs += ` min="${min}"`;
        if (max !== undefined)
            attrs += ` max="${max}"`;
        if (step !== undefined)
            attrs += ` step="${step}"`;
        if (defaultValue)
            attrs += ` value="${defaultValue}"`;
        if (required)
            attrs += ` required`;
        // Add data attribute for unit toggle if specified
        const toggleData = unitToggle ? `data-unit-toggle='${JSON.stringify(unitToggle)}'` : '';
        return `
            <div class="ui-input-group">
                <label for="${id}">${label}${requiredMark}</label>
                <div class="ui-input-wrapper" ${toggleData}>
                    <input class="ui-input" ${attrs}>
                    ${unitHTML}
                </div>
                ${helpHTML}
            </div>
        `;
    }
    /**
     * Create a radio button group
     * @param {Object} options - Configuration object
     */
    createRadioGroup({ name, label, options = [], // [{ value, label, checked }]
    required = false, helpText = '' }) {
        const requiredMark = required ? '<span class="required">*</span>' : '';
        const helpHTML = helpText ? `<div class="help-text">${helpText}</div>` : '';
        const optionsHTML = options
            .map((opt, index) => {
            const checked = opt.checked ? 'checked' : '';
            const disabled = opt.disabled ? 'disabled' : '';
            const id = opt.id || `${name}-${opt.value}-${index}`;
            return `
                <div class="ui-radio-option">
                    <input type="radio" 
                           id="${id}" 
                           name="${name}" 
                           value="${opt.value}" 
                           ${checked} 
                           ${disabled}>
                    <label for="${id}" class="radio-label">
                        ${opt.label}
                    </label>
                </div>
            `;
        })
            .join('');
        return `
            <div class="ui-input-group">
                ${label ? `<label>${label}${requiredMark}</label>` : ''}
                <div class="ui-radio-group">
                    ${optionsHTML}
                </div>
                ${helpHTML}
            </div>
        `;
    }
    /**
     * Create a checkbox group
     * @param {Object} options - Configuration object
     */
    createCheckboxGroup({ name, label, options = [], // [{ value, label, description, checked }]
    helpText = '' }) {
        const helpHTML = helpText ? `<div class="help-text">${helpText}</div>` : '';
        const optionsHTML = options
            .map((opt, index) => {
            const checked = opt.checked ? 'checked' : '';
            const disabled = opt.disabled ? 'disabled' : '';
            const id = opt.id || `${name}-${index}`;
            const descHTML = opt.description
                ? `<div class="checkbox-description">${opt.description}</div>`
                : '';
            return `
                <div class="ui-checkbox-option">
                    <input type="checkbox" 
                           id="${id}" 
                           name="${name}" 
                           value="${opt.value}" 
                           ${checked} 
                           ${disabled}>
                    <label for="${id}" class="checkbox-label">
                        ${opt.label}
                    </label>
                    ${descHTML}
                </div>
            `;
        })
            .join('');
        return `
            <div class="ui-input-group">
                ${label ? `<label>${label}</label>` : ''}
                <div class="ui-checkbox-group">
                    ${optionsHTML}
                </div>
                ${helpHTML}
            </div>
        `;
    }
    /**
     * Create a single checkbox
     * @param {Object} options - Configuration object
     */
    createCheckbox({ id, label, value = '1', checked = false, description = '' }) {
        const checkedAttr = checked ? 'checked' : '';
        const descHTML = description
            ? `<div class="checkbox-description">${description}</div>`
            : '';
        return `
            <div class="ui-checkbox-option">
                <input type="checkbox" 
                       id="${id}" 
                       value="${value}" 
                       ${checkedAttr}>
                <label for="${id}" class="checkbox-label">
                    ${label}
                </label>
                ${descHTML}
            </div>
        `;
    }
    /**
     * Create a select dropdown
     * @param {Object} options - Configuration object
     */
    createSelect({ id, label, options = [], // [{ value, label, selected }]
    required = false, helpText = '' }) {
        const requiredMark = required ? '<span class="required">*</span>' : '';
        const helpHTML = helpText ? `<div class="help-text">${helpText}</div>` : '';
        const optionsHTML = options
            .map(opt => {
            const selected = opt.selected ? 'selected' : '';
            return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
        })
            .join('');
        return `
            <div class="ui-input-group">
                <label for="${id}">${label}${requiredMark}</label>
                <select class="ui-select" id="${id}">
                    ${optionsHTML}
                </select>
                ${helpHTML}
            </div>
        `;
    }
    /**
     * Create a range slider
     * @param {Object} options - Configuration object
     */
    createRange({ id, label, min = 0, max = 100, step = 1, defaultValue = 50, unit = '', showValue = true }) {
        return `
            <div class="ui-input-group">
                <label for="${id}">${label}</label>
                <div class="ui-range-group">
                    <input type="range" 
                           class="ui-range-slider" 
                           id="${id}" 
                           min="${min}" 
                           max="${max}" 
                           step="${step}" 
                           value="${defaultValue}">
                    ${showValue ? `<span class="ui-range-value" id="${id}-value">${defaultValue}${unit}</span>` : ''}
                </div>
            </div>
        `;
    }
    /**
     * Create a result box container with Copy Report button
     * @param {Object} options - { id, title, content }
     */
    createResultBox({ id, title = 'Results' }) {
        return `
            <div id="${id}" class="ui-result-box">
                <div class="ui-result-header">
                    <span>${title}</span>
                    <button class="copy-report-btn" data-target="${id}" title="Copy Report to Clipboard">
                        📋 Copy Report
                    </button>
                </div>
                <div class="ui-result-content"></div>
            </div>
        `;
    }
    /**
     * Generate textual report from current inputs and results
     */
    generateReport(containerId = DOM_IDS.CALCULATOR_CONTAINER) {
        const container = document.getElementById(containerId);
        if (!container)
            return '';
        const title = document.getElementById(DOM_IDS.PAGE_TITLE)?.textContent || 'Calculator Report';
        const patientInfo = document.getElementById(DOM_IDS.PATIENT_INFO)?.innerText || 'Patient: Unknown';
        const date = new Date().toLocaleString();
        let report = `*** ${title} ***\n`;
        report += `${patientInfo} \n`;
        report += `Date: ${date} \n`;
        report += `Generated by: CGMH EHRCALC\n\n`;
        report += `--- INPUTS ---\n`;
        // Helper to get label text
        const getLabel = (element) => {
            const id = element.id;
            if (id) {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label)
                    return label.textContent?.replace('*', '').trim() || id;
            }
            return id || 'Unknown Field';
        };
        // Inputs
        const inputs = container.querySelectorAll('input:not([type="hidden"]), select');
        inputs.forEach((input) => {
            // Skip buttons etc
            if (input.type === 'button' || input.type === 'submit')
                return;
            // Handle Radios and Checkboxes
            if (input.type === 'radio' || input.type === 'checkbox') {
                if (input.checked) {
                    // Find option label
                    const optionLabel = input
                        .closest('.ui-radio-option, .ui-checkbox-option')
                        ?.querySelector('label')
                        ?.textContent?.trim();
                    // Find group label (exclude option labels)
                    let groupLabel = '';
                    const groupContainer = input.closest('.ui-input-group');
                    if (groupContainer) {
                        const labels = groupContainer.querySelectorAll('label');
                        for (let i = 0; i < labels.length; i++) {
                            // If this label is NOT inside an option wrapper, it's the group label
                            if (!labels[i].closest('.ui-radio-option, .ui-checkbox-option')) {
                                groupLabel = labels[i].textContent?.replace('*', '').trim() || '';
                                break;
                            }
                        }
                    }
                    // Fallback: Look for section title if no group label found
                    if (!groupLabel) {
                        const section = input.closest('.ui-section');
                        if (section) {
                            groupLabel =
                                section
                                    .querySelector('.ui-section-title')
                                    ?.textContent?.replace(/[\p{Emoji}\u200d]+/gu, '')
                                    .trim() || ''; // Remove emojis
                            if (!groupLabel) {
                                groupLabel =
                                    section
                                        .querySelector('.ui-section-subtitle')
                                        ?.textContent?.trim() || '';
                            }
                        }
                    }
                    if (groupLabel) {
                        report += `${groupLabel}: ${optionLabel || input.value}\n`;
                    }
                    else {
                        // Fallback if no group label, just show the selected option
                        report += `[x] ${optionLabel || input.value}\n`;
                    }
                }
                return;
            }
            // Normal text/number inputs
            const label = getLabel(input);
            const value = input.value;
            if (value) {
                report += `${label}: ${value} \n`;
            }
        });
        report += `\n--- RESULTS ---\n`;
        // Results
        // Try to get structured result items
        const resultItems = container.querySelectorAll('.ui-result-score, .ui-result-item');
        resultItems.forEach(item => {
            const label = item
                .querySelector('.ui-section-subtitle, .ui-result-label')
                ?.textContent?.trim();
            const value = item.querySelector('.ui-result-value')?.textContent?.trim();
            const unit = item.querySelector('.ui-result-unit')?.textContent?.trim();
            if (value) {
                let line = ``;
                if (label)
                    line += `${label}: `;
                line += value; // value usually includes unit span text if traversed
                // simple cleanup if unit is duplicated
                report += `${line} \n`;
            }
        });
        // Interpretations
        const interpretations = container.querySelectorAll('.ui-result-interpretation');
        interpretations.forEach(item => {
            report += `Interpretation: ${item.textContent?.trim()} \n`;
        });
        return report;
    }
    /**
     * Helper to create result item HTML
     */
    createResultItem({ label, value, unit = '', interpretation = '', alertClass = '' }) {
        let html = `
            <div class="ui-result-score">
                ${label ? `<div class="ui-result-label">${label}</div>` : ''}
                <div class="ui-result-value">${value}<span class="ui-result-unit">${unit}</span></div>
            </div>
        `;
        if (interpretation) {
            html += `<div class="ui-result-interpretation ${alertClass}">${interpretation}</div>`;
        }
        return html;
    }
    /**
     * Helper to create alert HTML
     */
    createAlert({ type = 'info', message, icon }) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            danger: '🚫',
            success: '✅'
        };
        const alertIcon = icon || icons[type] || icons.info;
        return `
            <div class="ui-alert ui-alert-${type}">
                <span class="ui-alert-icon">${alertIcon}</span>
                <div class="ui-alert-content">${message}</div>
            </div>
        `;
    }
    /**
     * Create a formula section
     * @param {Object} options - { items: [{ label, formula, notes }] }
     */
    createFormulaSection({ items = [], hideTitle = false }) {
        const itemsHTML = items
            .map(item => {
            const label = item.label || item.title || 'Formula';
            const formulaText = item.formula || item.content || '';
            const formulaContent = Array.isArray(item.formulas)
                ? item.formulas.map(f => `<div>${f}</div>`).join('')
                : formulaText;
            const notesHTML = item.notes
                ? `<div class="ui-formula-notes">${item.notes}</div>`
                : '';
            return `
            <div class="ui-formula-item">
                <strong>${label}:</strong>
                <div class="ui-formula-math">${formulaContent}</div>
                ${notesHTML}
            </div>
        `;
        })
            .join('');
        return `
            <div class="ui-formula-section">
                ${hideTitle ? '' : '<div class="ui-formula-title">Formulas</div>'}
                ${itemsHTML}
            </div>
        `;
    }
    /**
     * Helper to set radio group value programmatically
     * @param {string} name - The name of the radio group
     * @param {string} value - The value to select
     */
    setRadioValue(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            // Trigger visual update if needed (handled by initializeComponents listeners usually)
        }
    }
    /**
     * Initialize event listeners for dynamic components
     * Should be called after HTML is inserted into DOM
     * @param {HTMLElement} container - The container element
     */
    initializeComponents(container) {
        // Initialize unit toggles
        const inputsWithToggle = container.querySelectorAll('[data-unit-toggle]');
        inputsWithToggle.forEach(wrapper => {
            const input = wrapper.querySelector('.ui-input');
            let config = null;
            try {
                config = JSON.parse(wrapper.dataset.unitToggle || 'null');
            }
            catch (e) {
                console.warn('Failed to parse unit toggle config:', e);
            }
            // Ensure config is a proper object with units before attempting to enhance
            if (input && config && typeof config === 'object' && Array.isArray(config.units)) {
                UnitConverter.enhanceInput(input, config.type, config.units, config.default || config.units[0]);
            }
        });
        // Initialize range sliders with value display
        const rangeSliders = container.querySelectorAll('.ui-range-slider');
        rangeSliders.forEach(slider => {
            const valueDisplay = container.querySelector(`#${slider.id}-value`);
            if (valueDisplay) {
                slider.addEventListener('input', e => {
                    const unit = valueDisplay.textContent?.replace(/[0-9.-]/g, '') || '';
                    valueDisplay.textContent = e.target.value + unit;
                });
            }
        });
        // Add visual feedback for radio selections
        const radioInputs = container.querySelectorAll('.ui-radio-option input[type="radio"]');
        radioInputs.forEach(radio => {
            radio.addEventListener('change', () => {
                // Remove 'selected' class from all options in the same group
                const group = container.querySelectorAll(`input[name="${radio.name}"]`);
                group.forEach(r => {
                    if (r.parentElement)
                        r.parentElement.classList.remove('selected');
                });
                // Add 'selected' class to checked option
                if (radio.checked && radio.parentElement) {
                    radio.parentElement.classList.add('selected');
                }
            });
        });
        // Add visual feedback for checkbox selections
        const checkboxInputs = container.querySelectorAll('.ui-checkbox-option input[type="checkbox"]');
        checkboxInputs.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked && checkbox.parentElement) {
                    checkbox.parentElement.classList.add('selected');
                }
                else if (checkbox.parentElement) {
                    checkbox.parentElement.classList.remove('selected');
                }
            });
            // Initialize state
            if (checkbox.checked && checkbox.parentElement) {
                checkbox.parentElement.classList.add('selected');
            }
        });
        // Initialize Copy Report buttons
        const copyBtns = container.querySelectorAll('.copy-report-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const report = this.generateReport();
                navigator.clipboard
                    .writeText(report)
                    .then(() => {
                    const originalText = btn.textContent;
                    if (btn instanceof HTMLElement)
                        btn.textContent = '✅ Copied!';
                    setTimeout(() => {
                        if (btn instanceof HTMLElement)
                            btn.textContent = originalText;
                    }, 2000);
                })
                    .catch(err => {
                    console.error('Failed to copy report:', err);
                    alert('Failed to copy report to clipboard');
                });
            });
        });
    }
    /**
     * Create a complete form with multiple fields
     * @param options - Configuration object with fields array
     */
    createForm({ fields = [], submitLabel = 'Calculate', showSubmit = false }) {
        const fieldsHTML = fields
            .map(field => {
            switch (field.type) {
                case 'input':
                case 'number':
                case 'text':
                    return this.createInput(field);
                case 'radio':
                    return this.createRadioGroup(field);
                case 'checkbox':
                    if ('options' in field && Array.isArray(field.options)) {
                        return this.createCheckboxGroup(field);
                    }
                    else {
                        return this.createCheckbox(field);
                    }
                case 'select':
                    return this.createSelect(field);
                case 'range':
                    return this.createRange(field);
                case 'section':
                    return this.createSection(field);
                default:
                    return '';
            }
        })
            .join('');
        const submitHTML = showSubmit
            ? `
            <div class="ui-button-group">
                <button type="submit" class="ui-button ui-button-primary">${submitLabel}</button>
            </div>
        `
            : '';
        return `
            <form class="ui-form">
                ${fieldsHTML}
                ${submitHTML}
            </form>
        `;
    }
    /**
     * Create a data table
     * @param {Object} options - Configuration object
     */
    createTable({ id, headers = [], // ['Col 1', 'Col 2']
    rows = [], // [['r1c1', 'r1c2'], ['r2c1', 'r2c2']]
    className = '', stickyFirstColumn = false }) {
        const headerHTML = headers
            .map((h, i) => {
            const stickyClass = stickyFirstColumn && i === 0 ? 'sticky-col' : '';
            return `<th class="${stickyClass}">${h}</th>`;
        })
            .join('');
        const rowsHTML = rows
            .map(row => {
            const cellsHTML = row
                .map((cell, i) => {
                const stickyClass = stickyFirstColumn && i === 0 ? 'sticky-col' : '';
                return `<td class="${stickyClass}">${cell}</td>`;
            })
                .join('');
            return `<tr>${cellsHTML}</tr>`;
        })
            .join('');
        const tableClass = `ui-table ${className} ${stickyFirstColumn ? 'has-sticky-col' : ''}`;
        const wrapperId = id ? `id="${id}"` : '';
        return `
            <div class="ui-table-container" ${wrapperId}>
                <table class="${tableClass}">
                    <thead><tr>${headerHTML}</tr></thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </div>
        `;
    }
    /**
     * Create a list (ul/ol)
     * @param {Object} options - Configuration object
     */
    createList({ items = [], type = 'ul', className = '' }) {
        const itemsHTML = items.map(item => `<li>${item}</li>`).join('');
        return `<${type} class="ui-list ${className}">${itemsHTML}</${type}>`;
    }
    /**
     * Create a reference section for citations
     * @param {Object} options - Configuration object
     */
    createReference({ title = 'Reference', citations = [], icon = '📚' }) {
        const citationsHTML = citations.map(citation => `<p>${citation}</p>`).join('');
        return `
            <div class="info-section mt-20 text-sm text-muted">
                <h4>${icon} ${title}</h4>
                ${citationsHTML}
            </div>
        `;
    }
    /**
     * Create a risk factor item with badges (checkbox or radio)
     * Used for calculators like trade-off analysis that show HR values
     * @param {Object} options - Configuration object
     */
    createRiskFactorItem({ id, label, type = 'checkbox', name, checked = false, bleedingHR, ischemicHR, dataFactorId }) {
        const checkedAttr = checked ? 'checked' : '';
        const nameAttr = name ? `name="${name}"` : '';
        const dataAttr = dataFactorId ? `data-factor-id="${dataFactorId}"` : '';
        const bleedingBadge = bleedingHR && bleedingHR !== 1.0
            ? `<span class="hr-badge hr-badge-bleeding">Bleeding HR: ${bleedingHR}</span>`
            : '';
        const ischemicBadge = ischemicHR && ischemicHR !== 1.0
            ? `<span class="hr-badge hr-badge-ischemic">Thrombotic HR: ${ischemicHR}</span>`
            : '';
        return `
            <div class="risk-factor-item">
                <label class="risk-factor-label">
                    <input type="${type}" id="${id}" ${nameAttr} ${dataAttr} ${checkedAttr}>
                    <span class="factor-text">${label}</span>
                </label>
                <div class="hr-badges">
                    ${bleedingBadge}
                    ${ischemicBadge}
                </div>
            </div>
        `;
    }
    /**
     * Create a group of risk factor items with a title
     * @param {Object} options - Configuration object
     */
    createRiskFactorGroup({ title, icon, items }) {
        const iconHTML = icon ? `${icon} ` : '';
        const itemsHTML = items.map(item => this.createRiskFactorItem(item)).join('');
        return `
            <h3 class="factor-group-title">${iconHTML}${title}</h3>
            ${itemsHTML}
        `;
    }
}
// Create and export a singleton instance
export const uiBuilder = new UIBuilder();
// Export class for custom instances
export default UIBuilder;
