[![Version](https://img.shields.io/badge/version-v2.9.0-green)](https://github.com/WuSuBuDuoMing/freshkeeper/releases)

# AI 冰箱食材管理助手

> 帮助用户管理冰箱食材、过期提醒、采购清单和 AI 菜谱推荐的微信小程序

## 功能特性

- **首页仪表盘** - 食材概览、今日待办、快捷入口
- **冰箱管理** - 分类筛选、搜索、状态管理
- **食材添加/编辑** - 完整表单校验、日期管理
- **过期提醒** - 分级预警（今日/3天/7天/已过期）
- **采购清单** - 手动添加、分类分组、预计花费
- **AI 菜谱推荐** - 基于冰箱食材智能推荐
- **一周菜单** - 自动生成7天三餐建议
- **统计分析** - 分类占比、浪费统计、省钱建议
- **暗黑模式** - 支持浅色/暗黑主题切换
- **个人中心** - 设置、数据管理
- **无障碍支持** - 字体大小、高对比度、色盲模式
- **国际化** - 支持简体中文和英文

## 快速开始

### 环境要求

- 微信开发者工具
- 基础库 3.3.4+

### 运行步骤

1. 克隆仓库：`git clone https://github.com/WuSuBuDuoMing/freshkeeper.git`
2. 打开微信开发者工具
3. 导入项目目录
4. 填入你的 AppID（或使用测试号）
5. 编译运行即可

> 项目使用 mock 数据，无需后端服务，开箱即用。

## 项目结构

```
freshkeeper/
├── app.js / app.json / app.wxss    # 小程序入口
├── pages/                           # 页面
│   ├── index/          # 首页仪表盘
│   ├── fridge/         # 冰箱食材列表
│   ├── add-food/       # 添加/编辑食材
│   ├── expiry/         # 过期提醒
│   ├── shopping/       # 采购清单
│   ├── recipes/        # AI 菜谱推荐
│   ├── weekly-menu/    # 一周菜单
│   ├── stats/          # 统计分析
│   ├── profile/        # 个人中心
│   └── scan/           # 拍照识别
├── components/          # 公共组件（22个）
├── services/            # 业务服务层
│   ├── food-service.js       # 食材 CRUD
│   ├── recipe-service.js     # 菜谱推荐
│   ├── shopping-service.js   # 采购清单
│   ├── family-service.js     # 家庭共享
│   ├── stats-service.js      # 统计分析
│   ├── nutrition-service.js  # 营养追踪
│   ├── export-service.js     # 数据导出
│   ├── subscription-service.js  # 订阅消息
│   ├── food-recognition.js   # 食材识别
│   ├── ai-recipe-engine.js   # AI 菜谱引擎
│   └── api/                  # HTTP API 层
├── utils/               # 工具函数层
│   ├── date-utils.js         # 日期处理
│   ├── food-utils.js         # 食材工具
│   ├── storage-utils.js      # 本地存储
│   ├── mock-utils.js         # Mock 数据
│   ├── validator.js          # 表单验证
│   ├── performance-utils.js  # 性能优化
│   ├── error-handler.js      # 错误处理
│   ├── theme-behavior.js     # 暗黑模式
│   ├── i18n.js               # 国际化
│   ├── accessibility.js      # 无障碍
│   ├── image-utils.js        # 图片处理
│   ├── animation-utils.js    # 动画工具
│   ├── lifecycle-utils.js    # 生命周期
│   └── log-behavior.js       # 日志行为
├── assets/              # 静态资源
├── docs/                # 项目文档
└── tests/               # 测试用例
```

## 技术架构

- **前端框架**：微信小程序原生开发
- **数据层**：Mock 数据 + wx.setStorageSync 本地缓存
- **架构模式**：Page -> Service -> Storage 三层架构
- **主题系统**：CSS 变量 + Behavior 混入
- **组件设计**：纯展示组件，通过 properties/triggerEvent 通信
- **API 层**：统一请求封装，支持拦截器、缓存、重试、取消

## 数据模型

### 食材 (Food)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识，格式 `food_xxx` |
| name | string | 食材名称 |
| category | string | 分类（蔬菜/水果/肉类/海鲜/蛋奶/饮料/调料/主食/其他） |
| quantity | number | 数量 |
| unit | string | 单位（个/克/瓶/袋/盒等） |
| storageArea | string | 存放位置（冷藏区/冷冻区/保鲜区/常温区） |
| purchaseDate | string | 购买日期 YYYY-MM-DD |
| expiryDate | string | 过期日期 YYYY-MM-DD |
| status | string | 状态（normal/expiring_soon/expired/used） |
| imageUrl | string | 图片 URL |
| notes | string | 备注 |
| createdAt | string | 创建时间 ISO |
| updatedAt | string | 更新时间 ISO |

### 食材分类系统

| 分类 | 图标 | 典型保质期 |
|------|------|-----------|
| 蔬菜 | 3-14天 | 冷藏/保鲜 |
| 水果 | 3-14天 | 冷藏/常温 |
| 肉类 | 3-20天 | 冷冻 |
| 海鲜 | 3-9天 | 冷冻 |
| 蛋奶 | 7-25天 | 冷藏 |
| 饮料 | 3-180天 | 冷藏/常温 |
| 调料 | 14-365天 | 常温 |
| 主食 | 1-90天 | 冷藏/常温/冷冻 |
| 其他 | 视具体而定 | 常温 |

### 采购项 (ShoppingItem)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识，格式 `shop_xxx` |
| name | string | 名称 |
| category | string | 分类 |
| quantity | number | 数量 |
| unit | string | 单位 |
| estimatedPrice | number | 预估单价（元） |
| purchased | boolean | 是否已购买 |
| fromUsed | boolean | 是否从已用完食材自动添加 |
| notes | string | 备注 |
| createdAt | string | 创建时间 |
| purchasedAt | string/null | 购买时间 |

### 菜谱 (Recipe)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 菜名 |
| ingredients | string[] | 所需食材列表 |
| difficulty | string | 难度（简单/中等/困难） |
| cookingTime | number | 烹饪时间（分钟） |
| calories | number | 热量（千卡） |
| steps | string[] | 烹饪步骤 |
| imageEmoji | string | 表情图标 |
| tags | string[] | 标签（早餐/午餐/晚餐/快手菜等） |

## 页面一览

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
| 扫描 | pages/scan/scan | 拍照识别食材 |

## 相关文档

- [产品需求文档](docs/product-requirements.md)
- [技术架构文档](docs/technical-architecture.md)
- [Mock 数据设计](docs/mock-data-design.md)
- [手动测试清单](docs/manual-test-checklist.md)

## 开源协议

MIT License
