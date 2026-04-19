# Firefox 双版本兼容设计

## 概述

为 Get-Cookies 插件添加 Firefox 支持，使 Chrome 和 Firefox 版本共存于同一仓库，通过构建脚本生成各自适配的 manifest。

## 架构

### 目录结构

```
get-cookies/
├── manifest.json          # Chrome 版（不变）
├── manifest-firefox.json  # Firefox 版（构建生成）
├── service_worker.js      # 共用
├── js/cookie.js           # 共用
├── options/               # 共用
├── _locales/              # 共用
├── build/
│   └── gen-firefox.js     # 构建脚本
├── README.md              # 更新说明
└── .github/
    └── workflows/
        └── build.yml      # CI 打包
```

### 关键兼容点

| 项目 | Chrome | Firefox |
|------|--------|---------|
| background | `service_worker` | `scripts` (持久化) |
| API | `chrome.*` | `chrome.*` 可用 |
| manifest_version | 3 | 3 (Firefox 58+) |
| `update_url` | 需要 | **必须移除** |
| `browser_style` | 不支持 | 支持 |

## 构建流程

1. `npm run build:firefox` — 生成 `firefox/` 目录
2. `npm run build:chrome` — 打包 Chrome 版（可选）

## 实现步骤

1. 创建 `build/gen-firefox.js` 构建脚本
2. 生成 `manifest-firefox.json`
3. 更新 `README.md` 添加 Firefox 说明
4. 添加 CI workflow
5. 测试 Firefox 兼容性
