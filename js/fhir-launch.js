"use strict";
async function performLaunch() {
    const config = window.MEDCALC_CONFIG?.fhir;
    const FHIR = window.FHIR;
    function installTokenBasicAuthInterceptor(clientId, clientSecret) {
        const win = window;
        if (win.__MEDCALC_TOKEN_BASIC_AUTH_PATCHED)
            return;
        const originalFetch = window.fetch.bind(window);
        const basicToken = btoa(unescape(encodeURIComponent(`${clientId}:${clientSecret}`)));
        window.fetch = async (input, init) => {
            const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const requestMethod = (init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')).toUpperCase();
            const isTokenRequest = /\/auth\/token(?:\?|$)/i.test(requestUrl);
            if (isTokenRequest && requestMethod === 'POST') {
                const mergedHeaders = new Headers(init?.headers);
                if (!mergedHeaders.has('Authorization')) {
                    mergedHeaders.set('Authorization', `Basic ${basicToken}`);
                }
                const nextInit = { ...init, headers: mergedHeaders };
                return originalFetch(input, nextInit);
            }
            return originalFetch(input, init);
        };
        win.__MEDCALC_TOKEN_BASIC_AUTH_PATCHED = true;
    }
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
        // 3. 使用 SMART client 文件所示的 snake_case 參數
        const authorizeOptions = {
            client_id: client_id,
            scope: config?.scope || 'openid fhirUser launch profile patient/*.read online_access',
            redirect_uri: absoluteRedirectUri,
            completeInTarget: true
        };
        // Confidential client flow: include client secret when configured.
        if (client_secret) {
            installTokenBasicAuthInterceptor(client_id, client_secret);
            authorizeOptions.client_secret = client_secret;
            console.warn('偵測到 client_secret。瀏覽器端通常不支援機密客戶端 token 交換，若發生 401 請改用 public client。');
        }
        if (iss) {
            // EHR launch: the SMART client reads iss from the current launch URL.
            console.log('偵測到 EHR 模式，目標伺服器：', iss);
        }
        else {
            // If no iss is present, fall back to the sandbox FHIR server.
            authorizeOptions.fhirServiceUrl =
                config.fhirServiceUrl || 'https://launch.smarthealthit.org/v/r4/fhir';
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
            if (subStatus) {
                const rawMessage = error.message || '未知授權錯誤';
                if (/Basic authentication is required for confidential clients/i.test(rawMessage)) {
                    subStatus.innerText = '目前 client 被設定為機密客戶端。請改用可在瀏覽器端使用的 public SMART client（不要使用 client secret）。';
                }
                else {
                    subStatus.innerText = rawMessage;
                }
            }
        }
    }
}
performLaunch();
