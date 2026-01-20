# 🤝 贡献指南

感谢您对 MEDCALCEHR 项目的贡献！本指南将帮助您快速开始。

## 📋 目录

- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交信息规范](#提交信息规范)
- [Pull Request 流程](#pull-request-流程)
- [如何添加新计算器](#如何添加新计算器)

---

## 🔧 开发环境设置

### 前置要求

- Node.js 16+ 和 npm 8+
- Git
- 文本编辑器 (推荐 VS Code)

### 设置步骤

1. **Fork 仓库**

    ```bash
    # 访问 https://github.com/Lusnaker0730/MEDCALCEHR
    # 点击 Fork 按钮
    ```

2. **克隆您的 Fork**

    ```bash
    git clone https://github.com/YOUR_USERNAME/MEDCALCEHR.git
    cd MEDCALCEHR
    ```

3. **安装依赖**

    ```bash
    npm install
    ```

4. **运行开发服务器**

    ```bash
    npm start
    # 访问 http://localhost:8000
    ```

5. **运行测试**
    ```bash
    npm test
    ```

---

## 📝 代码规范

### JavaScript 风格

我们使用 ESLint 和 Prettier 来保持代码一致性：

```bash
# 检查代码风格
npm run lint

# 自动修复问题
npm run lint:fix

# 格式化代码
npm run format
```

### 命名约定

- **文件名**: 使用 `kebab-case` (例如: `apache-ii/index.js`)
- **变量/函数**: 使用 `camelCase` (例如: `calculateAge`)
- **类名**: 使用 `PascalCase` (例如: `CalculatorError`)
- **常量**: 使用 `UPPER_SNAKE_CASE` (例如: `MAX_AGE`)

### 代码注释

使用 JSDoc 风格的注释：

```javascript
/**
 * 计算患者年龄
 * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
 * @returns {number} 年龄（岁）
 * @example
 * const age = calculateAge('1990-01-01');
 */
export function calculateAge(birthDate) {
    // 实现...
}
```

---

## 💬 提交信息规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 格式

```
<类型>(<范围>): <简短描述>

[可选的详细描述]

[可选的脚注]
```

### 类型

- **feat**: 新功能
- **fix**: Bug 修复
- **docs**: 文档更改
- **style**: 代码格式（不影响代码运行的变动）
- **refactor**: 重构（既不是新增功能，也不是修改bug的代码变动）
- **test**: 增加测试
- **chore**: 构建过程或辅助工具的变动

### 示例

```bash
# 添加新功能
git commit -m "feat(calculators): add TIMI risk score calculator"

# 修复 Bug
git commit -m "fix(apache-ii): correct GCS scoring range"

# 更新文档
git commit -m "docs(README): add installation instructions"

# 代码重构
git commit -m "refactor(utils): extract common FHIR fetching logic"
```

---

## 🔀 Pull Request 流程

### 1. 创建新分支

```bash
git checkout -b feature/my-new-calculator
# 或
git checkout -b fix/apache-ii-scoring
```

### 2. 进行更改并提交

```bash
# 确保代码符合规范
npm run lint
npm run format

# 运行测试
npm test

# 提交更改
git add .
git commit -m "feat(calculators): add my new calculator"
```

### 3. 推送到您的 Fork

```bash
git push origin feature/my-new-calculator
```

### 4. 创建 Pull Request

1. 访问您的 Fork 页面
2. 点击 "New Pull Request"
3. 填写 PR 描述:
    - 简要说明更改内容
    - 列出相关的 issue 编号
    - 添加测试说明
    - 附上截图（如果是 UI 更改）

### PR 描述模板

```markdown
## 📝 更改描述

简要描述此 PR 的内容...

## 🎯 相关 Issue

Closes #123

## ✅ 测试清单

- [ ] 单元测试通过
- [ ] 手动测试通过
- [ ] 代码已格式化
- [ ] 文档已更新

## 📸 截图

（如适用）

## 💭 额外备注

（如有其他需要说明的内容）
```

---

## 🧮 如何添加新计算器

### 1. 创建计算器文件夹

```bash
mkdir js/calculators/my-calculator
cd js/calculators/my-calculator
touch index.js
```

### 2. 实现计算器模块

```javascript
// js/calculators/my-calculator/index.js
import { getMostRecentObservation, calculateAge } from '../../utils.js';
import { validateCalculatorInput, ValidationRules } from '../../validator.js';
import { CalculatorError, displayError } from '../../errorHandler.js';

export const myCalculator = {
    id: 'my-calculator',
    title: 'My Calculator Name',
    description: 'Brief description of what this calculator does',

    generateHTML: function () {
        return `
            <h3>${this.title}</h3>
            <p class="description">${this.description}</p>
            
            <div class="input-group">
                <label for="my-calc-age">Age (years)</label>
                <input type="number" id="my-calc-age" min="0" max="150">
            </div>
            
            <button id="calculate-my-calc">Calculate</button>
            <div id="my-calc-result" class="result" style="display:none;"></div>
            
            <!-- 添加公式说明 -->
            <div class="formula-section">
                <h4>Formula</h4>
                <p>Detailed formula explanation...</p>
            </div>
        `;
    },

    initialize: function (client, patient, container) {
        const ageInput = container.querySelector('#my-calc-age');
        const resultEl = container.querySelector('#my-calc-result');
        const calculateBtn = container.querySelector('#calculate-my-calc');

        // 自动填充患者数据
        if (patient && patient.birthDate) {
            ageInput.value = calculateAge(patient.birthDate);
        }

        // 计算逻辑
        calculateBtn.addEventListener('click', () => {
            try {
                // 验证输入
                const input = { age: ageInput.value };
                const validation = validateCalculatorInput(input, {
                    age: ValidationRules.age
                });

                if (!validation.isValid) {
                    throw new CalculatorError(validation.errors.join(', '), 'VALIDATION_ERROR');
                }

                // 执行计算
                const age = parseInt(ageInput.value);
                const result = age * 2; // 示例计算

                // 显示结果
                resultEl.innerHTML = `
                    <div class="result-item">
                        <span class="value">${result}</span>
                        <span class="label">Result</span>
                    </div>
                `;
                resultEl.style.display = 'block';
            } catch (error) {
                displayError(resultEl, error);
            }
        });
    }
};
```

### 3. 注册计算器

在 `js/calculators/index.js` 中添加：

```javascript
export const calculatorModules = [
    // ...existing calculators...
    { id: 'my-calculator', title: 'My Calculator Name' }
].sort((a, b) => a.title.localeCompare(b.title));
```

### 4. 动态导入配置

在 `js/calculator-page.js` 中的 `calculatorMap` 添加：

```javascript
const calculatorMap = {
    // ...existing calculators...
    'my-calculator': () => import('./calculators/my-calculator/index.js').then(m => m.myCalculator)
};
```

### 5. 添加测试

创建 `tests/calculators/my-calculator.test.js`:

```javascript
import { myCalculator } from '../../js/calculators/my-calculator/index.js';

describe('My Calculator', () => {
    it('should calculate correctly', () => {
        // 测试代码
    });
});
```

### 6. 添加文档

如果计算器有特殊的临床意义，添加：

- 参考文献（`.nbib` 或 `.ris` 文件）
- 参考图片（`.png` 或 `.jpg` 文件）

---

## ✅ 代码审查清单

在提交 PR 前，请确保：

- [ ] 代码通过 ESLint 检查
- [ ] 代码已使用 Prettier 格式化
- [ ] 添加了适当的 JSDoc 注释
- [ ] 包含单元测试（如适用）
- [ ] 测试全部通过
- [ ] 更新了相关文档
- [ ] 遵循了命名约定
- [ ] 使用了错误处理框架
- [ ] 添加了输入验证
- [ ] 包含公式说明和参考文献

---

## 🐛 报告 Bug

如果您发现 Bug，请创建 Issue 并包含：

1. **Bug 描述**: 简要描述问题
2. **重现步骤**: 如何重现此 Bug
3. **预期行为**: 应该发生什么
4. **实际行为**: 实际发生了什么
5. **环境信息**: 浏览器、操作系统等
6. **截图**: 如果适用

---

## 💡 功能建议

如果您有新功能建议，请创建 Issue 并包含：

1. **功能描述**: 您想要什么功能
2. **用例**: 为什么需要这个功能
3. **可能的实现**: 您认为如何实现（可选）

---

## 📞 联系方式

如有任何问题，请：

- 创建 GitHub Issue
- 发送邮件至: [your-email@example.com]

感谢您的贡献！🎉
