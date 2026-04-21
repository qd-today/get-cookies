#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const chromeOutputDir = path.join(rootDir, 'chrome');

// Chrome 版本直接使用根目录的文件，只需打包到 chrome/ 目录
// 排除构建相关文件和 Firefox 专有文件
const excludeDirs = ['firefox', 'chrome', 'build', '.git', 'node_modules', 'docs'];
const excludeFiles = ['manifest-firefox.json'];

if (!fs.existsSync(chromeOutputDir)) {
  fs.mkdirSync(chromeOutputDir, { recursive: true });
}

const filesToCopy = fs.readdirSync(rootDir).filter(f =>
  !excludeDirs.includes(f) && !excludeFiles.includes(f)
);

filesToCopy.forEach(file => {
  const srcPath = path.join(rootDir, file);
  const destPath = path.join(chromeOutputDir, file);

  if (fs.statSync(srcPath).isDirectory()) {
    copyDir(srcPath, destPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
});

// Chrome manifest 不需要修改，直接复制
console.log('✓ Created chrome/ directory with Chrome-compatible extension');
console.log('✓ Chrome manifest version:', JSON.parse(fs.readFileSync(path.join(chromeOutputDir, 'manifest.json'), 'utf8')).version);

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