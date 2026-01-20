# 🚀 快速开始指南

本指南帮助您在 5 分钟内启动 MEDCALCEHR 项目。

## ⚡ 三步启动

### 1️⃣ 安装依赖

```bash
npm install
```

### 2️⃣ 启动开发服务器

```bash
npm start
```

### 3️⃣ 在浏览器中打开

访问: http://localhost:8000

---

## 🎯 主要命令

| 命令               | 说明                                 |
| ------------------ | ------------------------------------ |
| `npm start`        | 启动开发服务器 (端口 8000)           |
| `npm test`         | 运行测试套件                         |
| `npm run lint`     | 检查代码风格                         |
| `npm run lint:fix` | 自动修复代码风格问题                 |
| `npm run format`   | 格式化代码                           |
| `npm run validate` | 运行全部检查（lint + format + test） |

---

## 🧪 测试 SMART on FHIR

1. 启动本地服务器:

    ```bash
    npm start
    ```

2. 访问 SMART Health IT Launcher:

    ```
    https://launch.smarthealthit.org/
    ```

3. 配置启动参数:
    - **App Launch URL**: `http://localhost:8000/launch.html`
    - **Provider**: 任意
    - **Patient**: 任意患者

4. 点击 "Launch" 按钮

5. 应用将自动加载患者数据并显示计算器列表

---

## 📝 添加新计算器（快速版）

```bash
# 1. 创建文件夹
mkdir js/calculators/my-calc

# 2. 创建 index.js
# 使用模板: 参考 js/calculators/bmi-bsa/index.js

# 3. 注册计算器
# 编辑 js/calculators/index.js 添加你的计算器

# 4. 添加动态导入
# 编辑 js/calculator-page.js 的 calculatorMap
```

详细指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🔧 故障排除

### 问题: 端口 8000 已被占用

```bash
# 使用其他端口
npx http-server -p 8080
```

### 问题: FHIR 数据无法加载

- 检查浏览器控制台是否有 CORS 错误
- 确保从 SMART Launcher 启动应用
- 清除浏览器 sessionStorage 并重新启动

### 问题: ESLint 报错太多

```bash
# 自动修复大部分问题
npm run lint:fix

# 格式化代码
npm run format
```

---

## 📚 更多资源

- [完整文档](README.md)
- [贡献指南](CONTRIBUTING.md)
- [开发文档](DEVELOPMENT.md)
- [代码分析报告](CODE_ANALYSIS_REPORT_CN.md)

---

## 💬 需要帮助？

- 📧 Email: support@cgmh.org.tw
- 🐛 提交 Issue: https://github.com/Lusnaker0730/MEDCALCEHR/issues
- 📖 查看文档: 项目根目录的 Markdown 文件

---

Happy Coding! 🎉
