import {
    calculatorModules,
    CalculatorMetadata
} from './calculators/index.js';
import { displayPatientInfo } from './utils.js';

window.onload = async () => {
    const patientInfoDiv = document.getElementById('patient-info') as HTMLElement;
    const calculatorContainer = document.getElementById('calculator-container') as HTMLElement;

    // 1. 從網址取得計算機 ID
    const urlParams = new URLSearchParams(window.location.search);
    const calcId = urlParams.get('id'); // 確保 main.ts 傳過來的是 id

    if (!calcId) {
        if (calculatorContainer) calculatorContainer.innerHTML = "<h1>錯誤：未指定計算機 ID</h1>";
        return;
    }

    // 2. 尋找對應的計算機模組
    const calcMetadata = calculatorModules.find(m => m.id === calcId);
    if (!calcMetadata) {
        if (calculatorContainer) calculatorContainer.innerHTML = "<h1>錯誤：找不到該計算機模組</h1>";
        return;
    }

    /**
     * 核心：資料載入邏輯
     */
    async function initializeCalculator() {
        try {
            console.log("嘗試初始化 SMART 環境...");
            let client;
            const response = await fetch('./test-Patient.json');
            const bundle = await response.json() as any;
            const patient = bundle.entry.find((e: any) => e.resource.resourceType === "Patient").resource;

            // 模擬 mockClient
            client = {
                patient: { id: patient.id, read: () => Promise.resolve(patient) },
                request: async () => bundle,
                user: { read: () => Promise.reject("測試模式") }
            };

            if (client) {
                // 顯示病人資訊
                displayPatientInfo(client, patientInfoDiv);
            }

        } catch (error) {
            console.error("初始化失敗:", error);
            if (patientInfoDiv) patientInfoDiv.innerHTML = "無法載入病人資料，請檢查 test-Patient.json";
        }
    }

    await initializeCalculator();
};