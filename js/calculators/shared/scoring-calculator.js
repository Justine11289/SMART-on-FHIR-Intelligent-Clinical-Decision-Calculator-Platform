/**
 * 統一評分計算器工廠函數
 *
 * 整合了原有的三種評分計算器：
 * - Radio Score Calculator (radio groups)
 * - Score Calculator (checkboxes)
 * - Yes/No Calculator (yes/no radio pairs)
 *
 * 支援 FHIRDataService 整合，可使用聲明式 dataRequirements 配置
 *
 * @example
 * // Radio 模式 (預設)
 * createScoringCalculator({ inputType: 'radio', ... });
 *
 * // Checkbox 模式
 * createScoringCalculator({ inputType: 'checkbox', ... });
 *
 * // Yes/No 模式
 * createScoringCalculator({ inputType: 'yesno', ... });
 */
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
// ==========================================
// 內部輔助函數
// ==========================================
/**
 * 將 YesNoQuestion 轉換為 ScoringSection (每個問題獨立 section)
 */
function convertYesNoToSections(questions) {
    return questions.map(q => ({
        id: q.id,
        title: q.label,
        subtitle: q.description,
        options: [
            { value: '0', label: 'No', checked: true },
            { value: String(q.points), label: 'Yes' }
        ],
        observationCriteria: q.observationCriteria
    }));
}
/**
 * 生成 Yes/No 模式的 HTML (統一 section 內多個 radio groups)
 */
function generateYesNoSectionHTML(questions, sectionTitle, sectionIcon) {
    const questionsHTML = questions
        .map(q => {
        const pointsLabel = q.points >= 0 ? `+${q.points}` : String(q.points);
        return `
                <div class="yesno-question">
                    <div class="yesno-label">${q.label}</div>
                    ${q.description ? `<div class="yesno-description">${q.description}</div>` : ''}
                    ${uiBuilder.createRadioGroup({
            name: q.id,
            options: [
                { value: '0', label: 'No', checked: true },
                { value: String(q.points), label: `Yes (${pointsLabel})` }
            ]
        })}
                </div>
            `;
    })
        .join('');
    return uiBuilder.createSection({
        title: sectionTitle,
        icon: sectionIcon,
        content: questionsHTML
    });
}
/**
 * 生成 Radio Group HTML
 */
function generateRadioSectionsHTML(sections) {
    return sections
        .map((section, index) => uiBuilder.createSection({
        title: section.title,
        icon: section.icon,
        subtitle: section.subtitle,
        content: uiBuilder.createRadioGroup({
            name: section.id || `section-${index}`,
            options: section.options.map(opt => ({
                value: String(opt.value),
                label: opt.label,
                checked: opt.checked
            }))
        })
    }))
        .join('');
}
/**
 * 生成 Checkbox HTML
 */
function generateCheckboxSectionsHTML(sections) {
    return sections
        .map((section, sectionIndex) => {
        const sectionIdPrefix = section.id || `section-${sectionIndex}`;
        const checkboxesHTML = section.options
            .map((opt, optIndex) => uiBuilder.createCheckbox({
            id: opt.id || `${sectionIdPrefix}-${optIndex}`,
            label: opt.label,
            value: String(opt.value),
            description: opt.description
        }))
            .join('');
        return uiBuilder.createSection({
            title: section.title,
            icon: section.icon,
            subtitle: section.subtitle,
            content: checkboxesHTML
        });
    })
        .join('');
}
/**
 * 生成 Formula Section HTML
 */
function generateFormulaSectionHTML(config, sections) {
    if (!config.formulaSection?.show)
        return '';
    const fs = config.formulaSection;
    const formulaTitle = fs.title || 'FORMULA';
    const calcNote = fs.calculationNote || 'Addition of the selected points:';
    // 生成評分標準內容
    let scoringContentHTML = '';
    if (fs.scoringCriteria?.length) {
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
    else {
        // 從 sections 自動提取
        const scoringRows = sections
            .map(section => {
            const optionRows = section.options
                .map(opt => {
                const displayLabel = opt.label
                    .replace(/\s*\([+-]?\d+\)\s*$/, '')
                    .replace(/\s*\(\+?\d+\)\s*$/, '');
                return `<tr><td class="option-label">${displayLabel}</td><td class="option-points">${opt.value}</td></tr>`;
            })
                .join('');
            return `
                    <tr class="category-row">
                        <td class="category-title">${section.title.replace(/^\d+\.\s*/, '')}</td>
                        <td></td>
                    </tr>
                    ${section.subtitle ? `<tr><td colspan="2" class="category-subtitle">${section.subtitle}</td></tr>` : ''}
                    ${optionRows}
                `;
        })
            .join('');
        scoringContentHTML = `
            <table class="ui-table w-100">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th class="text-center ui-scoring-table__header--points">Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${scoringRows}
                </tbody>
            </table>
        `;
    }
    // 生成註腳
    const footnotesHTML = fs.footnotes?.length
        ? `<div class="footnotes-section">
            ${fs.footnotes.map(fn => `<p class="footnote-item">${fn}</p>`).join('')}
           </div>`
        : '';
    // 生成解釋表格
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
            <p class="calculation-note">${calcNote}</p>
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
 * 創建統一評分計算器
 */
export function createScoringCalculator(config) {
    const inputType = config.inputType || 'radio';
    // 將 questions 轉換為 sections (yesno 模式，無 sectionTitle 時)
    const sections = inputType === 'yesno' && config.questions && !config.sectionTitle
        ? convertYesNoToSections(config.questions)
        : config.sections || [];
    return {
        id: config.id,
        title: config.title,
        description: config.description,
        generateHTML() {
            // 根據輸入類型生成對應的 HTML
            let sectionsHTML = '';
            if (inputType === 'checkbox') {
                sectionsHTML = generateCheckboxSectionsHTML(sections);
            }
            else if (inputType === 'yesno' && config.questions && config.sectionTitle) {
                // yesno 模式 + sectionTitle：使用專用生成函數
                sectionsHTML = generateYesNoSectionHTML(config.questions, config.sectionTitle, config.sectionIcon);
            }
            else {
                // radio 和 yesno（無 sectionTitle）使用 radio group
                sectionsHTML = generateRadioSectionsHTML(sections);
            }
            // 生成提示框
            const infoAlertHTML = config.infoAlert
                ? uiBuilder.createAlert({ type: 'info', message: config.infoAlert })
                : '';
            // 生成解釋說明
            const interpretationHTML = config.interpretationInfo
                ? uiBuilder.createAlert({ type: 'info', message: config.interpretationInfo })
                : '';
            // 生成參考文獻
            let referencesHTML = '';
            if (config.references && config.references.length) {
                const refList = config.references
                    .map((ref, i) => `<div class="reference-item">${i + 1}. ${ref}</div>`)
                    .join('');
                referencesHTML = uiBuilder.createSection({
                    title: 'References',
                    icon: '📚',
                    content: `<div class="references-list text-sm text-muted">${refList}</div>`
                });
            }
            // 生成 Formula 區塊
            let formulaSectionHTML = '';
            if (config.formulaItems) {
                // 舊格式兼容
                formulaSectionHTML = uiBuilder.createFormulaSection({ items: config.formulaItems });
            }
            else {
                const effectiveSections = inputType === 'yesno' && config.questions
                    ? config.questions.map(q => ({
                        id: q.id,
                        title: q.label,
                        options: [
                            { value: '0', label: 'No' },
                            { value: String(q.points), label: 'Yes' }
                        ]
                    }))
                    : sections;
                formulaSectionHTML = generateFormulaSectionHTML(config, effectiveSections);
            }
            return `
                <div class="calculator-header">
                    <h3>${config.title}</h3>
                    <p class="description">${config.description}</p>
                </div>
                
                ${infoAlertHTML}
                ${sectionsHTML}
                
                ${uiBuilder.createResultBox({
                id: `${config.id}-result`,
                title: `${config.title} Results`
            })}
                
                ${formulaSectionHTML}
                ${interpretationHTML}
                ${referencesHTML}
            `;
        },
        initialize(client, patient, container) {
            uiBuilder.initializeComponents(container);
            // 初始化 FHIR 數據服務
            fhirDataService.initialize(client, patient, container);
            /**
             * 設置 Radio 值
             */
            const setRadioValue = (name, value) => {
                const radio = container.querySelector(`input[name="${name}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            /**
             * 設置 Checkbox 狀態
             */
            const setCheckbox = (id, checked) => {
                const checkbox = container.querySelector(`#${id}`);
                if (checkbox) {
                    checkbox.checked = checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            /**
             * 計算分數
             */
            const calculate = () => {
                let totalScore = 0;
                const sectionScores = {};
                if (inputType === 'checkbox') {
                    // Checkbox 模式：收集所有勾選的值
                    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(box => {
                        const checkbox = box;
                        if (checkbox.checked) {
                            const value = parseFloat(checkbox.value) || 0;
                            totalScore += value;
                            const sectionId = checkbox.id.split('-')[0];
                            sectionScores[sectionId] = (sectionScores[sectionId] || 0) + value;
                        }
                    });
                }
                else if (inputType === 'yesno' && config.questions && config.sectionTitle) {
                    // YesNo 模式 + sectionTitle：從 questions 收集
                    config.questions.forEach(q => {
                        const radio = container.querySelector(`input[name="${q.id}"]:checked`);
                        if (radio) {
                            const value = parseFloat(radio.value) || 0;
                            sectionScores[q.id] = value;
                            totalScore += value;
                        }
                    });
                }
                else {
                    // Radio 模式：收集每個區塊的選中值
                    sections.forEach((section, index) => {
                        const sectionId = section.id || `section-${index}`;
                        const radio = container.querySelector(`input[name="${sectionId}"]:checked`);
                        if (radio) {
                            const value = parseFloat(radio.value) || 0;
                            sectionScores[sectionId] = value;
                            totalScore += value;
                        }
                    });
                }
                // 找到對應的風險等級
                const riskLevel = config.riskLevels.find(r => totalScore >= r.minScore && totalScore <= r.maxScore) || config.riskLevels[config.riskLevels.length - 1];
                // 更新結果顯示
                const resultBox = document.getElementById(`${config.id}-result`);
                if (resultBox) {
                    const resultContent = resultBox.querySelector('.ui-result-content');
                    if (resultContent) {
                        if (config.customResultRenderer) {
                            resultContent.innerHTML = config.customResultRenderer(totalScore, sectionScores);
                        }
                        else {
                            // 根據配置格式選擇顯示方式
                            const displayLabel = riskLevel.label || riskLevel.category || '';
                            const displayRisk = riskLevel.risk || '';
                            const displayDesc = riskLevel.description || riskLevel.recommendation || '';
                            let resultHTML = uiBuilder.createResultItem({
                                label: 'Total Score',
                                value: totalScore.toString(),
                                unit: 'points',
                                interpretation: displayLabel,
                                alertClass: `ui-alert-${riskLevel.severity}`
                            });
                            if (displayRisk) {
                                resultHTML += uiBuilder.createResultItem({
                                    label: 'Risk',
                                    value: displayRisk,
                                    alertClass: `ui-alert-${riskLevel.severity}`
                                });
                            }
                            if (displayDesc) {
                                resultHTML += uiBuilder.createAlert({
                                    type: riskLevel.severity,
                                    message: displayDesc
                                });
                            }
                            resultContent.innerHTML = resultHTML;
                        }
                    }
                    resultBox.classList.add('show');
                }
            };
            // 綁定事件
            if (inputType === 'checkbox') {
                container.querySelectorAll('input[type="checkbox"]').forEach(box => {
                    box.addEventListener('change', calculate);
                });
            }
            else {
                container.querySelectorAll('input[type="radio"]').forEach(radio => {
                    radio.addEventListener('change', calculate);
                });
            }
            /**
             * 執行 FHIR 數據自動填充
             */
            const performAutoPopulation = async () => {
                if (config.dataRequirements && fhirDataService.isReady()) {
                    try {
                        const dataReqs = config.dataRequirements;
                        const stalenessTracker = fhirDataService.getStalenessTracker();
                        // 自動填充患者性別
                        if (dataReqs.autoPopulateGender) {
                            const gender = fhirDataService.getPatientGender();
                            if (gender) {
                                const value = gender === 'male'
                                    ? dataReqs.autoPopulateGender.maleValue
                                    : dataReqs.autoPopulateGender.femaleValue;
                                const targetName = dataReqs.autoPopulateGender.radioName ||
                                    dataReqs.autoPopulateGender.questionId;
                                if (targetName) {
                                    setRadioValue(targetName, value);
                                }
                            }
                        }
                        // 自動填充患者年齡
                        if (dataReqs.autoPopulateAge?.condition) {
                            const age = fhirDataService.getPatientAge();
                            if (age !== null && dataReqs.autoPopulateAge.condition(age)) {
                                const targetId = dataReqs.autoPopulateAge.inputId ||
                                    dataReqs.autoPopulateAge.questionId;
                                if (targetId) {
                                    if (inputType === 'checkbox') {
                                        setCheckbox(targetId, true);
                                    }
                                    else {
                                        // 找到對應的 "Yes" 選項值
                                        const section = sections.find(s => s.id === targetId);
                                        if (section) {
                                            const yesOption = section.options.find(o => String(o.value) !== '0');
                                            if (yesOption) {
                                                setRadioValue(targetId, String(yesOption.value));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        // 處理 sections 中的 LOINC 配置
                        for (let sIdx = 0; sIdx < sections.length; sIdx++) {
                            const section = sections[sIdx];
                            const sectionId = section.id || `section-${sIdx}`;
                            // 使用 valueMapping
                            if (section.loincCode && section.valueMapping) {
                                try {
                                    const result = await fhirDataService.getObservation(section.loincCode, {
                                        trackStaleness: true,
                                        stalenessLabel: section.title
                                    });
                                    if (result.value !== null) {
                                        const mapping = section.valueMapping.find(m => m.condition(result.value));
                                        if (mapping) {
                                            const value = mapping.optionValue || mapping.radioValue;
                                            if (value) {
                                                setRadioValue(sectionId, value);
                                            }
                                        }
                                        if (stalenessTracker && result.observation) {
                                            stalenessTracker.trackObservation(`input[name="${sectionId}"]`, result.observation, section.loincCode, section.title);
                                        }
                                    }
                                }
                                catch (e) {
                                    console.warn(`Error fetching observation for ${sectionId}:`, e);
                                }
                            }
                            // 使用 observationCriteria (yesno 模式)
                            if (section.observationCriteria) {
                                try {
                                    const result = await fhirDataService.getObservation(section.observationCriteria.code, {
                                        trackStaleness: true,
                                        stalenessLabel: section.title
                                    });
                                    if (result.value !== null &&
                                        section.observationCriteria.condition(result.value)) {
                                        // 選擇 "Yes" 選項（非 0 值）
                                        const yesOption = section.options.find(o => String(o.value) !== '0');
                                        if (yesOption) {
                                            setRadioValue(sectionId, String(yesOption.value));
                                        }
                                    }
                                }
                                catch (e) {
                                    console.warn(`Error fetching observation for ${sectionId}:`, e);
                                }
                            }
                        }
                        // 處理 conditions 自動勾選 (checkbox 模式)
                        if (inputType === 'checkbox' && dataReqs.conditions?.length) {
                            const allConditionCodes = [...dataReqs.conditions];
                            const optionConditionMap = new Map();
                            sections.forEach((section, sIdx) => {
                                const sectionIdPrefix = section.id || `section-${sIdx}`;
                                section.options.forEach((opt, optIdx) => {
                                    if (opt.conditionCode) {
                                        allConditionCodes.push(opt.conditionCode);
                                        const checkboxId = opt.id || `${sectionIdPrefix}-${optIdx}`;
                                        optionConditionMap.set(opt.conditionCode, checkboxId);
                                    }
                                });
                            });
                            if (allConditionCodes.length > 0) {
                                const conditions = await fhirDataService.getConditions(allConditionCodes);
                                conditions.forEach((condition) => {
                                    const codings = condition.code?.coding || [];
                                    codings.forEach((coding) => {
                                        const checkboxId = optionConditionMap.get(coding.code);
                                        if (checkboxId) {
                                            setCheckbox(checkboxId, true);
                                        }
                                    });
                                });
                            }
                        }
                        // 處理額外的觀察值需求
                        if (dataReqs.observations?.length) {
                            await fhirDataService.autoPopulateFields(dataReqs.observations);
                        }
                    }
                    catch (error) {
                        console.error('Error during FHIR auto-population:', error);
                    }
                }
                // 調用自定義初始化
                if (config.customInitialize) {
                    await config.customInitialize(client, patient, container, calculate);
                }
                calculate();
            };
            performAutoPopulation();
        }
    };
}
