# 計算器統一樣式指南

## 📐 設計原則

### 為什麼需要統一樣式？

1. **一致的使用者體驗**：所有計算器看起來和感覺相同
2. **易於維護**：集中管理樣式，一處修改處處生效
3. **提高開發效率**：使用預定義組件，無需重新設計
4. **響應式設計**：所有樣式都已優化適配各種螢幕
5. **可訪問性**：符合無障礙標準

## 🎨 新的 CSS 樣式系統

所有統一樣式都定義在 `css/unified-calculator.css` 中，已經自動載入到所有頁面。

**重要**：請使用預定義的 CSS 類，避免使用內聯樣式（inline styles）！

## 📚 組件庫

### 1. 計算器標題區域

#### 選項 A：帶背景的標題（推薦用於重要計算器）

```html
<div class="calculator-header">
    <h3>ASCVD Risk Score</h3>
    <p class="description">Determines 10-year risk of hard ASCVD events.</p>
</div>
```

#### 選項 B：簡單標題

```html
<h3 class="calculator-title">BMI and BSA Calculator</h3>
<p class="calculator-description">Calculate Body Mass Index and Body Surface Area.</p>
```

---

### 2. 輸入欄位

#### 基本輸入

```html
<div class="input-group">
    <label for="age">Age (years):</label>
    <input type="number" id="age" placeholder="e.g., 55" min="0" max="120" />
    <span class="input-hint">Enter patient's age in years</span>
</div>
```

#### 下拉選單

```html
<div class="input-group">
    <label for="gender">Gender:</label>
    <select id="gender">
        <option value="">-- Select --</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
    </select>
</div>
```

---

### 3. 單選按鈕 (Radio Buttons)

#### 傳統樣式

```html
<div class="radio-group">
    <span class="radio-group-title">Glasgow Coma Scale - Eye Opening:</span>

    <label class="radio-option">
        <input type="radio" name="eye" value="4" checked />
        <span>Spontaneous - open with blinking at baseline (4)</span>
    </label>

    <label class="radio-option">
        <input type="radio" name="eye" value="3" />
        <span>To verbal stimuli, command, speech (3)</span>
    </label>

    <label class="radio-option">
        <input type="radio" name="eye" value="2" />
        <span>To pain only (not applied to face) (2)</span>
    </label>
</div>
```

#### 分段控制樣式（適合 2-4 個選項）

```html
<div class="segmented-control">
    <label>
        <input type="radio" name="gender" value="male" checked />
        <span>Male</span>
    </label>
    <label>
        <input type="radio" name="gender" value="female" />
        <span>Female</span>
    </label>
</div>
```

---

### 4. 複選框 (Checkboxes)

```html
<div class="checkbox-group">
    <label class="checkbox-option">
        <input type="checkbox" id="diabetes" value="yes" />
        <span>Diabetes Mellitus</span>
    </label>

    <label class="checkbox-option">
        <input type="checkbox" id="hypertension" value="yes" />
        <span>Hypertension</span>
    </label>

    <label class="checkbox-option">
        <input type="checkbox" id="smoking" value="yes" />
        <span>Current Smoker</span>
    </label>
</div>
```

---

### 5. 按鈕

```html
<!-- 主要計算按鈕 -->
<button class="btn-calculate" id="calculate-btn">Calculate Score</button>

<!-- 次要按鈕 -->
<button class="btn-secondary">Show Details</button>

<!-- 重置按鈕 -->
<button class="btn-reset">Reset Form</button>
```

---

### 6. 結果顯示

#### 單一結果值

```html
<div class="result-container" id="result" style="display: none;">
    <div class="result-header">
        <h4>Calculated BMI</h4>
    </div>

    <div class="result-score">
        <span class="result-score-value" id="bmi-value">24.5</span>
        <span class="result-score-unit">kg/m²</span>
    </div>

    <div class="risk-badge moderate">Normal Weight</div>
</div>
```

#### 多個結果項目

```html
<div class="result-container show" id="result">
    <div class="result-item">
        <span class="result-item-label">BMI</span>
        <span class="result-item-value"> 24.5 <span class="result-item-unit">kg/m²</span> </span>
    </div>

    <div class="result-item">
        <span class="result-item-label">BSA (Du Bois)</span>
        <span class="result-item-value"> 1.85 <span class="result-item-unit">m²</span> </span>
    </div>

    <div class="result-item">
        <span class="result-item-label">Ideal Body Weight</span>
        <span class="result-item-value"> 70.5 <span class="result-item-unit">kg</span> </span>
    </div>
</div>
```

---

### 7. 風險/嚴重度指標

#### 風險徽章

```html
<div class="risk-badge low">Low Risk</div>
<div class="risk-badge moderate">Moderate Risk</div>
<div class="risk-badge high">High Risk</div>
<div class="risk-badge severe">Severe Risk</div>
```

#### 嚴重度指示器

```html
<div class="severity-indicator low">
    <span class="severity-indicator-icon">✓</span>
    <span class="severity-indicator-text">Low Risk (< 5%)</span>
</div>

<div class="severity-indicator moderate">
    <span class="severity-indicator-icon">⚠️</span>
    <span class="severity-indicator-text">Moderate Risk (5-7.5%)</span>
</div>

<div class="severity-indicator high">
    <span class="severity-indicator-icon">⚠️</span>
    <span class="severity-indicator-text">High Risk (> 7.5%)</span>
</div>
```

---

### 8. 公式與說明

```html
<div class="info-section">
    <h4>📐 Formula</h4>

    <div class="formula-box">
        <div class="formula-title">Body Mass Index (BMI):</div>
        <div class="formula-code">BMI = Weight (kg) / Height² (m²)</div>
    </div>

    <div class="formula-box">
        <div class="formula-title">Body Surface Area (Du Bois):</div>
        <div class="formula-code">BSA = 0.007184 × Weight^0.425 × Height^0.725</div>
    </div>
</div>
```

---

### 9. 提示訊息

```html
<!-- 資訊提示 -->
<div class="alert info">
    <span class="alert-icon">ℹ️</span>
    <div class="alert-content">
        <div class="alert-title">Note</div>
        <p>This calculator is for adults aged 20-79 years.</p>
    </div>
</div>

<!-- 成功訊息 -->
<div class="alert success">
    <span class="alert-icon">✓</span>
    <div class="alert-content">
        <div class="alert-title">Success</div>
        <p>Calculation completed successfully.</p>
    </div>
</div>

<!-- 警告訊息 -->
<div class="alert warning">
    <span class="alert-icon">⚠️</span>
    <div class="alert-content">
        <div class="alert-title">Warning</div>
        <p>Values are outside normal range. Please verify input.</p>
    </div>
</div>

<!-- 錯誤訊息 -->
<div class="alert error">
    <span class="alert-icon">✗</span>
    <div class="alert-content">
        <div class="alert-title">Error</div>
        <p>Please fill in all required fields.</p>
    </div>
</div>
```

---

### 10. 分隔線與區塊

```html
<!-- 分隔線 -->
<div class="divider"></div>

<!-- 區塊標題 -->
<div class="section">
    <div class="section-title">
        <span class="section-title-icon">📊</span>
        <span>Risk Factors</span>
    </div>
    <!-- 區塊內容 -->
</div>
```

---

### 11. 進度條

```html
<div class="progress-bar">
    <div class="progress-bar-fill" style="width: 65%;">65% Risk</div>
</div>
```

---

### 12. 表格

```html
<table class="data-table">
    <thead>
        <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Normal Range</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Systolic BP</td>
            <td>140 mmHg</td>
            <td>90-120 mmHg</td>
        </tr>
        <tr>
            <td>Diastolic BP</td>
            <td>90 mmHg</td>
            <td>60-80 mmHg</td>
        </tr>
    </tbody>
</table>
```

---

## 📝 完整範例：標準計算器範本

```javascript
// js/calculators/example/index.js

export const exampleCalculator = {
    id: 'example',
    title: 'Example Calculator',

    generateHTML: function () {
        return `
            <!-- 標題區域 -->
            <div class="calculator-header">
                <h3>${this.title}</h3>
                <p class="description">Brief description of what this calculator does.</p>
            </div>
            
            <!-- 輸入區域 -->
            <div class="section">
                <div class="section-title">
                    <span class="section-title-icon">📝</span>
                    <span>Patient Information</span>
                </div>
                
                <div class="input-group">
                    <label for="age">Age (years):</label>
                    <input type="number" id="age" placeholder="e.g., 55" min="0" max="120">
                </div>
                
                <div class="input-group">
                    <label for="gender">Gender:</label>
                    <div class="segmented-control">
                        <label>
                            <input type="radio" name="gender" value="male" checked>
                            <span>Male</span>
                        </label>
                        <label>
                            <input type="radio" name="gender" value="female">
                            <span>Female</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- 計算按鈕 -->
            <button class="btn-calculate" id="calculate-btn">Calculate Score</button>
            
            <!-- 結果顯示 -->
            <div class="result-container" id="result" style="display: none;">
                <div class="result-header">
                    <h4>Calculated Score</h4>
                </div>
                
                <div class="result-score">
                    <span class="result-score-value" id="score-value">--</span>
                    <span class="result-score-unit">points</span>
                </div>
                
                <div id="risk-badge"></div>
            </div>
            
            <!-- 公式說明 -->
            <div class="info-section mt-30">
                <h4>📐 Formula</h4>
                <div class="formula-box">
                    <div class="formula-title">Example Score:</div>
                    <div class="formula-code">
                        Score = Age × Factor + Risk Points
                    </div>
                </div>
            </div>
        `;
    },

    initialize: function (client, patient, container) {
        const calculateBtn = container.querySelector('#calculate-btn');
        const resultContainer = container.querySelector('#result');
        const scoreValue = container.querySelector('#score-value');
        const riskBadge = container.querySelector('#risk-badge');

        calculateBtn.addEventListener('click', () => {
            // 獲取輸入值
            const age = parseInt(container.querySelector('#age').value);
            const gender = container.querySelector('input[name="gender"]:checked').value;

            // 驗證輸入
            if (!age || age < 0 || age > 120) {
                // 顯示錯誤
                return;
            }

            // 計算分數
            const score = this.calculate(age, gender);

            // 顯示結果
            scoreValue.textContent = score;
            resultContainer.style.display = 'block';
            resultContainer.classList.add('show');

            // 設定風險徽章
            if (score < 5) {
                riskBadge.innerHTML = '<div class="risk-badge low">Low Risk</div>';
            } else if (score < 10) {
                riskBadge.innerHTML = '<div class="risk-badge moderate">Moderate Risk</div>';
            } else {
                riskBadge.innerHTML = '<div class="risk-badge high">High Risk</div>';
            }
        });
    },

    calculate: function (age, gender) {
        // 計算邏輯
        const factor = gender === 'male' ? 1.2 : 1.0;
        return Math.round(age * factor);
    }
};
```

---

## 🔄 轉換現有計算器

### 轉換步驟：

1. **移除內聯樣式**：刪除所有 `style=""` 屬性
2. **使用預定義類**：用對應的 CSS 類替換
3. **統一結構**：使用標準組件結構
4. **測試**：確保功能正常且樣式一致

### 轉換範例：

#### Before（舊樣式）

```javascript
generateHTML: function() {
    return `
        <h3>${this.title}</h3>
        <div style="margin-bottom: 15px;">
            <label style="font-weight: 600;">Age:</label>
            <input type="number" id="age" style="width: 100%; padding: 10px;">
        </div>
        <button id="calc-btn" style="background: blue; color: white; padding: 12px;">
            Calculate
        </button>
        <div id="result" style="display: none; margin-top: 20px; padding: 20px; background: #f0f0f0;">
            <span id="value" style="font-size: 24px; font-weight: bold;"></span>
        </div>
    `;
}
```

#### After（新樣式）

```javascript
generateHTML: function() {
    return `
        <h3 class="calculator-title">${this.title}</h3>

        <div class="input-group">
            <label for="age">Age:</label>
            <input type="number" id="age">
        </div>

        <button class="btn-calculate" id="calc-btn">Calculate</button>

        <div class="result-container" id="result" style="display: none;">
            <div class="result-score">
                <span class="result-score-value" id="value"></span>
            </div>
        </div>
    `;
}
```

---

## 🎨 顏色系統

### 主要顏色

- **主要漸變色**：`#667eea` → `#764ba2`
- **文字顏色**：`#2d3748`（深灰）
- **次要文字**：`#718096`（中灰）
- **邊框顏色**：`#e2e8f0`（淺灰）

### 風險顏色

- **低風險**：`#c6f6d5`（綠色系）
- **中等風險**：`#feebc8`（橙色系）
- **高風險**：`#fed7d7`（紅色系）
- **嚴重**：`#fc8181`（深紅色系）

---

## ✅ 檢查清單

在提交計算器之前，請確認：

- [ ] 沒有使用內聯樣式（除了 `display: none` 用於初始隱藏）
- [ ] 使用統一的 CSS 類
- [ ] 標題使用 `.calculator-header` 或 `.calculator-title`
- [ ] 輸入欄位使用 `.input-group`
- [ ] 按鈕使用 `.btn-calculate`
- [ ] 結果使用 `.result-container`
- [ ] 提示訊息使用 `.alert`
- [ ] 公式使用 `.info-section` 和 `.formula-box`
- [ ] 在各種螢幕尺寸下測試（手機、平板、桌面）
- [ ] 使用測試工具驗證計算器載入正常

---

## 📚 更多資源

- **完整 CSS 文件**：`css/unified-calculator.css`
- **測試工具**：http://localhost:8080/test-calculators.html
- **開發指南**：[DEVELOPMENT.md](DEVELOPMENT.md)
- **範例計算器**：`js/calculators/bmi-bsa/index.js`（已更新為統一樣式）

---

## 🆘 常見問題

### Q: 我需要自訂樣式怎麼辦？

A: 首先檢查是否可以使用現有組件的組合。如果確實需要特殊樣式，請在 `unified-calculator.css` 中添加新的可重用類，而不是使用內聯樣式。

### Q: 如何為特定計算器添加特殊功能？

A: 可以在 `initialize()` 函數中使用 JavaScript 動態添加類和樣式，但 HTML 結構應該使用統一的 CSS 類。

### Q: 所有計算器都必須轉換嗎？

A: 建議逐步轉換。新計算器必須使用統一樣式。現有計算器可以在更新時一並轉換。

### Q: 轉換會破壞現有功能嗎？

A: 不會。樣式系統是向後兼容的。但建議轉換後進行完整測試。

---

**最後更新**：2025-11-01  
**版本**：2.0.0
