# Frontend Login Plugin

为 QwenPaw 控制台提供侧边栏「登录」入口：阿里集团账号登录（保存 `accessToken`）、以及一键复制 dogfooding 安装命令。

## 功能

- 通过插件路由注册侧边栏「登录」，页面路径：`/plugin/login`
- 可配置登录接口地址；成功后写入 `localStorage["qwenpaw_auth_token"]`
- 「Join dogfooding plan」将安装命令复制到剪贴板（需在终端自行执行）

## 目录结构

```text
plugins/login/frontend-login-plugin/
├── plugin.json
├── plugin.py
├── src/index.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 运行步骤（构建 → 安装 → 启动）

```bash
# 在仓库根目录 QwenPaw/ 下执行（路径按你的克隆位置调整）

# 1) 构建插件
cd plugins/login/frontend-login-plugin
npm install
npm run build

# 2) 强制重装插件（请先停掉正在运行的 qwenpaw app）
cd ../../..
qwenpaw plugin install plugins/login/frontend-login-plugin --force

# 3) 启动
qwenpaw app
```

若使用 `copaw` CLI，将上述命令中的 `qwenpaw` 换成 `copaw` 即可。

## 调试方法

1. 浏览器 Console 中应看到：`[frontend-login-plugin] runtime detected`
2. 侧边栏进入「登录」，配置登录接口后尝试登录；检查 Network 与 Local Storage 中的 `qwenpaw_auth_token`
3. 宿主需暴露 `window.QwenPaw.host`（含 React、Ant Design）；若 `window.QwenPaw` 为 `undefined`，说明当前安装的静态控制台过旧，需按官方文档使用支持插件的前端资源

## 常见问题

- **没有 `dist/index.js`**：未执行 `npm run build`
- **loader 报缺少 `plugin.py`**：本目录已包含占位 `plugin.py`
- **插件列表里 id**： manifest 中为 `frontend-login-plugin`
