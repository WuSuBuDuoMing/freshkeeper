# FreshKeeper — AI Fridge Food Management

[![WeChat Mini Program](https://img.shields.io/badge/WeChat-Mini%20Program-07C160?logo=wechat)](https://developers.weixin.qq.com/miniprogram/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v2.9.0-green)](https://github.com/WuSuBuDuoMing/freshkeeper/releases)
[![CI](https://github.com/WuSuBuDuoMing/freshkeeper/actions/workflows/ci.yml/badge.svg)](https://github.com/WuSuBuDuoMing/freshkeeper/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A WeChat Mini Program that helps you manage fridge inventory, track expiry dates, build shopping lists, and get AI-powered recipe recommendations.

**English** | [中文文档](README.zh-CN.md)

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Features

| Feature | Description |
|---------|-------------|
| **Fridge Dashboard** | Food overview, daily tasks, quick actions at a glance |
| **Food Management** | Category filtering, search, status tracking, bulk operations |
| **Expiry Alerts** | Tiered warnings: today / 3 days / 7 days / expired |
| **Shopping List** | Manual add, category grouping, cost estimation, auto-replenish from used items |
| **AI Recipe Recommendations** | Smart suggestions based on current fridge contents, prioritizing expiring items |
| **Weekly Menu** | Auto-generated 7-day meal plan with breakfast/lunch/dinner |
| **Statistics** | Category distribution, waste tracking, savings tips, monthly reports |
| **Photo Recognition** | Camera-based food identification (mock mode, ready for real API) |
| **Data Export** | Export fridge and shopping data as CSV or JSON |
| **Family Sharing** | Invite code system for shared household fridge management |
| **Nutrition Tracking** | Calorie and macro tracking with weekly nutrition reports |
| **Dark Mode** | Light / dark theme toggle |
| **Accessibility** | Font size, high contrast, color blind modes |
| **i18n** | Simplified Chinese and English |
| **Subscription Messages** | Expiry reminders, shopping alerts, and weekly reports via WeChat subscriptions |

## Architecture

```
Page -> Service -> Storage (three-layer architecture)
```

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Page** | UI rendering, user interaction | `pages/fridge/fridge` |
| **Service** | Business logic, CRUD operations | `services/food-service.js` |
| **Storage** | Local persistence via wx.setStorageSync | `utils/storage-utils.js` |

### Tech Stack

- **Framework**: WeChat Mini Program (native)
- **Data**: Mock data + `wx.setStorageSync` local cache (no backend required)
- **API Layer**: Unified request wrapper (`services/api/request.js`) with interceptors, cache, retry, and cancellation
- **Theming**: CSS variables + Behavior mixins
- **Components**: Pure presentational, communicate via `properties` / `triggerEvent`
- **AI Engine**: Mock recipe generation with real API switch ready (`services/ai-recipe-engine.js`)

## Quick Start

### Prerequisites

- [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- WeChat base library **3.3.4+**

### Installation

```bash
git clone https://github.com/WuSuBuDuoMing/freshkeeper.git
cd freshkeeper
```

### Run

1. Open **WeChat Developer Tools**
2. Click **Import Project** and select the cloned directory
3. Enter your AppID (or use a test account)
4. Click **Compile** -- the app runs immediately with mock data

> **No backend required.** The app works entirely offline with pre-loaded mock data and local storage.

### Verify Installation

After compilation, you should see:
- Home page with food overview and daily tasks
- 50+ sample food items in the fridge
- 20 sample recipes
- Working shopping list with 30 items

## Project Structure

```
freshkeeper/
├── app.js / app.json / app.wxss    # Entry point and global config
├── pages/                           # 10 page modules
│   ├── index/                       #   Home dashboard
│   ├── fridge/                      #   Fridge inventory management
│   ├── add-food/                    #   Add/edit food item
│   ├── expiry/                      #   Expiry alerts page
│   ├── shopping/                    #   Shopping list
│   ├── recipes/                     #   Recipe recommendations
│   ├── weekly-menu/                 #   Weekly meal plan
│   ├── stats/                       #   Statistics and reports
│   ├── profile/                     #   User settings and export
│   └── scan/                        #   Photo recognition
├── components/                      # 22 reusable UI components
├── services/                        # Business service layer
│   ├── food-service.js              #   Food CRUD + expiry queries
│   ├── recipe-service.js            #   Recipe matching + weekly menu
│   ├── shopping-service.js          #   Shopping list management
│   ├── ai-recipe-engine.js          #   AI recipe generation engine
│   ├── stats-service.js             #   Analytics and statistics
│   ├── nutrition-service.js         #   Nutrition tracking
│   ├── family-service.js            #   Family sharing
│   ├── food-recognition.js          #   Photo recognition
│   ├── subscription-service.js      #   WeChat subscription messages
│   ├── export-service.js            #   CSV/JSON data export
│   └── api/                         #   HTTP API layer
│       ├── request.js               #     Unified request wrapper
│       ├── config.js                #     API configuration
│       └── interceptors.js          #     Request/response interceptors
├── utils/                           # 15 utility modules
│   ├── storage-utils.js             #   Local storage wrapper
│   ├── date-utils.js                #   Date formatting and calculations
│   ├── food-utils.js                #   Food status helpers
│   ├── i18n.js                      #   Internationalization
│   ├── theme-behavior.js            #   Theme switching behavior
│   ├── accessibility.js             #   Accessibility utilities
│   └── ...                          #   Animation, image, validation, etc.
├── assets/                          # Static resources (icons, images)
├── docs/                            # Project documentation
│   ├── product-requirements.md
│   ├── technical-architecture.md
│   ├── data-model.md
│   ├── mock-data-design.md
│   └── manual-test-checklist.md
├── tests/                           # Test cases
│   └── test-cases.js
├── .github/                         # GitHub configuration
│   ├── workflows/ci.yml             #   CI pipeline
│   ├── ISSUE_TEMPLATE/              #   Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md     #   PR template
│   └── FUNDING.yml                  #   Sponsorship
├── CONTRIBUTING.md                  # Contribution guidelines
├── CODE_OF_CONDUCT.md               # Community code of conduct
├── SECURITY.md                      # Security policy
├── CHANGELOG.md                     # Version history
└── LICENSE                          # MIT License
```

## Configuration

### AI Recipe Engine

To switch from mock to a real AI API, edit `services/ai-recipe-engine.js`:

```javascript
const AI_CONFIG = {
  useRealAPI: true,              // Set to true
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: 'your-api-key-here',
  model: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.8
}
```

### Photo Recognition

To switch from mock to a real vision API, edit `services/food-recognition.js`:

```javascript
const CONFIG = {
  useRealAPI: true,
  apiEndpoint: 'https://your-vision-api.com/analyze',
  apiKey: 'your-api-key-here',
  confidence: 0.6
}
```

### WeChat Subscription Templates

Configure template IDs in `services/subscription-service.js` by registering templates in the WeChat Official Account backend.

## Testing

Run the test suite in WeChat Developer Tools:

1. Import the project
2. Open the Console
3. Run: `require('./tests/test-cases')`

The test suite covers:
- Food expiry logic (13 tests)
- Recipe matching algorithms (12 tests)
- Shopping list CRUD (18 tests)

## Documentation

| Document | Description |
|----------|-------------|
| [Product Requirements](docs/product-requirements.md) | Feature specifications and user stories |
| [Technical Architecture](docs/technical-architecture.md) | System design and decisions |
| [Data Model](docs/data-model.md) | Schema, category system, and storage keys |
| [Mock Data Design](docs/mock-data-design.md) | Mock data generation strategy |
| [Manual Test Checklist](docs/manual-test-checklist.md) | Step-by-step manual testing guide |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests to verify
5. Commit: `git commit -m 'feat: add my feature'`
6. Push: `git push origin feat/my-feature`
7. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## Security

Please see [SECURITY.md](SECURITY.md) for our security policy and vulnerability reporting process.

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 WuSuBuDuoMing
