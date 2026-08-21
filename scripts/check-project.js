const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'game.js',
  'game.json',
  'project.config.json',
  'src/main.js',
  'src/platform.js',
  'src/game.js',
];

let failed = false;

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`缺少必要文件：${file}`);
    failed = true;
  }
}

for (const file of ['game.json', 'project.config.json', 'package.json']) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  } catch (error) {
    console.error(`${file} 不是有效 JSON：${error.message}`);
    failed = true;
  }
}

for (const file of requiredFiles.filter((file) => file.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(`${file} 语法检查失败：\n${result.stderr}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('项目结构、JSON 和 JavaScript 语法检查通过。');
