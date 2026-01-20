# MEDCALC EHR - 92 个临床计算器

> 基于 FHIR 标准的医疗计算器集合，集成 EHR 系统

[![CI/CD Status](https://img.shields.io/badge/CI%2FCD-passing-brightgreen)](https://github.com/Lusnaker0730/MEDCALCEHR)
[![Tests](https://img.shields.io/badge/tests-23%20passing-success)](./tests)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4)](https://prettier.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm start
# 访问 http://localhost:8000
```

### 运行测试

```bash
npm test                # 运行所有测试
npm run test:watch      # 监视模式
npm run test:coverage   # 生成覆盖率报告
```

### 代码质量检查

```bash
npm run lint            # ESLint 检查
npm run lint:fix        # 自动修复问题
npm run format          # Prettier 格式化
npm run format:check    # 检查格式
```

## ✨ 新增功能（最近更新）

### 1. 🧪 单元测试框架

- ✅ Jest 测试环境配置完成
- ✅ 23 个单元测试，100% 通过率
- ✅ 测试覆盖 `utils.js` 和 `validator.js`
- ✅ 支持 ES 模块

### 2. 🛡️ 错误处理框架

- ✅ 统一的错误处理系统（`errorHandler.js`）
- ✅ 自定义错误类型：
    - `CalculatorError` - 计算错误
    - `FHIRDataError` - FHIR 数据错误
    - `ValidationError` - 验证错误
- ✅ 集中式错误日志记录
- ✅ 用户友好的错误消息
- ✅ 已应用到 BMI-BSA 和 CKD-EPI 计算器

### 3. ✅ 输入验证框架

- ✅ 统一的验证系统（`validator.js`）
- ✅ 预定义的医疗验证规则
- ✅ 支持自定义验证函数
- ✅ 实时验证反馈

### 4. 🤖 CI/CD 自动化

- ✅ **主 CI/CD 管道** (`.github/workflows/ci.yml`)
    - 代码质量检查 (ESLint, Prettier)
    - 自动化测试
    - 安全审计 (npm audit, Snyk)
    - 构建和部署
- ✅ **CodeQL 安全分析** (`.github/workflows/codeql.yml`)
    - JavaScript 代码安全扫描
    - 每周自动运行
- ✅ **依赖审查** (`.github/workflows/dependency-review.yml`)
    - Pull Request 依赖变更审查
    - 自动检测漏洞
    - 许可证合规性检查

## 📊 项目统计

- **计算器数量**: 92 个临床计算器
- **测试覆盖**: 23 个单元测试（100% 通过）
- **代码质量**: 0 ESLint 错误
- **CI/CD 工作流**: 3 个自动化工作流
- **FHIR 兼容性**: ✅ SMART-on-FHIR 集成

## 🏗️ 项目结构

```
MEDCALCEHR/
├── .github/
│   └── workflows/           # CI/CD 工作流
│       ├── ci.yml          # 主 CI/CD 管道
│       ├── codeql.yml      # 安全分析
│       └── dependency-review.yml
├── js/
│   ├── calculators/        # 92 个计算器
│   │   ├── bmi-bsa/       # BMI & BSA (已增强)
│   │   ├── ckd-epi/       # CKD-EPI GFR (已增强)
│   │   ├── ascvd/         # ASCVD Risk
│   │   └── ...            # 其他 89 个计算器
│   ├── errorHandler.js    # 错误处理框架
│   ├── validator.js       # 验证框架
│   ├── utils.js           # 工具函数
│   └── main.js            # 主入口
├── tests/
│   ├── setup.js           # Jest 设置
│   ├── utils.test.js      # utils 测试
│   └── validator.test.js  # validator 测试
├── style.css              # 样式文件
├── index.html             # 主页面
├── calculator.html        # 计算器页面
├── launch.html            # FHIR 启动页
├── jest.config.js         # Jest 配置
├── .eslintrc.json         # ESLint 配置
├── .prettierrc.json       # Prettier 配置
└── package.json           # 项目配置
```

## 🔧 技术栈

### 核心技术

- **前端**: Vanilla JavaScript (ES6+)
- **FHIR 客户端**: fhirclient.js
- **图表**: Chart.js

### 开发工具

- **测试**: Jest + jsdom
- **代码质量**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **安全**: CodeQL + Snyk + npm audit

## 📚 文档

- [完整任务总结](./TASK_COMPLETION_SUMMARY.md)
- [改进总结](./IMPROVEMENTS_SUMMARY.md)
- [开发指南](./DEVELOPMENT.md)
- [贡献指南](./CONTRIBUTING.md)
- [快速开始](./QUICK_START.md)

## 🧪 测试示例

### 运行特定测试

```bash
npm test -- tests/utils.test.js
```

### 生成覆盖率报告

```bash
npm run test:coverage
# 查看 coverage/lcov-report/index.html
```

### 监视模式（开发时）

```bash
npm run test:watch
```

## 🔐 安全

项目包含多层安全措施：

1. **自动安全审计**
    - npm audit 在每次 CI 运行时执行
    - Snyk 漏洞扫描
    - CodeQL 静态代码分析

2. **依赖管理**
    - 自动依赖审查
    - 许可证合规性检查
    - 定期安全更新

3. **代码质量**
    - ESLint 规则强制执行
    - 输入验证框架
    - 错误处理最佳实践

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 编写单元测试
- 更新文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- SMART Health IT - FHIR 客户端库
- Chart.js - 图表可视化
- Jest - 测试框架
- GitHub Actions - CI/CD 平台

## 📧 联系方式

**项目**: CGMH EHRCALC  
**仓库**: [https://github.com/Lusnaker0730/MEDCALCEHR](https://github.com/Lusnaker0730/MEDCALCEHR)

---

**最后更新**: 2025年10月27日  
**版本**: 1.0.0  
**状态**: ✅ 生产就绪
