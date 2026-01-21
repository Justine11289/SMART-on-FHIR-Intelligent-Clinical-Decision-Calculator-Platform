// src/main.ts
import { displayPatientInfo } from './utils.js';
import { calculatorModules, categories } from './calculators/index.js';
import { favoritesManager } from './favorites.js';
/**
 * Sort calculator list
 */
function sortCalculators(calculators, sortType) {
    const sorted = [...calculators];
    switch (sortType) {
        case 'a-z':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'z-a':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));
        case 'recently-added':
            return sorted.reverse();
        case 'most-used': {
            // Sort by usage stats
            const usage = favoritesManager.getUsage();
            return sorted.sort((a, b) => {
                const countA = usage[a.id] || 0;
                const countB = usage[b.id] || 0;
                return countB - countA;
            });
        }
        default:
            return sorted;
    }
}
/**
 * Filter calculator list
 */
function filterCalculators(calculators, filterType, category, searchTerm = '') {
    let filtered = [...calculators];
    // Filter by special filters
    switch (filterType) {
        case 'favorites': {
            const favorites = favoritesManager.getFavorites();
            filtered = filtered.filter(calc => favorites.includes(calc.id));
            break;
        }
        case 'recent': {
            const recent = favoritesManager.getRecent();
            filtered = recent
                .map(id => calculators.find(calc => calc.id === id))
                .filter((calc) => calc !== undefined);
            return filtered; // Keep order for recent
        }
        case 'all':
        default:
            // No special filter
            break;
    }
    // Filter by category
    if (category && category !== 'all') {
        filtered = filtered.filter(calc => calc.category === category);
    }
    // Filter by search term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(calc => calc.title.toLowerCase().includes(term) ||
            (calc.description && calc.description.toLowerCase().includes(term)));
    }
    return filtered;
}
/**
 * Render calculator list
 */
function renderCalculatorList(calculators, container) {
    container.innerHTML = '';
    if (calculators.length === 0) {
        container.innerHTML = `<p class="no-results">No calculators found matching your criteria.</p>`;
        return;
    }
    calculators.forEach(calc => {
        const link = document.createElement('a');
        link.href = `calculator.html?id=${calc.id}`;
        link.className = 'list-item';
        // Content area
        const contentDiv = document.createElement('div');
        contentDiv.className = 'list-item-content';
        const title = document.createElement('span');
        title.className = 'list-item-title';
        title.textContent = calc.title;
        contentDiv.appendChild(title);
        // Category badge
        if (calc.category) {
            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'category-badge';
            categoryBadge.textContent = categories[calc.category] || calc.category;
            categoryBadge.setAttribute('data-category', calc.category);
            contentDiv.appendChild(categoryBadge);
        }
        // Description (if any)
        if (calc.description) {
            const description = document.createElement('span');
            description.className = 'list-item-description';
            description.textContent = calc.description;
            contentDiv.appendChild(description);
        }
        link.appendChild(contentDiv);
        // Favorite button
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.setAttribute('data-calculator-id', calc.id);
        favoriteBtn.innerHTML = favoritesManager.isFavorite(calc.id) ? '⭐' : '☆';
        favoriteBtn.title = favoritesManager.isFavorite(calc.id)
            ? 'Remove from Favorites'
            : 'Add to Favorites';
        // Prevent clicking favorite button from triggering link
        favoriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isFavorite = favoritesManager.toggleFavorite(calc.id);
            favoriteBtn.innerHTML = isFavorite ? '⭐' : '☆';
            favoriteBtn.title = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
        });
        link.appendChild(favoriteBtn);
        container.appendChild(link);
    });
}
/**
 * Update stats display
 */
function updateStats(total, showing) {
    const statsEl = document.getElementById('calculator-stats');
    if (statsEl) {
        statsEl.textContent = `Showing ${showing} / ${total} results`;
    }
}
/**
 * Main program
 */
window.onload = async () => {
    // Get DOM elements
    const patientInfoEl = document.getElementById('patient-info');
    const calculatorListEl = document.getElementById('calculator-list');
    const searchBarEl = document.getElementById('search-bar');
    const sortSelectEl = document.getElementById('sort-select');
    const categorySelectEl = document.getElementById('category-select');
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!patientInfoEl || !calculatorListEl || !searchBarEl || !sortSelectEl) {
        console.error('Required DOM elements not found');
        return;
    }
    const patientInfoDiv = patientInfoEl;
    const calculatorListDiv = calculatorListEl;
    const searchBar = searchBarEl;
    const sortSelect = sortSelectEl;
    const categorySelect = categorySelectEl;
    // 狀態變數
    let currentSortType = 'a-z';
    let currentFilterType = 'all';
    let currentCategory = 'all';
    // ========== 核心修正：模擬載入本地測試資料 ==========
    try {
        console.log("Index page is fetching local test data...");
        const response = await fetch('/test-Patient.json'); // 現在可以使用 await 了
        if (!response.ok)
            throw new Error('test-Patient.json not found');
        const bundle = await response.json();
        const patient = bundle.entry.find((e) => e.resource.resourceType === "Patient")?.resource;
        // 建立符合 utils.ts 檢查邏輯的 mockClient
        const mockClient = {
            patient: {
                id: patient.id, // 傳入 ID 解決 "No patient data" 錯誤
                read: () => Promise.resolve(patient)
            },
            request: (url) => Promise.resolve(bundle)
        };
        // 顯示包含 TW Core IG 標籤的病患資訊
        displayPatientInfo(mockClient, patientInfoDiv);
        console.log("Index page loaded local patient data successfully");
    }
    catch (error) {
        console.warn("Failed to load mock data, checking for FHIR session:", error);
        displayPatientInfo(null, patientInfoDiv);
        // 若本地無資料，才嘗試原有的 SMART 流程
        if (typeof window.FHIR !== 'undefined') {
            window.FHIR.oauth2.ready()
                .then(async (client) => {
                displayPatientInfo(client, patientInfoDiv);
                // ... 原有的 Practitioner 處理邏輯 ...
            })
                .catch(() => console.log('FHIR client not ready.'));
        }
    }
    // 渲染清單與設定事件監聽器 (保持不變)
    function updateDisplay() {
        const searchTerm = searchBar.value;
        const filtered = filterCalculators(calculatorModules, currentFilterType, currentCategory, searchTerm);
        const sorted = sortCalculators(filtered, currentSortType);
        renderCalculatorList(sorted, calculatorListDiv);
        updateStats(calculatorModules.length, sorted.length);
    }
    /**
     * Update filter button states
     */
    function updateFilterButtons() {
        filterBtns.forEach(btn => {
            const filterType = btn.getAttribute('data-filter');
            if (filterType === currentFilterType) {
                btn.classList.add('active');
            }
            else {
                btn.classList.remove('active');
            }
            // Update counts
            if (filterType === 'favorites') {
                const count = favoritesManager.getFavoritesCount();
                btn.querySelector('.filter-count')?.remove();
                if (count > 0) {
                    const countBadge = document.createElement('span');
                    countBadge.className = 'filter-count';
                    countBadge.textContent = count.toString();
                    btn.appendChild(countBadge);
                }
            }
            else if (filterType === 'recent') {
                const count = favoritesManager.getRecent().length;
                btn.querySelector('.filter-count')?.remove();
                if (count > 0) {
                    const countBadge = document.createElement('span');
                    countBadge.className = 'filter-count';
                    countBadge.textContent = count.toString();
                    btn.appendChild(countBadge);
                }
            }
        });
    }
    // ========== Initialize FHIR ==========
    displayPatientInfo(null, patientInfoDiv);
    if (typeof window.FHIR !== 'undefined') {
        window.FHIR.oauth2
            .ready()
            .then(async (client) => {
            displayPatientInfo(client, patientInfoDiv);
            // Fetch User/Practitioner Info
            try {
                // Try to read the user (Practitioner) from the client
                const user = await client.user.read();
                const practitionerNameEl = document.getElementById('practitioner-name');
                const practitionerInfoEl = document.getElementById('practitioner-info');
                if (user &&
                    (user.resourceType === 'Practitioner' ||
                        user.resourceType === 'PractitionerRole')) {
                    let name = 'Unknown Practitioner';
                    if (user.resourceType === 'Practitioner') {
                        name =
                            user.name?.[0]?.text ||
                                `${user.name?.[0]?.family || ''} ${user.name?.[0]?.given?.join(' ') || ''}`.trim();
                    }
                    else if (user.resourceType === 'PractitionerRole' &&
                        user.practitioner?.display) {
                        name = user.practitioner.display;
                    }
                    if (practitionerNameEl)
                        practitionerNameEl.textContent = name || 'Practitioner';
                    if (practitionerInfoEl)
                        practitionerInfoEl.style.display = 'flex';
                    // Set Practitioner ID for favorites
                    if (user.id) {
                        favoritesManager.setPractitionerId(user.id);
                        console.log(`[MedCalc] Practitioner set to: ${user.id}`);
                    }
                }
            }
            catch (error) {
                console.warn('[MedCalc] Failed to fetch user info:', error);
            }
        })
            .catch(() => {
            console.log('FHIR client not ready, patient info will be loaded from cache if available.');
        });
    }
    // ========== Initialize Category Selector ==========
    if (categorySelect) {
        // Add All option
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Categories';
        categorySelect.appendChild(allOption);
        // Add category options
        Object.keys(categories).forEach(categoryKey => {
            const option = document.createElement('option');
            option.value = categoryKey;
            option.textContent = categories[categoryKey];
            categorySelect.appendChild(option);
        });
        categorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            updateDisplay();
        });
    }
    // ========== Initialize Filter Buttons ==========
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilterType = btn.getAttribute('data-filter');
            updateFilterButtons();
            updateDisplay();
        });
    });
    // ========== Search Function ==========
    searchBar.addEventListener('input', updateDisplay);
    // ========== Sort Function ==========
    sortSelect.addEventListener('change', (e) => {
        currentSortType = e.target.value;
        updateDisplay();
    });
    // ========== Listen for Favorite Changes ==========
    favoritesManager.addListener(() => {
        updateFilterButtons();
        // If currently showing favorites/recent, update list
        if (currentFilterType === 'favorites' || currentFilterType === 'recent') {
            updateDisplay();
        }
    });
    // ========== Initial Render ==========
    updateDisplay();
    updateFilterButtons();
};
