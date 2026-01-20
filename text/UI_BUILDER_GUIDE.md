# 📐 UI Builder 使用指南

MedCalcEHR 統一 UI 組件生成系統

## 🎯 目標

- **統一樣式**：所有計算器使用一致的視覺設計
- **減少重複**：消除大量重複的 HTML 模板代碼
- **簡化開發**：使用簡單的 API 快速創建表單元素
- **內建功能**：自動支持單位轉換、驗證、響應式設計

## 📦 快速開始

### 1. 導入 UI Builder

```javascript
import { uiBuilder } from '../../ui-builder.js';
```

### 2. 基本使用範例

#### 創建輸入框

```javascript
// 簡單的數字輸入
const html = uiBuilder.createInput({
    id: 'weight',
    label: 'Weight',
    type: 'number',
    placeholder: 'Enter weight',
    required: true,
    unit: 'kg'
});

// 帶單位轉換的輸入（kg ↔ lbs）
const html = uiBuilder.createInput({
    id: 'weight',
    label: 'Weight',
    type: 'number',
    unitToggle: {
        type: 'weight',
        units: ['kg', 'lbs'],
        default: 'kg'
    },
    helpText: 'Click unit button to convert'
});
```

#### 創建單選按鈕組

```javascript
const html = uiBuilder.createRadioGroup({
    name: 'gender',
    label: 'Gender',
    required: true,
    options: [
        { value: 'male', label: 'Male', checked: true },
        { value: 'female', label: 'Female' }
    ]
});
```

#### 創建複選框組

```javascript
const html = uiBuilder.createCheckboxGroup({
    name: 'risk-factors',
    label: 'Risk Factors',
    options: [
        {
            value: 'diabetes',
            label: 'Diabetes',
            description: 'History of diabetes mellitus'
        },
        {
            value: 'hypertension',
            label: 'Hypertension',
            description: 'Blood pressure > 140/90 mmHg'
        },
        {
            value: 'smoking',
            label: 'Current Smoker'
        }
    ]
});
```

#### 創建下拉選單

```javascript
const html = uiBuilder.createSelect({
    id: 'race',
    label: 'Race',
    options: [
        { value: 'white', label: 'White/Caucasian' },
        { value: 'black', label: 'Black/African American', selected: true },
        { value: 'asian', label: 'Asian' },
        { value: 'other', label: 'Other' }
    ]
});
```

#### 創建範圍滑塊

```javascript
const html = uiBuilder.createRange({
    id: 'age',
    label: 'Age',
    min: 0,
    max: 120,
    step: 1,
    defaultValue: 50,
    unit: ' years',
    showValue: true
});
```

### 3. 創建完整表單

```javascript
const formHTML = uiBuilder.createForm({
    fields: [
        {
            type: 'section',
            title: '👤 Patient Demographics',
            icon: ''
        },
        {
            type: 'radio',
            name: 'gender',
            label: 'Gender',
            options: [
                { value: 'male', label: 'Male', checked: true },
                { value: 'female', label: 'Female' }
            ]
        },
        {
            type: 'input',
            id: 'age',
            label: 'Age',
            type: 'number',
            min: 0,
            max: 120,
            unit: 'years',
            required: true
        },
        {
            type: 'section',
            title: '📏 Measurements'
        },
        {
            type: 'input',
            id: 'weight',
            label: 'Weight',
            type: 'number',
            unitToggle: {
                type: 'weight',
                units: ['kg', 'lbs'],
                default: 'kg'
            }
        },
        {
            type: 'input',
            id: 'height',
            label: 'Height',
            type: 'number',
            unitToggle: {
                type: 'height',
                units: ['cm', 'in'],
                default: 'cm'
            }
        }
    ]
});
```

### 4. 初始化組件

在 `initialize()` 函數中，HTML 插入 DOM 後調用：

```javascript
initialize: function (client, patient, container) {
    // 初始化所有動態組件（單位轉換、滑塊等）
    uiBuilder.initializeComponents(container);

    // 綁定事件
    const inputs = container.querySelectorAll('.ui-input');
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // ... 其他邏輯
}
```

## 🎨 完整計算器示例

### 範例：BMI 計算器（使用 UI Builder）

```javascript
import { uiBuilder } from '../../ui-builder.js';
import { getMostRecentObservation } from '../../utils.js';
import { LOINC_CODES } from '../../fhir-codes.js';

export const bmiCalculator = {
    id: 'bmi',
    title: 'BMI Calculator',

    generateHTML: function () {
        return (
            uiBuilder.createForm({
                fields: [
                    {
                        type: 'section',
                        title: '📏 Patient Measurements',
                        icon: '📊'
                    },
                    {
                        type: 'input',
                        id: 'weight',
                        label: 'Weight',
                        type: 'number',
                        placeholder: 'Enter weight',
                        required: true,
                        unitToggle: {
                            type: 'weight',
                            units: ['kg', 'lbs'],
                            default: 'kg'
                        },
                        helpText: 'Click button to switch between kg and lbs'
                    },
                    {
                        type: 'input',
                        id: 'height',
                        label: 'Height',
                        type: 'number',
                        placeholder: 'Enter height',
                        required: true,
                        unitToggle: {
                            type: 'height',
                            units: ['cm', 'in'],
                            default: 'cm'
                        },
                        helpText: 'Click button to switch between cm and inches'
                    }
                ]
            }) + `<div class="result-container" id="bmi-result" style="display:none;"></div>`
        );
    },

    initialize: function (client, patient, container) {
        const resultEl = container.querySelector('#bmi-result');

        // 初始化 UI 組件
        uiBuilder.initializeComponents(container);

        // 獲取輸入元素
        const weightInput = container.querySelector('#weight');
        const heightInput = container.querySelector('#height');

        // 計算函數
        const calculate = () => {
            // 使用 UnitConverter 獲取標準單位值
            const weight = UnitConverter.getStandardValue(weightInput, 'kg');
            const height = UnitConverter.getStandardValue(heightInput, 'cm');

            if (weight && height) {
                const heightM = height / 100; // cm to m
                const bmi = weight / (heightM * heightM);

                resultEl.innerHTML = `
                    <div class="result-item">
                        <span class="label">BMI:</span>
                        <span class="value">${bmi.toFixed(1)}</span>
                    </div>
                `;
                resultEl.style.display = 'block';
            }
        };

        // 綁定事件
        weightInput.addEventListener('input', calculate);
        heightInput.addEventListener('input', calculate);

        // 從 FHIR 加載數據
        if (client && patient) {
            Promise.all([
                getMostRecentObservation(client, LOINC_CODES.WEIGHT),
                getMostRecentObservation(client, LOINC_CODES.HEIGHT)
            ]).then(([weightObs, heightObs]) => {
                if (weightObs?.valueQuantity) {
                    weightInput.value = weightObs.valueQuantity.value.toFixed(1);
                }
                if (heightObs?.valueQuantity) {
                    heightInput.value = heightObs.valueQuantity.value.toFixed(1);
                }
                calculate();
            });
        }
    }
};
```

## 📋 API 參考

### 輸入組件

#### `createInput(options)`

**參數:**

- `id` (string): 元素 ID
- `label` (string): 標籤文字
- `type` (string): 輸入類型 ('number', 'text', 'email', 等)
- `placeholder` (string): 佔位符文字
- `required` (boolean): 是否必填
- `unit` (string): 單位標籤（靜態）
- `unitToggle` (object): 單位轉換配置 `{ type, units, default }`
- `helpText` (string): 幫助文字
- `min`, `max`, `step` (number): 數字輸入限制
- `defaultValue` (any): 默認值

**支持的單位類型 (unitToggle.type):**

- `'weight'`: kg, lbs, g
- `'height'`: cm, in, ft, m
- `'temperature'`: C, F, K
- `'pressure'`: mmHg, kPa
- `'volume'`: mL, L, fl oz

### 選擇組件

#### `createRadioGroup(options)`

**參數:**

- `name` (string): radio group 名稱
- `label` (string): 組標籤
- `required` (boolean): 是否必填
- `options` (array): 選項數組
    - `value`: 選項值
    - `label`: 顯示文字
    - `checked`: 是否默認選中
    - `disabled`: 是否禁用
- `helpText` (string): 幫助文字

#### `createCheckboxGroup(options)`

**參數:**

- `name` (string): checkbox group 名稱
- `label` (string): 組標籤
- `options` (array): 選項數組
    - `value`: 選項值
    - `label`: 顯示文字
    - `description`: 描述文字
    - `checked`: 是否默認選中
    - `disabled`: 是否禁用
- `helpText` (string): 幫助文字

#### `createSelect(options)`

**參數:**

- `id` (string): 元素 ID
- `label` (string): 標籤文字
- `required` (boolean): 是否必填
- `options` (array): 選項數組
    - `value`: 選項值
    - `label`: 顯示文字
    - `selected`: 是否默認選中
- `helpText` (string): 幫助文字

### 其他組件

#### `createRange(options)`

創建範圍滑塊

**參數:**

- `id`, `label`, `min`, `max`, `step`, `defaultValue`, `unit`, `showValue`

#### `createSection(options)`

創建分組容器

**參數:**

- `title` (string): 標題
- `subtitle` (string): 副標題
- `icon` (string): 圖標（emoji 或 HTML）
- `content` (string): 內部 HTML

### 初始化方法

#### `initializeComponents(container)`

初始化容器內的所有動態組件，必須在 HTML 插入 DOM 後調用。

## 🎨 樣式自定義

所有樣式類都以 `ui-` 開頭，可以通過覆蓋 CSS 變量進行自定義：

```css
/* 在你的自定義樣式中 */
.ui-section {
    /* 自定義 section 樣式 */
}

.ui-input:focus {
    border-color: #your-color;
}

.ui-radio-option input:checked + .radio-label {
    background: your-gradient;
}
```

## 🔄 遷移現有計算器

### 步驟

1. **導入 uiBuilder**

    ```javascript
    import { uiBuilder } from '../../ui-builder.js';
    ```

2. **替換 HTML 生成**
    - 找到硬編碼的 HTML 模板
    - 使用 `uiBuilder.create*()` 方法替換

3. **更新 initialize()**
    - 添加 `uiBuilder.initializeComponents(container);`
    - 移除手動的樣式切換代碼

4. **測試**
    - 確保所有功能正常
    - 檢查單位轉換是否工作

### 遷移前後對比

**Before:**

```javascript
generateHTML: function () {
    return `
        <div class="section">
            <label>Weight (kg):</label>
            <input type="number" id="weight" placeholder="Enter weight">
        </div>
        <div class="section">
            <label>Gender:</label>
            <label><input type="radio" name="gender" value="male" checked> Male</label>
            <label><input type="radio" name="gender" value="female"> Female</label>
        </div>
    `;
}
```

**After:**

```javascript
generateHTML: function () {
    return uiBuilder.createForm({
        fields: [
            {
                type: 'input',
                id: 'weight',
                label: 'Weight',
                unitToggle: { type: 'weight', units: ['kg', 'lbs'] }
            },
            {
                type: 'radio',
                name: 'gender',
                label: 'Gender',
                options: [
                    { value: 'male', label: 'Male', checked: true },
                    { value: 'female', label: 'Female' }
                ]
            }
        ]
    });
}
```

## 💡 最佳實踐

1. **總是調用 initializeComponents()**

    ```javascript
    initialize: function (client, patient, container) {
        uiBuilder.initializeComponents(container);
        // ... 其他代碼
    }
    ```

2. **使用有意義的 ID 和 name**
    - 使用描述性命名：`weight`, `height`, `systolic-bp`
    - 為 radio/checkbox group 使用統一的 name

3. **提供幫助文字**

    ```javascript
    helpText: 'Normal range: 60-100 bpm';
    ```

4. **善用 unitToggle**
    - 讓用戶可以使用他們習慣的單位
    - 內部計算使用標準單位

5. **測試響應式設計**
    - UI Builder 內建響應式支持
    - 在不同螢幕尺寸測試

## 🚀 下一步

- 查看 `js/ui-builder.js` 源碼了解更多細節
- 查看 `js/unit-converter.js` 了解單位轉換
- 參考現有計算器的實現範例

## ❓ 常見問題

**Q: 如何獲取有單位轉換的輸入值？**

```javascript
import { UnitConverter } from '../../unit-converter.js';

const value = UnitConverter.getStandardValue(inputElement, 'kg');
```

**Q: 如何自定義樣式？**
覆蓋 `.ui-*` 類的 CSS 即可。

**Q: 是否支持動態添加選項？**
可以，使用標準 DOM API 操作生成的元素。

**Q: 如何驗證輸入？**
配合 `js/validator.js` 使用，或使用 HTML5 的 `required`, `min`, `max` 等屬性。
