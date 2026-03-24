import { displayPatientInfo } from './utils.js';
import {
    calculatorModules,
    categories,
    CalculatorMetadata,
    CategoryKey
} from './calculators/index.js';
import { favoritesManager } from './favorites.js';

type SortType = 'a-z' | 'z-a';

/**
 * 渲染計算機清單
 */
function renderCalculatorList(calculators: CalculatorMetadata[], container: HTMLElement): void {
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
                ${calc.category ? `<span class="category-badge" data-category="${calc.category}">${categories[calc.category as CategoryKey] || calc.category}</span>` : ''}
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
    const patientInfoDiv = document.getElementById('patient-info') as HTMLElement;
    const calculatorListDiv = document.getElementById('calculator-list') as HTMLElement;
    const searchBar = document.getElementById('search-bar') as HTMLInputElement;
    const categorySelect = document.getElementById('category-select') as HTMLSelectElement;

    if (!patientInfoDiv || !calculatorListDiv || !searchBar) return;

    // 修正：這裡改用 const，因為在此版本中我們不打算重新賦值
    const currentSortType: SortType = 'a-z';
    let currentCategory: string = 'all';

    function updateDisplay(): void {
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

    function installTokenBasicAuthInterceptor(): void {
        const win = window as any;
        if (win.__MEDCALC_READY_BASIC_AUTH_PATCHED) return;

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

        if (!clientId || !clientSecret) return;

        const basic = `Basic ${btoa(unescape(encodeURIComponent(`${clientId}:${clientSecret}`)))}`;
        const shouldPatch = (url: string, method: string): boolean =>
            /\/auth\/token(?:\?|$)/i.test(url) && method.toUpperCase() === 'POST';

        const originalFetch = window.fetch.bind(window);
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const url =
                typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const method = (
                init?.method ||
                (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')
            ).toUpperCase();

            if (shouldPatch(url, method)) {
                win.__MEDCALC_AUTH_DEBUG.matchedCount += 1;
                win.__MEDCALC_AUTH_DEBUG.lastUrl = url;
                win.__MEDCALC_AUTH_DEBUG.lastMethod = method;
                const headers = new Headers(init?.headers);
                if (!headers.has('Authorization')) {
                    headers.set('Authorization', basic);
                }
                win.__MEDCALC_AUTH_DEBUG.lastInjected = headers.has('Authorization');
                console.info(
                    '[MEDCALC][AUTH] ready/fetch token match, Authorization set:',
                    win.__MEDCALC_AUTH_DEBUG.lastInjected
                );
                const nextInit: RequestInit = { ...init, headers };
                return originalFetch(input, nextInit);
            }

            return originalFetch(input, init);
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (
            this: XMLHttpRequest & { __medcalcMethod?: string; __medcalcUrl?: string },
            method: string,
            url: string | URL,
            ...args: any[]
        ): any {
            this.__medcalcMethod = method;
            this.__medcalcUrl = String(url);
            const [asyncFlag, username, password] = args;
            return originalOpen.call(this, method, url, asyncFlag, username, password);
        };
        XMLHttpRequest.prototype.send = function (
            this: XMLHttpRequest & { __medcalcMethod?: string; __medcalcUrl?: string },
            ...args: any[]
        ): any {
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
                } catch (_e) {
                    // Ignore and continue request.
                    win.__MEDCALC_AUTH_DEBUG.lastInjected = false;
                    console.warn(
                        '[MEDCALC][AUTH] ready/xhr token match, failed to set Authorization'
                    );
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
            const patient = await client.patient.read();

            // 使用 utils.ts 中的函數顯示資訊
            displayPatientInfo(client, patientInfoDiv);
        } catch (error) {
            console.error('FHIR 資料載入失敗:', error);
            patientInfoDiv.innerHTML = `<b style="color:red">無法取得病人資料，請確認是否從啟動頁面進入。</b>`;
        }
    }

    if (categorySelect) {
        categorySelect.onchange = e => {
            currentCategory = (e.target as HTMLSelectElement).value;
            updateDisplay();
        };
    }

    searchBar.oninput = updateDisplay;
    await loadRealFHIRData();
    updateDisplay();
};
