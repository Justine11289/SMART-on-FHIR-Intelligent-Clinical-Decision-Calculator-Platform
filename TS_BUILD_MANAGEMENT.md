# TypeScript 編譯產物管理

## 📁 目錄結構

```
src/                            # TypeScript 源碼
├── *.ts                        # 主要模組
├── *.d.ts                      # ⚠️ 手動編寫的類型宣告 (勿刪除)
├── calculators/
│   ├── */index.ts              # 計算器模組
│   ├── */calculation.js        # ⚠️ 輔助計算檔案 (勿刪除)
│   └── */cdc-data.js           # ⚠️ 資料檔案 (勿刪除)
└── ...

js/                             # 編譯輸出目錄 (tsconfig.json outDir)
├── *.js                        # 編譯後的 JavaScript
├── *.d.ts                      # 🔄 自動生成 (可清理)
├── *.d.ts.map                  # 🔄 自動生成 (可清理)
├── *.js.map                    # 🔄 自動生成 (可清理)
└── calculators/                # 計算器編譯產物
    └── */
        ├── index.js            # 🔄 自動生成
        ├── index.d.ts          # 🔄 自動生成
        └── ...
```

## 🔧 常用指令

### 編譯 TypeScript

```bash
npm run build:ts
# 或
npx tsc -p tsconfig.json
```

### 清理編譯產物

```bash
npm run clean:ts
# 或
powershell -ExecutionPolicy Bypass -File clean-ts-output.ps1
```

### 重新編譯 (清理+編譯)

```bash
npm run rebuild:ts
```

## ⚠️ 重要注意事項

### 不可刪除的檔案

以下檔案是手動編寫的，**不是編譯產物**：

1. **`src/*.d.ts`** - 類型宣告檔案
    - `src/ui-builder.d.ts`
    - `src/fhir-codes.d.ts`
    - `src/utils.d.ts`
    - `src/validator.d.ts`
    - `src/errorHandler.d.ts`
    - `src/unit-converter.d.ts`
    - `src/data-staleness.d.ts`
    - `src/fhir-data-service.d.ts`

2. **`src/**/calculation.js`\*\* - 輔助計算檔案
    - `src/calculators/ethanol-concentration/calculation.js`
    - `src/calculators/intraop-fluid/calculation.js`
    - `src/calculators/nafld-fibrosis-score/calculation.js`

3. **`src/**/cdc-data.js`\*\* - 資料檔案
    - `src/calculators/growth-chart/cdc-data.js`

### 可安全清理的檔案

- `js/*.d.ts` - 自動生成的類型宣告
- `js/*.d.ts.map` - 類型宣告對應表
- `js/*.js.map` - Source Map
- `js/calculators/**/*.d.ts`
- `js/calculators/**/*.d.ts.map`
- `js/calculators/**/*.js.map`
- `dist/` - 整個目錄

## 📋 .gitignore 設定

```gitignore
# TypeScript 編譯產物
js/calculators/**/*.js
js/calculators/**/*.d.ts
js/calculators/**/*.js.map
js/calculators/**/*.d.ts.map
js/*.d.ts
js/*.d.ts.map
js/*.js.map

# 保留輔助檔案
!js/calculators/**/calculation.js
!js/calculators/**/cdc-data.js
```

## 🔄 開發工作流程

1. **編輯** `src/**/*.ts` 檔案
2. **編譯** `npm run build:ts`
3. **測試** 在瀏覽器中驗證
4. **提交** Git 會自動忽略編譯產物

## 📅 更新記錄

- **2025-12-25** - 建立 TypeScript 編譯產物管理文件
