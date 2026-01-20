/**
 * 公式計算器類型定義
 *
 * 適用於 createUnifiedFormulaCalculator 工廠函數
 * 支援 Simple 和 Complex 兩種計算模式
 */

import type {
    AlertSeverity,
    BaseCalculatorConfig,
    CalculationMode,
    FHIRAutoPopulateConfig,
    FormulaReferenceItem,
    UnitToggleConfig,
    FHIRClientType,
    PatientType,
    FormulaSectionConfig
} from './calculator-base.js';

// ==========================================
// 輸入配置類型
// ==========================================

/** 數字輸入配置 */
export interface NumberInputConfig {
    /** 輸入類型 (可省略，由結構推斷) */
    type?: 'number';
    /** 輸入 ID */
    id: string;
    /** 輸入標籤 */
    label: string;
    /** 標準單位（計算時使用） */
    standardUnit?: string;
    /** 顯示單位（無切換時） */
    unit?: string;
    /** 單位切換配置 */
    unitConfig?: UnitToggleConfig;
    /** 單位切換配置（別名，向後兼容） */
    unitToggle?: UnitToggleConfig;
    /** 驗證類型 (對應 ValidationRules 的 key，如 'pH', 'sodium') */
    validationType?: string;
    /** 預設值占位符 */
    placeholder?: string;
    /** 最小值 */
    min?: number;
    /** 最大值 */
    max?: number;
    /** 步進值 */
    step?: number;
    /** LOINC 代碼 (用於 FHIR 自動填入) */
    loincCode?: string;
    /** 幫助文字 */
    helpText?: string;
    /** 是否必填 */
    required?: boolean;
}

/** Radio 選項 */
export interface RadioOptionItem {
    /** 選項值 */
    value: string;
    /** 顯示標籤 */
    label: string;
    /** 是否預設選中 */
    checked?: boolean;
}

/** Radio 輸入配置 */
export interface RadioInputConfig {
    /** 輸入類型 */
    type?: 'radio';
    /** ID (用作 name 屬性) */
    id?: string;
    /** name 屬性 */
    name?: string;
    /** 輸入標籤 */
    label: string;
    /** 選項列表 */
    options: RadioOptionItem[];
    /** 幫助文字 */
    helpText?: string;
    /** LOINC code for FHIR auto-population */
    loincCode?: string;
    /** SNOMED code for FHIR auto-population */
    snomedCode?: string;
}

/** Select 選項 */
export interface SelectOptionItem {
    /** 選項值 */
    value: string;
    /** 顯示標籤 */
    label: string;
}

/** Select 輸入配置 */
export interface SelectInputConfig {
    /** 輸入類型 */
    type?: 'select';
    /** 輸入 ID */
    id: string;
    /** 輸入標籤 */
    label: string;
    /** 選項列表 */
    options: SelectOptionItem[];
    /** 預設值 */
    defaultValue?: string;
    /** 幫助文字 */
    helpText?: string;
    /** LOINC code for FHIR auto-population */
    loincCode?: string;
    /** SNOMED code for FHIR auto-population */
    snomedCode?: string;
}

/** Checkbox 選項 */
export interface CheckboxOptionItem {
    /** 選項值 */
    value: string;
    /** 顯示標籤 */
    label: string;
    /** 描述文字 */
    description?: string;
    /** 是否預設選中 */
    checked?: boolean;
}

/** Checkbox 輸入配置 */
export interface CheckboxInputConfig {
    /** 輸入類型 */
    type: 'checkbox';
    /** ID (單個) 或 Name (群組) */
    id: string;
    /** 輸入標籤 */
    label: string;
    /** 選項列表 (若存在則為群組) */
    options?: CheckboxOptionItem[];
    /** 值 (單個 checkbox) */
    value?: string;
    /** 描述 (單個 checkbox) */
    description?: string;
    /** 是否預設選中 (單個 checkbox) */
    checked?: boolean;
    /** 幫助文字 */
    helpText?: string;
}

/** 輸入配置類型 (聯合類型) */
export type InputConfig =
    | NumberInputConfig
    | RadioInputConfig
    | SelectInputConfig
    | CheckboxInputConfig
    | string;

// ==========================================
// 區塊配置
// ==========================================

/** 輸入區塊配置 */
export interface InputSectionConfig {
    /** 區塊標題 */
    title: string;
    /** 副標題 */
    subtitle?: string;
    /** 圖示 */
    icon?: string;
    /** 區塊內的輸入欄位 */
    fields: InputConfig[];
}

// ==========================================
// 計算結果類型
// ==========================================

/** 簡單計算結果項目 */
export interface FormulaResultItem {
    /** 結果標籤 */
    label: string;
    /** 結果值 */
    value: number | string;
    /** 單位 */
    unit?: string;
    /** 結果解讀 */
    interpretation?: string;
    /** 警示樣式 */
    alertClass?: AlertSeverity;
    /** 警示負載 (如自定義 HTML 或 AlertConfig) */
    alertPayload?: any;
}

/** 複雜計算結果 */
export interface ComplexCalculationResult {
    /** 分數 */
    score?: number;
    /** 數值 */
    value?: number;
    /** 結果解讀 */
    interpretation?: string;
    /** 嚴重程度 */
    severity: AlertSeverity;
    /** 計算分解說明 */
    breakdown?: string;
    /** 額外結果項目 */
    additionalResults?: Array<{
        label: string;
        value: string;
        unit?: string;
    }>;
}

// ==========================================
// 計算函數類型
// ==========================================

/** 取得原始值函數 */
export type GetValueFn = (id: string) => number | null;

/** 取得標準化值函數 */
export type GetStdValueFn = (id: string, unit: string) => number | null;

/** 取得 Radio 值函數 */
export type GetRadioValueFn = (name: string) => string | null;

/** 取得 Checkbox 值函數 */
export type GetCheckboxValueFn = (id: string) => boolean;

/** 簡單計算函數類型 */
export type SimpleCalculateFn = (
    values: Record<string, number | string | boolean>
) => FormulaResultItem[] | null;

/** 複雜計算函數類型 */
export type ComplexCalculateFn = (
    getValue: GetValueFn,
    getStdValue: GetStdValueFn,
    getRadioValue: GetRadioValueFn,
    getCheckboxValue: GetCheckboxValueFn
) => ComplexCalculationResult | null;

// ==========================================
// 主要配置介面
// ==========================================

/** 公式計算器配置 */
export interface FormulaCalculatorConfig extends BaseCalculatorConfig {
    /**
     * 計算模式
     * - 'simple': 使用扁平的 inputs 陣列和簡單的 values 物件
     * - 'complex': 使用區塊化的 sections 和輔助函數
     * @default 自動判斷 (有 sections 為 complex，有 inputs 為 simple)
     */
    mode?: CalculationMode;

    /** 扁平輸入列表 (simple 模式) */
    inputs?: InputConfig[];

    /** 區塊化輸入 (complex 模式) */
    sections?: InputSectionConfig[];

    /** 簡單計算函數 */
    calculate?: SimpleCalculateFn;

    /** 複雜計算函數 */
    complexCalculate?: ComplexCalculateFn;

    /** Formula Section (Rich HTML table/list) */
    formulaSection?: FormulaSectionConfig;

    /** 公式參考 (Legacy Simple List) */
    formulas?: FormulaReferenceItem[];

    /** 自定義結果渲染器 */
    customResultRenderer?: (results: FormulaResultItem[]) => string;

    /** 結果標題 */
    resultTitle?: string;

    /** 底部 HTML */
    footerHTML?: string;

    /** FHIR 自動填入配置 */
    fhirAutoPopulate?: FHIRAutoPopulateConfig[];

    /** 自動填入年齡欄位 ID */
    autoPopulateAge?: string;

    /** 自動填入性別欄位 ID */
    autoPopulateGender?: string;

    /** 自定義初始化函數 */
    customInitialize?: (
        client: FHIRClientType | null,
        patient: PatientType | null,
        container: HTMLElement,
        calculate: () => void
    ) => void;
}

// ==========================================
// 向後兼容別名
// ==========================================

/** @deprecated 使用 NumberInputConfig */
export type FormulaNumberInputConfig = NumberInputConfig;
/** @deprecated 使用 RadioInputConfig */
export type FormulaRadioInputConfig = RadioInputConfig;
/** @deprecated 使用 SelectInputConfig */
export type FormulaSelectInputConfig = SelectInputConfig;
/** @deprecated 使用 InputConfig */
export type FormulaInputConfig = InputConfig;
/** @deprecated 使用 FormulaCalculatorConfig */
export type FormulaConfig = FormulaCalculatorConfig;
/** @deprecated 使用 NumberInputConfig */
export type InputFieldConfig = NumberInputConfig;
/** @deprecated 使用 RadioInputConfig */
export type RadioFieldConfig = RadioInputConfig;
/** @deprecated 使用 InputSectionConfig */
export type InputSection = InputSectionConfig;
/** @deprecated 使用 FormulaCalculatorConfig */
export type ComplexFormulaCalculatorConfig = FormulaCalculatorConfig;
/** @deprecated 使用 ComplexCalculationResult */
export type CalculationResult = ComplexCalculationResult;
