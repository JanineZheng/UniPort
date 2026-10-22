# Cloudflare 静态部署

本次工作不执行发布，不配置生产凭证，也不推送可能触发生产构建的分支。

## 推荐：Workers Static Assets

项目是纯静态 React SPA，没有 Worker 后端入口，也不需要数据库。

1. Node.js 使用 `.nvmrc` 指定的 22.23.3（最低 22.18）。
2. 在仓库根目录执行 `npm ci` 和 `npm run check`，生成 `dist/index.html`。
3. 在 Cloudflare 中连接仓库时设置：

| 配置 | 值 |
| --- | --- |
| 根目录 | 仓库根目录（不要填 src） |
| Build command | `npm ci && npm run build` |
| Deploy command | `npx wrangler@4.151.3 deploy` |
| Worker name | `unitport`，与 `wrangler.jsonc` 一致 |
| Node version | `22.23.3` |

`wrangler.jsonc` 显式声明 `assets.directory = "./dist"`，防止出现之前的 “Could not detect a directory containing static files”。`not_found_handling` 设置为 `single-page-application`。

Cloudflare 默认分支自动部署可能发布生产内容。首次接入前先确认生产分支与预览分支设置，避免把尚未验收的改动直接上线。

### 手动发布（仅在用户明确授权后）

```sh
npm ci
npm run check
npx wrangler@4.151.3 deploy
```

构建完成后才可调用 Wrangler；不要只运行裸的 `npx wrangler deploy` 并期望它自动构建 Vite。

### 本地检查静态产物

```sh
npm run build
npm run preview
```

访问终端显示的本地地址。检查语言、收藏、自由单位、商品规格复制、DST gap/overlap 以及手机宽度。

## 备选：Cloudflare Pages

创建 **Pages** 项目时，框架选 Vite，构建命令 `npm run build`，输出目录 `dist`，根目录为空/仓库根目录，Node 使用 22.23.3。Pages Git 集成负责构建和上传，不使用 Workers 的 Deploy command，也无需 Worker 入口。

不要同时混用 Pages 与 Workers 的项目设置。当前推荐并随仓库提供的是 Workers Static Assets 配置。

## 发布后验收与回退

- 核对构建成功、实际发布 commit、静态页面及 favicon 可访问。
- HTTPS 环境检查 Clipboard API；无权限时界面应提示手动复制。
- 清空测试站点本地存储后应为中国 → 美国；刷新可恢复新偏好。
- 纽约 `2026-03-08 02:30` 不存在；`2026-11-01 01:30` 必须先选具体一次。
- 汇率面板显示“尚未接入”，无报价和外部 API 请求。
- 回退使用 Cloudflare 部署历史恢复上一成功版本；代码回退走审查流程。

参考：[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Wrangler 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)。
