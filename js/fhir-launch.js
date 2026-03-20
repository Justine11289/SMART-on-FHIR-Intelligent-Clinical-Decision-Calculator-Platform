"use strict";
// src/fhir-launch.ts
async function performLaunch() {
    const statusEl = document.getElementById('status');
    const subStatusEl = document.getElementById('sub-status');
    const appWindow = window;
    // 取得配置
    const config = appWindow.MEDCALC_CONFIG?.fhir;
    const FHIR = appWindow.FHIR;
    if (!config) {
        console.error("Missing MEDCALC_CONFIG");
        if (statusEl)
            statusEl.innerText = "授權初始化失敗：缺少配置資訊";
        return;
    }
    if (!FHIR?.oauth2?.authorize) {
        console.error("FHIR client not loaded");
        if (statusEl) {
            statusEl.innerText = "授權初始化失敗";
            statusEl.style.color = "red";
        }
        if (subStatusEl) {
            subStatusEl.innerText = "FHIR SDK 載入失敗，請重新整理頁面後再試。";
        }
        return;
    }
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const iss = urlParams.get("iss") || "";
        // 1. 初始化 Client 參數
        let clientId = config.clientId;
        let secret = config.clientSecret;
        // 2. 自動退避邏輯 (不管您指定的 ID，如果是沙盒就用萬用 ID)
        if (iss.includes("smarthealthit.org")) {
            console.log("偵測到沙盒環境，切換至通用 Client ID");
            clientId = "my_web_app";
            secret = undefined;
            if (subStatusEl)
                subStatusEl.innerText = "偵測到測試沙盒，使用通用憑證中...";
        }
        // 3. 將相對路徑轉為絕對 URL (解決連線失敗的關鍵)
        const absoluteRedirectUri = new URL(config.redirectUri || "index.html", window.location.href).href;
        const authorizeOptions = {
            clientId,
            scope: config.scope,
            redirectUri: absoluteRedirectUri,
            completeInTarget: true
        };
        if (secret) {
            authorizeOptions.clientSecret = secret;
        }
        // Standalone Launch 處理
        if (!iss) {
            authorizeOptions.fhirServiceUrl = config.fhirServiceUrl || "https://launch.smarthealthit.org/v/r4/fhir";
        }
        console.log("正在啟動 FHIR 授權，參數：", authorizeOptions);
        const redirectTimeout = window.setTimeout(() => {
            if (statusEl) {
                statusEl.innerText = "授權跳轉逾時";
                statusEl.style.color = "red";
            }
            if (subStatusEl) {
                subStatusEl.innerText = "無法導向授權頁面，請檢查瀏覽器封鎖設定或重新啟動流程。";
            }
        }, 6000);
        // 4. 執行跳轉
        await FHIR.oauth2.authorize(authorizeOptions);
        window.clearTimeout(redirectTimeout);
    }
    catch (error) {
        console.error("SMART Launch Error:", error);
        if (statusEl) {
            statusEl.innerText = "授權初始化失敗";
            statusEl.style.color = "red";
        }
        if (subStatusEl) {
            subStatusEl.innerText = error instanceof Error ? error.message : String(error);
        }
    }
}
// 啟動流程
performLaunch();
