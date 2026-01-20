# 🛠️ 开发文档

本文档详细说明 MEDCALCEHR 项目的架构、开发流程和最佳实践。

## 📋 目录

- [项目架构](#项目架构)
- [核心模块](#核心模块)
- [计算器开发指南](#计算器开发指南)
- [FHIR 集成](#fhir-集成)
- [错误处理](#错误处理)
- [测试策略](#测试策略)
- [性能优化](#性能优化)
- [调试技巧](#调试技巧)

---

## 🏗️ 项目架构

### 文件结构

```
MEDCALCEHR/
├── index.html                  # 计算器列表页
├── calculator.html             # 单个计算器页面
├── launch.html                 # SMART on FHIR 启动页
├── style.css                   # 全局样式
├── package.json                # 项目配置
├── .eslintrc.json             # ESLint 配置
├── .prettierrc.json           # Prettier 配置
│
├── js/
│   ├── main.js                # 列表页主逻辑
│   ├── calculator-page.js     # 计算器页主逻辑
│   ├── utils.js               # FHIR 工具函数
│   ├── errorHandler.js        # 错误处理框架
│   ├── validator.js           # 输入验证框架
│   │
│   └── calculators/
│       ├── index.js           # 计算器注册表
│       ├── apache-ii/         # 单个计算器
│       │   ├── index.js       # 计算器逻辑
│       │   ├── *.nbib         # 参考文献
│       │   └── *.png          # 参考图片
│       └── ...                # 其他 91 个计算器
│
└── tests/                      # 测试文件（待添加）
    ├── utils.test.js
    └── calculators/
        └── apache-ii.test.js
```

---

## 🧩 核心模块

### 1. FHIR 客户端 (`utils.js`)

提供与 FHIR 服务器交互的工具函数：

#### 主要函数

```javascript
// 获取最近的观察数据
getMostRecentObservation(client, loincCode);

// 计算患者年龄
calculateAge(birthDate);

// 显示患者信息
displayPatientInfo(client, container);

// 获取患者条件
getPatientConditions(client, snomedCodes);

// 获取患者用药
getMedicationRequests(client);
```

#### LOINC 代码参考

| 数据类型 | LOINC 代码 | 说明                 |
| -------- | ---------- | -------------------- |
| 心率     | 8867-4     | Heart Rate           |
| 血压     | 85354-9    | Blood Pressure panel |
| 收缩压   | 8480-6     | Systolic BP          |
| 舒张压   | 8462-4     | Diastolic BP         |
| 体温     | 8310-5     | Body temperature     |
| 血糖     | 2339-0     | Glucose              |
| 肌酐     | 2160-0     | Creatinine           |
| 钠       | 2951-2     | Sodium               |
| 钾       | 2823-3     | Potassium            |
| 白细胞   | 6690-2     | WBC                  |
| 血红蛋白 | 718-7      | Hemoglobin           |
| 血小板   | 777-3      | Platelets            |

---

### 2. 错误处理 (`errorHandler.js`)

统一的错误处理机制：

#### 错误类型

```javascript
// 基础计算器错误
throw new CalculatorError('错误消息', 'ERROR_CODE', { details });

// FHIR 数据错误
throw new FHIRDataError('无法获取数据', { resource: 'Patient' });

// 验证错误
throw new ValidationError('年龄必须在 0-150 之间', { field: 'age' });
```

#### 使用示例

```javascript
import { displayError, logError } from './errorHandler.js';

try {
    // 计算逻辑
    if (!data) {
        throw new FHIRDataError('Patient data missing');
    }
} catch (error) {
    logError(error, { calculator: 'apache-ii' });
    displayError(container, error, '无法加载患者数据，请手动输入');
}
```

---

### 3. 输入验证 (`validator.js`)

标准化的输入验证：

#### 使用预定义规则

```javascript
import { validateCalculatorInput, ValidationRules } from './validator.js';

const input = {
    age: 65,
    temperature: 37.5,
    heartRate: 85
};

const schema = {
    age: ValidationRules.age,
    temperature: ValidationRules.temperature,
    heartRate: ValidationRules.heartRate
};

const result = validateCalculatorInput(input, schema);
if (!result.isValid) {
    console.error('Validation errors:', result.errors);
}
```

#### 自定义验证规则

```javascript
const customSchema = {
    systolicBP: {
        required: true,
        min: 50,
        max: 250,
        message: '收缩压必须在 50-250 mmHg 之间',
        custom: (value, allInputs) => {
            // 确保收缩压大于舒张压
            if (allInputs.diastolicBP && value <= allInputs.diastolicBP) {
                return '收缩压必须大于舒张压';
            }
            return true;
        }
    }
};
```

---

## 🧮 计算器开发指南

### 计算器接口规范

每个计算器必须实现以下接口：

```javascript
export const calculatorName = {
    // 必需：唯一 ID
    id: 'calculator-id',

    // 必需：显示标题
    title: 'Calculator Title',

    // 可选：简短描述
    description: 'What this calculator does',

    // 必需：生成 HTML
    generateHTML: function () {
        return `<!-- HTML content -->`;
    },

    // 必需：初始化逻辑
    initialize: function (client, patient, container) {
        // Setup logic
    }
};
```

### 最佳实践

#### 1. 使用 Scoped Selectors

```javascript
// ❌ 不好 - 可能与其他计算器冲突
document.getElementById('age');

// ✅ 好 - 使用容器作用域
container.querySelector('#apache-age');
```

#### 2. 自动填充患者数据

```javascript
initialize: function(client, patient, container) {
    const ageInput = container.querySelector('#calc-age');

    // 从患者资源填充
    if (patient && patient.birthDate) {
        ageInput.value = calculateAge(patient.birthDate);
    }

    // 从 FHIR 观察填充
    if (client) {
        getMostRecentObservation(client, '8867-4').then(obs => {
            if (obs && obs.valueQuantity) {
                const hrInput = container.querySelector('#calc-hr');
                hrInput.value = obs.valueQuantity.value.toFixed(0);
            }
        });
    }
}
```

#### 3. 添加公式说明

```javascript
generateHTML: function() {
    return `
        <!-- 计算器输入 -->
        <div class="input-group">...</div>

        <!-- 结果显示 -->
        <div id="result" class="result"></div>

        <!-- 公式说明 -->
        <div class="formula-section">
            <h4>📐 Formula</h4>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 10px;">
                <p style="font-family: monospace;">
                    Score = (0.037 × Age) + (0.094 × BMI) + ...
                </p>
            </div>

            <h5>Variables:</h5>
            <ul>
                <li><strong>Age:</strong> Patient age in years</li>
                <li><strong>BMI:</strong> Body Mass Index (kg/m²)</li>
            </ul>
        </div>
    `;
}
```

#### 4. 结果展示格式

```javascript
resultEl.innerHTML = `
    <div class="result-item">
        <span class="value">${score}</span>
        <span class="label">APACHE II Score</span>
    </div>
    
    <!-- 风险分层 -->
    <div style="background: ${riskColor}20; border-left: 4px solid ${riskColor}; padding: 15px;">
        <div style="font-weight: 600; color: ${riskColor};">
            Risk Category: ${riskLevel}
        </div>
        <div style="font-size: 0.9em; margin-top: 8px;">
            ${interpretation}
        </div>
    </div>
`;
```

---

## 🔗 FHIR 集成

### SMART on FHIR 流程

```
用户访问 index.html
    ↓ (无 FHIR 会话)
重定向到 launch.html
    ↓
调用 FHIR.oauth2.authorize()
    ↓
重定向到 SMART 授权服务器
    ↓
用户选择患者并授权
    ↓
重定向回 index.html (带 state 参数)
    ↓
调用 FHIR.oauth2.ready()
    ↓
获取 FHIR 客户端
    ↓
加载患者数据和计算器
```

### 处理 FHIR 错误

```javascript
async function fetchPatientData(client) {
    try {
        const patient = await client.patient.read();
        return patient;
    } catch (error) {
        // FHIR 服务器不可用
        if (error.status === 503) {
            console.warn('FHIR server unavailable, using cached data');
            return JSON.parse(sessionStorage.getItem('patientData'));
        }

        // 未授权
        if (error.status === 401) {
            console.error('FHIR authorization expired');
            window.location.href = 'launch.html';
            return null;
        }

        throw new FHIRDataError('Failed to fetch patient data', { error });
    }
}
```

---

## 🧪 测试策略

### 单元测试示例

```javascript
// tests/utils.test.js
import { calculateAge } from '../js/utils.js';

describe('calculateAge', () => {
    it('should calculate age correctly', () => {
        const birthDate = '1990-01-01';
        const age = calculateAge(birthDate);
        expect(age).toBeGreaterThan(30);
        expect(age).toBeLessThan(40);
    });

    it('should handle leap years', () => {
        const birthDate = '2000-02-29';
        const age = calculateAge(birthDate);
        expect(age).toBeGreaterThan(20);
    });
});
```

### 计算器测试示例

```javascript
// tests/calculators/apache-ii.test.js
import { apacheIi } from '../js/calculators/apache-ii/index.js';

describe('APACHE II Calculator', () => {
    it('should calculate score correctly', () => {
        const inputs = {
            age: 65,
            temp: 37.5,
            map: 85,
            pH: 7.35
            // ...other inputs
        };

        const score = calculateAPACHEII(inputs);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThan(72);
    });

    it('should handle missing data gracefully', () => {
        const inputs = { age: 65 };
        expect(() => calculateAPACHEII(inputs)).toThrow(ValidationError);
    });
});
```

---

## ⚡ 性能优化

### 1. 懒加载计算器

```javascript
// calculator-page.js
const calculatorMap = {
    'apache-ii': () => import('./calculators/apache-ii/index.js').then(m => m.apacheIi),
    'wells-pe': () => import('./calculators/wells-pe/index.js').then(m => m.wellsPE)
};

// 仅在需要时加载
const calculator = await calculatorMap[calcId]();
```

### 2. 缓存患者数据

```javascript
// utils.js
export function displayPatientInfo(client, patientInfoDiv) {
    // 先从缓存加载
    const cachedPatient = sessionStorage.getItem('patientData');
    if (cachedPatient) {
        renderPatient(JSON.parse(cachedPatient));
    }

    // 然后从 FHIR 刷新
    if (client) {
        client.patient.read().then(patient => {
            sessionStorage.setItem('patientData', JSON.stringify(patient));
            renderPatient(patient);
        });
    }
}
```

### 3. 防抖输入

```javascript
let debounceTimer;
inputElement.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        // 执行计算
        calculate();
    }, 300); // 300ms 延迟
});
```

---

## 🐛 调试技巧

### 1. 启用详细日志

在开发环境中，所有错误都会显示详细堆栈：

```javascript
// errorHandler.js 已自动检测
if (window.location.hostname === 'localhost') {
    // 显示详细日志
}
```

### 2. Chrome DevTools FHIR 调试

1. 打开 Network 标签
2. 筛选 "fhir"
3. 查看 Request/Response

### 3. 测试计算器而不启动 FHIR

```javascript
// 在 calculator.html 中添加
<script>
    // 测试数据
    const mockPatient = {
        birthDate: '1960-01-01',
        gender: 'male',
        name: [{ given: ['Test'], family: 'Patient' }]
    };

    // 直接初始化计算器
    calculator.initialize(null, mockPatient, container);
</script>
```

---

## 📚 参考资源

- [SMART on FHIR Documentation](https://docs.smarthealthit.org/)
- [FHIR R4 Specification](https://www.hl7.org/fhir/)
- [LOINC Code System](https://loinc.org/)
- [SNOMED CT Browser](https://browser.ihtsdotools.org/)

---

## 💡 常见问题

### Q: 如何在本地测试 FHIR 集成？

A: 使用 SMART Health IT 提供的测试沙盒：

```
https://launch.smarthealthit.org/
```

### Q: 如何添加新的 LOINC 代码？

A: 在 `utils.js` 中使用 `getMostRecentObservation(client, 'LOINC-CODE')`

### Q: 如何处理单位转换？

A: 使用 `utils.js` 中的转换函数：

```javascript
convertToMmolL(valueMgDl, 'glucose');
convertToMgDl(valueMmolL, 'glucose');
```

---

Happy Coding! 🎉
