計算器架構分析與改進建議
📋 架構問題總覽

1. CSS 架構問題 🎨
   現況
   10 個 CSS 文件，總計約 80KB
   多個文件有重疊和衝突的樣式規則
   大量使用 !important 來覆蓋樣式（特別是
   tech-theme.css
   ）
   主要問題
   問題 說明
   樣式分散 同一組件的樣式分散在多個文件中（如 .calculator-header 在 3 個文件中定義）
   !important 濫用
   tech-theme.css
   大量使用 !important，表示層級混亂
   命名不一致 混用多種命名慣例（BEM、功能命名、組件命名）
   主題耦合 主題樣式和基礎樣式混在一起
   建議改進
   css/
   ├── \_variables.css # CSS變數（顏色、間距等）
   ├── \_reset.css # 重置樣式
   ├── \_base.css # 基礎元素樣式
   ├── components/
   │ ├── \_alerts.css
   │ ├── \_buttons.css
   │ ├── \_inputs.css
   │ ├── \_result-box.css
   │ └── \_sections.css
   ├── layouts/
   │ ├── \_calculator.css
   │ └── \_responsive.css
   └── themes/
   └── tech-theme.css # 只覆蓋變數，不用!important
2. JavaScript 架構問題 ⚙️
   現況
   211 個計算器目錄，每個包含
   index.ts
   /
   index.js
   部分計算器有重複的 TypeScript 和 JavaScript 版本
   樣式有時候寫在 JavaScript 中（如
   data-staleness.js
   ）
   主要問題
   問題 說明
   TS/JS 重複 許多計算器同時有
   .ts
   和
   .js
   文件，維護困難
   inline CSS JavaScript 中包含 CSS（如
   data-staleness.js
   第 296-347 行）
   缺乏抽象 計算邏輯和 UI 代碼混在一起
   錯誤處理不一致 不同計算器的錯誤處理方式不同
   建議改進
   calculators/
   ├── shared/
   │ ├── base-calculator.ts # 抽象基類
   │ ├── score-calculator.ts # 評分計算器基類
   │ └── lab-calculator.ts # 實驗室值計算器基類
   └── [calculator-name]/
   ├── index.ts # 只保留 TS 版本
   ├── calculation.ts # 純計算邏輯（可單元測試）
   └── config.ts # 配置（選項、閾值等）
3. UI Builder 問題 🔧
   現況
   uiBuilder 是主要的 UI 生成器
   組件使用 HTML 字串模板
   主要問題
   問題 說明
   字串模板 使用字串拼接生成 HTML，難以偵錯和維護
   XSS 風險 部分地方使用 innerHTML 沒有消毒
   無類型安全 模板字串無法享受 TypeScript 類型檢查
   建議改進
   考慮使用輕量級模板引擎或 Web Components
   對所有動態內容進行 HTML 消毒
   為 UI 組件增加更強的類型定義
4. 數據流問題 📊
   現況
   FHIR 數據通過 getMostRecentObservation 獲取
   每個計算器各自處理數據
   主要問題
   問題 說明
   重複請求 不同計算器可能重複請求相同數據
   緩存分散 緩存邏輯不統一
   單位轉換分散 每個計算器各自處理單位轉換
   建議改進
   建立統一的數據層（Data Layer）
   實作智能緩存機制
   標準化單位轉換流程
   🎯 優先級建議
   高優先級（應立即處理）
   統一 CSS 變數系統 - 消除 !important 濫用
   移除 TS/JS 重複 - 只保留 TypeScript 版本
   抽離 inline CSS - 從 JavaScript 移到 CSS 文件
   中優先級（近期處理）
   CSS 文件重組 - 按組件/功能分類
   計算器基類 - 抽象共用邏輯
   類型安全加強 - 增加更多 TypeScript 類型
   低優先級（長期改進）
   組件化重構 - 考慮 Web Components
   數據層統一 - 建立 FHIR 數據管理層
   測試覆蓋 - 增加單元測試和整合測試
   ❓ 需要您的意見
   CSS 重構優先級：您希望先處理哪個 CSS 問題？

A. 統一 CSS 變數，消除 !important
B. 重組 CSS 文件結構
C. 兩者同時進行
TypeScript 遷移：

是否要完全移除所有
.js
文件，只保留
.ts
？
inline CSS 處理：

是否要將
data-staleness.js
中的樣式移到 CSS 文件？
其他優先事項：

您是否有其他特別想改進的地方？
