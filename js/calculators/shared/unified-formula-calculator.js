/**
 * 統一公式計算器工廠函數
 *
 * 整合了原有的兩種公式計算器：
 * - Formula Calculator (簡單公式計算)
 * - Complex Formula Calculator (複雜公式計算)
 *
 * 支援：
 * - 數字輸入與單位轉換
 * - Radio/Select 輸入
 * - 區塊化輸入佈局
 * - FHIR 自動填入
 * - 自定義計算函數
 */
import { uiBuilder } from '../../ui-builder.js';
import { UnitConverter } from '../../unit-converter.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { displayError } from '../../errorHandler.js';
import { ValidationRules, validateCalculatorInput } from '../../validator.js';
// ==========================================
// 輔助函數
// ==========================================
function isRadioInput(input) {
    if (typeof input === 'string')
        return false;
    // 有 options 但沒有 id（或有 name）的是 radio
    if (input.type === 'radio')
        return true;
    if ('options' in input && 'name' in input)
        return true;
    if ('options' in input && !('id' in input))
        return true;
    return false;
}
function isNumberInput(input) {
    if (typeof input === 'string')
        return false;
    if (input.type === 'number')
        return true;
    // Fix: Explicitly exclude other known types to avoid false positives for inputs with ID but no options
    if (input.type && input.type !== 'number')
        return false;
    // 有 id 且沒有 options 的是 number
    if ('id' in input && !('options' in input))
        return true;
    return false;
}
function isSelectInput(input) {
    if (typeof input === 'string')
        return false;
    if (input.type === 'select')
        return true;
    // 有 id 且有 options 且不是 radio 的是 select
    if ('id' in input && 'options' in input && !('name' in input))
        return true;
    return false;
}
function isCheckboxInput(input) {
    if (typeof input === 'string')
        return false;
    if (input.type === 'checkbox')
        return true;
    return false;
}
/**
 * Get the validation rule for an input configuration
 * Merges explicit config with default rules based on type
 * Priority: validationType > unitConfig.type > unitToggle.type
 */
function getValidationRuleForInput(input) {
    // 優先使用 validationType，其次是 unitConfig/unitToggle 的 type
    const ruleType = input.validationType ||
        input.unitConfig?.type ||
        input.unitToggle?.type ||
        (input.unitConfig && typeof input.unitConfig.type === 'string'
            ? input.unitConfig.type
            : undefined);
    // Get default rule from type
    const defaultRule = ruleType && ValidationRules[ruleType] ? ValidationRules[ruleType] : {};
    // Merge: explicit input config takes precedence over default rules
    return {
        min: input.min !== undefined ? input.min : defaultRule.min,
        max: input.max !== undefined ? input.max : defaultRule.max,
        warnMin: defaultRule.warnMin,
        warnMax: defaultRule.warnMax,
        message: defaultRule.message,
        warningMessage: defaultRule.warningMessage,
        required: input.required !== false
    };
}
/**
 * 生成單個輸入欄位的 HTML
 */
function generateInputHTML(input) {
    if (typeof input === 'string') {
        return input; // Raw HTML
    }
    if (isNumberInput(input)) {
        const unitToggle = input.unitConfig || input.unitToggle;
        // Resolve validation rules (min/max) for HTML attributes
        const validationRule = getValidationRuleForInput(input);
        return uiBuilder.createInput({
            id: input.id,
            label: input.label,
            type: 'number',
            placeholder: input.placeholder,
            min: validationRule.min,
            max: validationRule.max,
            step: input.step,
            helpText: input.helpText,
            unit: unitToggle ? undefined : input.unit || input.standardUnit,
            unitToggle: unitToggle
                ? {
                    type: unitToggle.type,
                    units: unitToggle.units,
                    default: unitToggle.default
                }
                : undefined,
            required: input.required !== false
        });
    }
    if (isRadioInput(input)) {
        return uiBuilder.createRadioGroup({
            name: input.id || input.name || '',
            label: input.label,
            options: input.options,
            helpText: input.helpText
        });
    }
    if (isSelectInput(input)) {
        return uiBuilder.createSelect({
            id: input.id,
            label: input.label,
            options: input.options,
            helpText: input.helpText
        });
    }
    if (isCheckboxInput(input)) {
        if (input.options) {
            return uiBuilder.createCheckboxGroup({
                name: input.id,
                label: input.label,
                options: input.options,
                helpText: input.helpText
            });
        }
        else {
            return uiBuilder.createCheckbox({
                id: input.id,
                label: input.label,
                value: input.value,
                checked: input.checked,
                description: input.description
            });
        }
    }
    return '';
}
/**
 * 生成 Formula Section HTML (Rich Table / List)
 * Ported from mixed-input-calculator.ts
 */
function generateFormulaSectionHTML(fs) {
    const formulaTitle = fs.title || 'FORMULA';
    const calcNote = fs.calculationNote || '';
    const displayType = fs.type || 'table';
    // Scoring Table
    let scoringContentHTML = '';
    if (fs.scoringCriteria?.length) {
        if (displayType === 'list') {
            // Render as List/Block
            const listItems = fs.scoringCriteria
                .map(item => {
                return `
                    <div class="ui-formula-list-item">
                        <div class="criteria-header">${item.criteria}</div>
                        <div class="criteria-points">${item.points}</div>
                    </div>
                `;
            })
                .join('');
            scoringContentHTML = `
                <div class="ui-formula-list mt-15">
                    ${listItems}
                </div>
            `;
        }
        else {
            // Render as Table (default)
            const scoringRows = fs.scoringCriteria
                .map(item => {
                if (item.isHeader) {
                    return `
                        <tr class="ui-scoring-table__category">
                            <td colspan="2">${item.criteria}</td>
                        </tr>
                    `;
                }
                else {
                    return `
                        <tr class="ui-scoring-table__item">
                            <td class="ui-scoring-table__criteria">${item.criteria}</td>
                            <td class="ui-scoring-table__points">${item.points || ''}</td>
                        </tr>
                    `;
                }
            })
                .join('');
            scoringContentHTML = `
                <div class="ui-table-wrapper">
                    <table class="ui-scoring-table">
                        <thead>
                            <tr>
                                <th class="ui-scoring-table__header ui-scoring-table__header--criteria">Criteria</th>
                                <th class="ui-scoring-table__header ui-scoring-table__header--points">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${scoringRows}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }
    else if (fs.rows?.length && fs.tableHeaders?.length) {
        // Generic Table
        const headerCells = fs.tableHeaders
            .map(h => `<th class="ui-scoring-table__header">${h}</th>`)
            .join('');
        const tableRows = fs.rows
            .map(row => {
            const cells = row
                .map(cell => `<td class="ui-scoring-table__criteria">${cell}</td>`)
                .join('');
            return `<tr class="ui-scoring-table__item">${cells}</tr>`;
        })
            .join('');
        scoringContentHTML = `
            <div class="ui-table-wrapper">
                <table class="ui-scoring-table">
                    <thead>
                        <tr>${headerCells}</tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }
    // Footnotes
    const footnotesHTML = fs.footnotes?.length
        ? `<div class="footnotes-section">
            ${fs.footnotes.map(fn => `<p class="footnote-item">${fn}</p>`).join('')}
           </div>`
        : '';
    // Interpretation Table
    let interpretationTableHTML = '';
    if (fs.interpretations?.length) {
        const interpTitle = fs.interpretationTitle || 'FACTS & FIGURES';
        const hasCategory = fs.interpretations.some(item => item.category);
        const defaultHeaders = hasCategory
            ? ['Score', 'Risk Category', 'Description']
            : ['Score', 'Interpretation'];
        const headers = fs.tableHeaders || defaultHeaders;
        const interpRows = fs.interpretations
            .map(item => {
            const severityClass = item.severity
                ? `ui-interpretation-table__row--${item.severity}`
                : '';
            if (hasCategory) {
                return `
                    <tr class="ui-interpretation-table__row ${severityClass}">
                        <td class="ui-interpretation-table__cell ui-interpretation-table__score">${item.score}</td>
                        <td class="ui-interpretation-table__cell text-center">${item.category || ''}</td>
                        <td class="ui-interpretation-table__cell">${item.interpretation}</td>
                    </tr>
                `;
            }
            else {
                return `
                    <tr class="ui-interpretation-table__row ${severityClass}">
                        <td class="ui-interpretation-table__cell ui-interpretation-table__score">${item.score}</td>
                        <td class="ui-interpretation-table__cell">${item.interpretation}</td>
                    </tr>
                `;
            }
        })
            .join('');
        const headerCells = headers
            .map((h, i) => `<th class="ui-interpretation-table__header ${i === 0 ? 'text-center' : ''}">${h}</th>`)
            .join('');
        interpretationTableHTML = `
            <div class="ui-section mt-20">
                <div class="ui-section-title">📊 ${interpTitle}</div>
                <div class="ui-table-wrapper">
                    <table class="ui-interpretation-table">
                        <thead>
                            <tr>${headerCells}</tr>
                        </thead>
                        <tbody>
                            ${interpRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    return `
        <div class="ui-section mt-20">
            <div class="ui-section-title">📐 ${formulaTitle}</div>
            ${calcNote ? `<p class="calculation-note">${calcNote}</p>` : ''}
            ${scoringContentHTML}
            ${footnotesHTML}
        </div>
        ${interpretationTableHTML}
    `;
}
// ==========================================
// 主要工廠函數
// ==========================================
/**
 * 創建統一公式計算器
 */
export function createUnifiedFormulaCalculator(config) {
    // 自動判斷模式
    const mode = config.mode || (config.sections ? 'complex' : 'simple');
    const isComplexMode = mode === 'complex';
    return {
        id: config.id,
        title: config.title,
        description: config.description,
        generateHTML() {
            let inputsHTML = '';
            if (isComplexMode && config.sections) {
                // Complex 模式：區塊化輸入
                inputsHTML = config.sections
                    .map(section => {
                    const fieldsHTML = section.fields.map(generateInputHTML).join('');
                    return uiBuilder.createSection({
                        title: section.title,
                        subtitle: section.subtitle,
                        icon: section.icon,
                        content: fieldsHTML
                    });
                })
                    .join('');
            }
            else if (config.inputs) {
                // Simple 模式：扁平輸入
                const fieldsHTML = config.inputs.map(generateInputHTML).join('');
                inputsHTML = uiBuilder.createSection({
                    title: 'Measurements',
                    content: fieldsHTML
                });
            }
            // 公式參考區塊
            let formulaSection = '';
            if (config.formulaSection?.show) {
                formulaSection = generateFormulaSectionHTML(config.formulaSection);
            }
            else if (config.formulas) {
                formulaSection = uiBuilder.createFormulaSection({ items: config.formulas });
            }
            // 提示訊息
            const infoAlertHTML = config.infoAlert
                ? uiBuilder.createAlert({ type: 'info', message: config.infoAlert })
                : '';
            // 參考文獻區塊
            let referencesHTML = config.reference || '';
            if (config.references && config.references.length > 0) {
                const refList = config.references
                    .map((ref, i) => `<div class="reference-item">${i + 1}. ${ref}</div>`)
                    .join('');
                referencesHTML += uiBuilder.createSection({
                    title: 'References',
                    icon: '📚',
                    content: `<div class="references-list text-sm text-muted">${refList}</div>`
                });
            }
            return `
                <div class="calculator-header">
                    <h3>${config.title}</h3>
                    <p class="description">${config.description}</p>
                </div>

                ${infoAlertHTML}
                ${inputsHTML}

                <div id="${config.id}-error-container"></div>
                
                ${uiBuilder.createResultBox({
                id: `${config.id}-result`,
                title: config.resultTitle || 'Results'
            })}

                ${formulaSection}
                ${referencesHTML}
                ${config.footerHTML || ''}
            `;
        },
        initialize(client, patient, container) {
            uiBuilder.initializeComponents(container);
            fhirDataService.initialize(client, patient, container);
            const resultBox = container.querySelector(`[id="${config.id}-result"]`);
            const resultContent = resultBox?.querySelector('.ui-result-content');
            const errorContainer = container.querySelector(`[id="${config.id}-error-container"]`);
            // 值取得輔助函數
            const getValue = (id) => {
                const el = container.querySelector(`[id="${id}"]`);
                const val = el?.value;
                if (val === '' || val === null || val === undefined)
                    return null;
                const num = parseFloat(val);
                return isNaN(num) ? null : num;
            };
            const getStdValue = (id, unit) => {
                const el = container.querySelector(`[id="${id}"]`);
                if (!el || el.value === '')
                    return null;
                const val = UnitConverter.getStandardValue(el, unit);
                return val === null || isNaN(val) ? null : val;
            };
            const getRadioValue = (name) => {
                const radio = container.querySelector(`input[name="${name}"]:checked`);
                return radio?.value || null;
            };
            const getCheckboxValue = (id) => {
                const checkbox = container.querySelector(`[id="${id}"]`);
                return checkbox?.checked || false;
            };
            // 收集所有輸入配置
            const allInputs = [];
            if (config.sections) {
                config.sections.forEach(s => allInputs.push(...s.fields));
            }
            if (config.inputs) {
                allInputs.push(...config.inputs);
            }
            /**
             * 更新輸入欄位的驗證 UI 狀態
             */
            const updateFieldValidationUI = (inputEl, status, message) => {
                // 清除現有狀態
                inputEl.classList.remove('validation-error', 'validation-warning');
                // 找到或創建訊息容器
                const inputWrapper = inputEl.closest('.ui-input-wrapper') || inputEl.parentElement;
                let messageEl = inputWrapper?.querySelector('.validation-message');
                if (status === 'valid') {
                    // 移除訊息
                    if (messageEl)
                        messageEl.remove();
                    return;
                }
                // 添加對應的 class
                inputEl.classList.add(status === 'error' ? 'validation-error' : 'validation-warning');
                // 創建或更新訊息
                if (message) {
                    if (!messageEl) {
                        messageEl = document.createElement('div');
                        messageEl.className = 'validation-message';
                        inputWrapper?.appendChild(messageEl);
                    }
                    messageEl.className = `validation-message ${status}`;
                    messageEl.textContent = message;
                }
            };
            /**
             * 清除所有欄位的驗證 UI
             */
            const clearAllValidationUI = () => {
                container.querySelectorAll('.validation-error, .validation-warning').forEach(el => {
                    el.classList.remove('validation-error', 'validation-warning');
                });
                container.querySelectorAll('.validation-message').forEach(el => el.remove());
            };
            /**
             * 驗證所有輸入
             * 回傳驗證結果物件（包含 warnings）
             */
            const validateInputs = () => {
                const values = {};
                const schema = {};
                // Helper to check requirements
                let allRequiredPresent = true;
                // 清除之前的驗證 UI
                clearAllValidationUI();
                allInputs.forEach(inputConfig => {
                    if (typeof inputConfig === 'string')
                        return;
                    if (isNumberInput(inputConfig)) {
                        const inputEl = container.querySelector(`[id="${inputConfig.id}"]`);
                        if (!inputEl)
                            return;
                        let val = null;
                        if (inputEl.value === '') {
                            if (inputConfig.required !== false) {
                                allRequiredPresent = false;
                            }
                        }
                        else {
                            val = parseFloat(inputEl.value);
                            if (isNaN(val)) {
                                allRequiredPresent = false;
                            }
                            else {
                                // 單位轉換
                                const targetUnit = inputConfig.standardUnit ||
                                    (inputConfig.unitToggle
                                        ? inputConfig.unitToggle.default
                                        : inputConfig.unit);
                                if (targetUnit) {
                                    try {
                                        const standardVal = UnitConverter.getStandardValue(inputEl, targetUnit);
                                        if (standardVal !== null) {
                                            val = standardVal;
                                        }
                                    }
                                    catch (e) {
                                        // 靜默失敗
                                    }
                                }
                            }
                        }
                        // Add to schema based on resolved rules (including warning thresholds)
                        const rule = getValidationRuleForInput(inputConfig);
                        schema[inputConfig.id] = {
                            required: rule.required,
                            min: rule.min,
                            max: rule.max,
                            warnMin: rule.warnMin,
                            warnMax: rule.warnMax,
                            message: rule.message,
                            warningMessage: rule.warningMessage
                        };
                        if (val !== null && !isNaN(val)) {
                            values[inputConfig.id] = val;
                        }
                    }
                    else if (isRadioInput(inputConfig)) {
                        const name = inputConfig.id || inputConfig.name || '';
                        const checked = container.querySelector(`input[name="${name}"]:checked`);
                        if (checked) {
                            values[name] = checked.value;
                        }
                    }
                    else if (isSelectInput(inputConfig)) {
                        const select = container.querySelector(`[id="${inputConfig.id}"]`);
                        if (select) {
                            values[inputConfig.id] = select.value;
                        }
                    }
                });
                if (!allRequiredPresent) {
                    // 顯示提示訊息 "Please fill out required fields."
                    if (resultContent) {
                        resultContent.innerHTML = uiBuilder.createAlert({
                            type: 'info',
                            message: 'Please fill out required fields.'
                        });
                    }
                    if (resultBox) {
                        resultBox.classList.add('show');
                        resultBox.classList.remove('ui-hidden');
                    }
                    return { isValid: false, values, hasWarnings: false, warnings: [] };
                }
                const validation = validateCalculatorInput(values, schema);
                // 更新每個欄位的 UI 狀態，同時檢查是否有任何錯誤
                let hasFieldErrors = false;
                Object.keys(validation.fieldStatus).forEach(fieldId => {
                    const inputEl = container.querySelector(`[id="${fieldId}"]`);
                    if (!inputEl)
                        return;
                    const status = validation.fieldStatus[fieldId];
                    const rule = schema[fieldId];
                    if (status === 'error') {
                        hasFieldErrors = true;
                        updateFieldValidationUI(inputEl, 'error', rule.message);
                    }
                    else if (status === 'warning') {
                        updateFieldValidationUI(inputEl, 'warning', rule.warningMessage);
                    }
                    else {
                        updateFieldValidationUI(inputEl, 'valid');
                    }
                });
                // 紅區錯誤：阻擋計算（使用 validation.isValid 或 hasFieldErrors）
                if (!validation.isValid || hasFieldErrors) {
                    if (errorContainer) {
                        // 清除舊的錯誤容器訊息（現在用 inline 顯示）
                        errorContainer.innerHTML = '';
                    }
                    // 顯示提示訊息 "Please fill out required fields."
                    if (resultContent) {
                        resultContent.innerHTML = uiBuilder.createAlert({
                            type: 'info',
                            message: 'Please fill out required fields.'
                        });
                    }
                    if (resultBox) {
                        resultBox.classList.add('show');
                        resultBox.classList.remove('ui-hidden');
                    }
                    return {
                        isValid: false,
                        values,
                        hasWarnings: validation.hasWarnings,
                        warnings: validation.warnings
                    };
                }
                // 黃區警告：允許計算但顯示警告
                return {
                    isValid: true,
                    values,
                    hasWarnings: validation.hasWarnings,
                    warnings: validation.warnings
                };
            };
            /**
             * Simple 模式計算
             */
            /**
             * 隱藏結果框
             */
            const hideResultBox = () => {
                if (resultBox) {
                    resultBox.classList.remove('show');
                    resultBox.classList.add('ui-hidden');
                }
                // 清空內容，確保舊結果不會殘留
                if (resultContent) {
                    resultContent.innerHTML = '';
                }
            };
            /**
             * 顯示結果框
             */
            const showResultBox = () => {
                if (resultBox) {
                    resultBox.classList.add('show');
                    resultBox.classList.remove('ui-hidden');
                }
            };
            /**
             * Simple 模式計算
             */
            const performSimpleCalculation = () => {
                if (!config.calculate)
                    return;
                if (errorContainer)
                    errorContainer.innerHTML = '';
                const { isValid, values } = validateInputs();
                if (!isValid) {
                    // validateInputs handles waiting message
                    return;
                }
                try {
                    const results = config.calculate(values);
                    if (results && results.length > 0 && resultContent) {
                        if (config.customResultRenderer) {
                            resultContent.innerHTML = config.customResultRenderer(results);
                        }
                        else {
                            resultContent.innerHTML = results
                                .map(r => uiBuilder.createResultItem({
                                label: r.label,
                                value: r.value,
                                unit: r.unit,
                                interpretation: r.interpretation,
                                alertClass: r.alertClass ? `ui-alert-${r.alertClass}` : ''
                            }))
                                .join('');
                        }
                        showResultBox();
                    }
                    else {
                        hideResultBox();
                    }
                }
                catch (e) {
                    hideResultBox();
                    if (errorContainer) {
                        displayError(errorContainer, e);
                    }
                }
            };
            /**
             * Complex 模式計算
             */
            const performComplexCalculation = () => {
                if (!config.complexCalculate)
                    return;
                if (errorContainer)
                    errorContainer.innerHTML = '';
                // Also run validation for complex mode
                const { isValid } = validateInputs();
                if (!isValid) {
                    // validateInputs handles waiting message
                    return;
                }
                try {
                    const result = config.complexCalculate(getValue, getStdValue, getRadioValue, getCheckboxValue);
                    if (!result) {
                        hideResultBox();
                        return;
                    }
                    if (resultContent) {
                        let html = '';
                        if (result.score !== undefined) {
                            html += uiBuilder.createResultItem({
                                label: 'Score',
                                value: result.score.toString(),
                                unit: 'points',
                                interpretation: result.interpretation,
                                alertClass: `ui-alert-${result.severity}`
                            });
                        }
                        if (result.value !== undefined && result.score === undefined) {
                            html += uiBuilder.createResultItem({
                                label: 'Result',
                                value: result.value.toString(),
                                interpretation: result.interpretation,
                                alertClass: `ui-alert-${result.severity}`
                            });
                        }
                        if (result.additionalResults) {
                            result.additionalResults.forEach(item => {
                                html += uiBuilder.createResultItem({
                                    label: item.label,
                                    value: item.value,
                                    unit: item.unit
                                });
                            });
                        }
                        if (result.breakdown) {
                            html += `<div class="mt-15 text-sm text-muted">${result.breakdown}</div>`;
                        }
                        resultContent.innerHTML = html;
                    }
                    showResultBox();
                }
                catch (e) {
                    console.error(`Error calculating ${config.id}:`, e);
                    hideResultBox();
                }
            };
            // 選擇計算函數 (如果沒有提供 complexCalculate，即使是 complex 模式也使用 simple 計算)
            const calculate = isComplexMode && config.complexCalculate
                ? performComplexCalculation
                : performSimpleCalculation;
            // 事件監聽
            container.addEventListener('change', e => {
                const target = e.target;
                if (target.type === 'radio' ||
                    target.type === 'checkbox' ||
                    target.tagName === 'SELECT') {
                    calculate();
                }
            });
            container.addEventListener('input', e => {
                const target = e.target;
                if (target.type === 'number' || target.type === 'text') {
                    // 清除錯誤（但不一定計算，視需求）
                    // 這裡保持原樣：即時計算
                    calculate();
                }
            });
            // 自動填入年齡
            if (config.autoPopulateAge) {
                const age = fhirDataService.getPatientAge();
                if (age !== null) {
                    const ageInput = container.querySelector(`[id="${config.autoPopulateAge}"]`);
                    if (ageInput)
                        ageInput.value = age.toString();
                }
            }
            // 自動填入性別
            if (config.autoPopulateGender) {
                const gender = fhirDataService.getPatientGender();
                if (gender) {
                    const genderEl = container.querySelector(`#${config.autoPopulateGender}`);
                    if (genderEl) {
                        if (genderEl.tagName === 'SELECT') {
                            genderEl.value = gender;
                        }
                        else if (genderEl.tagName === 'INPUT') {
                            const radio = container.querySelector(`input[name="${config.autoPopulateGender}"][value="${gender}"]`);
                            if (radio)
                                radio.checked = true;
                        }
                    }
                }
            }
            // FHIR 自動填入
            const autoPopulate = async () => {
                // 從 inputs 配置中收集 LOINC 代碼
                const numberInputs = allInputs.filter((i) => isNumberInput(i) && !!i.loincCode);
                if (numberInputs.length > 0 && fhirDataService.isReady()) {
                    const requirements = numberInputs.map(i => ({
                        inputId: `#${i.id}`,
                        code: i.loincCode,
                        label: i.label,
                        targetUnit: (i.unitConfig || i.unitToggle)?.default || i.standardUnit,
                        unitType: (i.unitConfig || i.unitToggle)?.type,
                        decimals: 1
                    }));
                    await fhirDataService.autoPopulateFields(requirements);
                }
                // 從 fhirAutoPopulate 配置中填入
                if (config.fhirAutoPopulate && client && fhirDataService.isReady()) {
                    for (const autoConfig of config.fhirAutoPopulate) {
                        try {
                            const result = await fhirDataService.getObservation(autoConfig.loincCode, {
                                trackStaleness: true,
                                stalenessLabel: autoConfig.fieldId,
                                targetUnit: autoConfig.targetUnit,
                                unitType: autoConfig.unitType
                            });
                            if (result.value !== null) {
                                const el = container.querySelector(`[id="${autoConfig.fieldId}"]`);
                                if (el) {
                                    el.value = autoConfig.formatter
                                        ? autoConfig.formatter(result.value)
                                        : result.value.toFixed(1);
                                }
                            }
                        }
                        catch (e) {
                            console.warn(`Error auto-populating ${autoConfig.fieldId}:`, e);
                        }
                    }
                }
                calculate();
            };
            autoPopulate();
            // 自定義初始化
            if (config.customInitialize) {
                config.customInitialize(client, patient, container, calculate);
            }
        }
    };
}
