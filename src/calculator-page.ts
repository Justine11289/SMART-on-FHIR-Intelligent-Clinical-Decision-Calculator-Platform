// src/calculator-page.ts
import { displayPatientInfo } from './utils.js';
import { loadCalculator, getCalculatorMetadata, CalculatorModule } from './calculators/index.js';
import { favoritesManager } from './favorites.js';
import { displayError } from './errorHandler.js';

declare global {
    interface Window {
        CACHE_VERSION: string;
        FHIR: {
            oauth2: {
                ready(): Promise<any>;
            };
        };
    }
}

// 快取版本號
window.CACHE_VERSION = '1.s1.1';

/**
 * 顯示載入中狀態
 */
function showLoading(element: HTMLElement): void {
    element.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading calculator and local test data...</p>
        </div>
    `;
}

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const calculatorId = params.get('id');
    const patientInfoDiv = document.getElementById('patient-info');
    const container = document.getElementById('calculator-container');
    const pageTitle = document.getElementById('page-title');

    if (!patientInfoDiv || !container || !pageTitle || !calculatorId) return;

    const calculatorInfo = getCalculatorMetadata(calculatorId);
    if (!calculatorInfo) return;

    pageTitle.textContent = calculatorInfo.title;
    const card = document.createElement('div');
    card.className = 'calculator-card';
    container.appendChild(card);

    try {
        // --- 關鍵修改：改用真實 FHIR Client ---
        // 使用 fhirclient 庫等待 OAuth2 授權完成並取得 client
        const client = await window.FHIR.oauth2.ready();

        // 從伺服器讀取當前病人的完整 Resource 資料
        const patient = await client.patient.read();

        // 載入計算機模組
        const calculator = await loadCalculator(calculatorId);

        // 渲染 HTML
        card.innerHTML = calculator.generateHTML();

        // 初始化計算機並傳入真實的 client 與 patient
        if (typeof calculator.initialize === 'function') {
            calculator.initialize(client, patient, card);
            // 顯示病人資訊（頭部區塊）
            displayPatientInfo(client, patientInfoDiv as HTMLElement);
        }
    } catch (error) {
        console.error(`初始化或連接 FHIR Server 失敗: ${calculatorId}`, error);
        container.innerHTML = `<div class="error">無法連接至 FHIR 伺服器或取得病人資料。</div>`;
    }
};
