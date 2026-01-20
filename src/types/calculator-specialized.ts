/**
 * 專用計算器類型定義
 *
 * 包含特殊用途的計算器類型：
 * - 換算計算器 (Conversion Calculator)
 * - 動態列表計算器 (Dynamic List Calculator)
 * - 條件式評分計算器 (Conditional Score Calculator)
 * - 混合輸入計算器 (Mixed Input Calculator)
 */

import type {
    AlertSeverity,
    BaseCalculatorConfig,
    BaseRiskLevel,
    FieldDataRequirement,
    UnitToggleConfig,
    FHIRClientType,
    PatientType
} from './calculator-base.js';

// ==========================================
// 換算計算器類型
// ==========================================

/** 藥物選項 */
export interface DrugOption {
    /** 藥物識別碼 */
    id: string;
    /** 顯示名稱 */
    name: string;
    /** 等效劑量（相對於基準藥物） */
    equivalentDose: number;
    /** 換算範圍（可選，用於不確定性換算） */
    conversionRange?: [number, number];
}

/** 藥物換算矩陣 */
export interface ConversionMatrix {
    [fromDrug: string]: {
        [toDrug: string]: {
            factor: number;
            range?: [number, number];
        };
    };
}

/** 換算表配置 */
export interface ConversionTableConfig {
    /** 是否顯示換算表 */
    show: boolean;
    /** 表格標題 */
    title?: string;
    /** 是否固定第一欄 */
    stickyFirstColumn?: boolean;
}

/** 換算結果 */
export interface ConversionResult {
    /** 來源藥物 */
    fromDrug: DrugOption;
    /** 目標藥物 */
    toDrug: DrugOption;
    /** 來源劑量 */
    fromDose: number;
    /** 目標劑量 */
    toDose: number;
    /** 範圍最小值 */
    rangeMin?: number;
    /** 範圍最大值 */
    rangeMax?: number;
}

/** 換算計算器配置 */
export interface ConversionCalculatorConfig extends BaseCalculatorConfig {
    /** 藥物列表 */
    drugs: DrugOption[];
    /** 換算矩陣（可選） */
    conversionMatrix?: ConversionMatrix;
    /** 換算表配置 */
    conversionTable?: ConversionTableConfig;
    /** 是否顯示換算範圍 */
    showRange?: boolean;
    /** 單位 */
    unit?: string;
    /** 警告提示 */
    warningAlert?: string;
    /** 額外資訊（HTML） */
    additionalInfo?: string;
    /** 自訂結果渲染函數 */
    customResultRenderer?: (result: ConversionResult) => string;
}

// ==========================================
// 動態列表計算器類型
// ==========================================

/** 動態列表項目選項 */
export interface DynamicListItemOption {
    /** 選項值 */
    value: string;
    /** 顯示標籤 */
    label: string;
    /** 換算因子 */
    factor: number;
}

/** 動態列表風險等級 */
export interface DynamicListRiskLevel {
    /** 最小值 */
    minValue: number;
    /** 最大值 */
    maxValue: number;
    /** 標籤 */
    label: string;
    /** 嚴重程度 */
    severity: AlertSeverity;
    /** 建議 */
    recommendation?: string;
}

/** 動態列表計算器配置 */
export interface DynamicListCalculatorConfig extends BaseCalculatorConfig {
    /** 項目選項列表 */
    itemOptions: DynamicListItemOption[];
    /** 項目標籤（如 "Opioid"） */
    itemLabel: string;
    /** 數值標籤（如 "Daily Dose"） */
    valueLabel: string;
    /** 數值單位（如 "mg/day"） */
    valueUnit?: string;
    /** 結果標籤（如 "Total Daily MME"） */
    resultLabel: string;
    /** 結果單位（如 "MME/day"） */
    resultUnit?: string;
    /** 風險等級 */
    riskLevels?: DynamicListRiskLevel[];
    /** 新增按鈕文字 */
    addButtonText?: string;
    /** 警告提示 */
    warningAlert?: string;
    /** 額外資訊（HTML） */
    additionalInfo?: string;
    /** 自訂結果渲染函數 */
    customResultRenderer?: (
        total: number,
        items: Array<{ option: string; value: number }>
    ) => string;
}

// ==========================================
// 條件式評分計算器類型
// ==========================================

/** 條件式評分選項 */
export interface ConditionalScoreOption {
    /** 標籤 */
    label: string;
    /** 值 */
    value: number;
    /** 是否預設選中 */
    checked?: boolean;
}

/** 條件式評分項目 */
export interface ConditionalScoreCriterion {
    /** 項目識別碼 */
    id: string;
    /** 項目標籤 */
    label: string;
    /** 選項列表（如果提供） */
    options?: ConditionalScoreOption[];
    /** Yes/No 類型的「是」分數 */
    yesScore?: number;
    /** Yes/No 類型的「否」分數 */
    noScore?: number;
    /** 條件函數（決定是否顯示此項目） */
    condition?: (context: Record<string, string>) => boolean;
}

/** 條件式評分類別 */
export interface ConditionalScoreCategory {
    /** 類別標題 */
    title: string;
    /** 評分項目列表 */
    criteria: ConditionalScoreCriterion[];
}

/** 條件式評分解釋 */
export interface ConditionalScoreInterpretation {
    /** 最低分數 */
    minScore: number;
    /** 最高分數 */
    maxScore: number;
    /** 標籤 */
    label: string;
    /** 描述 */
    description: string;
    /** 嚴重程度 */
    severity: AlertSeverity;
}

/** 條件選擇器配置 */
export interface ConditionSelectorConfig {
    /** 名稱 */
    name: string;
    /** 標籤 */
    label: string;
    /** 選項 */
    options: Array<{
        value: string;
        label: string;
        checked?: boolean;
    }>;
}

/** 條件式 FHIR 自動填入配置 */
export interface ConditionalFHIRAutoPopulate {
    /** 評分項目 ID */
    criterionId: string;
    /** LOINC 代碼 */
    loincCode: string;
    /** 值映射函數 */
    valueMapper: (value: number) => number;
}

/** 條件式評分計算器配置 */
export interface ConditionalScoreCalculatorConfig extends BaseCalculatorConfig {
    /** 條件選擇器 */
    conditionSelector: ConditionSelectorConfig;
    /** 評分類別 */
    categories: ConditionalScoreCategory[];
    /** 結果解讀 */
    interpretations: ConditionalScoreInterpretation[];
    /** 評分表（HTML） */
    scoringTable?: string;
    /** FHIR 自動填入配置 */
    fhirAutoPopulate?: ConditionalFHIRAutoPopulate[];
}

// ==========================================
// 混合輸入計算器類型
// ==========================================

/** 混合輸入數字配置 */
export interface MixedNumberInputConfig {
    /** 類型 */
    type: 'number';
    /** ID */
    id: string;
    /** 標籤 */
    label: string;
    /** 單位 */
    unit?: string;
    /** 占位符 */
    placeholder?: string;
    /** 步進值 */
    step?: number;
    /** 最小值 */
    min?: number;
    /** 最大值 */
    max?: number;
    /** 幫助文字 */
    helpText?: string;
    /** LOINC 代碼 */
    loincCode?: string;
    /** 單位切換配置 */
    unitToggle?: UnitToggleConfig;
}

/** 混合輸入 Radio 選項 */
export interface MixedRadioOptionConfig {
    /** 值 */
    value: string;
    /** 標籤 */
    label: string;
    /** 是否預設選中 */
    checked?: boolean;
}

/** 混合輸入 Radio 組配置 */
export interface MixedRadioGroupConfig {
    /** 類型 */
    type: 'radio';
    /** 名稱 */
    name: string;
    /** 標籤 */
    label: string;
    /** 幫助文字 */
    helpText?: string;
    /** 選項列表 */
    options: MixedRadioOptionConfig[];
}

/** 混合輸入 Select 選項 */
export interface MixedSelectOptionConfig {
    /** 值 */
    value: string;
    /** 標籤 */
    label: string;
}

/** 混合輸入 Select 配置 */
export interface MixedSelectConfig {
    /** 類型 */
    type: 'select';
    /** ID */
    id: string;
    /** 標籤 */
    label: string;
    /** 幫助文字 */
    helpText?: string;
    /** 選項列表 */
    options: MixedSelectOptionConfig[];
}

/** 混合輸入項類型 */
export type MixedInputItemConfig =
    | MixedNumberInputConfig
    | MixedRadioGroupConfig
    | MixedSelectConfig;

/** 混合輸入區塊配置 */
export interface MixedSectionConfig {
    /** 標題 */
    title: string;
    /** 圖示 */
    icon?: string;
    /** 副標題 */
    subtitle?: string;
    /** 輸入項列表 */
    inputs: MixedInputItemConfig[];
}

/** 混合輸入計算結果 */
export interface MixedCalculationResult {
    /** 分數 */
    score: number;
    /** 輸入值 */
    values: Record<string, number | string | null>;
}

/** 混合輸入風險等級 */
/** 混合輸入風險等級 */
export type MixedRiskLevel = BaseRiskLevel;

/** 混合輸入 FHIR 數據需求 */
export interface MixedFHIRDataRequirements {
    /** 觀察值需求 */
    observations?: FieldDataRequirement[];
    /** 自動填充年齡 */
    autoPopulateAge?: {
        inputId: string;
    };
    /** 自動填充性別 */
    autoPopulateGender?: {
        radioName: string;
        maleValue: string;
        femaleValue: string;
    };
}

/** 混合輸入計算器配置 */
export interface MixedInputCalculatorConfig extends BaseCalculatorConfig {
    /** 輸入區塊列表 */
    sections: MixedSectionConfig[];
    /** 風險等級列表 */
    riskLevels: MixedRiskLevel[];
    /** 計算函數 */
    calculate: (values: Record<string, number | string | null>) => MixedCalculationResult;
    /** 自定義結果渲染函數 */
    customResultRenderer?: (result: MixedCalculationResult) => string;
    /** FHIR 數據需求 */
    dataRequirements?: MixedFHIRDataRequirements;
    /** 公式項目 */
    formulaItems?: Array<{
        title: string;
        formulas?: string[];
        content?: string;
        notes?: string;
    }>;
    /** 解釋說明 */
    interpretationInfo?: string;
}

// ==========================================
// 向後兼容別名
// ==========================================

/** @deprecated 使用 DynamicListItemOption */
export type ItemOption = DynamicListItemOption;
/** @deprecated 使用 ConditionalScoreOption */
export type ScoreOption = ConditionalScoreOption;
/** @deprecated 使用 ConditionalScoreCriterion */
export type ScoreCriterion = ConditionalScoreCriterion;
/** @deprecated 使用 ConditionalScoreCategory */
export type ScoreCategory = ConditionalScoreCategory;
/** @deprecated 使用 ConditionalScoreInterpretation */
export type ScoreInterpretation = ConditionalScoreInterpretation;
