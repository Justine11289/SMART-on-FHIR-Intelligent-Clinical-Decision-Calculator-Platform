import { displayPatientInfo } from './utils.js';
import { calculatorModules, categories } from './calculators/index.js';
import { favoritesManager } from './favorites.js';
/**
 * 渲染計算機清單
 */
function renderCalculatorList(calculators, container, smartParams) {
    container.innerHTML = '';
    if (calculators.length === 0) {
        container.innerHTML = `<p class="no-results">找不到符合的計算機。</p>`;
        return;
    }
    calculators.forEach(calc => {
        const nextParams = new URLSearchParams(smartParams.toString());
        nextParams.set('id', calc.id);
        const link = document.createElement('a');
        link.href = `calculator.html?${nextParams.toString()}`;
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
    const sortSelect = document.getElementById('sort-select');
    const statsText = document.getElementById('calculator-stats');
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    if (!patientInfoDiv || !calculatorListDiv || !searchBar)
        return;
    let currentSortType = 'a-z';
    let currentListFilter = 'all';
    let currentCategory = 'all';
    const smartParamKeys = ['iss', 'launch', 'code', 'state', 'clientId', 'clientSecret'];
    const currentParams = new URLSearchParams(window.location.search);
    const hasSmartParams = smartParamKeys.some(key => currentParams.has(key));
    if (hasSmartParams) {
        sessionStorage.setItem('MEDCALC_SMART_PARAMS', currentParams.toString());
    }
    const persistedSmartParams = new URLSearchParams(hasSmartParams ? currentParams.toString() : sessionStorage.getItem('MEDCALC_SMART_PARAMS') || '');
    function updateDisplay() {
        const searchTerm = searchBar.value.toLowerCase();
        const filtered = calculatorModules.filter(calc => {
            const matchesSearch = calc.title.toLowerCase().includes(searchTerm);
            const matchesCategory = currentCategory === 'all' || calc.category === currentCategory;
            let matchesListFilter = true;
            if (currentListFilter === 'favorites') {
                matchesListFilter = favoritesManager.isFavorite(calc.id);
            }
            else if (currentListFilter === 'recent') {
                matchesListFilter = favoritesManager.getRecent().includes(calc.id);
            }
            return matchesSearch && matchesCategory && matchesListFilter;
        });
        if (currentSortType === 'a-z') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }
        else if (currentSortType === 'z-a') {
            filtered.sort((a, b) => b.title.localeCompare(a.title));
        }
        else if (currentSortType === 'most-used') {
            filtered.sort((a, b) => {
                const usageDiff = favoritesManager.getUsageCount(b.id) - favoritesManager.getUsageCount(a.id);
                if (usageDiff !== 0)
                    return usageDiff;
                return a.title.localeCompare(b.title);
            });
        }
        renderCalculatorList(filtered, calculatorListDiv, persistedSmartParams);
        if (statsText) {
            statsText.textContent = `Showing ${filtered.length} / ${calculatorModules.length}`;
        }
    }
    function initializeCategoryOptions() {
        if (!categorySelect)
            return;
        categorySelect.innerHTML = '';
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Categories';
        categorySelect.appendChild(allOption);
        Object.entries(categories).forEach(([key, label]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = label;
            categorySelect.appendChild(option);
        });
        categorySelect.value = currentCategory;
    }
    function initializeFilters() {
        filterButtons.forEach(button => {
            button.onclick = () => {
                const filterType = button.dataset.filter;
                if (!filterType)
                    return;
                currentListFilter = filterType;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateDisplay();
            };
        });
    }
    function initializeSort() {
        if (!sortSelect)
            return;
        currentSortType = sortSelect.value || 'a-z';
        sortSelect.onchange = e => {
            currentSortType = e.target.value;
            updateDisplay();
        };
    }
    function installUsageTracking() {
        calculatorListDiv.addEventListener('click', event => {
            const target = event.target;
            if (target.closest('.favorite-btn'))
                return;
            const listItem = target.closest('.list-item');
            if (!listItem)
                return;
            const url = new URL(listItem.href, window.location.origin);
            const calculatorId = url.searchParams.get('id');
            if (!calculatorId)
                return;
            favoritesManager.addToRecent(calculatorId);
            favoritesManager.trackUsage(calculatorId);
        });
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
        const clientId = params.get('clientId') ||
            win.MEDCALC_CONFIG?.fhir?.clientId ||
            localStorage.getItem('TEMP_CLIENT_ID') ||
            'cc344727-6f90-496c-94fd-c7829aa9a51d';
        const clientSecret = params.get('clientSecret') ||
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
            const method = (init?.method ||
                (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')).toUpperCase();
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
        XMLHttpRequest.prototype.open = function (method, url, ...args) {
            this.__medcalcMethod = method;
            this.__medcalcUrl = String(url);
            const [asyncFlag, username, password] = args;
            return originalOpen.call(this, method, url, asyncFlag, username, password);
        };
        XMLHttpRequest.prototype.send = function (...args) {
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
            const [body] = args;
            return originalSend.call(this, body);
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
                patientInfoDiv.innerHTML =
                    '<p>No patient data available. Standalone launch is ready.</p>';
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
    favoritesManager.addListener(type => {
        if (type === 'favorites' || type === 'recent') {
            updateDisplay();
        }
    });
    initializeCategoryOptions();
    initializeFilters();
    initializeSort();
    installUsageTracking();
    // 先顯示清單，避免 FHIR ready 等待期間整個側邊控制看起來失效。
    updateDisplay();
    searchBar.oninput = updateDisplay;
    await loadRealFHIRData();
};
