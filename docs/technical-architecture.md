# 技术架构文档

## 架构概览

```
┌─────────────────────────────────────┐
│              View Layer              │
│  (Pages + Components WXML/WXSS)     │
├─────────────────────────────────────┤
│           Page Logic Layer           │
│  (Page JS + Behavior Mixin)          │
├─────────────────────────────────────┤
│           Service Layer              │
│  (food-service / recipe-service /    │
│   shopping-service / stats-service)  │
├─────────────────────────────────────┤
│            Utils Layer               │
│  (date-utils / food-utils /          │
│   storage-utils / mock-utils /       │
│   theme-behavior)                    │
├─────────────────────────────────────┤
│         Storage Layer                │
│  (wx.setStorageSync / wx.getStorageSync) │
└─────────────────────────────────────┘
```

## 数据流

```
用户操作 → Page Event Handler → Service Method → Storage (Read/Write) → Page setData → View Update
```

## 目录结构

```
├── app.js                 # 入口：初始化 mock 数据、获取系统信息
├── app.json               # 路由配置、TabBar、窗口样式
├── app.wxss               # 全局 CSS 变量、通用样式
├── pages/                 # 9 个页面
├── components/            # 9 个组件
├── services/              # 4 个服务模块
├── utils/                 # 5 个工具模块
└── assets/                # 图片资源（mock 占位）
```

## 组件设计原则

1. **纯展示组件**：组件只负责展示和事件触发
2. **Props 下行**：通过 properties 接收数据
3. **Events 上行**：通过 triggerEvent 通知父组件
4. **无副作用**：组件不直接请求 API，不直接操作 Storage

## 主题系统

使用 CSS 变量实现主题切换：
- Light 模式：默认，浅色背景
- Dark 模式：深色背景，调整对比度
- ThemeBehavior：混入到需要主题感知的页面

## 状态管理

采用 Page 级别状态管理：
- 每个 Page 负责自己的数据状态
- Service 层只负责数据读写
- Page 通过 setData 驱动视图更新

## 扩展路径

1. 接入真实后端 API（替换 Service 层 mock）
2. 添加图片上传功能
3. 接入微信订阅消息（过期提醒通知）
4. 接入真实 AI API（菜谱生成）
