import { displayPatientInfo } from './utils.js';
import {
    calculatorModules,
    categories,
    CalculatorMetadata,
    CategoryKey
} from './calculators/index.js';
import { favoritesManager } from './favorites.js';

type SortType = 'a-z' | 'z-a';
type FilterType = 'all' | 'favorites';

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
        // 修正：統一使用 id 作為參數，確保 calculator.html 能正確讀取
        link.href = `calculator.html?id=${calc.id}`; 
        link.className = 'list-item';
        link.innerHTML = `
            <div class="list-item-content">
                <span class="list-item-title">${calc.title}</span>
                ${calc.category ? `<span class="category-badge" data-category="${calc.category}">${categories[calc.category as CategoryKey] || calc.category}</span>` : ''}
                ${calc.description ? `<span class="list-item-description">${calc.description}</span>` : ''}
            </div>
        `;

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.innerHTML = favoritesManager.isFavorite(calc.id) ? '⭐' : '☆';
        favoriteBtn.onclick = (e) => {
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

    let currentSortType: SortType = 'a-z';
    let currentCategory: string = 'all';

    function updateDisplay(): void {
        const searchTerm = searchBar.value.toLowerCase();
        let filtered = calculatorModules.filter(calc => {
            const matchesSearch = calc.title.toLowerCase().includes(searchTerm);
            const matchesCategory = currentCategory === 'all' || calc.category === currentCategory;
            return matchesSearch && matchesCategory;
        });

        if (currentSortType === 'a-z') filtered.sort((a, b) => a.title.localeCompare(b.title));
        renderCalculatorList(filtered, calculatorListDiv);
    }

    /**
     * 核心邏輯：強制讀取本地 test-Patient.json 並模擬 FHIR Client
     */
    async function loadTestData() {
        patientInfoDiv.innerHTML = "正在載入測試資料...";
        
        try {
            // 使用相對路徑讀取 JSON，確保在 GitHub Pages 與 Docker 都能運作
            const response = await fetch('./test-Patient.json');
            if (!response.ok) throw new Error(`無法讀取 JSON: ${response.status}`);
            
            const bundle = await response.json();
            
            // 從 Bundle 中尋找 Patient 資源
            const patientEntry = bundle.entry.find((e: any) => e.resource.resourceType === "Patient");
            const patientResource = patientEntry.resource;

            // 模擬一個符合 FHIR Client 結構的物件，讓 utils.ts 能夠無縫接收
            const mockClient = {
                patient: {
                    id: patientResource.id,
                    read: () => Promise.resolve(patientResource)
                },
                // 模擬抓取 Observation 的功能
                request: async (url: string) => {
                    console.log(`模擬請求: ${url}`);
                    return bundle; // 直接回傳整份 Bundle，讓前端過濾所需的 Observation
                },
                user: { read: () => Promise.reject("測試模式不支援使用者資訊") }
            };

            console.log("成功讀取 test-Patient.json，病人 ID:", mockClient.patient.id);
            displayPatientInfo(mockClient, patientInfoDiv);

        } catch (error) {
            console.error("資料載入失敗:", error);
            patientInfoDiv.innerHTML = `<b style="color:red">錯誤：無法從 ./test-Patient.json 獲取資料。</b>`;
        }
    }

    // 初始化類別選單
    if (categorySelect) {
        categorySelect.onchange = (e) => {
            currentCategory = (e.target as HTMLSelectElement).value;
            updateDisplay();
        };
    }

    searchBar.oninput = updateDisplay;
    favoritesManager.addListener(() => updateDisplay());

    // 啟動資料加載
    await loadTestData();
    updateDisplay();
};