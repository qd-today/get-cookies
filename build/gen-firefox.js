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

// 添加 Firefox 特定的 browser_specific_settings
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
