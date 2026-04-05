import { displayPatientInfo } from './utils.js';
import { calculatorModules, categories } from './calculators/index.js';
import { favoritesManager } from './favorites.js';
/**
 * 渲染計算機清單
 */
function renderCalculatorList(calculators, container) {
    container.innerHTML = '';
    if (calculators.length === 0) {
        container.innerHTML = `<p class="no-results">找不到符合的計算機。</p>`;
        return;
    }
    calculators.forEach(calc => {
        const link = document.createElement('a');
        link.href = `calculator.html?id=${calc.id}`;
        link.className = 'list-item';
        link.innerHTML = `
            <div class="list-item-content">
                <span class="list-item-title">${calc.title}</span>
                ${calc.category ? `<span class="category-badge" data-category="${calc.category}">${categories[calc.category] || calc.category}</span>` : ''}
            </div>
        `;
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.innerHTML = favoritesManager.isFavorite(calc.id) ? '⭐' : '☆';
        favoriteBtn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            const isFav = favoritesManager.toggleFavorite(calc.id);
            favoriteBtn.innerHTML = isFav ? '⭐' : '☆';
        };
        link.appendChild(favoriteBtn);
        container.appendChild(link);
    });
}
window.onload = async () => {
    const patientInfoDiv = document.getElementById('patient-info');
    const calculatorListDiv = document.getElementById('calculator-list');
    const searchBar = document.getElementById('search-bar');
    const categorySelect = document.getElementById('category-select');
    if (!patientInfoDiv || !calculatorListDiv || !searchBar)
        return;
    // 修正：這裡改用 const，因為在此版本中我們不打算重新賦值
    const currentSortType = 'a-z';
    let currentCategory = 'all';
    function updateDisplay() {
        const searchTerm = searchBar.value.toLowerCase();
        // 修正：這裡改用 const，因為它是 filter 的結果，宣告後未再更動
        const filtered = calculatorModules.filter(calc => {
            const matchesSearch = calc.title.toLowerCase().includes(searchTerm);
            const matchesCategory = currentCategory === 'all' || calc.category === currentCategory;
            return matchesSearch && matchesCategory;
        });
        if (currentSortType === 'a-z') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }
        renderCalculatorList(filtered, calculatorListDiv);
    }
    function installTokenBasicAuthInterceptor() {
        const win = window;
        if (win.__MEDCALC_READY_BASIC_AUTH_PATCHED)
            return;
        win.__MEDCALC_AUTH_DEBUG = win.__MEDCALC_AUTH_DEBUG || {
            interceptor: 'ready',
            installed: false,
            matchedCount: 0,
            lastUrl: '',
            lastMethod: '',
            lastInjected: false
        };
        const params = new URLSearchParams(window.location.search);
        const clientId =
            params.get('clientId') ||
                win.MEDCALC_CONFIG?.fhir?.clientId ||
                localStorage.getItem('TEMP_CLIENT_ID') ||
                'cc344727-6f90-496c-94fd-c7829aa9a51d';
        const clientSecret =
            params.get('clientSecret') ||
                win.MEDCALC_CONFIG?.fhir?.clientSecret ||
                localStorage.getItem('TEMP_CLIENT_SECRET') ||
                '79f04b56b33491716c0880af72cdef7d3f0629111421cedd18353651cd313d9e';
        localStorage.setItem('TEMP_CLIENT_ID', clientId);
        localStorage.setItem('TEMP_CLIENT_SECRET', clientSecret);
        if (!clientId || !clientSecret)
            return;
        const basic = `Basic ${btoa(unescape(encodeURIComponent(`${clientId}:${clientSecret}`)))}`;
        const shouldPatch = (url, method) => /\/auth\/token(?:\?|$)/i.test(url) && method.toUpperCase() === 'POST';
        const originalFetch = window.fetch.bind(window);
        window.fetch = async (input, init) => {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const method = (init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')).toUpperCase();
            if (shouldPatch(url, method)) {
                win.__MEDCALC_AUTH_DEBUG.matchedCount += 1;
                win.__MEDCALC_AUTH_DEBUG.lastUrl = url;
                win.__MEDCALC_AUTH_DEBUG.lastMethod = method;
                const headers = new Headers(init?.headers);
                if (!headers.has('Authorization')) {
                    headers.set('Authorization', basic);
                }
                win.__MEDCALC_AUTH_DEBUG.lastInjected = headers.has('Authorization');
                console.info('[MEDCALC][AUTH] ready/fetch token match, Authorization set:', win.__MEDCALC_AUTH_DEBUG.lastInjected);
                const nextInit = { ...init, headers };
                return originalFetch(input, nextInit);
            }
            return originalFetch(input, init);
        };
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (method, url) {
            this.__medcalcMethod = method;
            this.__medcalcUrl = String(url);
            return originalOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function () {
            const method = this.__medcalcMethod || 'GET';
            const url = this.__medcalcUrl || '';
            if (shouldPatch(url, method)) {
                win.__MEDCALC_AUTH_DEBUG.matchedCount += 1;
                win.__MEDCALC_AUTH_DEBUG.lastUrl = url;
                win.__MEDCALC_AUTH_DEBUG.lastMethod = method;
                try {
                    this.setRequestHeader('Authorization', basic);
                    win.__MEDCALC_AUTH_DEBUG.lastInjected = true;
                    console.info('[MEDCALC][AUTH] ready/xhr token match, Authorization set: true');
                }
                catch (_e) {
                    // Ignore and continue request.
                    win.__MEDCALC_AUTH_DEBUG.lastInjected = false;
                    console.warn('[MEDCALC][AUTH] ready/xhr token match, failed to set Authorization');
                }
            }
            return originalSend.apply(this, arguments);
        };
        win.__MEDCALC_READY_BASIC_AUTH_PATCHED = true;
        win.__MEDCALC_AUTH_DEBUG.installed = true;
        console.info('[MEDCALC][AUTH] ready interceptor installed');
    }
    async function loadRealFHIRData() {
        patientInfoDiv.innerHTML = '正在連接伺服器並載入病人資料...';
        try {
            installTokenBasicAuthInterceptor();
            // 等待 SMART 框架就緒
            const client = await window.FHIR.oauth2.ready();
            // 使用 utils.ts 中的函數顯示資訊
            await displayPatientInfo(client, patientInfoDiv);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (/Patient is not available/i.test(message)) {
                patientInfoDiv.innerHTML = '<p>No patient data available. Standalone launch is ready.</p>';
                return;
            }
            console.error('FHIR 資料載入失敗:', error);
            patientInfoDiv.innerHTML = `<b style="color:red">無法取得病人資料，請確認是否從啟動頁面進入。</b>`;
        }
    }
    if (categorySelect) {
        categorySelect.onchange = e => {
            currentCategory = e.target.value;
            updateDisplay();
        };
    }
    searchBar.oninput = updateDisplay;
    await loadRealFHIRData();
    updateDisplay();
};
