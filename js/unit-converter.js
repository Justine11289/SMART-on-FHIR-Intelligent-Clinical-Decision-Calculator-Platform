// Universal Unit Conversion System for MedCalcEHR
/**
 * Unit conversion definitions and functions
 */
export const UnitConverter = {
    // Conversion factors
    conversions: {
        // Weight
        weight: {
            kg: { lbs: 2.20462, g: 1000 },
            lbs: { kg: 0.453592, g: 453.592 },
            g: { kg: 0.001, lbs: 0.00220462 }
        },
        // Height/Length
        height: {
            cm: { in: 0.393701, ft: 0.0328084, m: 0.01 },
            in: { cm: 2.54, ft: 0.0833333, m: 0.0254 },
            ft: { cm: 30.48, in: 12, m: 0.3048 },
            m: { cm: 100, in: 39.3701, ft: 3.28084 }
        },
        // Temperature
        temperature: {
            C: {
                F: (val) => (val * 9) / 5 + 32,
                K: (val) => val + 273.15
            },
            F: {
                C: (val) => ((val - 32) * 5) / 9,
                K: (val) => ((val - 32) * 5) / 9 + 273.15
            },
            K: {
                C: (val) => val - 273.15,
                F: (val) => ((val - 273.15) * 9) / 5 + 32
            }
        },
        // Blood Pressure
        pressure: {
            mmHg: { kPa: 0.133322, bar: 0.00133322, 'mm[Hg]': 1 },
            kPa: { mmHg: 7.50062, bar: 0.01, 'mm[Hg]': 7.50062 },
            bar: { mmHg: 750.062, kPa: 100, 'mm[Hg]': 750.062 },
            'mm[Hg]': { mmHg: 1, kPa: 0.133322, bar: 0.00133322 }
        },
        // Volume
        volume: {
            mL: { L: 0.001, 'fl oz': 0.033814, cup: 0.00422675 },
            L: { mL: 1000, 'fl oz': 33.814, cup: 4.22675 },
            'fl oz': { mL: 29.5735, L: 0.0295735, cup: 0.125 },
            cup: { mL: 236.588, L: 0.236588, 'fl oz': 8 }
        },
        // Concentration (generic)
        concentration: {
            'mg/dL': { 'mmol/L': null },
            'g/L': { 'mg/dL': 100, 'g/dL': 0.1 },
            'g/dL': { 'mg/dL': 1000, 'g/L': 10 }
        },
        // Glucose
        glucose: {
            'mg/dL': { 'mmol/L': 0.0555 },
            'mmol/L': { 'mg/dL': 18.018 }
        },
        // Creatinine
        creatinine: {
            'mg/dL': { 'µmol/L': 88.4, 'umol/L': 88.4 },
            'µmol/L': { 'mg/dL': 0.0113 },
            'umol/L': { 'mg/dL': 0.0113 }
        },
        // Calcium
        calcium: {
            'mg/dL': { 'mmol/L': 0.2495 },
            'mmol/L': { 'mg/dL': 4.008 }
        },
        // Albumin
        albumin: {
            'g/dL': { 'g/L': 10 },
            'g/L': { 'g/dL': 0.1 }
        },
        // Bilirubin
        bilirubin: {
            'mg/dL': { 'µmol/L': 17.1, 'umol/L': 17.1 },
            'µmol/L': { 'mg/dL': 0.0585 },
            'umol/L': { 'mg/dL': 0.0585 }
        },
        // Hemoglobin
        hemoglobin: {
            'g/dL': { 'g/L': 10, 'mmol/L': 0.6206 },
            'g/L': { 'g/dL': 0.1 },
            'mmol/L': { 'g/dL': 1.611 }
        },
        // Urea/BUN
        bun: {
            'mg/dL': { 'mmol/L': 0.357 },
            'mmol/L': { 'mg/dL': 2.801 }
        },
        // Electrolytes (Na, K)
        electrolyte: {
            'mEq/L': { 'mmol/L': 1 },
            'mmol/L': { 'mEq/L': 1 }
        },
        // Cholesterol (TC, HDL, LDL)
        cholesterol: {
            'mg/dL': { 'mmol/L': 0.02586 },
            'mmol/L': { 'mg/dL': 38.67 }
        },
        // Total Cholesterol (alias for cholesterol)
        totalCholesterol: {
            'mg/dL': { 'mmol/L': 0.02586 },
            'mmol/L': { 'mg/dL': 38.67 }
        },
        // HDL Cholesterol
        hdl: {
            'mg/dL': { 'mmol/L': 0.02586 },
            'mmol/L': { 'mg/dL': 38.67 }
        },
        // LDL Cholesterol
        ldl: {
            'mg/dL': { 'mmol/L': 0.02586 },
            'mmol/L': { 'mg/dL': 38.67 }
        },
        // Triglycerides
        triglycerides: {
            'mg/dL': { 'mmol/L': 0.01129 },
            'mmol/L': { 'mg/dL': 88.57 }
        },
        // Sodium
        sodium: {
            'mEq/L': { 'mmol/L': 1 },
            'mmol/L': { 'mEq/L': 1 }
        },
        // Platelet count
        platelet: {
            '×10⁹/L': { '×10³/µL': 1, 'K/µL': 1, '10*3/uL': 1 },
            '×10³/µL': { '×10⁹/L': 1 },
            'K/µL': { '×10⁹/L': 1 },
            '10*3/uL': { '×10⁹/L': 1 }
        },
        // White blood cell count
        wbc: {
            '×10⁹/L': { '×10³/µL': 1, 'K/µL': 1, '10*3/uL': 1 },
            '×10³/µL': { '×10⁹/L': 1 },
            'K/µL': { '×10⁹/L': 1 },
            '10*3/uL': { '×10⁹/L': 1 }
        },
        // D-dimer
        ddimer: {
            'mg/L': { 'µg/mL': 1, 'ng/mL': 1000 },
            'µg/mL': { 'mg/L': 1 },
            'ng/mL': { 'mg/L': 0.001 }
        },
        // Fibrinogen
        fibrinogen: {
            'g/L': { 'mg/dL': 100 },
            'mg/dL': { 'g/L': 0.01 }
        },
        // Insulin
        insulin: {
            'µU/mL': { 'pmol/L': 6.945, 'mU/L': 1 },
            'mU/L': { 'pmol/L': 6.945, 'µU/mL': 1 },
            'pmol/L': { 'µU/mL': 0.144, 'mU/L': 0.144 }
        },
        // Phenytoin
        phenytoin: {
            'mcg/mL': { 'µmol/L': 3.964, 'mg/L': 1 },
            'µmol/L': { 'mcg/mL': 0.252, 'mg/L': 0.252 },
            'mg/L': { 'mcg/mL': 1, 'µmol/L': 3.964 }
        }
    },
    /**
     * Convert a value from one unit to another
     * @param {number} value - The value to convert
     * @param {string} fromUnit - The source unit
     * @param {string} toUnit - The target unit
     * @param {string} type - The measurement type (weight, height, temperature, etc.)
     * @returns {number|null} - The converted value or null if conversion not available
     */
    convert(value, fromUnit, toUnit, type) {
        if (value === null || value === undefined || isNaN(value))
            return null;
        if (fromUnit === toUnit)
            return value;
        const typeConversions = this.conversions[type];
        if (!typeConversions || !typeConversions[fromUnit])
            return null;
        const conversion = typeConversions[fromUnit][toUnit];
        if (conversion === undefined)
            return null;
        // Handle function-based conversions (like temperature)
        if (typeof conversion === 'function') {
            return conversion(value);
        }
        // Handle factor-based conversions
        return value * conversion;
    },
    /**
     * Create a unit toggle button with conversion logic
     * @param {HTMLElement} inputElement - The input element to attach conversion to
     * @param {string} type - The measurement type
     * @param {Array} units - Array of unit strings, e.g., ['kg', 'lbs']
     * @param {string} defaultUnit - The default unit
     * @returns {HTMLElement} - The toggle button element
     */
    createUnitToggle(inputElement, type, units = [], defaultUnit = units[0]) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'unit-toggle-btn';
        toggleBtn.dataset.currentUnit = defaultUnit;
        toggleBtn.dataset.units = JSON.stringify(units);
        toggleBtn.dataset.type = type;
        toggleBtn.textContent = defaultUnit;
        toggleBtn.title = `Click to switch units (${units.join(' ↔ ')})`;
        // Store original value and unit
        let storedValue = null;
        let currentUnitIndex = 0;
        toggleBtn.addEventListener('click', e => {
            e.preventDefault();
            const currentValue = parseFloat(inputElement.value);
            if (!isNaN(currentValue)) {
                storedValue = currentValue;
            }
            // Cycle to next unit
            currentUnitIndex = (currentUnitIndex + 1) % units.length;
            const oldUnit = units[(currentUnitIndex - 1 + units.length) % units.length];
            const newUnit = units[currentUnitIndex];
            // Convert the value if present
            if (storedValue !== null && !isNaN(storedValue)) {
                const converted = this.convert(storedValue, oldUnit, newUnit, type);
                if (converted !== null) {
                    // Determine appropriate decimal places
                    const decimals = this.getDecimalPlaces(type, newUnit);
                    inputElement.value = converted.toFixed(decimals);
                    storedValue = converted;
                    // Fix: Update input element dataset unit immediately
                    inputElement.dataset.currentUnit = newUnit;
                }
            }
            // Update button
            toggleBtn.textContent = newUnit;
            toggleBtn.dataset.currentUnit = newUnit;
            // Trigger change event on input to recalculate
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        });
        return toggleBtn;
    },
    /**
     * Get appropriate decimal places for a given unit
     */
    getDecimalPlaces(type, unit) {
        const decimalMap = {
            weight: { kg: 1, lbs: 1, g: 0 },
            height: { cm: 1, in: 1, ft: 2, m: 2 },
            temperature: { C: 1, F: 1, K: 1 },
            cholesterol: { 'mg/dL': 0, 'mmol/L': 2 },
            totalCholesterol: { 'mg/dL': 0, 'mmol/L': 2 },
            hdl: { 'mg/dL': 0, 'mmol/L': 2 },
            ldl: { 'mg/dL': 0, 'mmol/L': 2 },
            triglycerides: { 'mg/dL': 0, 'mmol/L': 2 },
            sodium: { 'mEq/L': 0, 'mmol/L': 0 },
            insulin: { 'µU/mL': 1, 'pmol/L': 0, 'mU/L': 1 },
            phenytoin: { 'mcg/mL': 1, 'µmol/L': 0, 'mg/L': 1 },
            pressure: { mmHg: 0, kPa: 2, bar: 3, 'mm[Hg]': 0 },
            volume: { mL: 0, L: 2, 'fl oz': 1, cup: 2 },
            glucose: { 'mmol/L': 1, 'mg/dL': 0 },
            creatinine: { 'mg/dL': 2, 'µmol/L': 0, 'umol/L': 0 },
            calcium: { 'mg/dL': 2, 'mmol/L': 2 },
            albumin: { 'g/dL': 1, 'g/L': 0 },
            bilirubin: { 'mg/dL': 1, 'µmol/L': 0, 'umol/L': 0 }
        };
        return decimalMap[type]?.[unit] ?? 2;
    },
    /**
     * Enhance an input field with unit conversion
     * Wraps the input in a container and adds a toggle button
     * @param {HTMLElement} inputElement - The input element to enhance
     * @param {string} type - The measurement type
     * @param {Array} units - Array of unit strings
     * @param {string} defaultUnit - The default unit
     * @returns {HTMLElement} - The wrapper container
     */
    enhanceInput(inputElement, type, units, defaultUnit = units[0]) {
        // Check if already enhanced
        if (inputElement.parentElement?.classList.contains('unit-converter-wrapper')) {
            return inputElement.parentElement;
        }
        const wrapper = document.createElement('div');
        wrapper.className = 'unit-converter-wrapper';
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '5px';
        // Replace input with wrapper
        if (inputElement.parentNode) {
            inputElement.parentNode.insertBefore(wrapper, inputElement);
        }
        wrapper.appendChild(inputElement);
        // Create and add toggle button
        const toggleBtn = this.createUnitToggle(inputElement, type, units, defaultUnit);
        wrapper.appendChild(toggleBtn);
        // Add unit indicator to input
        inputElement.dataset.currentUnit = defaultUnit;
        return wrapper;
    },
    /**
     * Auto-detect and enhance common inputs in a calculator
     * @param {HTMLElement} container - The calculator container
     * @param {Object} config - Configuration object mapping input IDs to unit specs
     * Example config: { 'weight': { type: 'weight', units: ['kg', 'lbs'] } }
     */
    autoEnhance(container, config = {}) {
        // Default configurations for common fields
        const defaultConfig = {
            weight: { type: 'weight', units: ['kg', 'lbs'], default: 'kg' },
            height: { type: 'height', units: ['cm', 'in'], default: 'cm' },
            temperature: { type: 'temperature', units: ['C', 'F'], default: 'C' },
            temp: { type: 'temperature', units: ['C', 'F'], default: 'C' }
        };
        const finalConfig = { ...defaultConfig, ...config };
        // Find and enhance matching inputs
        Object.entries(finalConfig).forEach(([key, spec]) => {
            const input = container.querySelector(`#${key}, input[name="${key}"], #${key}-input, .${key}-input`);
            if (input &&
                input.type !== 'checkbox' &&
                input.type !== 'radio') {
                this.enhanceInput(input, spec.type, spec.units, spec.default || spec.units[0]);
            }
        });
    },
    /**
     * Get the current unit of an enhanced input
     */
    getCurrentUnit(inputElement) {
        const wrapper = inputElement.closest('.unit-converter-wrapper');
        if (!wrapper)
            return null;
        const toggleBtn = wrapper.querySelector('.unit-toggle-btn');
        return toggleBtn?.dataset.currentUnit || null;
    },
    /**
     * Set the input value, automatically converting if the current UI unit differs from the provided unit.
     * @param {HTMLElement} inputElement - The input element
     * @param {number} value - The value to set
     * @param {string} unit - The unit of the value being set
     */
    setInputValue(inputElement, value, unit) {
        if (!inputElement || value === null || value === undefined)
            return;
        // Clean up unit string (sometimes FHIR returns messy units or variations)
        // Basic normalization if needed, or rely on exact map.
        // For now, assume exact or close enough mapping in conversions.
        const currentUnit = this.getCurrentUnit(inputElement);
        if (currentUnit && unit && currentUnit !== unit) {
            // Need conversion
            const wrapper = inputElement.closest('.unit-converter-wrapper');
            const toggleBtn = wrapper?.querySelector('.unit-toggle-btn');
            const type = toggleBtn?.dataset.type;
            if (type) {
                const converted = this.convert(value, unit, currentUnit, type);
                if (converted !== null) {
                    const decimals = this.getDecimalPlaces(type, currentUnit);
                    inputElement.value = converted.toFixed(decimals);
                }
                else {
                    // Conversion failed, fall back to raw value?
                    // Or maybe the unit string didn't match our map (e.g. 'mg/dl' vs 'mg/dL').
                    // Just set raw value as fallback.
                    console.warn(`Unit conversion failed from ${unit} to ${currentUnit} for type ${type}`);
                    inputElement.value = value.toString();
                }
            }
            else {
                inputElement.value = value.toString();
            }
        }
        else {
            // Units match or no UI unit context
            // If we have a type, we might still want to respect decimal places?
            // Optional polish.
            inputElement.value = value.toString();
        }
        // Dispatch input event to trigger listeners
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    },
    /**
     * Convert value back to standard unit before calculation
     * @param {HTMLElement} inputElement - The input element
     * @param {string} standardUnit - The standard unit to convert to
     * @returns {number|null} - The value in standard units
     */
    getStandardValue(inputElement, standardUnit) {
        const value = parseFloat(inputElement.value);
        if (isNaN(value))
            return null;
        const currentUnit = this.getCurrentUnit(inputElement);
        if (!currentUnit)
            return value;
        const wrapper = inputElement.closest('.unit-converter-wrapper');
        const toggleBtn = wrapper?.querySelector('.unit-toggle-btn');
        const type = toggleBtn?.dataset.type;
        if (!type)
            return value;
        return this.convert(value, currentUnit, standardUnit, type) || value;
    }
};
// Load external CSS for unit toggle buttons
if (typeof document !== 'undefined') {
    if (!document.getElementById('unit-converter-styles')) {
        const link = document.createElement('link');
        link.id = 'unit-converter-styles';
        link.rel = 'stylesheet';
        link.href = './css/unit-converter.css';
        document.head.appendChild(link);
    }
}
export default UnitConverter;
