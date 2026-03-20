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

    async function loadRealFHIRData() {
        patientInfoDiv.innerHTML = '正在連接伺服器並載入病人資料...';
        try {
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
