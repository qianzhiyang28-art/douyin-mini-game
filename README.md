# 抖音小游戏基础模板

一个零依赖、原生 JavaScript 编写的抖音小游戏起步项目。仓库可直接导入抖音开发者工具，内置 Canvas 界面、触摸交互、轻振动和本地最高分存储。

## 已包含

- 抖音小游戏必需的 `game.js`、`game.json`、`project.config.json`
- 适配高像素密度屏幕的 Canvas
- 竖屏点击计数示例
- `tt.onTouchStart` 触摸交互
- `tt.getStorageSync` / `tt.setStorageSync` 本地最高分
- `tt.vibrateShort` 轻振动反馈（不支持时自动跳过）
- 本地项目结构与语法检查

## 快速开始

1. 下载或克隆本仓库。
2. 安装并打开抖音开发者工具。
3. 选择“小游戏”并导入仓库根目录。
4. 根据需要填写测试 AppID；仅查看基础界面时可按开发者工具提示使用测试模式。
5. 点击编译运行。

项目入口是 `game.js`，主要界面和交互位于 `src/game.js`。

## 本地检查

电脑已安装 Node.js 时可运行：

```bash
npm run check
```

该命令不会启动抖音运行环境，只检查必要文件、JSON 格式和 JavaScript 语法。最终效果仍应在抖音开发者工具和真机中验证。

## 目录结构

```text
.
├── game.js
├── game.json
├── project.config.json
├── src
│   ├── game.js
│   ├── main.js
│   └── platform.js
├── scripts
│   └── check-project.js
├── package.json
└── README.md
```

## 邀请协作者

仓库所有者可进入：`Settings` → `Collaborators` → `Add people`，搜索对方 GitHub 用户名并发送邀请。

公开仓库允许任何人查看代码，但只有被授予权限的协作者才能直接推送分支。团队协作时建议通过功能分支和 Pull Request 合并代码。

## 下一步建议

- 把点击示例替换为正式玩法和状态机
- 在 `images/`、`audio/` 中添加素材
- 增加暂停、结算和重新开始界面
- 接入分享、广告、登录或排行榜前先阅读对应的抖音开放平台文档
- 在上传前检查包体、权限声明、隐私合规和真机表现

## 参考文档

- [抖音小游戏开发指南](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/guide/dev-guide/bytedance-mini-game)
- [抖音开放平台](https://developer.open-douyin.com/)

## License

[MIT](LICENSE)
