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
window.CACHE_VERSION = '1.1.1';

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

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const calculatorId = params.get('id');
    const patientInfoDiv = document.getElementById('patient-info');
    const container = document.getElementById('calculator-container');
    const pageTitle = document.getElementById('page-title');

    if (!patientInfoDiv || !container || !pageTitle) {
        console.error('Required DOM elements not found');
        return;
    }

    if (!calculatorId) {
        container.innerHTML = '<h2>No calculator ID specified.</h2>';
        return;
    }

    const calculatorInfo = getCalculatorMetadata(calculatorId);
    if (!calculatorInfo) {
        container.innerHTML = `<h2>Calculator "${calculatorId}" not found.</h2>`;
        return;
    }

    pageTitle.textContent = calculatorInfo.title;
    const card = document.createElement('div');
    card.className = 'calculator-card';
    container.appendChild(card);

    favoritesManager.addToRecent(calculatorId);
    favoritesManager.trackUsage(calculatorId);

    const loadCalculatorModule = async () => {
        try {
            // 1. 載入計算器
            const calculator = await loadCalculator(calculatorId);
            card.innerHTML = calculator.generateHTML();

            // 2. 讀取測試資料
            const response = await fetch('/test-Patient.json');
            const bundle = await response.json();
            const patient = bundle.entry.find(
                (e: any) => e.resource.resourceType === 'Patient'
            )?.resource;

            // 核心修正：將 patient.id 傳入 mockClient 滿足 utils.ts 的檢查
            const mockClient = {
                patient: {
                    id: patient.id,
                    read: () => Promise.resolve(patient),
                    // 核心修正：request 必須在 patient 物件內，且回傳整個 bundle (模擬 FHIR Search)
                    request: (url: string) => Promise.resolve(bundle)
                },
                // 為了相容性，外層也可以放一個
                request: (url: string) => Promise.resolve(bundle)
            };
            if (typeof calculator.initialize === 'function') {
                calculator.initialize(mockClient, patient, card);
                // 這裡會成功執行，不再跳出「No patient data」錯誤
                displayPatientInfo(mockClient, patientInfoDiv);
            }
        } catch (error) {
            console.error(`Failed: ${calculatorId}`, error);
        }
    };
    loadCalculatorModule();
};
