# MEDCALC EHR - CSS 架構文件

## 📁 目錄結構

```
css/
├── main.css                    # 主入口文件 (v2.1.0)
├── _variables.css              # CSS 變數 (顏色、間距、字體等)
├── _reset.css                  # CSS 重置
├── _base.css                   # 基礎元素樣式
│
├── components/                 # 組件樣式 (12 個檔案)
│   ├── _alerts.css            # 警告/提示框
│   ├── _buttons.css           # 按鈕
│   ├── _calculator-list.css   # ✅ 計算器列表
│   ├── _formula.css           # ✅ 公式區塊
│   ├── _inputs.css            # 輸入框
│   ├── _radio-checkbox.css    # 單選/複選框
│   ├── _reference.css         # ✅ 參考文獻
│   ├── _result-box.css        # 結果顯示框
│   ├── _search.css            # ✅ 搜索框
│   ├── _sections.css          # 區塊容器
│   ├── _tables.css            # ✅ 評分/解釋表格
│   └── _theme-toggle.css      # 主題切換按鈕
│
├── layouts/                    # 佈局樣式
│   ├── _container.css         # 容器
│   ├── _calculator.css        # 計算器頁面
│   └── _responsive.css        # 響應式
│
├── pages/                      # 頁面專屬樣式
│   ├── _index.css             # ✅ 首頁
│   └── _growth-chart.css      # ✅ 生長曲線頁面
│
├── themes/                     # 主題
│   └── tech-theme.css         # 深色科技主題
│
├── CSS_ARCHITECTURE.md         # 本文件
└── STYLE_REFACTOR_PLAN.md     # 重構計劃
```

## ✅ 遷移完成

**舊 `style.css` 已刪除！** 所有樣式已遷移至模組化架構。

### 建立的檔案

| 檔案                              | 大小  | 說明          |
| --------------------------------- | ----- | ------------- |
| `components/_tables.css`          | 6KB   | 評分/解釋表格 |
| `components/_search.css`          | 3KB   | 搜索框        |
| `components/_reference.css`       | 3.4KB | 參考文獻      |
| `components/_formula.css`         | 3.7KB | 公式區塊      |
| `components/_calculator-list.css` | 3.1KB | 計算器列表    |
| `pages/_index.css`                | 2.9KB | 首頁          |
| `pages/_growth-chart.css`         | 9.8KB | 生長曲線      |

## 🎨 設計原則

### 1. ITCSS 分層架構

```
Settings     → _variables.css
Generic      → _reset.css
Elements     → _base.css
Objects      → layouts/
Components   → components/
Pages        → pages/
Utilities    → (在 main.css 中)
```

### 2. BEM 命名規範

```css
.block {
}
.block__element {
}
.block--modifier {
}

/* 範例 */
.ui-table {
}
.ui-table__header {
}
.ui-table__row--category {
}
```

### 3. CSS 變數命名

```css
--color-*         /* 顏色 */
--spacing-*       /* 間距 */
--font-*          /* 字體 */
--radius-*        /* 圓角 */
--shadow-*        /* 陰影 */
```

## 📚 組件類別參考

### 表格

```css
.ui-scoring-table              /* 評分表格 */
.ui-scoring-table__category    /* 分類標題行 */
.ui-scoring-table__item        /* 項目行 */
.ui-interpretation-table       /* 解釋表格 */
.ui-interpretation-table__row--success  /* 綠色 */
.ui-interpretation-table__row--warning  /* 黃色 */
.ui-interpretation-table__row--danger   /* 紅色 */
```

### 計算器列表

```css
.calculator-list               /* 列表容器 */
.list-item                     /* 列表項目 */
.list-item-title              /* 標題 */
.list-item-description        /* 描述 */
.list-item-star               /* 收藏星號 */
```

### 搜索

```css
.search-container              /* 搜索區塊 */
#search-bar                    /* 搜索輸入框 */
.controls-row                  /* 控制列 */
.sort-container                /* 排序選擇器 */
```

### 參考文獻

```css
.reference-box                 /* 參考文獻區塊 */
.reference-citation            /* 引用文字 */
.reference-links               /* 連結列表 */
.citation                      /* 舊版引用 */
```

### 公式

```css
.formula-section               /* 公式區塊 */
.formula-box                   /* 公式框 */
.formula-equation              /* 公式方程式 */
.calculator-notes              /* 計算器說明 */
```

## 🔧 使用方式

### HTML 引用

```html
<!-- 推薦方式 -->
<link rel="stylesheet" href="css/main.css" />

<!-- 加入主題 (可選) -->
<link rel="stylesheet" href="css/themes/tech-theme.css" />
```

## 📅 更新記錄

- **2025-12-25** - 完成遷移，刪除舊 `style.css`
- **2025-12-25** - 新增 `_calculator-list.css`, `pages/_index.css`
- **2025-12-25** - 新增 `_tables.css`, `_search.css`, `_reference.css`, `_formula.css`, `pages/_growth-chart.css`
