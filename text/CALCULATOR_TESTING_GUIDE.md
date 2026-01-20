# 計算器測試指南

## 🧪 計算器測試工具使用說明

自動化測試工具可以幫助您快速驗證所有 91 個計算器模組是否正常運作。

## 🚀 快速開始

### 1. 訪問測試工具

```
http://localhost:8080/test-calculators.html
```

### 2. 開始測試

點擊 **「🚀 開始測試」** 按鈕，工具會自動：

- 檢查每個計算器的模組檔案
- 嘗試載入模組
- 驗證模組結構
- 檢查必要方法（generateHTML）
- 測試 HTML 生成

### 3. 查看結果

測試完成後，您會看到：

- **總覽摘要**：總數、成功數、失敗數、成功率
- **詳細列表**：每個計算器的測試結果
- **篩選選項**：可以只查看成功或失敗的項目

## 📊 測試項目說明

### 測試 1: 檔案存在性 ✓

檢查 `/js/calculators/{id}/index.js` 檔案是否存在且可訪問。

**失敗原因**：

- 檔案不存在
- 路徑錯誤
- 權限問題

### 測試 2: 模組載入 ✓

嘗試使用 ES6 import 載入模組。

**失敗原因**：

- JavaScript 語法錯誤
- 模組路徑錯誤
- 瀏覽器不支援 ES6 模組

### 測試 3: 模組結構 ✓

檢查模組是否正確匯出計算器物件。

**失敗原因**：

- 沒有 export 語句
- export 格式不正確
- 模組為空

### 測試 4: 必要方法 ✓

驗證計算器物件是否包含 `generateHTML` 方法。

**失敗原因**：

- 缺少 generateHTML 方法
- generateHTML 不是函數

### 測試 5: HTML 生成 ⚠️

嘗試執行 `generateHTML()` 並檢查返回值。

**警告（不影響通過）**：

- generateHTML 返回值不是字串
- generateHTML 執行時出現錯誤
- 返回的 HTML 為空

### 測試 6: 可選方法 ℹ️

檢查是否有 `initialize` 和 `calculate` 方法（可選）。

**資訊項（不影響通過）**：

- 有 initialize：表示計算器支援 FHIR 整合
- 有 calculate：表示計算器有計算邏輯
- HTML 長度：生成的 HTML 字元數

## 🎨 測試結果解讀

### ✅ 綠色 - 測試通過

```
✅ ASCVD Risk Score (10-Year)
   ID: ascvd
   ✓ 所有測試通過 • ✓ 有 initialize • ✓ 有 calculate • ✓ HTML (2543 字元)
```

**說明**：

- 所有必要測試通過
- 檔案存在且可載入
- 結構正確，方法完整
- 可以正常使用

### ❌ 紅色 - 測試失敗

```
❌ BMI and BSA Calculator
   ID: bmi-bsa
   ✗ 測試失敗
   模組載入失敗: Unexpected token 'export'
```

**說明**：

- 至少一項測試失敗
- 需要檢查和修復
- 無法在應用程式中使用

### ⚠️ 黃色 - 有警告

```
✅ APGAR Score
   ID: apgar
   ✓ 所有測試通過
   ⚠️ 警告: generateHTML 返回值可能不正確
```

**說明**：

- 基本測試通過
- 但有潛在問題
- 可以使用，但建議檢查

## 🔧 常見問題修復

### 問題 1: "模組檔案不存在或無法訪問"

**可能原因**：

- 檔案路徑不正確
- 檔案名稱拼寫錯誤
- 檔案在 Docker 容器中不存在

**解決方案**：

```bash
# 檢查檔案是否存在
ls -la js/calculators/{id}/

# 如果使用 Docker，重建容器
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 問題 2: "模組載入失敗: Unexpected token"

**可能原因**：

- JavaScript 語法錯誤
- 使用了不支援的語法
- 缺少必要的匯入

**解決方案**：

```javascript
// 檢查 index.js 檔案
// 確保有正確的 export 語句

export const calculatorName = {
    generateHTML: function () {
        // ...
    }
};
```

### 問題 3: "模組沒有匯出計算器物件"

**可能原因**：

- 缺少 export 語句
- export 格式錯誤

**解決方案**：

```javascript
// ❌ 錯誤
const calculator = {
    /* ... */
};

// ✅ 正確
export const calculator = {
    /* ... */
};

// 或
const calculator = {
    /* ... */
};
export default calculator;
```

### 問題 4: "缺少 generateHTML 方法"

**可能原因**：

- 計算器物件結構不正確
- 方法名稱拼寫錯誤

**解決方案**：

```javascript
export const calculator = {
    // ❌ 錯誤：方法名拼寫錯誤
    generateHtml: function () {
        /* ... */
    },

    // ✅ 正確
    generateHTML: function () {
        /* ... */
    }
};
```

## 📝 測試報告匯出

點擊 **「📥 匯出報告」** 按鈕會下載 JSON 格式的測試報告：

```json
{
    "timestamp": "2025-11-01T12:34:56.789Z",
    "total": 91,
    "success": 89,
    "error": 2,
    "results": [
        {
            "id": "ascvd",
            "title": "ASCVD Risk Score (10-Year)",
            "success": true,
            "errors": [],
            "warnings": [],
            "details": {
                "fileExists": true,
                "moduleLoaded": true,
                "hasExport": true,
                "hasGenerateHTML": true,
                "hasInitialize": true,
                "htmlLength": 2543
            }
        }
    ]
}
```

## 🎯 測試最佳實踐

### 開發新計算器時

1. 開發完成後立即執行測試
2. 確保所有測試通過
3. 檢查是否有警告訊息

### 修改現有計算器時

1. 修改前執行測試（建立基準）
2. 修改後重新測試
3. 確保沒有破壞現有功能

### 部署前檢查

1. 執行完整測試套件
2. 確保成功率 100%
3. 匯出報告存檔

### 定期維護

1. 每週執行一次完整測試
2. 追蹤成功率趨勢
3. 及時修復發現的問題

## 🔍 進階功能

### 單個計算器重測

在測試結果中，每個項目都有 **「重新測試」** 按鈕：

- 點擊後只重新測試該計算器
- 不影響其他測試結果
- 用於驗證修復是否成功

### 直接開啟計算器

點擊 **「開啟計算器」** 按鈕：

- 在新分頁中開啟該計算器
- 可以手動驗證功能
- 查看實際顯示效果

### 結果篩選

使用篩選按鈕快速查看：

- **全部**：顯示所有測試結果
- **✓ 成功**：只顯示通過的項目
- **✗ 失敗**：只顯示失敗的項目

### 停止測試

測試進行中可以點擊 **「⏸️ 停止測試」**：

- 立即停止測試
- 保留已測試的結果
- 可以隨時繼續

## 📚 計算器開發規範

根據測試要求，計算器模組應該遵循以下結構：

```javascript
// js/calculators/example/index.js

export const exampleCalculator = {
    // 必要：生成計算器 HTML
    generateHTML: function () {
        return `
            <h2>Example Calculator</h2>
            <form id="example-form">
                <!-- 計算器表單 -->
            </form>
            <div id="result"></div>
        `;
    },

    // 可選：初始化函數（用於 FHIR 整合）
    initialize: function (client, patient, container) {
        // 綁定事件
        // 自動填入病患資料
        // 設置監聽器
    },

    // 可選：計算函數
    calculate: function (inputs) {
        // 執行計算
        // 返回結果
    }
};
```

## 🔗 相關資源

- **健康檢查工具**：http://localhost:8080/health-check.html
- **應用程式首頁**：http://localhost:8080/
- **開發指南**：[DEVELOPMENT.md](DEVELOPMENT.md)
- **貢獻指南**：[CONTRIBUTING.md](CONTRIBUTING.md)

## 💡 提示

1. **測試順序是隨機的嗎？**
    - 不是，按照 `calculators/index.js` 中的字母順序

2. **測試會修改資料嗎？**
    - 不會，測試是唯讀的，只檢查不修改

3. **可以在生產環境使用嗎？**
    - 可以，但建議只在開發/測試環境使用

4. **測試需要多久？**
    - 通常 30-60 秒完成 91 個計算器的測試

5. **測試會影響效能嗎？**
    - 測試期間會載入所有模組，可能暫時增加記憶體使用

---

**最後更新**：2025-11-01  
**測試工具版本**：1.0.0
