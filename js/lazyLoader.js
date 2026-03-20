// src/lazyLoader.ts
/**
 * Lazy Loading Utilities
 * - Dynamic calculator imports
 * - Image lazy loading
 * - CSS lazy loading
 */
/**
 * Lazy load CSS files
 * @param href - CSS file path
 * @param id - Optional link element ID
 */
export function loadCSS(href, id = null) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (id && document.getElementById(id)) {
            resolve();
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        if (id) {
            link.id = id;
        }
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
        document.head.appendChild(link);
    });
}
/**
 * Preload CSS file
 * @param href - CSS file path
 */
export function preloadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
}
/**
 * Lazy load calculator module
 * @param calculatorId - Calculator ID
 * @returns Calculator module
 */
export async function loadCalculator(calculatorId) {
    try {
        // Dynamic import with webpack magic comment for code splitting
        const module = await import(
        /* webpackChunkName: "calculator-[request]" */
        /* webpackMode: "lazy" */
        `./calculators/${calculatorId}/index.js`);
        return module.default || Object.values(module)[0];
    }
    catch (error) {
        console.error(`Failed to load calculator: ${calculatorId}`, error);
        throw new Error(`Calculator "${calculatorId}" not found`);
    }
}
/**
 * Lazy load Chart.js only when needed
 * @returns Chart.js module
 */
let chartJsPromise = null;
export function loadChartJS() {
    if (chartJsPromise) {
        return chartJsPromise;
    }
    chartJsPromise = new Promise((resolve, reject) => {
        // Check if Chart.js is already loaded
        if (window.Chart) {
            resolve(window.Chart);
            return;
        }
        // Load from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.async = true;
        script.onload = () => {
            if (window.Chart) {
                resolve(window.Chart);
            }
            else {
                reject(new Error('Chart.js failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Chart.js'));
        document.head.appendChild(script);
    });
    return chartJsPromise;
}
/**
 * Image Lazy Loading using Intersection Observer
 */
export class ImageLazyLoader {
    constructor(options = {}) {
        this.observer = null;
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01,
            ...options
        };
        this.init();
    }
    init() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            // Fallback: load all images immediately
            this.loadAllImages();
            return;
        }
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer?.unobserve(entry.target);
                }
            });
        }, this.options);
        this.observeImages();
    }
    observeImages() {
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        images.forEach(img => {
            this.observer?.observe(img);
        });
    }
    loadImage(img) {
        const src = img.dataset.src || img.getAttribute('src');
        if (!src) {
            return;
        }
        // Create new image to preload
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            // Trigger custom event instead of eval() for security
            // This prevents XSS attacks through data-onload attribute
            if (img.dataset.onload) {
                const event = new CustomEvent('imageLoaded', {
                    detail: { img, callback: img.dataset.onload }
                });
                img.dispatchEvent(event);
            }
        };
        tempImg.onerror = () => {
            img.classList.add('error');
            console.error(`Failed to load image: ${src}`);
        };
        // Add loading class
        img.classList.add('loading');
        // Start loading
        tempImg.src = src;
    }
    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            const src = img.dataset.src;
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
        });
    }
    // Add new images to observer
    observe(element) {
        if (this.observer) {
            if (element.tagName === 'IMG') {
                this.observer.observe(element);
            }
            else {
                const images = element.querySelectorAll('img[data-src]');
                images.forEach(img => this.observer?.observe(img));
            }
        }
    }
    // Disconnect observer
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
/**
 * Resource Prefetching
 */
export function prefetchResource(url, type = 'fetch') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = type;
    link.href = url;
    document.head.appendChild(link);
}
/**
 * Preload important resources
 */
export function preloadResources(resources) {
    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.type;
        link.href = resource.url;
        if (resource.type === 'font') {
            link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
    });
}
/**
 * Idle callback for non-critical tasks
 * @param callback - Function to execute when idle
 * @param options - Options for requestIdleCallback
 */
export function onIdle(callback, options = { timeout: 2000 }) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, options);
    }
    else {
        // Fallback to setTimeout
        setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 100);
    }
}
/**
 * Load module when network is idle
 * @param importFn - Dynamic import function
 */
export function loadOnIdle(importFn) {
    return new Promise((resolve, reject) => {
        onIdle(async () => {
            try {
                const module = await importFn();
                resolve(module);
            }
            catch (error) {
                reject(error);
            }
        });
    });
}
// Initialize image lazy loader on DOM ready
let imageLazyLoader = null;
export function initImageLazyLoading() {
    if (!imageLazyLoader) {
        imageLazyLoader = new ImageLazyLoader();
    }
    return imageLazyLoader;
}
// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageLazyLoading);
}
else {
    initImageLazyLoading();
}
export default {
    loadCSS,
    preloadCSS,
    loadCalculator,
    loadChartJS,
    ImageLazyLoader,
    prefetchResource,
    preloadResources,
    onIdle,
    loadOnIdle,
    initImageLazyLoading
};
