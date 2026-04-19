# Firefox 双版本兼容实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Get-Cookies 插件添加 Firefox 支持，通过构建脚本生成适配的 manifest，使 Chrome 和 Firefox 版本共存于同一仓库。

**Architecture:** 创建 Node.js 构建脚本读取原始 manifest.json，生成 Firefox 专用版本（移除 update_url，改用 scripts 替代 service_worker），并输出到 firefox/ 目录。

**Tech Stack:** Node.js, WebExtension APIs, Manifest V3

---

### Task 1: 创建构建脚本生成 Firefox manifest

**Files:**
- Create: `build/gen-firefox.js`
- Read: `manifest.json`

- [ ] **Step 1: 创建构建目录和脚本**

```bash
mkdir -p build
```

- [ ] **Step 2: 编写 gen-firefox.js**

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const chromeManifestPath = path.join(rootDir, 'manifest.json');
const firefoxManifestPath = path.join(rootDir, 'manifest-firefox.json');
const firefoxOutputDir = path.join(rootDir, 'firefox');

// 读取 Chrome manifest
const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));

// 生成 Firefox manifest
const firefoxManifest = { ...chromeManifest };

// 移除 Chrome Web Store 更新 URL
delete firefoxManifest.update_url;

// 将 service_worker 改为 scripts（Firefox 需要持久化后台脚本）
if (firefoxManifest.background && firefoxManifest.background.service_worker) {
  firefoxManifest.background = {
    scripts: [firefoxManifest.background.service_worker],
    persistent: false
  };
}

// 添加 Firefox 特定的 browser_style（可选）
firefoxManifest.browser_specific_settings = {
  gecko: {
    id: "get-cookies@qd-today",
    strict_min_version: "109.0"
  }
};

// 写入文件
fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 3) + '\n');
console.log('✓ Generated manifest-firefox.json');

// 创建 firefox/ 输出目录并复制所有文件
if (!fs.existsSync(firefoxOutputDir)) {
  fs.mkdirSync(firefoxOutputDir, { recursive: true });
}

// 复制所有文件到 firefox/ 目录（除了 manifest.json）
const filesToCopy = fs.readdirSync(rootDir).filter(f => 
  f !== 'firefox' && 
  f !== 'build' && 
  f !== '.git' &&
  f !== 'node_modules' &&
  f !== 'docs'
);

filesToCopy.forEach(file => {
  const srcPath = path.join(rootDir, file);
  const destPath = path.join(firefoxOutputDir, file);
  
  if (fs.statSync(srcPath).isDirectory()) {
    copyDir(srcPath, destPath);
  } else if (file !== 'manifest.json') {
    fs.copyFileSync(srcPath, destPath);
  }
});

// 写入 Firefox manifest 到输出目录
fs.writeFileSync(
  path.join(firefoxOutputDir, 'manifest.json'), 
  JSON.stringify(firefoxManifest, null, 3) + '\n'
);

console.log('✓ Created firefox/ directory with Firefox-compatible extension');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
```

- [ ] **Step 3: 测试构建脚本**

```bash
node build/gen-firefox.js
```

Expected output:
```
✓ Generated manifest-firefox.json
✓ Created firefox/ directory with Firefox-compatible extension
```

- [ ] **Step 4: 验证生成的 manifest**

```bash
cat manifest-firefox.json
```

确认：
- `update_url` 已移除
- `background.scripts` 替代了 `service_worker`
- `browser_specific_settings` 已添加

- [ ] **Step 5: 验证 firefox/ 目录**

```bash
ls firefox/
```

应包含所有扩展文件，manifest.json 为 Firefox 版本。

- [ ] **Step 6: 提交**

```bash
git add build/gen-firefox.js manifest-firefox.json firefox/
git commit -m "feat: add Firefox build script and generated manifest"
```

---

### Task 2: 添加 package.json 和 npm scripts

**Files:**
- Create: `package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "get-cookies",
  "version": "2.2.3",
  "description": "Cookies 获取助手 - Chrome/Firefox 扩展",
  "scripts": {
    "build:firefox": "node build/gen-firefox.js",
    "build:chrome": "echo 'Chrome version is ready in current directory'",
    "build": "npm run build:firefox"
  },
  "keywords": ["firefox", "chrome", "extension", "cookies", "webextension"],
  "license": "MIT"
}
```

- [ ] **Step 2: 测试 npm scripts**

```bash
npm run build:firefox
```

- [ ] **Step 3: 提交**

```bash
git add package.json
git commit -m "chore: add package.json with build scripts"
```

---

### Task 3: 更新 README 添加 Firefox 说明

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 更新 README.md**

在现有内容基础上添加 Firefox 相关说明：

```markdown
# Get-Cookies 插件

一键获取 Cookies 的浏览器扩展, 用于配合 QD 框架使用

QD 框架: <https://github.com/qd-today/qd>

Docker 容器: <https://hub.docker.com/r/qdtoday/qd>

## 浏览器支持

- ✅ Chrome / Chromium (Manifest V3)
- ✅ Firefox (Manifest V3)

## 使用方式

### Chrome

推荐形式：前往Chrome商店安装。（非公开扩展只可链接直达）
[商店页面](https://chromewebstore.google.com/detail/cookies%E8%8E%B7%E5%8F%96%E5%8A%A9%E6%89%8B/mmcdaoockinhaeiljdmjmnjfndpfpklo) 

或者

1. 项目代码完整打包下载，使用 Chrome浏览器 -> `扩展` -> `加载已解压的扩展程序` 来使用;

2. 前往 [Releases](https://github.com/qd-today/get-cookies/releases/latest) 下载安装打包好的 `.crx` 文件.

### Firefox

1. 克隆本仓库或下载源码

2. 运行构建脚本生成 Firefox 版本：

```bash
npm install
npm run build:firefox
```

3. 打开 Firefox，访问 `about:debugging`

4. 点击"此 Firefox" → "临时载入附加组件"

5. 选择 `firefox/manifest.json` 文件

> 注意: 使用前进入扩展选项页，根据提示填入 QD 框架对应 `ip或域名` 信息。
> [这里有参考图例](https://github.com/qd-today/get-cookies/issues/11) 

- ### Screenshots
<div><img src="./eg1.gif" alt="eg1" width="50%" /></div>

## Tips

插件目前无法获取在**隐私模式**下访问的网站的 Cookies。

Chrome 用户可以使用 Chrome 的 **多用户模式** 来达到隐私模式一样的效果。

Firefox 用户可以在 `about:addons` 中设置允许在隐私窗口运行。

> 只需要新建一个用户，重新安装本插件（无非是重新导入文件夹一次），在这个用户下同时访问签到平台和需要隐私访问的网站
>
> 同时在该用户的chrome设置里-隐私设置和安全性-cookie及其他网站数据-关闭所有窗口时清除cookie及网站数据 处打勾即可。

## 更新内容
- ### v2.2.3

    添加空cookies的处理

    > 临时保留2.1.0旧方法。下版本移除。注意及时更新QD框架

- ### v2.1.0

    修改与QD框架的通信方法，防止因其他扩展滥用postMessage而造成的插件失效

    > 临时保留旧方法，使其暂时兼容旧qd框架

- ### v2.0.0

    针对 Chrome 强制推进的 **Manifest V3** 标准进行了代码的整体迁移和更新, 未有功能上的改进。

    目前在新版浏览器上应该能正常运作。

    > 只部分测试了功能上的正常，未广泛进行兼容性测试，有bug欢迎提交issue

- ### v1.0.3

    小改进: 同时增加对旧版平台 BUG 的兼容 (编辑测试界面无法获取cookie, 新版 QD 框架已修正)

- ### v1.0.0

    修改匹配及注入方式，添加设定选项方便自行添加需要启用的网站

## 开发

```bash
# 构建 Firefox 版本
npm run build:firefox

# 输出目录: firefox/
```

## 鸣谢

- [ckx000](https://github.com/ckx000)
- [acgotaku(原作者)](https://github.com/acgotaku/GetCookies)
```

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: add Firefox installation instructions"
```

---

### Task 4: 添加 .gitignore 排除构建产物

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: 更新 .gitignore**

```gitignore
.lh
firefox/
manifest-firefox.json
```

- [ ] **Step 2: 提交**

```bash
git add .gitignore
git commit -m "chore: ignore Firefox build artifacts"
```

---

### Task 5: 添加 GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/build.yml`

- [ ] **Step 1: 创建 workflow 目录**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: 创建 build.yml**

```yaml
name: Build Extensions

on:
  push:
    branches: [main, firefox-support]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build Firefox extension
        run: npm run build:firefox

      - name: Verify Chrome manifest
        run: |
          node -e "const m = require('./manifest.json'); console.log('Chrome manifest OK:', m.version);"

      - name: Verify Firefox manifest
        run: |
          node -e "const m = require('./manifest-firefox.json'); console.log('Firefox manifest OK:', m.version);"

      - name: Upload Firefox build
        uses: actions/upload-artifact@v4
        with:
          name: get-cookies-firefox
          path: firefox/
          retention-days: 7
```

- [ ] **Step 3: 提交**

```bash
git add .github/workflows/build.yml
git commit -m "ci: add GitHub Actions workflow for building extensions"
```

---

### Task 6: 最终验证和清理

- [ ] **Step 1: 完整构建测试**

```bash
npm run build:firefox
```

- [ ] **Step 2: 验证所有文件**

```bash
# 检查 manifest-firefox.json 没有 update_url
node -e "const m = require('./manifest-firefox.json'); console.log('update_url:', m.update_url || 'removed ✓');"

# 检查 background 配置
node -e "const m = require('./manifest-firefox.json'); console.log('background:', JSON.stringify(m.background));"

# 检查 browser_specific_settings
node -e "const m = require('./manifest-firefox.json'); console.log('browser_specific_settings:', JSON.stringify(m.browser_specific_settings));"
```

- [ ] **Step 3: 检查 git 状态**

```bash
git status
```

确保 `firefox/` 和 `manifest-firefox.json` 被 .gitignore 排除。

- [ ] **Step 4: 最终提交（如有遗漏）**

```bash
git add -A
git commit -m "chore: final verification and cleanup"
```
