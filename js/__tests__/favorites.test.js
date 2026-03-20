/**
 * @jest-environment jsdom
 */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { FavoritesManager } from '../favorites';
describe('FavoritesManager', () => {
    let manager;
    let localStorageMock;
    beforeEach(() => {
        localStorageMock = {};
        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn((key) => localStorageMock[key] || null),
                setItem: jest.fn((key, value) => {
                    localStorageMock[key] = value;
                }),
                removeItem: jest.fn((key) => {
                    delete localStorageMock[key];
                }),
                clear: jest.fn(() => {
                    localStorageMock = {};
                })
            },
            writable: true
        });
        manager = new FavoritesManager();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Favorites', () => {
        test('should add calculator to favorites', () => {
            manager.addFavorite('bmi-bsa');
            expect(manager.isFavorite('bmi-bsa')).toBe(true);
            expect(manager.getFavorites()).toContain('bmi-bsa');
        });
        test('should remove calculator from favorites', () => {
            manager.addFavorite('bmi-bsa');
            manager.removeFavorite('bmi-bsa');
            expect(manager.isFavorite('bmi-bsa')).toBe(false);
        });
        test('should toggle favorite status', () => {
            const firstToggle = manager.toggleFavorite('bmi-bsa');
            expect(firstToggle).toBe(true);
            expect(manager.isFavorite('bmi-bsa')).toBe(true);
            const secondToggle = manager.toggleFavorite('bmi-bsa');
            expect(secondToggle).toBe(false);
            expect(manager.isFavorite('bmi-bsa')).toBe(false);
        });
        test('should return correct favorites count', () => {
            manager.addFavorite('bmi-bsa');
            manager.addFavorite('crcl');
            manager.addFavorite('gcs');
            expect(manager.getFavoritesCount()).toBe(3);
        });
        test('should not add duplicate favorites', () => {
            manager.addFavorite('bmi-bsa');
            manager.addFavorite('bmi-bsa');
            expect(manager.getFavoritesCount()).toBe(1);
        });
    });
    describe('Recent Usage', () => {
        test('should add to recent list', () => {
            manager.addToRecent('bmi-bsa');
            expect(manager.getRecent()).toContain('bmi-bsa');
        });
        test('should keep most recent at the front', () => {
            manager.addToRecent('calc-1');
            manager.addToRecent('calc-2');
            manager.addToRecent('calc-3');
            const recent = manager.getRecent();
            expect(recent[0]).toBe('calc-3');
            expect(recent[1]).toBe('calc-2');
            expect(recent[2]).toBe('calc-1');
        });
        test('should not duplicate in recent list', () => {
            manager.addToRecent('bmi-bsa');
            manager.addToRecent('crcl');
            manager.addToRecent('bmi-bsa');
            const recent = manager.getRecent();
            expect(recent.filter(id => id === 'bmi-bsa').length).toBe(1);
            expect(recent[0]).toBe('bmi-bsa');
        });
        test('should limit recent list to maxRecent', () => {
            // Add more than maxRecent (10) items
            for (let i = 0; i < 15; i++) {
                manager.addToRecent(`calc-${i}`);
            }
            expect(manager.getRecent().length).toBeLessThanOrEqual(10);
        });
        test('should clear recent list', () => {
            manager.addToRecent('bmi-bsa');
            manager.addToRecent('crcl');
            manager.clearRecent();
            expect(manager.getRecent().length).toBe(0);
        });
    });
    describe('Usage Statistics', () => {
        test('should track usage count', () => {
            manager.trackUsage('bmi-bsa');
            manager.trackUsage('bmi-bsa');
            manager.trackUsage('bmi-bsa');
            expect(manager.getUsageCount('bmi-bsa')).toBe(3);
        });
        test('should return 0 for unused calculator', () => {
            expect(manager.getUsageCount('never-used')).toBe(0);
        });
        test('should get most used calculators', () => {
            manager.trackUsage('calc-a');
            manager.trackUsage('calc-b');
            manager.trackUsage('calc-b');
            manager.trackUsage('calc-c');
            manager.trackUsage('calc-c');
            manager.trackUsage('calc-c');
            const mostUsed = manager.getMostUsed(2);
            expect(mostUsed[0].id).toBe('calc-c');
            expect(mostUsed[0].count).toBe(3);
            expect(mostUsed[1].id).toBe('calc-b');
            expect(mostUsed[1].count).toBe(2);
        });
    });
    describe('Listeners', () => {
        test('should notify listeners on favorite change', () => {
            const listener = jest.fn();
            manager.addListener(listener);
            manager.toggleFavorite('bmi-bsa');
            expect(listener).toHaveBeenCalledWith('favorites', 'bmi-bsa');
        });
        test('should remove listener', () => {
            const listener = jest.fn();
            manager.addListener(listener);
            manager.removeListener(listener);
            manager.toggleFavorite('bmi-bsa');
            expect(listener).not.toHaveBeenCalled();
        });
    });
    describe('Data Export/Import', () => {
        test('should export data', () => {
            manager.addFavorite('bmi-bsa');
            manager.addToRecent('crcl');
            manager.trackUsage('gcs');
            const exported = manager.exportData();
            expect(exported.favorites).toContain('bmi-bsa');
            expect(exported.recent).toContain('crcl');
            expect(exported.usage['gcs']).toBe(1);
            expect(exported.exportDate).toBeDefined();
        });
        test('should import data', () => {
            const data = {
                favorites: ['calc-1', 'calc-2'],
                recent: ['calc-3'],
                usage: { 'calc-1': 5 }
            };
            const result = manager.importData(data);
            expect(result).toBe(true);
            expect(manager.getFavorites()).toContain('calc-1');
            expect(manager.getRecent()).toContain('calc-3');
            expect(manager.getUsageCount('calc-1')).toBe(5);
        });
    });
    describe('Stats Summary', () => {
        test('should return correct stats summary', () => {
            manager.addFavorite('bmi-bsa');
            manager.addFavorite('crcl');
            manager.addToRecent('gcs');
            manager.trackUsage('bmi-bsa');
            manager.trackUsage('crcl');
            manager.trackUsage('crcl');
            const stats = manager.getStatsSummary();
            expect(stats.favoritesCount).toBe(2);
            expect(stats.recentCount).toBe(1);
            expect(stats.totalUsage).toBe(3);
            expect(stats.uniqueCalculatorsUsed).toBe(2);
        });
    });
    describe('Clear All', () => {
        test('should clear all data', () => {
            manager.addFavorite('bmi-bsa');
            manager.addToRecent('crcl');
            manager.trackUsage('gcs');
            manager.clearAll();
            expect(manager.getFavorites().length).toBe(0);
            expect(manager.getRecent().length).toBe(0);
            expect(Object.keys(manager.getUsage()).length).toBe(0);
        });
    });
});
