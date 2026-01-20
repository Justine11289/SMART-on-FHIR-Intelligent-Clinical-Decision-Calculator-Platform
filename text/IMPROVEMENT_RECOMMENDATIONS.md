# 📈 MEDCALCEHR 改善建議

## 🎯 改善優先級

### P0 - 高優先級（立即實施）

#### 1. 效能優化 ⚡

**問題：** 92個計算器模組在首頁一次性載入可能影響效能

**建議解決方案：**

```javascript
// 實施計算器懶加載 (Lazy Loading)
// 在 js/calculators/index.js 中：

// 目前：直接 import 所有模組
// 建議：改為動態 import

export const calculatorModules = [
    { id: 'bmi-bsa', title: 'BMI & BSA Calculator', category: 'general' },
    { id: 'gcs', title: 'Glasgow Coma Scale', category: 'critical-care' }
    // ... 更多計算器
];

// 新增動態載入函數
export async function loadCalculator(calculatorId) {
    try {
        const module = await import(`/js/calculators/${calculatorId}/index.js`);
        return module.default || Object.values(module)[0];
    } catch (error) {
        console.error(`Failed to load calculator: ${calculatorId}`, error);
        throw error;
    }
}
```

**預期效果：**

- 首頁載入時間減少 60-70%
- 初始 bundle 大小減少
- 更好的使用者體驗

---

#### 2. 測試覆蓋率提升 🧪

**當前狀況：**

- 僅有 19/92 個計算器有測試（21%）
- 缺少整合測試

**建議：**

```bash
# 設定測試覆蓋率目標
# 在 jest.config.js 中更新：

coverageThreshold: {
    global: {
        lines: 60,      // 從 5% 提升到 60%
        statements: 60,  // 從 5% 提升到 60%
        functions: 50,   // 從 5% 提升到 50%
        branches: 40     // 從 3% 提升到 40%
    }
}
```

**實施計劃：**

1. **Week 1-2：** 為剩餘 73 個計算器添加單元測試
2. **Week 3：** 添加整合測試（FHIR 集成測試）
3. **Week 4：** E2E 測試（使用 Playwright 或 Cypress）

**測試模板範例：**

```javascript
// tests/calculators/calculator-template.test.js
import { describe, test, expect } from '@jest/globals';
import { setupMockFHIRClient, mockPatientData } from './test-helpers.js';

describe('Calculator Name', () => {
    test('should calculate correctly with valid input', () => {
        // 測試邏輯
    });

    test('should handle invalid input gracefully', () => {
        // 錯誤處理測試
    });

    test('should populate from FHIR data', async () => {
        // FHIR 集成測試
    });
});
```

---

#### 3. 快取策略優化 💾

**問題：** 目前沒有明確的快取策略，可能導致重複載入相同資源

**建議實施：**

```javascript
// js/cacheManager.js - 新檔案
export class CacheManager {
    constructor(cacheName = 'medcalcehr-cache-v1') {
        this.cacheName = cacheName;
        this.memoryCache = new Map();
    }

    // FHIR 資料快取
    async cacheFHIRData(patientId, data, ttl = 300000) {
        // 5分鐘
        const cacheKey = `fhir-${patientId}`;
        const item = {
            data,
            timestamp: Date.now(),
            ttl
        };

        this.memoryCache.set(cacheKey, item);

        // 同時存到 localStorage
        try {
            localStorage.setItem(cacheKey, JSON.stringify(item));
        } catch (e) {
            console.warn('Failed to cache to localStorage:', e);
        }
    }

    // 獲取快取資料
    async getCachedFHIRData(patientId) {
        const cacheKey = `fhir-${patientId}`;

        // 優先從記憶體快取讀取
        let item = this.memoryCache.get(cacheKey);

        // 如果記憶體快取沒有，嘗試從 localStorage
        if (!item) {
            try {
                const stored = localStorage.getItem(cacheKey);
                if (stored) {
                    item = JSON.parse(stored);
                    this.memoryCache.set(cacheKey, item);
                }
            } catch (e) {
                console.warn('Failed to read from localStorage:', e);
            }
        }

        // 檢查是否過期
        if (item && Date.now() - item.timestamp < item.ttl) {
            return item.data;
        }

        return null;
    }

    // 計算器結果快取（用於"Most Used"排序）
    trackCalculatorUsage(calculatorId) {
        const usageKey = 'calculator-usage';
        let usage = JSON.parse(localStorage.getItem(usageKey) || '{}');
        usage[calculatorId] = (usage[calculatorId] || 0) + 1;
        localStorage.setItem(usageKey, JSON.stringify(usage));
    }

    getCalculatorUsage() {
        return JSON.parse(localStorage.getItem('calculator-usage') || '{}');
    }
}

export const cacheManager = new CacheManager();
```

**整合到現有程式碼：**

```javascript
// js/utils.js 中更新 displayPatientInfo

import { cacheManager } from './cacheManager.js';

export async function displayPatientInfo(client, element) {
    if (!element) return;

    if (!client) {
        // 嘗試從快取載入
        const cached = await cacheManager.getCachedFHIRData('current-patient');
        if (cached) {
            renderPatientInfo(element, cached);
            return;
        }
        element.textContent = 'No patient data available';
        return;
    }

    try {
        const patient = await client.patient.read();
        await cacheManager.cacheFHIRData('current-patient', patient);
        renderPatientInfo(element, patient);
    } catch (error) {
        console.error('Error loading patient:', error);
        element.textContent = 'Error loading patient data';
    }
}
```

---

### P1 - 中優先級（1-2個月內實施）

#### 4. 國際化 (i18n) 🌍

**目前狀況：** 混合使用中文和英文，沒有統一的語言管理

**建議架構：**

```javascript
// js/i18n.js - 新檔案
const translations = {
    'zh-TW': {
        'app.title': 'CGMH EHRCALC on FHIR',
        'search.placeholder': '搜尋計算器...',
        'sort.a-z': 'A → Z',
        'sort.z-a': 'Z → A',
        'error.fhir_not_available': '無法連接到 FHIR 伺服器'
        // ... 更多翻譯
    },
    'en-US': {
        'app.title': 'CGMH EHRCALC on FHIR',
        'search.placeholder': 'Search calculators...',
        'sort.a-z': 'A → Z',
        'sort.z-a': 'Z → A',
        'error.fhir_not_available': 'Cannot connect to FHIR server'
        // ... 更多翻譯
    }
};

class I18n {
    constructor(defaultLocale = 'zh-TW') {
        this.locale = localStorage.getItem('locale') || defaultLocale;
    }

    t(key, params = {}) {
        let text = translations[this.locale]?.[key] || key;

        // 支援參數替換：t('welcome.user', { name: 'John' })
        Object.keys(params).forEach(param => {
            text = text.replace(`{{${param}}}`, params[param]);
        });

        return text;
    }

    setLocale(locale) {
        if (translations[locale]) {
            this.locale = locale;
            localStorage.setItem('locale', locale);
            // 觸發重新渲染
            window.dispatchEvent(new Event('localechange'));
        }
    }

    getLocale() {
        return this.locale;
    }
}

export const i18n = new I18n();
```

**使用方式：**

```javascript
// 在 HTML 或 JS 中
import { i18n } from './i18n.js';

element.textContent = i18n.t('search.placeholder');
```

---

#### 5. 使用者體驗增強 🎨

**A. 添加收藏/最近使用功能**

```javascript
// js/favorites.js - 新檔案
export class FavoritesManager {
    constructor() {
        this.storageKey = 'calculator-favorites';
        this.recentKey = 'calculator-recent';
    }

    // 收藏功能
    toggleFavorite(calculatorId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(calculatorId);

        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(calculatorId);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(favorites));
        return favorites;
    }

    isFavorite(calculatorId) {
        return this.getFavorites().includes(calculatorId);
    }

    getFavorites() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    // 最近使用
    addToRecent(calculatorId) {
        let recent = this.getRecent();

        // 移除重複項目
        recent = recent.filter(id => id !== calculatorId);

        // 添加到最前面
        recent.unshift(calculatorId);

        // 只保留最近 10 個
        recent = recent.slice(0, 10);

        localStorage.setItem(this.recentKey, JSON.stringify(recent));
    }

    getRecent() {
        return JSON.parse(localStorage.getItem(this.recentKey) || '[]');
    }
}

export const favoritesManager = new FavoritesManager();
```

**B. 添加分類過濾器**

```javascript
// 更新 js/main.js
const categories = {
    cardiovascular: '心血管',
    renal: '腎臟功能',
    'critical-care': '重症醫學',
    pediatric: '兒科',
    'drug-conversion': '藥物換算',
    infection: '感染評估'
};

// 添加分類到 calculatorModules
export const calculatorModules = [
    { id: 'bmi-bsa', title: 'BMI & BSA', category: 'general' },
    { id: 'gcs', title: 'Glasgow Coma Scale', category: 'critical-care' }
    // ...
];

// 添加分類過濾功能
function filterByCategory(calculators, category) {
    if (category === 'all') return calculators;
    if (category === 'favorites') {
        const favorites = favoritesManager.getFavorites();
        return calculators.filter(c => favorites.includes(c.id));
    }
    return calculators.filter(c => c.category === category);
}
```

---

#### 6. 監控與分析 📊

**建議整合分析工具：**

```javascript
// js/analytics.js - 新檔案
class Analytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.events.push(event);

        // 可以整合 Google Analytics, Mixpanel 等
        // this.sendToAnalytics(event);

        // 本地存儲用於調試
        if (this.events.length > 100) {
            this.flush();
        }
    }

    flush() {
        // 批量發送到分析服務
        console.log('Flushing analytics:', this.events.length, 'events');
        this.events = [];
    }

    // 常用追蹤方法
    trackCalculatorView(calculatorId) {
        this.track('calculator_viewed', { calculatorId });
    }

    trackCalculatorCalculation(calculatorId, inputs, result) {
        this.track('calculator_calculated', {
            calculatorId,
            hasInputs: Object.keys(inputs).length > 0,
            hasResult: !!result
        });
    }

    trackError(error, context) {
        this.track('error', {
            errorName: error.name,
            errorMessage: error.message,
            context
        });
    }
}

export const analytics = new Analytics();
```

---

### P2 - 低優先級（長期規劃）

#### 7. PWA 支援 📱

**讓應用可以離線使用並安裝到手機**

```javascript
// service-worker.js - 新檔案
const CACHE_NAME = 'medcalcehr-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/calculator.html',
    '/style.css',
    '/js/main.js',
    '/js/utils.js'
    // ... 其他靜態資源
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
```

```json
// manifest.json - 新檔案
{
    "name": "CGMH EHRCALC",
    "short_name": "EHRCALC",
    "description": "92 Clinical Calculators for Healthcare Professionals",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#2c3e50",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

---

#### 8. API 後端開發 🔧

**目前：** 純前端應用  
**建議：** 添加後端 API 用於：

- 保存使用者設定和收藏
- 計算歷史記錄
- 多裝置同步
- 進階分析

**建議技術棧：**

- Node.js + Express (輕量)
- 或 FastAPI (Python, 如果需要機器學習功能)

```javascript
// backend/server.js - 範例架構
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// 使用者設定
app.get('/api/user/:userId/settings', async (req, res) => {
    // 獲取使用者設定
});

app.post('/api/user/:userId/settings', async (req, res) => {
    // 保存使用者設定
});

// 計算歷史
app.post('/api/calculations', async (req, res) => {
    // 保存計算記錄
});

app.get('/api/calculations/:userId', async (req, res) => {
    // 獲取計算歷史
});

app.listen(3000, () => {
    console.log('API server running on port 3000');
});
```

---

#### 9. 輔助功能 (Accessibility) ♿

**確保應用符合 WCAG 2.1 標準**

```javascript
// js/accessibility.js - 新檔案
export class AccessibilityManager {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        // 確保所有互動元素可用鍵盤操作
        document.addEventListener('keydown', e => {
            // Tab 導航
            if (e.key === 'Tab') {
                this.highlightFocusedElement();
            }

            // 快捷鍵：Ctrl+K 開啟搜尋
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('search-bar')?.focus();
            }
        });
    }

    setupScreenReaderSupport() {
        // 添加 ARIA 標籤
        this.addAriaLabels();

        // 確保動態內容變更會被通知
        this.setupLiveRegions();
    }

    addAriaLabels() {
        // 為互動元素添加適當的 ARIA 屬性
        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
            searchBar.setAttribute('aria-label', '搜尋計算器');
            searchBar.setAttribute('role', 'searchbox');
        }
    }

    setupLiveRegions() {
        // 為動態更新的區域添加 aria-live
        const resultContainers = document.querySelectorAll('.result-container');
        resultContainers.forEach(container => {
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
        });
    }
}
```

---

## 🎯 實施路線圖

### 第1個月

- ✅ 實施計算器懶加載（效能優化）
- ✅ 建立快取管理系統
- ✅ 添加收藏和最近使用功能

### 第2-3個月

- ✅ 完成所有計算器的單元測試
- ✅ 實施 i18n 國際化
- ✅ 添加分類過濾器

### 第4-6個月

- ✅ 整合分析系統
- ✅ PWA 支援
- ✅ 輔助功能優化

### 長期（6個月以上）

- ✅ 開發後端 API
- ✅ 多使用者系統
- ✅ 進階功能（AI 輔助診斷等）

---

## 📝 立即可執行的小改進

### 1. 添加載入指示器

```javascript
// 在 js/main.js 中
function showLoading(element) {
    element.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>載入中...</p>
        </div>
    `;
}

function hideLoading(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
}
```

### 2. 改進錯誤訊息

```javascript
// 在 js/errorHandler.js 中添加更友善的錯誤訊息
const errorMessages = {
    FHIR_CONNECTION_ERROR: '無法連接到醫療記錄系統，請確認網路連線。',
    INVALID_INPUT: '輸入的數值不正確，請檢查後重試。',
    CALCULATION_ERROR: '計算過程發生錯誤，請稍後再試。'
};
```

### 3. 添加快捷鍵提示

```html
<!-- 在 index.html 中添加 -->
<div class="keyboard-shortcuts" style="display: none;">
    <h3>鍵盤快捷鍵</h3>
    <ul>
        <li><kbd>Ctrl</kbd> + <kbd>K</kbd> - 開啟搜尋</li>
        <li><kbd>/</kbd> - 快速搜尋</li>
        <li><kbd>Esc</kbd> - 關閉對話框</li>
    </ul>
</div>
```

---

## 🔧 開發工具改進

### 添加更多開發腳本到 package.json

```json
{
    "scripts": {
        "start": "npx http-server -p 8000 -c-1",
        "dev": "npx http-server -p 8000 -c-1 --cors",
        "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
        "test:watch": "npm test -- --watch",
        "test:coverage": "npm test -- --coverage",
        "test:ci": "npm test -- --ci --coverage --maxWorkers=2",
        "lint": "eslint js/**/*.js",
        "lint:fix": "eslint js/**/*.js --fix",
        "format": "prettier --write \"**/*.{js,html,css,md}\"",
        "format:check": "prettier --check \"**/*.{js,html,css,md}\"",
        "validate": "npm run lint && npm run format:check && npm run test",
        "analyze": "npx webpack-bundle-analyzer",
        "lighthouse": "npx lighthouse http://localhost:8000 --view",
        "docker:build": "docker-compose build",
        "docker:up": "docker-compose up -d",
        "docker:down": "docker-compose down",
        "docker:logs": "docker-compose logs -f",
        "precommit": "lint-staged"
    }
}
```

---

## 📚 文件改進建議

### 1. 添加 API 文件

```markdown
# API_DOCUMENTATION.md

## Calculator Module Structure

每個計算器模組應遵循以下結構：

\`\`\`javascript
export const calculatorName = {
id: 'calculator-id',
title: 'Calculator Title',
description: 'Brief description',
category: 'category-name',

    generateHTML: function() {
        // 返回計算器的 HTML
    },

    initialize: function(client, patient, container) {
        // 初始化計算器，綁定事件
    },

    calculate: function(inputs) {
        // 執行計算邏輯
        return result;
    }

};
\`\`\`
```

### 2. 貢獻指南更新

在 CONTRIBUTING.md 中添加：

- 程式碼風格指南
- PR 審查清單
- 測試要求
- 文件要求

---

## 🎯 總結

**立即可做（1週內）：**

1. 實施計算器懶加載
2. 添加載入指示器
3. 改進錯誤訊息

**短期目標（1個月內）：**

1. 完成快取系統
2. 添加收藏功能
3. 提高測試覆蓋率到 60%

**中期目標（3個月內）：**

1. 完成國際化
2. 實施分析系統
3. PWA 支援

**長期願景（6個月以上）：**

1. 後端 API
2. 多使用者系統
3. AI 輔助功能

---

**需要我開始實施其中任何一項嗎？我可以立即開始編寫程式碼！** 🚀
