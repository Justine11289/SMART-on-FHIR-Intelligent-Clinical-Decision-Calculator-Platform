# 過期數據警告功能 (Data Staleness Warning)

## 概述

當計算器自動從 FHIR 服務器抓取實驗室數值或生命徵象數據時，如果數據已超過 3 個月（90 天），系統會顯示警告提示用戶確認數據的有效性。

## 功能特點

- **自動檢測**：檢查 FHIR Observation 資源的 `effectiveDateTime`、`issued` 等日期欄位
- **視覺警告**：在計算器頂部顯示黃色警告框，列出所有過期的數據項目
- **多語言支援**：警告訊息同時顯示中文和英文
- **日期格式**：顯示數據的收集日期和年齡（例如：「3 個月前」）

## 如何為計算器添加過期數據追蹤

### 步驟 1：導入模組

在計算器的 `index.js` 開頭添加：

```javascript
import { createStalenessTracker } from '../../data-staleness.js';
```

### 步驟 2：在 `initialize` 函數中創建追蹤器

```javascript
initialize: function (client, patient, container) {
    uiBuilder.initializeComponents(container);

    // 創建過期數據追蹤器
    const stalenessTracker = createStalenessTracker();
    stalenessTracker.setContainer(container);

    // ... 其他初始化代碼
}
```

### 步驟 3：在抓取 FHIR 數據時追蹤

```javascript
// 抓取 FHIR 數據時追蹤過期狀態
getMostRecentObservation(client, LOINC_CODES.SODIUM).then(obs => {
    if (obs?.valueQuantity) {
        // 設置輸入值
        setValue('#calculator-sodium', obs.valueQuantity.value.toFixed(0));

        // 追蹤過期狀態（會自動顯示警告如果超過 3 個月）
        stalenessTracker.trackObservation(
            '#calculator-sodium', // 欄位 ID
            obs, // FHIR Observation 資源
            LOINC_CODES.SODIUM, // LOINC 代碼
            'Sodium' // 自定義標籤（選填）
        );
    }
});
```

## API 參考

### `createStalenessTracker(options)`

創建一個新的過期數據追蹤器。

**參數：**

- `options.thresholdMs`：過期閾值（毫秒），默認 90 天
- `options.warningContainerId`：警告容器 ID，默認 `'staleness-warnings'`

**返回：** `DataStalenessTracker` 實例

### `DataStalenessTracker.setContainer(container)`

設置追蹤器的容器元素。警告將顯示在此容器中。

### `DataStalenessTracker.trackObservation(fieldId, observation, code, customLabel)`

追蹤一個觀察值的過期狀態。

**參數：**

- `fieldId`：輸入欄位的 ID（用於識別）
- `observation`：FHIR Observation 資源對象
- `code`：LOINC 代碼
- `customLabel`：自定義標籤（選填，用於顯示在警告中）

**返回：** 過期資訊對象或 `null`

### `DataStalenessTracker.clearField(fieldId)`

清除特定欄位的過期追蹤。

### `DataStalenessTracker.clearAll()`

清除所有過期追蹤。

### `DataStalenessTracker.getStaleCount()`

獲取過期項目數量。

### `DataStalenessTracker.getStaleItems()`

獲取所有過期項目的詳細資訊。

## 已實現的計算器

以下計算器已經實現了過期數據警告功能：

- ✅ APACHE II
- ✅ SOFA Score

## 配置

默認過期閾值為 **90 天（3 個月）**。如需自定義：

```javascript
const stalenessTracker = createStalenessTracker({
    thresholdMs: 30 * 24 * 60 * 60 * 1000 // 30 天
});
```

## 樣式

過期警告使用標準的 UI Builder 警告樣式，並額外包含：

- 動畫淡入效果
- 深色模式支援
- 列表格式展示過期項目
