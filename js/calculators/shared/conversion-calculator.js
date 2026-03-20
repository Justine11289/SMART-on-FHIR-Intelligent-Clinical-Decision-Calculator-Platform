/**
 * 藥物換算計算器工廠函數
 *
 * 適用於藥物劑量轉換的計算器，如：
 * - 類固醇換算 (Steroid Conversion)
 * - 苯二氮平類換算 (Benzodiazepine Conversion)
 *
 * 特點：
 * - 支援雙向換算（從 A 藥物 → B 藥物）
 * - 自動生成等效劑量表
 * - 支援換算範圍顯示
 */
import { uiBuilder } from '../../ui-builder.js';
// ==========================================
// 工廠函數
// ==========================================
/**
 * 創建藥物換算計算器
 */
export function createConversionCalculator(config) {
    const unit = config.unit || 'mg';
    return {
        id: config.id,
        title: config.title,
        description: config.description,
        generateHTML() {
            const drugOptions = config.drugs.map(d => ({
                value: d.id,
                label: d.name
            }));
            // 生成換算表
            let tableHTML = '';
            if (config.conversionTable?.show !== false) {
                const headers = ['Reference Dose', ...config.drugs.map(d => d.name)];
                const rows = config.drugs.map(drug => {
                    const firstCell = `${drug.name} ${drug.equivalentDose} ${unit}`;
                    const conversions = config.drugs.map(targetDrug => {
                        if (config.conversionMatrix) {
                            const factor = config.conversionMatrix[drug.id]?.[targetDrug.id]?.factor;
                            if (factor !== undefined) {
                                return (drug.equivalentDose * factor).toFixed(2);
                            }
                        }
                        // 使用等效劑量計算
                        return ((drug.equivalentDose / targetDrug.equivalentDose) *
                            drug.equivalentDose).toFixed(2);
                    });
                    return [firstCell, ...conversions];
                });
                tableHTML = uiBuilder.createSection({
                    title: config.conversionTable?.title || 'Equivalence Table',
                    content: `
                        ${uiBuilder.createTable({
                        headers,
                        rows,
                        stickyFirstColumn: config.conversionTable?.stickyFirstColumn ?? true
                    })}
                        <p class="table-note text-sm text-muted mt-10">
                            <strong>Note:</strong> These are approximate equivalents. Individual patient response may vary.
                        </p>
                    `
                });
            }
            // 生成提示
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
                title: 'Conversion',
                content: `
                        <div class="conversion-row flex-row gap-lg align-end">
                            <div class="flex-1">
                                ${uiBuilder.createInput({
                    id: `${config.id}-from-dose`,
                    label: 'Dose',
                    type: 'number',
                    placeholder: 'Enter dose',
                    min: 0
                })}
                            </div>
                            <div class="flex-1">
                                ${uiBuilder.createSelect({
                    id: `${config.id}-from-drug`,
                    label: 'From',
                    options: drugOptions
                })}
                            </div>
                        </div>
                        <div class="text-center font-bold mb-10 mt-10">IS EQUIVALENT TO</div>
                        <div class="conversion-row flex-row gap-lg align-end">
                            <div class="flex-1">
                                ${uiBuilder.createInput({
                    id: `${config.id}-to-dose`,
                    label: 'Equivalent Dose',
                    type: 'text',
                    placeholder: 'Result'
                })}
                            </div>
                            <div class="flex-1">
                                ${uiBuilder.createSelect({
                    id: `${config.id}-to-drug`,
                    label: 'To',
                    options: drugOptions
                })}
                            </div>
                        </div>
                        ${config.showRange
                    ? `
                            <div id="${config.id}-range" class="mt-10 text-center text-muted ui-hidden">
                                <span class="label">Estimated Range: </span>
                                <span id="${config.id}-range-value"></span>
                            </div>
                        `
                    : ''}
                    `
            })}

                ${tableHTML}
                ${config.additionalInfo || ''}
            `;
        },
        initialize(client, patient, container) {
            uiBuilder.initializeComponents(container);
            const fromDoseEl = container.querySelector(`#${config.id}-from-dose`);
            const fromDrugEl = container.querySelector(`#${config.id}-from-drug`);
            const toDoseEl = container.querySelector(`#${config.id}-to-dose`);
            const toDrugEl = container.querySelector(`#${config.id}-to-drug`);
            const rangeEl = container.querySelector(`#${config.id}-range`);
            const rangeValueEl = container.querySelector(`#${config.id}-range-value`);
            // Make result readonly
            if (toDoseEl) {
                toDoseEl.readOnly = true;
            }
            const calculateConversion = () => {
                const fromDose = parseFloat(fromDoseEl?.value || '0');
                const fromDrugId = fromDrugEl?.value;
                const toDrugId = toDrugEl?.value;
                if (isNaN(fromDose) || fromDose <= 0 || !fromDrugId || !toDrugId) {
                    if (toDoseEl)
                        toDoseEl.value = '';
                    if (rangeEl)
                        rangeEl.classList.add('ui-hidden');
                    return;
                }
                const fromDrug = config.drugs.find(d => d.id === fromDrugId);
                const toDrug = config.drugs.find(d => d.id === toDrugId);
                if (!fromDrug || !toDrug) {
                    if (toDoseEl)
                        toDoseEl.value = '';
                    return;
                }
                let toDose;
                let rangeMin;
                let rangeMax;
                // 檢查是否有特定的換算矩陣
                if (config.conversionMatrix && config.conversionMatrix[fromDrugId]?.[toDrugId]) {
                    const conversion = config.conversionMatrix[fromDrugId][toDrugId];
                    toDose = fromDose * conversion.factor;
                    if (conversion.range) {
                        rangeMin = fromDose * conversion.range[0];
                        rangeMax = fromDose * conversion.range[1];
                    }
                }
                else if (fromDrugId === toDrugId) {
                    // 同一藥物
                    toDose = fromDose;
                }
                else {
                    // 使用等效劑量計算
                    toDose = (fromDose / fromDrug.equivalentDose) * toDrug.equivalentDose;
                }
                if (toDoseEl) {
                    toDoseEl.value = toDose.toFixed(2);
                }
                // 顯示範圍
                if (config.showRange && rangeEl && rangeValueEl) {
                    if (rangeMin !== undefined && rangeMax !== undefined) {
                        rangeValueEl.textContent = `${rangeMin.toFixed(1)} - ${rangeMax.toFixed(1)} ${unit}`;
                        rangeEl.classList.remove('ui-hidden');
                    }
                    else {
                        rangeEl.classList.add('ui-hidden');
                    }
                }
            };
            // 綁定事件
            fromDoseEl?.addEventListener('input', calculateConversion);
            fromDrugEl?.addEventListener('change', calculateConversion);
            toDrugEl?.addEventListener('change', calculateConversion);
            calculateConversion();
        }
    };
}
