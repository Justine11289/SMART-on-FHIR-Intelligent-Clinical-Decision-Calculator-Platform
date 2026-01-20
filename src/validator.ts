// js/validator.js
import { ValidationError } from './errorHandler.js';

export interface ValidationRule {
    required?: boolean;
    // 紅區 - 硬限制 (阻擋計算)
    min?: number;
    max?: number;
    message?: string;
    // 黃區 - 警告限制 (允許計算但警告)
    warnMin?: number;
    warnMax?: number;
    warningMessage?: string;
    // 其他
    pattern?: RegExp;
    custom?: (value: any, input: any) => boolean | string;
}

/**
 * 驗證結果介面
 */
export interface ValidationResult {
    isValid: boolean; // 紅區檢查結果
    errors: string[]; // 紅區錯誤訊息
    hasWarnings: boolean; // 黃區檢查結果
    warnings: string[]; // 黃區警告訊息
    fieldStatus: Record<string, 'valid' | 'warning' | 'error'>;
}

export type ValidationSchema = Record<string, ValidationRule>;

/**
 * 驗證計算器輸入
 * @param {Object} input - 輸入值對象
 * @param {Object<string, ValidationRule>} schema - 驗證規則
 * @returns {ValidationResult} 驗證結果（包含錯誤與警告）
 */
export function validateCalculatorInput(
    input: Record<string, any>,
    schema: ValidationSchema
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldStatus: Record<string, 'valid' | 'warning' | 'error'> = {};

    Object.keys(schema).forEach(key => {
        const value = input[key];
        const rule = schema[key];
        let status: 'valid' | 'warning' | 'error' = 'valid';

        // Required field validation
        if (
            rule.required &&
            (value === null ||
                value === undefined ||
                value === '' ||
                (typeof value === 'number' && Number.isNaN(value)))
        ) {
            errors.push(rule.message || `${key} is required`);
            fieldStatus[key] = 'error';
            return;
        }

        // Skip further validation if value is empty and not required
        if (
            value === null ||
            value === undefined ||
            value === '' ||
            (typeof value === 'number' && Number.isNaN(value))
        ) {
            fieldStatus[key] = 'valid';
            return;
        }

        const numValue = Number(value);

        // 紅區檢查 - 最小值
        if (rule.min !== undefined && numValue < rule.min) {
            errors.push(rule.message || `${key} must be at least ${rule.min}`);
            status = 'error';
        }
        // 紅區檢查 - 最大值
        else if (rule.max !== undefined && numValue > rule.max) {
            errors.push(rule.message || `${key} must be at most ${rule.max}`);
            status = 'error';
        }
        // 黃區檢查 - 低於警告下限
        else if (rule.warnMin !== undefined && numValue < rule.warnMin) {
            warnings.push(rule.warningMessage || `${key} is very low; double-check.`);
            status = 'warning';
        }
        // 黃區檢查 - 高於警告上限
        else if (rule.warnMax !== undefined && numValue > rule.warnMax) {
            warnings.push(rule.warningMessage || `${key} is very high; double-check.`);
            status = 'warning';
        }

        // Pattern validation (紅區)
        if (rule.pattern && !rule.pattern.test(String(value))) {
            errors.push(rule.message || `${key} format is incorrect`);
            status = 'error';
        }

        // Custom validation function
        if (rule.custom && typeof rule.custom === 'function') {
            const customResult = rule.custom(value, input);
            if (customResult !== true) {
                errors.push((customResult as string) || rule.message || `${key} validation failed`);
                status = 'error';
            }
        }

        fieldStatus[key] = status;
    });

    return {
        isValid: errors.length === 0,
        errors,
        hasWarnings: warnings.length > 0,
        warnings,
        fieldStatus
    };
}

/**
 * 常用驗證規則範本
 * 包含紅區（硬限制，阻擋計算）和黃區（警告，允許計算）
 */
export const ValidationRules: Record<string, ValidationRule> = {
    // Age validation
    age: {
        required: true,
        min: 0,
        max: 150,
        warnMin: 1,
        warnMax: 120,
        message: 'Age must be between 0-150 years',
        warningMessage: 'Age is unusual; double-check.'
    },

    // Temperature validation (°C)
    temperature: {
        required: true,
        min: 20,
        max: 45,
        warnMin: 35,
        warnMax: 40,
        message: 'Temperature must be between 20-45°C',
        warningMessage: 'Temperature is extreme; double-check.'
    },

    // Systolic Blood pressure validation
    systolicBP: {
        required: true,
        min: 50,
        max: 250,
        warnMin: 70,
        warnMax: 200,
        message: 'Systolic BP must be between 50-250 mmHg',
        warningMessage: 'Systolic BP is extreme; double-check.'
    },

    // Diastolic Blood pressure validation
    diastolicBP: {
        required: true,
        min: 30,
        max: 150,
        warnMin: 40,
        warnMax: 110,
        message: 'Diastolic BP must be between 30-150 mmHg',
        warningMessage: 'Diastolic BP is extreme; double-check.'
    },

    // Heart rate validation
    heartRate: {
        required: true,
        min: 20,
        max: 250,
        warnMin: 40,
        warnMax: 150,
        message: 'Heart rate must be between 20-250 bpm',
        warningMessage: 'Heart rate is extreme; double-check.'
    },

    // pH validation
    pH: {
        required: true,
        min: 6.5,
        max: 8.0,
        warnMin: 7.25,
        warnMax: 7.55,
        message: 'Too low/high; please change to proceed.',
        warningMessage: 'Extreme value; double-check.'
    },

    // Weight validation (kg)
    weight: {
        required: true,
        min: 0.5,
        max: 500,
        warnMin: 30,
        warnMax: 200,
        message: 'Weight must be between 0.5-500 kg',
        warningMessage: 'Weight is unusual; double-check.'
    },

    // Height validation (cm)
    height: {
        required: true,
        min: 30,
        max: 250,
        warnMin: 100,
        warnMax: 220,
        message: 'Height must be between 30-250 cm',
        warningMessage: 'Height is unusual; double-check.'
    },

    // GCS validation (no warning zone - values are bounded)
    gcs: {
        required: true,
        min: 3,
        max: 15,
        message: 'GCS score must be between 3-15'
    },

    // Glucose validation (mg/dL)
    glucose: {
        required: true,
        min: 10,
        max: 2000,
        warnMin: 50,
        warnMax: 400,
        message: 'Glucose must be between 10-2000 mg/dL',
        warningMessage: 'Glucose is extreme; double-check.'
    },

    // BUN validation (mg/dL)
    bun: {
        required: true,
        min: 1,
        max: 200,
        warnMin: 5,
        warnMax: 80,
        message: 'BUN must be between 1-200 mg/dL',
        warningMessage: 'BUN is extreme; double-check.'
    },

    // Urine sodium validation (mEq/L)
    urineSodium: {
        required: true,
        min: 1,
        max: 1000,
        warnMin: 10,
        warnMax: 200,
        message: 'Urine sodium must be between 1-1000 mEq/L',
        warningMessage: 'Urine sodium is unusual; double-check.'
    },

    // Urine potassium validation (mEq/L)
    urinePotassium: {
        required: true,
        min: 1,
        max: 500,
        warnMin: 15,
        warnMax: 150,
        message: 'Urine potassium must be between 1-500 mEq/L',
        warningMessage: 'Urine potassium is unusual; double-check.'
    },

    // Urine creatinine validation (mg/dL)
    urineCreatinine: {
        required: true,
        min: 1,
        max: 2000,
        warnMin: 20,
        warnMax: 400,
        message: 'Urine creatinine must be between 1-2000 mg/dL',
        warningMessage: 'Urine creatinine is unusual; double-check.'
    },

    // Creatinine validation (mg/dL)
    creatinine: {
        required: true,
        min: 0.1,
        max: 20,
        warnMin: 0.4,
        warnMax: 10,
        message: 'Creatinine must be between 0.1-20 mg/dL',
        warningMessage: 'Creatinine is extreme; double-check.'
    },

    // eGFR validation (mL/min/1.73m²)
    egfr: {
        required: true,
        min: 1,
        max: 200,
        warnMin: 15,
        warnMax: 120,
        message: 'eGFR must be between 1-200 mL/min/1.73m²',
        warningMessage: 'eGFR is unusual; double-check.'
    },

    // Sodium validation (mEq/L)
    sodium: {
        required: true,
        min: 100,
        max: 200,
        warnMin: 120,
        warnMax: 160,
        message: 'Too low/high; please change to proceed.',
        warningMessage: 'Very low/high; double-check.'
    },

    // Potassium validation (mEq/L)
    potassium: {
        required: true,
        min: 1.5,
        max: 10,
        warnMin: 2.5,
        warnMax: 6.5,
        message: 'Potassium must be between 1.5-10 mEq/L',
        warningMessage: 'Potassium is extreme; double-check.'
    },

    // Bilirubin validation (mg/dL)
    bilirubin: {
        required: true,
        min: 0.1,
        max: 80,
        warnMin: 0.2,
        warnMax: 30,
        message: 'Bilirubin must be between 0.1-80 mg/dL',
        warningMessage: 'Bilirubin is extreme; double-check.'
    },

    // Calcium validation (Total) (mg/dL)
    calcium: {
        required: true,
        min: 2.0,
        max: 20.0,
        warnMin: 7.0,
        warnMax: 12.0,
        message: 'Calcium must be between 2.0-20.0 mg/dL',
        warningMessage: 'Calcium is extreme; double-check.'
    },

    // INR validation
    inr: {
        required: true,
        min: 0.5,
        max: 20,
        warnMin: 0.8,
        warnMax: 6,
        message: 'INR must be between 0.5-20',
        warningMessage: 'INR is extreme; double-check.'
    },

    // Albumin validation (g/dL)
    albumin: {
        required: true,
        min: 0.5,
        max: 8.0,
        warnMin: 2.0,
        warnMax: 5.5,
        message: 'Albumin must be between 0.5-8.0 g/dL',
        warningMessage: 'Albumin is unusual; double-check.'
    },

    // Liver enzyme validation (AST/ALT) (U/L)
    liverEnzyme: {
        required: true,
        min: 1,
        max: 5000,
        warnMin: 5,
        warnMax: 500,
        message: 'Enzyme level must be between 1-5000 U/L',
        warningMessage: 'Enzyme level is extreme; double-check.'
    },

    // Platelet validation (10^9/L)
    platelets: {
        required: true,
        min: 1,
        max: 2000,
        warnMin: 50,
        warnMax: 500,
        message: 'Platelets must be between 1-2000 ×10⁹/L',
        warningMessage: 'Platelet count is extreme; double-check.'
    },

    // MAP validation (mmHg)
    map: {
        required: true,
        min: 20,
        max: 300,
        warnMin: 50,
        warnMax: 150,
        message: 'Too low/high; please change to proceed.',
        warningMessage: 'Very low/high; double-check.'
    },

    // Respiratory rate (breaths/min)
    respiratoryRate: {
        required: true,
        min: 0, // Allow for intubated patients
        max: 100,
        warnMin: 8,
        warnMax: 40,
        message: 'Respiratory rate must be between 0-100 breaths/min',
        warningMessage: 'Respiratory rate is extreme; double-check.'
    },

    // Hematocrit (Hct) (%)
    hematocrit: {
        required: true,
        min: 5,
        max: 80,
        warnMin: 20,
        warnMax: 55,
        message: 'Hematocrit must be between 5-80%',
        warningMessage: 'Hematocrit is extreme; double-check.'
    },

    // WBC count (10^9/L)
    wbc: {
        required: true,
        min: 0,
        max: 500,
        warnMin: 2,
        warnMax: 30,
        message: 'WBC must be between 0-500 ×10⁹/L',
        warningMessage: 'WBC count is extreme; double-check.'
    },

    // QT interval validation (ms)
    qtInterval: {
        required: true,
        min: 200,
        max: 800,
        warnMin: 350,
        warnMax: 500,
        message: 'QT interval must be between 200-800 ms',
        warningMessage: 'QT interval is unusual; double-check.'
    },

    // PaO2 validation (mmHg)
    paO2: {
        required: true,
        min: 10,
        max: 800,
        warnMin: 40,
        warnMax: 500,
        message: 'PaO₂ must be between 10-800 mmHg',
        warningMessage: 'PaO₂ is extreme; double-check.'
    },

    // PaCO2 validation (mmHg)
    paCO2: {
        required: true,
        min: 5,
        max: 200,
        warnMin: 25,
        warnMax: 80,
        message: 'PaCO₂ must be between 5-200 mmHg',
        warningMessage: 'PaCO₂ is extreme; double-check.'
    },

    // FiO2 validation
    fiO2: {
        required: true,
        min: 0.21,
        max: 1.0,
        message: 'FiO₂ must be between 0.21-1.0'
    },

    // Phenytoin (mcg/mL)
    phenytoin: {
        required: true,
        min: 0,
        max: 100,
        warnMin: 5,
        warnMax: 30,
        message: 'Phenytoin level must be between 0-100 mcg/mL',
        warningMessage: 'Phenytoin level is unusual; double-check.'
    },

    // Bicarbonate validation (mEq/L)
    bicarbonate: {
        required: true,
        min: 2,
        max: 60,
        warnMin: 15,
        warnMax: 35,
        message: 'HCO₃⁻ must be between 2-60 mEq/L',
        warningMessage: 'Bicarbonate is extreme; double-check.'
    },

    // Chloride validation (mEq/L)
    chloride: {
        required: true,
        min: 50,
        max: 150,
        warnMin: 90,
        warnMax: 115,
        message: 'Chloride must be between 50-150 mEq/L',
        warningMessage: 'Chloride is extreme; double-check.'
    },

    // Insulin validation (µU/mL)
    insulin: {
        required: true,
        min: 0.1,
        max: 500,
        warnMin: 2,
        warnMax: 100,
        message: 'Insulin must be between 0.1-500 µU/mL',
        warningMessage: 'Insulin level is unusual; double-check.'
    },

    // Ethanol validation (mg/dL)
    ethanol: {
        required: false,
        min: 0,
        max: 1000,
        warnMax: 400,
        message: 'Ethanol concentration must be between 0-1000 mg/dL',
        warningMessage: 'Ethanol level is very high; double-check.'
    },

    // Total Cholesterol (mg/dL)
    totalCholesterol: {
        required: true,
        min: 50,
        max: 1000,
        warnMin: 100,
        warnMax: 350,
        message: 'Total cholesterol must be between 50-1000 mg/dL',
        warningMessage: 'Cholesterol is unusual; double-check.'
    },

    // HDL (mg/dL)
    hdl: {
        required: true,
        min: 10,
        max: 200,
        warnMin: 25,
        warnMax: 100,
        message: 'HDL must be between 10-200 mg/dL',
        warningMessage: 'HDL is unusual; double-check.'
    },

    // Triglycerides (mg/dL)
    triglycerides: {
        required: true,
        min: 10,
        max: 3000,
        warnMin: 30,
        warnMax: 500,
        message: 'Triglycerides must be between 10-3000 mg/dL',
        warningMessage: 'Triglycerides are unusual; double-check.'
    },

    // Osmolality (mOsm/kg)
    osmolality: {
        required: true,
        min: 0,
        max: 2000,
        warnMin: 250,
        warnMax: 350,
        message: 'Osmolality must be between 0-2000 mOsm/kg',
        warningMessage: 'Osmolality is unusual; double-check.'
    },

    // Time (hours)
    hours: {
        required: true,
        min: 0,
        max: 168, // 1 week max reasonable cap
        warnMax: 72,
        message: 'Time must be between 0-168 hours',
        warningMessage: 'Time duration is very long; double-check.'
    },

    // Volume (mL)
    volume: {
        required: true,
        min: 0,
        max: 5000,
        warnMax: 2000,
        message: 'Volume must be between 0-5000 mL',
        warningMessage: 'Volume is very large; double-check.'
    },

    // Alcohol by volume (ABV) %
    abv: {
        required: true,
        min: 0,
        max: 100,
        warnMax: 60,
        message: 'ABV must be between 0-100%',
        warningMessage: 'ABV is very high; double-check.'
    },

    // Hemoglobin (g/dL)
    hemoglobin: {
        required: true,
        min: 1,
        max: 25,
        warnMin: 6,
        warnMax: 18,
        message: 'Hemoglobin must be between 1-25 g/dL',
        warningMessage: 'Hemoglobin is extreme; double-check.'
    }
};

/**
 * 验证并抛出错误（如果验证失败）
 * @param {Object} input - 输入值
 * @param {Object} schema - 验证规则
 * @throws {ValidationError} 如果验证失败
 */
export function validateOrThrow(input: Record<string, any>, schema: ValidationSchema): void {
    const result = validateCalculatorInput(input, schema);
    if (!result.isValid) {
        throw new ValidationError(result.errors.join('; '), { input, errors: result.errors });
    }
}

/**
 * 创建输入字段的实时验证
 * @param {HTMLInputElement} inputElement - 输入元素
 * @param {ValidationRule} rule - 验证规则
 * @param {Function} onError - 错误回调函数
 */
export function setupLiveValidation(
    inputElement: HTMLInputElement,
    rule: ValidationRule,
    onError: ((errors: string[]) => void) | null = null
): void {
    if (!inputElement) {
        return;
    }

    const validate = () => {
        const value = inputElement.value;
        const result = validateCalculatorInput({ value }, { value: rule });

        if (!result.isValid) {
            inputElement.classList.add('invalid');
            inputElement.setAttribute('aria-invalid', 'true');

            // Display error message
            let errorSpan = inputElement.nextElementSibling as HTMLElement;
            if (!errorSpan || !errorSpan.classList.contains('error-text')) {
                errorSpan = document.createElement('span');
                errorSpan.className = 'error-text';
                errorSpan.style.color = '#d32f2f';
                errorSpan.style.fontSize = '1.1rem';
                errorSpan.style.fontWeight = '500';
                errorSpan.style.marginTop = '6px';
                errorSpan.style.display = 'block';
                if (inputElement.parentNode) {
                    inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
                }
            }
            errorSpan.textContent = result.errors[0];

            if (onError) {
                onError(result.errors);
            }
        } else {
            inputElement.classList.remove('invalid');
            inputElement.removeAttribute('aria-invalid');

            // 移除错误消息
            const errorSpan = inputElement.nextElementSibling as HTMLElement;
            if (errorSpan && errorSpan.classList.contains('error-text')) {
                errorSpan.remove();
            }
        }
    };

    inputElement.addEventListener('blur', validate);
    inputElement.addEventListener('input', () => {
        // 移除错误状态但不立即验证
        inputElement.classList.remove('invalid');
        const errorSpan = inputElement.nextElementSibling as HTMLElement;
        if (errorSpan && errorSpan.classList.contains('error-text')) {
            errorSpan.remove();
        }
    });
}

/**
 * 为表单中的所有输入设置验证
 * @param {HTMLFormElement} formElement - 表单元素
 * @param {Object} schema - 验证规则
 */
export function setupFormValidation(formElement: HTMLFormElement, schema: ValidationSchema): void {
    if (!formElement) {
        return;
    }

    Object.keys(schema).forEach(key => {
        const inputElement = formElement.querySelector(`#${key}`) as HTMLInputElement;
        if (inputElement) {
            setupLiveValidation(inputElement, schema[key]);
        }
    });
}
