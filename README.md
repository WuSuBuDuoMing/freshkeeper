# FreshKeeper — AI 冰箱食材管理助手

[![WeChat Mini Program](https://img.shields.io/badge/WeChat-Mini%20Program-07C160?logo=wechat)](https://developers.weixin.qq.com/miniprogram/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v2.1.0-green)](https://github.com/WuSuBuDuoMing/freshkeeper/releases)

> 管理冰箱食材、过期提醒、采购清单和 AI 菜谱推荐的微信小程序

**[English](#features) | [中文文档](README.zh-CN.md)**

## Features

- **Fridge Dashboard** — food overview, daily tasks, quick actions
- **Food Management** — category filter, search, status tracking
- **Expiry Alerts** — tiered warnings (today / 3 days / 7 days / expired)
- **Shopping List** — manual add, category grouping, cost estimation
- **AI Recipe Recommendations** — smart suggestions based on fridge contents
- **Weekly Menu** — auto-generated 7-day meal plan
- **Statistics** — category distribution, waste tracking, saving tips
- **Dark Mode** — light / dark theme toggle
- **Accessibility** — font size, high contrast, color blind modes
- **i18n** — Simplified Chinese and English

## Quick Start

### Prerequisites

- [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- Base library 3.3.4+

### Run

```bash
git clone https://github.com/WuSuBuDuoMing/freshkeeper.git
```

1. Open WeChat Developer Tools
2. Import the project directory
3. Enter your AppID (or use a test account)
4. Compile and run

> Uses mock data — no backend required, works out of the box.

## Architecture

```
Page → Service → Storage (three-layer architecture)
```

| Layer | Responsibility | Example |
|-------|---------------|---------|
| Page | UI rendering, user interaction | `pages/fridge/fridge` |
| Service | Business logic, CRUD operations | `services/food-service.js` |
| Storage | Local persistence | `utils/storage-utils.js` |

### Tech Stack

- **Framework**: WeChat Mini Program (native)
- **Data**: Mock data + `wx.setStorageSync` local cache
- **Theming**: CSS variables + Behavior mixins
- **Components**: Pure presentational, communicate via `properties` / `triggerEvent`
- **API Layer**: Unified request wrapper with interceptors, cache, retry, cancellation

## Project Structure

```
freshkeeper/
├── app.js / app.json / app.wxss    # Entry point
├── pages/              # 10 pages
├── components/         # 22 reusable components
├── services/           # Business service layer
│   └── api/            # HTTP API layer
├── utils/              # Utility functions
├── assets/             # Static resources
├── docs/               # Documentation
└── tests/              # Test cases
```

See [Data Model Documentation](docs/data-model.md) for detailed schema and category system.

## Documentation

- [Product Requirements](docs/product-requirements.md)
- [Technical Architecture](docs/technical-architecture.md)
- [Data Model](docs/data-model.md)
- [Mock Data Design](docs/mock-data-design.md)
- [Manual Test Checklist](docs/manual-test-checklist.md)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

## License

[MIT](LICENSE)
