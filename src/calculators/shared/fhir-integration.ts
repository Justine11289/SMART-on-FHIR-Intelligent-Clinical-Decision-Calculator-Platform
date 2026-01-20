/**
 * FHIR 數據整合輔助模組
 *
 * 為計算器工廠提供簡化的 FHIR 數據自動填充功能
 * 與 FHIRDataService 整合，提供統一的快取、過期追蹤和單位轉換
 */

import {
    createFHIRDataService,
    FHIRDataService,
    FieldDataRequirement
} from '../../fhir-data-service.js';

// ============================================================================
// 類型定義
// ============================================================================

/**
 * FHIR 自動填充配置
 */
export interface FHIRAutoPopulateConfig {
    /** LOINC 代碼 */
    code: string;
    /** 輸入欄位 ID */
    inputId: string;
    /** 顯示標籤 */
    label: string;
    /** 目標單位（自動轉換） */
    targetUnit?: string;
    /** 小數位數 */
    decimals?: number;
    /** 最大快取時間（小時） */
    maxAgeHours?: number;
    /** 值轉換函數 */
    transform?: (value: number) => number;
}

/**
 * 創建計算器 customInitialize 函數的選項
 */
export interface CreateCustomInitializeOptions {
    /** FHIR 自動填充配置 */
    observations?: FHIRAutoPopulateConfig[];
    /** 患者資料映射 */
    patientFields?: {
        /** 年齡輸入欄位 ID */
        ageInputId?: string;
        /** 性別輸入 name */
        genderInputName?: string;
    };
    /** 自定義邏輯（在 FHIR 填充後執行） */
    afterPopulate?: (
        fhirService: FHIRDataService,
        container: HTMLElement,
        calculate: () => void,
        setValue: (id: string, value: string) => void
    ) => void | Promise<void>;
}

// ============================================================================
// 輔助函數
// ============================================================================

/**
 * 創建可用於 customInitialize 的 FHIR 自動填充函數
 *
 * @example
 * ```ts
 * const calculator = createMixedInputCalculator({
 *     id: 'my-calc',
 *     customInitialize: createFHIRAutoPopulate({
 *         observations: [
 *             { code: '2160-0', inputId: 'creatinine', label: 'Creatinine' }
 *         ],
 *         patientFields: { ageInputId: 'age' }
 *     })
 * });
 * ```
 */
export function createFHIRAutoPopulate(options: CreateCustomInitializeOptions) {
    return async (
        client: unknown,
        patient: unknown,
        container: HTMLElement,
        calculate: () => void,
        setValue: (id: string, value: string) => void
    ): Promise<void> => {
        // 創建並初始化 FHIR 服務
        const fhirService = createFHIRDataService();
        fhirService.initialize(client as any, patient as any, container);

        // 自動填充患者資料
        if (options.patientFields) {
            const { ageInputId, genderInputName } = options.patientFields;

            // 填充年齡
            if (ageInputId) {
                const age = fhirService.getPatientAge();
                if (age !== null) {
                    setValue(ageInputId, age.toString());
                }
            }

            // 填充性別
            if (genderInputName) {
                const gender = fhirService.getPatientGender();
                if (gender) {
                    setValue(genderInputName, gender);
                }
            }
        }

        // 自動填充 FHIR Observations
        if (options.observations && options.observations.length > 0) {
            const fields: FieldDataRequirement[] = options.observations.map(obs => ({
                code: obs.code,
                inputId: `#${obs.inputId}`,
                label: obs.label,
                targetUnit: obs.targetUnit,
                decimals: obs.decimals,
                transform: obs.transform
            }));

            await fhirService.autoPopulateFields(fields);
        }

        // 執行自定義邏輯
        if (options.afterPopulate) {
            await options.afterPopulate(fhirService, container, calculate, setValue);
        }

        // 觸發重新計算
        calculate();
    };
}

/**
 * 創建帶有 FHIR 整合的計算器初始化函數（同步版本）
 * 用於不支援 async 的計算器
 */
export function createFHIRAutoPopulateSync(options: CreateCustomInitializeOptions) {
    return (
        client: unknown,
        patient: unknown,
        container: HTMLElement,
        calculate: () => void,
        setValue: (id: string, value: string) => void
    ): void => {
        // 創建並初始化 FHIR 服務
        const fhirService = createFHIRDataService();
        fhirService.initialize(client as any, patient as any, container);

        // 自動填充患者資料（同步）
        if (options.patientFields) {
            const { ageInputId, genderInputName } = options.patientFields;

            if (ageInputId) {
                const age = fhirService.getPatientAge();
                if (age !== null) {
                    setValue(ageInputId, age.toString());
                }
            }

            if (genderInputName) {
                const gender = fhirService.getPatientGender();
                if (gender) {
                    setValue(genderInputName, gender);
                }
            }
        }

        // 異步填充 FHIR Observations（非阻塞）
        if (options.observations && options.observations.length > 0) {
            const fields: FieldDataRequirement[] = options.observations.map(obs => ({
                code: obs.code,
                inputId: `#${obs.inputId}`,
                label: obs.label,
                targetUnit: obs.targetUnit,
                decimals: obs.decimals,
                transform: obs.transform
            }));

            fhirService.autoPopulateFields(fields).then(() => {
                // 執行自定義邏輯
                if (options.afterPopulate) {
                    Promise.resolve(
                        options.afterPopulate(fhirService, container, calculate, setValue)
                    ).then(() => calculate());
                } else {
                    calculate();
                }
            });
        } else {
            // 無 FHIR 觀察資料，直接執行自定義邏輯
            if (options.afterPopulate) {
                Promise.resolve(
                    options.afterPopulate(fhirService, container, calculate, setValue)
                ).then(() => calculate());
            }
        }
    };
}

// ============================================================================
// 導出
// ============================================================================

export default {
    createFHIRAutoPopulate,
    createFHIRAutoPopulateSync
};
