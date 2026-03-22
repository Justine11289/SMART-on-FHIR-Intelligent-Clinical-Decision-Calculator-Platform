"use strict";
async function performLaunch() {
    const config = window.MEDCALC_CONFIG?.fhir;
    const FHIR = window.FHIR;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const iss = urlParams.get('iss') || '';
        const client_id = config?.clientId;
        const client_secret = config?.clientSecret;
        // 2. 驗證：若沒輸入 ID，直接噴錯停止執行
        if (!client_id) {
            throw new Error('認證失敗：未提供 Client ID。請在 MEDCALC_CONFIG 中設定。');
        }
        const absoluteRedirectUri = new URL(config?.redirectUri || 'index.html', window.location.href).href;
        // 3. 關鍵修正：使用 snake_case 參數名稱，SDK 才能正確識別
        const authorizeOptions = {
            client_id: client_id, // 修正為 client_id
            scope: config?.scope || 'openid fhirUser launch profile patient/*.read online_access',
            redirect_uri: absoluteRedirectUri, // 修正為 redirect_uri
            completeInTarget: true
        };
        // 4. 若為機密客戶端，加入 Secret
        if (client_secret) {
            authorizeOptions.client_secret = client_secret; // 修正為 client_secret
            console.log('執行機密客戶端授權流程...');
        }
        // 處理 Standalone Launch (當 iss 存在，但不是由 EHR 觸發時)
        if (!iss) {
            // 如果連 iss 都沒有（使用者直接打 localhost:8080/launch.html）
            // 則退回到預設的測試沙盒
            authorizeOptions.fhirServiceUrl =
                config.fhirServiceUrl || 'https://launch.smarthealthit.org/v/r4/fhir';
        }
        else {
            // 如果有 iss (Standalone 模式)，SDK 會自動使用該 iss 作為目標伺服器
            console.log('偵測到 Standalone 模式，目標伺服器：', iss);
        }
        // 執行跳轉
        await FHIR.oauth2.authorize(authorizeOptions);
    }
    catch (error) {
        console.error('SMART Launch Error:', error);
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerText = '授權中止';
            statusEl.style.color = 'red';
            const subStatus = document.getElementById('sub-status');
            if (subStatus)
                subStatus.innerText = error.message;
        }
    }
}
performLaunch();
