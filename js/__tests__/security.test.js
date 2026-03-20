import { describe, expect, test } from '@jest/globals';
import { escapeHTML, sanitizeHTML, isValidURL, sanitizeFHIRField } from '../security';
describe('Security Utilities', () => {
    describe('escapeHTML', () => {
        test('should escape special characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert("xss")&lt;/script&gt;';
            expect(escapeHTML(input)).toBe(expected);
        });
        test('should handle null and undefined', () => {
            expect(escapeHTML(null)).toBe('');
            expect(escapeHTML(undefined)).toBe('');
        });
        test('should return empty string for empty input', () => {
            expect(escapeHTML('')).toBe('');
        });
    });
    describe('sanitizeHTML', () => {
        test('should remove unsafe tags', () => {
            const input = '<div>Safe<script>Unsafe</script></div>';
            // Note: sanitizeHTML uses DOMParser/createElement which might strip script tags differently in JSDOM
            const result = sanitizeHTML(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('Safe');
        });
        test('should preserve safe formatting tags', () => {
            const input = '<b>Bold</b> and <i>Italic</i>';
            const result = sanitizeHTML(input);
            // It might normalize HTML (e.g. UPPERCASE tags or whitespace), so check content presence
            expect(result).toMatch(/<b>Bold<\/b>/i);
            expect(result).toMatch(/<i>Italic<\/i>/i);
        });
        test('should remove javascript: hrefs', () => {
            const input = '<a href="javascript:alert(1)">Click me</a>';
            const result = sanitizeHTML(input);
            expect(result).not.toContain('javascript:');
            // It typically removes the attribute or the element usage depending on implementation logic
            // Our implementation removes the attribute
            expect(result).toContain('<a>Click me</a>');
        });
    });
    describe('isValidURL', () => {
        test('should validate correct URLs', () => {
            expect(isValidURL('https://example.com')).toBe(true);
            expect(isValidURL('http://example.com/path?query=1')).toBe(true);
            expect(isValidURL('/relative/path')).toBe(true);
        });
        test('should reject invalid URLs', () => {
            expect(isValidURL('javascript:alert(1)')).toBe(false);
            expect(isValidURL('data:text/html,bad')).toBe(false);
        });
    });
    describe('sanitizeFHIRField', () => {
        test('should extract and sanitize string field', () => {
            const data = { name: '<script>John</script>' };
            expect(sanitizeFHIRField(data, 'name')).toBe('&lt;script&gt;John&lt;/script&gt;');
        });
        test('should handle nested fields', () => {
            const data = { patient: { name: { text: 'Doe' } } };
            expect(sanitizeFHIRField(data, 'patient.name.text')).toBe('Doe');
        });
        test('should return empty string if field missing', () => {
            const data = { name: 'John' };
            expect(sanitizeFHIRField(data, 'age')).toBe('');
        });
        test('should handle null data', () => {
            expect(sanitizeFHIRField(null, 'any')).toBe('');
        });
    });
});
