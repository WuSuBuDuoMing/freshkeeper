# 🧊 AI 冰箱食材管理助手

> 帮助用户管理冰箱食材、过期提醒、采购清单和 AI 菜谱推荐的微信小程序

## ✨ 功能特性

- 🏠 **首页仪表盘** - 食材概览、今日待办、快捷入口
- 🧊 **冰箱管理** - 分类筛选、搜索、状态管理
- ➕ **食材添加/编辑** - 完整表单校验、日期管理
- ⏰ **过期提醒** - 分级预警（今日/3天/7天/已过期）
- 🛒 **采购清单** - 手动添加、分类分组、预计花费
- 🤖 **AI 菜谱推荐** - 基于冰箱食材智能推荐
- 📅 **一周菜单** - 自动生成7天三餐建议
- 📊 **统计分析** - 分类占比、浪费统计、省钱建议
- 🌙 **暗黑模式** - 支持浅色/暗黑主题切换
- 👤 **个人中心** - 设置、数据管理

## 🚀 快速开始

### 环境要求
- 微信开发者工具
- 基础库 3.3.4+

### 运行步骤
1. 打开微信开发者工具
2. 导入项目 `AI冰箱食材管理助手` 目录
3. 填入你的 AppID（或使用测试号）
4. 编译运行即可

> 项目使用 mock 数据，无需后端服务，开箱即用。

## 📁 项目结构

```
AI冰箱食材管理助手/
├── app.js / app.json / app.wxss    # 小程序入口
├── pages/
│   ├── index/          # 首页仪表盘
│   ├── fridge/         # 冰箱食材列表
│   ├── add-food/       # 添加/编辑食材
│   ├── expiry/         # 过期提醒
│   ├── shopping/       # 采购清单
│   ├── recipes/        # AI 菜谱推荐
│   ├── weekly-menu/    # 一周菜单
│   ├── stats/          # 统计分析
│   └── profile/        # 个人中心
├── components/         # 公共组件（9个）
├── services/           # 业务服务层
├── utils/              # 工具函数层
├── docs/               # 项目文档
└── tests/              # 测试用例
```

## 🧩 技术架构

- **前端框架**：微信小程序原生开发
- **数据层**：Mock 数据 + wx.setStorageSync 本地缓存
- **架构模式**：Page → Service → Storage 三层架构
- **主题系统**：CSS 变量 + Behavior 混入
- **组件设计**：纯展示组件，通过 properties/triggerEvent 通信

## 📱 页面一览

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | pages/index/index | 食材概览、快捷入口、推荐菜谱 |
| 冰箱 | pages/fridge/fridge | 食材列表、分类筛选、搜索 |
| 添加 | pages/add-food/add-food | 添加/编辑食材表单 |
| 过期 | pages/expiry/expiry | 分级过期提醒 |
| 采购 | pages/shopping/shopping | 采购清单管理 |
| 菜谱 | pages/recipes/recipes | AI 菜谱推荐 |
| 菜单 | pages/weekly-menu/weekly-menu | 一周菜单生成 |
| 统计 | pages/stats/stats | 数据分析 |
| 我的 | pages/profile/profile | 个人中心 |

## 📄 相关文档

- [产品需求文档](docs/product-requirements.md)
- [技术架构文档](docs/technical-architecture.md)
- [Mock 数据设计](docs/mock-data-design.md)
- [手动测试清单](docs/manual-test-checklist.md)
- [Vibe Coding 文案](docs/vibe-coding-pitch.md)

## 📝 License

MIT License
