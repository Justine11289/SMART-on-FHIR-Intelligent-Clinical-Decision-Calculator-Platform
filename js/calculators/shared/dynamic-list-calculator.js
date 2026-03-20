/**
 * 動態列表計算器工廠函數
 *
 * 適用於可動態新增/刪除項目的計算器，如：
 * - MME 計算器（多種鴉片類藥物）
 * - 多藥物總量計算
 *
 * 特點：
 * - 動態新增/刪除項目
 * - 自動彙總計算
 * - 支援分級結果顯示
 */
import { uiBuilder } from '../../ui-builder.js';
// ==========================================
// 工廠函數
// ==========================================
/**
 * 創建動態列表計算器
 */
export function createDynamicListCalculator(config) {
    return {
        id: config.id,
        title: config.title,
        description: config.description,
        generateHTML() {
            const warningHTML = config.warningAlert
                ? uiBuilder.createAlert({ type: 'warning', message: config.warningAlert })
                : '';
            const infoHTML = config.infoAlert
                ? uiBuilder.createAlert({ type: 'info', message: config.infoAlert })
                : '';
            return `
                <div class="calculator-header">
                    <h3>${config.title}</h3>
                    <p class="description">${config.description}</p>
                </div>

                ${warningHTML}
                ${infoHTML}

                ${uiBuilder.createSection({
                title: config.itemLabel + 's',
                icon: '💊',
                content: `
                        <div id="${config.id}-list">
                            <!-- Dynamic rows will be added here -->
                        </div>
                        <div class="mt-15">
                            <button id="${config.id}-add-btn" class="ui-button ui-button-secondary full-width">
                                + ${config.addButtonText || 'Add Item'}
                            </button>
                        </div>
                    `
            })}

                ${uiBuilder.createResultBox({ id: `${config.id}-result`, title: config.resultLabel })}

                ${config.additionalInfo || ''}
            `;
        },
        initialize(client, patient, container) {
            uiBuilder.initializeComponents(container);
            const listContainer = container.querySelector(`#${config.id}-list`);
            const addBtn = container.querySelector(`#${config.id}-add-btn`);
            const resultBox = container.querySelector(`#${config.id}-result`);
            // 建立選項映射
            const optionMap = new Map();
            config.itemOptions.forEach(opt => optionMap.set(opt.value, opt));
            const selectOptions = config.itemOptions.map(opt => ({
                value: opt.value,
                label: opt.label
            }));
            const calculate = () => {
                let total = 0;
                const items = [];
                const rows = listContainer.querySelectorAll(`.${config.id}-row`);
                if (rows.length === 0) {
                    if (resultBox)
                        resultBox.classList.remove('show');
                    return;
                }
                rows.forEach(row => {
                    const select = row.querySelector('select');
                    const input = row.querySelector('input');
                    const optionValue = select?.value;
                    const inputValue = parseFloat(input?.value || '0');
                    if (optionValue && inputValue > 0) {
                        const option = optionMap.get(optionValue);
                        if (option) {
                            total += inputValue * option.factor;
                            items.push({ option: optionValue, value: inputValue });
                        }
                    }
                });
                // 渲染結果
                if (resultBox) {
                    const resultContent = resultBox.querySelector('.ui-result-content');
                    if (config.customResultRenderer) {
                        if (resultContent) {
                            resultContent.innerHTML = config.customResultRenderer(total, items);
                        }
                    }
                    else {
                        // 預設結果渲染
                        let riskLevel = '';
                        let alertType = 'info';
                        let recommendation = '';
                        if (config.riskLevels) {
                            for (const level of config.riskLevels) {
                                if (total >= level.minValue && total < level.maxValue) {
                                    riskLevel = level.label;
                                    alertType = level.severity;
                                    recommendation = level.recommendation || '';
                                    break;
                                }
                            }
                        }
                        if (resultContent) {
                            resultContent.innerHTML = `
                                ${uiBuilder.createResultItem({
                                label: config.resultLabel,
                                value: total.toFixed(1),
                                unit: config.resultUnit || '',
                                interpretation: riskLevel,
                                alertClass: `ui-alert-${alertType}`
                            })}
                                ${recommendation
                                ? uiBuilder.createAlert({
                                    type: alertType,
                                    message: `<strong>Recommendation:</strong> ${recommendation}`
                                })
                                : ''}
                            `;
                        }
                    }
                    resultBox.classList.add('show');
                }
            };
            const createRow = () => {
                const rowId = `${config.id}-row-${Date.now()}`;
                const div = document.createElement('div');
                div.className = `${config.id}-row flex-row gap-md align-center mb-10 p-10`;
                const selectHTML = uiBuilder.createSelect({
                    id: `${rowId}-select`,
                    label: config.itemLabel,
                    options: selectOptions
                });
                const inputHTML = uiBuilder.createInput({
                    id: `${rowId}-input`,
                    label: config.valueLabel,
                    type: 'number',
                    placeholder: config.valueUnit || ''
                });
                div.innerHTML = `
                    <div class="flex-1">${selectHTML}</div>
                    <div class="flex-1">${inputHTML}</div>
                    <button class="remove-btn ui-button ui-button-danger mt-20">✕</button>
                `;
                listContainer.appendChild(div);
                const select = div.querySelector('select');
                const input = div.querySelector('input');
                const removeBtn = div.querySelector('.remove-btn');
                select?.addEventListener('change', calculate);
                input?.addEventListener('input', calculate);
                removeBtn?.addEventListener('click', () => {
                    div.remove();
                    calculate();
                });
            };
            addBtn?.addEventListener('click', createRow);
            // 建立初始行
            createRow();
        }
    };
}
