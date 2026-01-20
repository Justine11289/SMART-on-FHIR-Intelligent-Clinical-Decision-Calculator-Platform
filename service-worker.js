/**
 * Service Worker for Medical Calculator Application
 * Provides offline support and caching strategies
 */

const CACHE_VERSION = '1.0.1';
const CACHE_NAMES = {
    static: `medcalc-static-v${CACHE_VERSION}`,
    calculators: `medcalc-calculators-v${CACHE_VERSION}`,
    fhir: `medcalc-fhir-v${CACHE_VERSION}`,
    images: `medcalc-images-v${CACHE_VERSION}`,
    runtime: `medcalc-runtime-v${CACHE_VERSION}`
};

// Static resources to cache on install
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/calculator.html',
    '/css/main.css',
    '/css/unified-calculator.css',
    '/css/enhanced-features.css',
    '/js/main.js',
    '/js/calculator-page.js',
    '/js/calculators/index.js',
    '/js/utils.js',
    '/js/errorHandler.js',

    '/js/favorites.js',
    '/js/cache-manager.js'
];

/**
 * Install Event
 * Cache static resources
 */
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches
            .open(CACHE_NAMES.static)
            .then(cache => {
                console.log('[Service Worker] Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

/**
 * Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old version caches
                        if (!Object.values(CACHE_NAMES).includes(cacheName)) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch Event
 * Handle network requests with different caching strategies
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // Determine caching strategy based on request type
    if (isStaticResource(url)) {
        // Static resources: Cache First
        event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    } else if (isCalculatorModule(url)) {
        // Calculator modules: Stale While Revalidate
        event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.calculators));
    } else if (isFHIRRequest(url)) {
        // FHIR requests: Network First with short cache
        event.respondWith(networkFirst(request, CACHE_NAMES.fhir, 5000));
    } else if (isImageRequest(url)) {
        // Images: Cache First with long expiry
        event.respondWith(cacheFirst(request, CACHE_NAMES.images));
    } else {
        // Other requests: Network First
        event.respondWith(networkFirst(request, CACHE_NAMES.runtime, 3000));
    }
});

/**
 * Cache First Strategy
 * Use cached version if available, otherwise fetch from network
 */
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        const response = await fetch(request);

        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[Service Worker] Cache First failed:', error);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

/**
 * Network First Strategy
 * Try network first, fall back to cache if network fails
 */
async function networkFirst(request, cacheName, timeout = 3000) {
    try {
        const cache = await caches.open(cacheName);

        // Try network with timeout
        const networkPromise = fetch(request);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), timeout)
        );

        try {
            const response = await Promise.race([networkPromise, timeoutPromise]);

            if (response.ok) {
                cache.put(request, response.clone());
            }

            return response;
        } catch (networkError) {
            // Network failed or timed out, try cache
            const cached = await cache.match(request);

            if (cached) {
                console.log('[Service Worker] Serving from cache due to network failure');
                return cached;
            }

            throw networkError;
        }
    } catch (error) {
        console.error('[Service Worker] Network First failed:', error);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);

        // Fetch fresh version in background
        const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        });

        // Return cached version immediately if available
        if (cached) {
            return cached;
        }

        // Otherwise wait for network
        return await fetchPromise;
    } catch (error) {
        console.error('[Service Worker] Stale While Revalidate failed:', error);

        // Try cache as last resort
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

/**
 * Helper: Check if request is for static resource
 */
function isStaticResource(url) {
    return (
        url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/) ||
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        url.pathname === '/calculator.html'
    );
}

/**
 * Helper: Check if request is for calculator module
 */
function isCalculatorModule(url) {
    return url.pathname.includes('/js/calculators/') && url.pathname.endsWith('/index.js');
}

/**
 * Helper: Check if request is FHIR API call
 */
function isFHIRRequest(url) {
    return (
        url.hostname.includes('fhir') ||
        url.pathname.includes('/fhir/') ||
        url.pathname.includes('/Patient') ||
        url.pathname.includes('/Observation')
    );
}

/**
 * Helper: Check if request is for image
 */
function isImageRequest(url) {
    return url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/);
}

/**
 * Message Event
 * Handle messages from clients
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches
                .keys()
                .then(cacheNames => {
                    return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                })
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
        );
    }

    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        event.waitUntil(
            getCacheStats().then(stats => {
                event.ports[0].postMessage({ stats });
            })
        );
    }
});

/**
 * Get cache statistics
 */
async function getCacheStats() {
    const stats = {};

    for (const [name, cacheName] of Object.entries(CACHE_NAMES)) {
        try {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            stats[name] = keys.length;
        } catch (error) {
            stats[name] = 0;
        }
    }

    return stats;
}

/**
 * Background Sync Event (Progressive Enhancement)
 * Sync data when connection is restored
 */
self.addEventListener('sync', event => {
    if (event.tag === 'sync-fhir-data') {
        event.waitUntil(syncFHIRData());
    }
});

/**
 * Sync FHIR data
 */
async function syncFHIRData() {
    console.log('[Service Worker] Syncing FHIR data...');
    // Implementation would depend on your specific FHIR sync requirements
    // This is a placeholder for future enhancement
}

/**
 * Push Notification Event (Future Enhancement)
 */
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'New notification',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        data: data
    };

    event.waitUntil(self.registration.showNotification(data.title || 'MedCalc EHR', options));
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});

console.log('[Service Worker] Script loaded');
