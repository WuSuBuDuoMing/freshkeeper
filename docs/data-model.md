# 数据模型文档

> FreshKeeper v2.1.0 — 核心数据结构与分类系统说明

## 概述

FreshKeeper 使用 `wx.setStorageSync` 作为本地数据存储，所有数据以 JSON 格式序列化。存储键统一添加 `fridge_` 前缀以避免冲突。

## 存储键映射

| 存储键 | 数据类型 | 说明 |
|--------|----------|------|
| `fridge_foods` | Array\<Food\> | 食材列表 |
| `fridge_recipes` | Array\<Recipe\> | 菜谱列表 |
| `fridge_shopping` | Array\<ShoppingItem\> | 采购清单 |
| `fridge_family_group` | Object | 家庭组信息 |
| `fridge_stats` | Array | 统计数据 |
| `fridge_nutrition_daily_log` | Object | 每日营养摄入记录 |
| `fridge_ai_recipe_cache` | Object | AI 菜谱缓存 |
| `fridge_subscription_status` | Object | 订阅授权状态 |
| `fridge_theme_mode` | string | 主题模式（light/dark） |
| `fridge_app_locale` | string | 语言设置 |
| `fridge_accessibility_settings` | Object | 无障碍设置 |

## 核心实体

### Food（食材）

食材是系统的核心实体，代表冰箱中的一项食材。

```
{
  "id": "food_m1abc2def3",     // 唯一标识，prefix_timestamp+random
  "name": "番茄",               // 食材名称
  "category": "蔬菜",           // 分类，见分类系统
  "quantity": 4,                // 数量
  "unit": "个",                 // 单位
  "storageArea": "冷藏区",      // 存放位置
  "purchaseDate": "2026-06-01", // 购买日期
  "expiryDate": "2026-06-08",   // 过期日期
  "status": "normal",           // 状态
  "imageUrl": "",               // 图片 URL
  "notes": "做番茄炒蛋",        // 备注
  "createdAt": "2026-06-01T10:00:00Z",
  "updatedAt": "2026-06-01T10:00:00Z"
}
```

#### 状态流转

```
normal ──(临近过期)──> expiring_soon ──(超过过期日)──> expired
  │                                                       │
  └──────────────(手动标记用完)──────────────────────────────> used
```

- `normal`：正常状态，距离过期 > 3天
- `expiring_soon`：即将过期，距离过期 0-3天
- `expired`：已过期，超过过期日期
- `used`：已用完，手动标记

### ShoppingItem（采购项）

```
{
  "id": "shop_m1abc2def3",
  "name": "番茄",
  "category": "蔬菜",
  "quantity": 4,
  "unit": "个",
  "estimatedPrice": 3,       // 预估单价（元）
  "purchased": false,         // 是否已购买
  "fromUsed": false,          // 是否从已用完食材自动添加
  "notes": "",
  "createdAt": "2026-06-01T10:00:00Z",
  "purchasedAt": null          // 购买时间，未购买时为 null
}
```

### Recipe（菜谱）

```
{
  "id": "recipe_001",
  "name": "番茄鸡蛋面",
  "ingredients": ["番茄", "鸡蛋", "面条"],
  "difficulty": "简单",         // 简单 | 中等 | 困难
  "cookingTime": 15,           // 分钟
  "calories": 350,             // 千卡
  "steps": ["烧水煮面", "番茄切块", ...],
  "imageEmoji": "🍜",
  "tags": ["午餐", "快手菜"]
}
```

### FamilyGroup（家庭组）

```
{
  "id": "family_m1abc2def3",
  "name": "周先生的冰箱",
  "creator": "周先生",
  "inviteCode": "ABC123",      // 6位邀请码
  "members": [
    {
      "id": "member_xxx",
      "name": "周先生",
      "role": "owner",          // owner | member
      "joinDate": "2026-06-01T10:00:00Z",
      "avatar": "👤"
    }
  ],
  "createdAt": "2026-06-01T10:00:00Z"
}
```

## 食材分类系统

### 分类枚举

| Key | 名称 | 图标 | 典型食材 |
|-----|------|------|---------|
| 蔬菜 | 蔬菜 | 3-14天 | 番茄、黄瓜、西兰花、胡萝卜、白菜 |
| 水果 | 水果 | 3-14天 | 苹果、香蕉、草莓、橙子、葡萄 |
| 肉类 | 肉类 | 3-20天 | 鸡胸肉、猪里脊、牛肉、五花肉 |
| 海鲜 | 海鲜 | 3-9天 | 三文鱼、虾、鱿鱼、带鱼 |
| 蛋奶 | 蛋奶 | 7-25天 | 鸡蛋、牛奶、酸奶、奶酪片 |
| 饮料 | 饮料 | 3-180天 | 橙汁、可乐、矿泉水、咖啡 |
| 调料 | 调料 | 14-365天 | 酱油、醋、盐、食用油 |
| 主食 | 主食 | 1-90天 | 面条、大米、面包、馒头 |
| 其他 | 其他 | 视具体而定 | 腐竹、粉丝、海带 |

### 存放位置

| Key | 图标 | 颜色 | 说明 |
|-----|------|------|------|
| 冷藏区 | ❄️ | #2196F3 | 0-8°C，蔬菜水果短期存放 |
| 冷冻区 | 🧊 | #00BCD4 | -18°C 以下，肉类海鲜长期存放 |
| 保鲜区 | 🌱 | #4CAF50 | 8-15°C，部分蔬菜保鲜 |
| 常温区 | ☀️ | #FF9800 | 室温，调料主食饮料 |

### 单位枚举

`个`, `斤`, `克`, `千克`, `瓶`, `袋`, `盒`, `包`, `罐`, `根`, `条`, `只`, `把`, `块`, `片`, `升`, `毫升`

## 过期判定逻辑

```javascript
// 核心判定函数：date-utils.daysUntilExpiry(expiryDate)
// 返回值：正数=剩余天数，0=今天过期，负数=已过期天数

function getFreshnessStatus(expiryDate) {
  const days = daysUntilExpiry(expiryDate)
  if (days < 0) return 'expired'       // 已过期
  if (days <= 3) return 'expiring_soon' // 即将过期
  return 'fresh'                         // 新鲜
}
```

## 缓存策略

### AI 菜谱缓存

- 存储键：`fridge_ai_recipe_cache`
- TTL：30分钟
- Key 生成：`recipe_${sortedFoodNames}_${JSON.stringify(options)}`
- 自动清理过期条目

### HTTP 请求缓存

- 内存缓存，不持久化
- 仅 GET 请求支持缓存
- 默认 TTL：5分钟
- 支持按前缀清除
