// Custom Calculator Error Class
export class CalculatorError extends Error {
    /**
     * Create calculator error instance
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Object} details - Error details
     */
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'CalculatorError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date();
    }
}
/**
 * FHIR Data Error Class
 * @extends CalculatorError
 */
export class FHIRDataError extends CalculatorError {
    constructor(message, details = {}) {
        super(message, 'FHIR_DATA_ERROR', details);
        this.name = 'FHIRDataError';
    }
}
/**
 * Input Validation Error Class
 * @extends CalculatorError
 */
export class ValidationError extends CalculatorError {
    constructor(message, details = {}) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
/**
 * Log error to console and optional logging service
 * @param {Error} error - Error object
 * @param {Object} context - Error context information
 */
export function logError(error, context = {}) {
    const errorLog = {
        name: error.name || 'Error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        context: context,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        stack: error.stack
    };
    // Log details in development environment
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        console.group('🚨 Error Logged');
        console.error('Error:', error);
        console.log('Context:', context);
        console.log('Full Log:', errorLog);
        console.groupEnd();
    }
    else {
        // Log brief info in production
        console.error(`[${errorLog.code}] ${errorLog.message}`);
    }
    // Optional: Send to logging service (e.g. Sentry, LogRocket, etc.)
    // sendToLoggingService(errorLog);
    return errorLog;
}
/**
 * Display user-friendly error message
 * @param {HTMLElement} container - Container element to display error
 * @param {Error} error - Error object
 * @param {string} userMessage - User-friendly error message
 */
export function displayError(container, error, userMessage = null) {
    if (!container) {
        console.error('displayError: container element is null');
        return;
    }
    // Ensure CSS is loaded
    loadErrorStyles();
    const message = userMessage || getUserFriendlyMessage(error);
    container.innerHTML = `
        <div class="error-message">
            <div class="error-title">
                ⚠️ Error
            </div>
            <div class="error-content">
                ${message}
            </div>
            ${typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? `
                <details>
                    <summary>Technical Details</summary>
                    <pre>${error.stack || error.message}</pre>
                </details>
            `
        : ''}
        </div>
    `;
}
/**
 * Load error handler CSS
 */
function loadErrorStyles() {
    if (typeof document === 'undefined')
        return;
    if (document.getElementById('error-handler-styles'))
        return;
    const link = document.createElement('link');
    link.id = 'error-handler-styles';
    link.rel = 'stylesheet';
    link.href = './css/error-handler.css';
    document.head.appendChild(link);
}
/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
function getUserFriendlyMessage(error) {
    if (error instanceof FHIRDataError) {
        return 'Unable to retrieve patient data from EHR system. Please check connection or enter data manually.';
    }
    if (error instanceof ValidationError) {
        return `Input validation failed: ${error.message}`;
    }
    if (error instanceof CalculatorError) {
        return error.message;
    }
    // Generic error message
    return 'Calculator encountered an error. Please refresh the page and try again or contact support.';
}
/**
 * Wrap async function to automatically catch and log errors
 * @param {Function} fn - Async function to wrap
 * @param {Object} context - Error context
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context = {}) {
    return async function (...args) {
        try {
            return await fn.apply(this, args);
        }
        catch (error) {
            logError(error, context);
            throw error;
        }
    };
}
/**
 * Try to execute function, return default value on failure
 * @param {Function} fn - Function to execute
 * @param {*} defaultValue - Default value on failure
 * @param {Object} context - Error context
 * @returns {*} Function result or default value
 */
export function tryOrDefault(fn, defaultValue, context = {}) {
    try {
        return fn();
    }
    catch (error) {
        logError(error, { ...context, defaultValue });
        return defaultValue;
    }
}
/**
 * Global error handler
 */
export function setupGlobalErrorHandler() {
    if (typeof window === 'undefined')
        return;
    window.addEventListener('error', event => {
        logError(event.error, {
            type: 'uncaught_error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    });
    window.addEventListener('unhandledrejection', event => {
        logError(event.reason, {
            type: 'unhandled_promise_rejection',
            promise: event.promise
        });
    });
}
// Setup global error handling on app start
if (typeof window !== 'undefined') {
    setupGlobalErrorHandler();
}
