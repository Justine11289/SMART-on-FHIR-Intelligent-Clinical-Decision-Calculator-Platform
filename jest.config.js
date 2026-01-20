/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    // 使用 ts-jest 預設設定處理 TypeScript
    preset: 'ts-jest/presets/default-esm',

    // 測試環境使用 jsdom (瀏覽器模擬)
    testEnvironment: 'jsdom',

    // 支援的副檔名
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],

    // 處理模組路徑別名 (如果有) 和 .js 副檔名導入
    moduleNameMapper: {
        // 處理 TypeScript 中的 .js 導入 (ESM 規範)
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },

    // 轉換設定
    transform: {
        // 使用 ts-jest 處理 .ts 檔案
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: 'tsconfig.json'
            }
        ]
    },

    // 測試檔案匹配模式：src 目錄下的 __tests__ 資料夾或 .test.ts 結尾的檔案
    testMatch: ['**/src/**/__tests__/**/*.ts', '**/src/**/*.test.ts', '**/tests/**/*.test.ts'],

    // Ignore utility files in __tests__/utils (not actual test files)
    testPathIgnorePatterns: ['/node_modules/', '/__tests__/utils/'],

    // 覆蓋率設定
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types/**/*.ts' // 排除類型定義檔案
    ],

    // 覆蓋率閾值 (逐步提高，當前為基準值)
    coverageThreshold: {
        global: {
            branches: 8,
            functions: 12,
            lines: 8,
            statements: 8
        }
    },

    // 覆蓋率報告格式
    coverageReporters: ['text', 'text-summary', 'lcov', 'html'],

    // 指定不需要轉換的路徑
    transformIgnorePatterns: [
        'node_modules/(?!(fhirclient|chart.js)/)' // 如果這些庫發布為 ESM，可能需要轉換
    ]
};
