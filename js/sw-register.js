// src/sw-register.ts
/**
 * Service Worker Registration
 * Registers and manages the Service Worker lifecycle
 */
/**
 * Register Service Worker
 */
export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return null;
    }
    try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        });
        console.log('Service Worker registered successfully:', registration.scope);
        // Handle updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Service Worker update found');
            newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available
                    showUpdateNotification(registration);
                }
            });
        });
        // Check for updates periodically (every hour)
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);
        return registration;
    }
    catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
}
/**
 * Show update notification to user
 */
function showUpdateNotification(registration) {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
        <div class="sw-update-content">
            <span class="sw-update-icon">🔄</span>
            <span class="sw-update-text">New version available!</span>
            <button class="sw-update-button" id="sw-update-btn">Update</button>
            <button class="sw-dismiss-button" id="sw-dismiss-btn">Later</button>
        </div>
    `;
    // Load styles if not already loaded
    if (!document.getElementById('sw-update-styles')) {
        const link = document.createElement('link');
        link.id = 'sw-update-styles';
        link.rel = 'stylesheet';
        link.href = './css/sw-register.css';
        document.head.appendChild(link);
    }
    document.body.appendChild(notification);
    // Handle update button click
    document.getElementById('sw-update-btn')?.addEventListener('click', () => {
        // Tell service worker to skip waiting
        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        // Reload page when new service worker takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
        notification.remove();
    });
    // Handle dismiss button click
    document.getElementById('sw-dismiss-btn')?.addEventListener('click', () => {
        notification.remove();
    });
}
/**
 * Unregister Service Worker (for debugging)
 */
export async function unregisterServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return false;
    }
    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
        }
        console.log('Service Worker unregistered');
        return true;
    }
    catch (error) {
        console.error('Failed to unregister Service Worker:', error);
        return false;
    }
}
/**
 * Get Service Worker status
 */
export function getServiceWorkerStatus() {
    if (!('serviceWorker' in navigator)) {
        return { supported: false };
    }
    return {
        supported: true,
        controller: navigator.serviceWorker.controller ? 'active' : 'none',
        ready: navigator.serviceWorker.ready
    };
}
/**
 * Send message to Service Worker
 */
export async function sendMessageToSW(message) {
    const controller = navigator.serviceWorker.controller;
    if (!controller) {
        console.warn('No active service worker');
        return null;
    }
    return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
        };
        // Use addEventListener for error handling on MessagePort
        messageChannel.port1.addEventListener('messageerror', (event) => {
            reject(new Error('Message error: ' + event.data));
        });
        controller.postMessage(message, [messageChannel.port2]);
        // Timeout to prevent hanging
        setTimeout(() => {
            reject(new Error('Service worker message timeout'));
        }, 10000);
    });
}
/**
 * Clear Service Worker caches
 */
export async function clearServiceWorkerCaches() {
    try {
        const result = await sendMessageToSW({ type: 'CLEAR_CACHE' });
        console.log('Service Worker caches cleared');
        return result;
    }
    catch (error) {
        console.error('Failed to clear Service Worker caches:', error);
        return null;
    }
}
/**
 * Get cache statistics from Service Worker
 */
export async function getCacheStats() {
    try {
        const result = (await sendMessageToSW({ type: 'GET_CACHE_STATS' }));
        return result.stats;
    }
    catch (error) {
        console.error('Failed to get cache stats:', error);
        return null;
    }
}
/**
 * Initialize Service Worker on page load
 */
export function initializeServiceWorker() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            registerServiceWorker();
        });
    }
    else {
        registerServiceWorker();
    }
}
export default {
    registerServiceWorker,
    unregisterServiceWorker,
    getServiceWorkerStatus,
    sendMessageToSW,
    clearServiceWorkerCaches,
    getCacheStats,
    initializeServiceWorker
};
