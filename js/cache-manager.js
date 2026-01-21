/**
 * Cache Manager for Medical Calculator Application
 * Provides caching strategies for different types of data
 */
const CACHE_VERSION = '1.0.0';
export const CACHE_NAMES = {
    static: `medcalc-static-v${CACHE_VERSION}`,
    calculators: `medcalc-calculators-v${CACHE_VERSION}`,
    fhir: `medcalc-fhir-v${CACHE_VERSION}`,
    images: `medcalc-images-v${CACHE_VERSION}`
};
export const CACHE_EXPIRY = {
    static: 7 * 24 * 60 * 60 * 1000, // 7 days
    calculators: 24 * 60 * 60 * 1000, // 1 day
    fhir: 5 * 60 * 1000, // 5 minutes
    images: 30 * 24 * 60 * 60 * 1000 // 30 days
};
/**
 * Cache Manager Class
 */
export class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.cacheEnabled = this.isCacheSupported();
    }
    /**
     * Check if Cache API is supported
     */
    isCacheSupported() {
        return typeof window !== 'undefined' && 'caches' in window;
    }
    /**
     * Store item in cache with expiry
     */
    async set(cacheName, key, data, expiryMs = null) {
        // Memory cache
        const expiryTime = expiryMs ? Date.now() + expiryMs : null;
        this.memoryCache.set(key, {
            data,
            expiry: expiryTime
        });
        // Browser Cache API
        if (this.cacheEnabled) {
            try {
                const cache = await caches.open(cacheName);
                const response = new Response(JSON.stringify({
                    data,
                    timestamp: Date.now(),
                    expiry: expiryTime
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Cache-Timestamp': Date.now().toString()
                    }
                });
                await cache.put(key, response);
            }
            catch (error) {
                console.warn('Failed to write to cache:', error);
            }
        }
        return true;
    }
    /**
     * Get item from cache
     */
    async get(cacheName, key, checkExpiry = true) {
        // Check memory cache first
        const memCached = this.memoryCache.get(key);
        if (memCached) {
            if (!checkExpiry || !memCached.expiry || Date.now() < memCached.expiry) {
                return memCached.data;
            }
            else {
                this.memoryCache.delete(key);
            }
        }
        // Check browser cache
        if (this.cacheEnabled) {
            try {
                const cache = await caches.open(cacheName);
                const response = await cache.match(key);
                if (response) {
                    const cached = await response.json();
                    if (!checkExpiry || !cached.expiry || Date.now() < cached.expiry) {
                        // Update memory cache
                        this.memoryCache.set(key, {
                            data: cached.data,
                            expiry: cached.expiry
                        });
                        return cached.data;
                    }
                    else {
                        // Expired, remove from cache
                        await cache.delete(key);
                    }
                }
            }
            catch (error) {
                console.warn('Failed to read from cache:', error);
            }
        }
        return null;
    }
    /**
     * Remove item from cache
     */
    async remove(cacheName, key) {
        this.memoryCache.delete(key);
        if (this.cacheEnabled) {
            try {
                const cache = await caches.open(cacheName);
                await cache.delete(key);
            }
            catch (error) {
                console.warn('Failed to delete from cache:', error);
            }
        }
    }
    /**
     * Clear specific cache
     */
    async clearCache(cacheName) {
        if (this.cacheEnabled) {
            try {
                await caches.delete(cacheName);
            }
            catch (error) {
                console.warn('Failed to clear cache:', error);
            }
        }
    }
    /**
     * Clear all caches
     */
    async clearAllCaches() {
        this.memoryCache.clear();
        if (this.cacheEnabled) {
            try {
                const keys = await caches.keys();
                const promises = keys.map((key) => caches.delete(key));
                await Promise.all(promises);
            }
            catch (error) {
                console.warn('Failed to clear all caches:', error);
            }
        }
    }
    /**
     * Clear expired items from cache
     */
    async cleanExpired(cacheName) {
        if (!this.cacheEnabled)
            return;
        try {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    try {
                        const cached = await response.json();
                        if (cached.expiry && Date.now() >= cached.expiry) {
                            await cache.delete(request);
                        }
                    }
                    catch (e) {
                        // Invalid cache entry, remove it
                        await cache.delete(request);
                    }
                }
            }
        }
        catch (error) {
            console.warn('Failed to clean expired cache:', error);
        }
    }
    /**
     * Get cache size
     */
    async getCacheSize(cacheName) {
        if (!this.cacheEnabled)
            return 0;
        try {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            return requests.length;
        }
        catch (error) {
            console.warn('Failed to get cache size:', error);
            return 0;
        }
    }
    /**
     * Get all cache statistics
     */
    async getCacheStats() {
        const stats = {
            memoryCache: this.memoryCache.size,
            caches: {}
        };
        if (this.cacheEnabled) {
            for (const [name, cacheName] of Object.entries(CACHE_NAMES)) {
                stats.caches[name] = await this.getCacheSize(cacheName);
            }
        }
        return stats;
    }
}
/**
 * Calculator Cache Manager
 */
export class CalculatorCacheManager extends CacheManager {
    /**
     * Cache calculator module
     */
    async cacheCalculator(calculatorId, moduleData) {
        const key = `/js/calculators/${calculatorId}/index.js`;
        await this.set(CACHE_NAMES.calculators, key, moduleData, CACHE_EXPIRY.calculators);
    }
    /**
     * Get cached calculator module
     */
    async getCachedCalculator(calculatorId) {
        const key = `/js/calculators/${calculatorId}/index.js`;
        return await this.get(CACHE_NAMES.calculators, key);
    }
    /**
     * Preload popular calculators
     */
    async preloadPopularCalculators(calculatorIds) {
        const promises = calculatorIds.map(async (id) => {
            try {
                const response = await fetch(`/js/calculators/${id}/index.js`);
                if (response.ok) {
                    const text = await response.text();
                    await this.cacheCalculator(id, text);
                }
            }
            catch (error) {
                console.warn(`Failed to preload calculator: ${id}`, error);
            }
        });
        await Promise.all(promises);
    }
}
/**
 * FHIR Data Cache Manager
 */
export class FHIRCacheManager extends CacheManager {
    /**
     * Cache patient data
     */
    async cachePatient(patientId, patientData) {
        const key = `patient-${patientId}`;
        await this.set(CACHE_NAMES.fhir, key, patientData, CACHE_EXPIRY.fhir);
    }
    /**
     * Get cached patient data
     */
    async getCachedPatient(patientId) {
        const key = `patient-${patientId}`;
        return await this.get(CACHE_NAMES.fhir, key);
    }
    /**
     * Cache observation data
     */
    async cacheObservation(patientId, observationCode, observationData) {
        const key = `observation-${patientId}-${observationCode}`;
        await this.set(CACHE_NAMES.fhir, key, observationData, CACHE_EXPIRY.fhir);
    }
    /**
     * Get cached observation data
     */
    async getCachedObservation(patientId, observationCode) {
        const key = `observation-${patientId}-${observationCode}`;
        return await this.get(CACHE_NAMES.fhir, key);
    }
    /**
     * Clear patient-specific cache
     */
    async clearPatientCache(patientId) {
        if (!this.cacheEnabled)
            return;
        try {
            const cache = await caches.open(CACHE_NAMES.fhir);
            const requests = await cache.keys();
            for (const request of requests) {
                const url = request.url;
                if (url.includes(`patient-${patientId}`) ||
                    url.includes(`observation-${patientId}`)) {
                    await cache.delete(request);
                }
            }
        }
        catch (error) {
            console.warn('Failed to clear patient cache:', error);
        }
    }
}
/**
 * Static Resource Cache Manager
 */
export class StaticCacheManager extends CacheManager {
    /**
     * Cache static resources
     */
    async cacheStaticResources(urls) {
        if (!this.cacheEnabled)
            return;
        try {
            const cache = await caches.open(CACHE_NAMES.static);
            await cache.addAll(urls);
        }
        catch (error) {
            console.warn('Failed to cache static resources:', error);
        }
    }
    /**
     * Cache image
     */
    async cacheImage(url, imageData) {
        await this.set(CACHE_NAMES.images, url, imageData, CACHE_EXPIRY.images);
    }
    /**
     * Get cached image
     */
    async getCachedImage(url) {
        return await this.get(CACHE_NAMES.images, url);
    }
}
/**
 * Main application cache manager instance
 */
export const cacheManager = new CacheManager();
export const calculatorCache = new CalculatorCacheManager();
export const fhirCache = new FHIRCacheManager();
export const staticCache = new StaticCacheManager();
/**
 * Get popular calculators from localStorage
 */
function getPopularCalculators() {
    try {
        const usage = JSON.parse(localStorage.getItem('calculator-usage') || '{}');
        return Object.entries(usage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([id]) => id);
    }
    catch (error) {
        return [];
    }
}
/**
 * Initialize caching system
 */
export async function initializeCaching() {
    console.log('Initializing cache system...');
    // Clean expired caches on startup
    await Promise.all([
        cacheManager.cleanExpired(CACHE_NAMES.static),
        cacheManager.cleanExpired(CACHE_NAMES.calculators),
        cacheManager.cleanExpired(CACHE_NAMES.fhir),
        cacheManager.cleanExpired(CACHE_NAMES.images)
    ]);
    // Preload critical static resources
    const criticalResources = [
        '/',
        '/css/main.css',
        '/css/unified-calculator.css',
        '/js/main.js',
        '/js/calculators/index.js'
    ];
    await staticCache.cacheStaticResources(criticalResources);
    // Preload popular calculators based on usage
    const popularCalculators = getPopularCalculators();
    if (popularCalculators.length > 0) {
        await calculatorCache.preloadPopularCalculators(popularCalculators);
    }
    console.log('Cache system initialized');
}
/**
 * Get cache statistics for debugging
 */
export async function getCacheStatistics() {
    const stats = await cacheManager.getCacheStats();
    console.table(stats);
    return stats;
}
/**
 * Clear all application caches (for debugging/maintenance)
 */
export async function clearAllApplicationCaches() {
    await cacheManager.clearAllCaches();
    console.log('All caches cleared');
}
export default {
    cacheManager,
    calculatorCache,
    fhirCache,
    staticCache,
    initializeCaching,
    getCacheStatistics,
    clearAllApplicationCaches,
    CACHE_NAMES,
    CACHE_EXPIRY
};
