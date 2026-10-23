# Cloudflare 静态部署

2026-10-23 已获授权合并与发布。PR #1 已合并 main，Cloudflare Git 集成负责生产部署；GitHub Actions 仍仅执行验证。

生产地址：`https://uniport.janine-cheng22.workers.dev`。Cloudflare 项目名为 `uniport`，与仓库 `UniPort`、产品 UnitPort 对应。

## 推荐：Workers Static Assets

项目是预渲染的 React 多页面静态网站，没有 Worker 后端入口，也不需要数据库。

1. Node.js 使用 `.nvmrc` 指定的 22.23.3（最低 22.18）。
2. 在仓库根目录执行 `npm ci` 和 `npm run check`，生成 `dist/index.html` 及 8 个工具子目录的 `index.html`。未来发布前配置 `SITE_URL` 为实际 HTTPS 域名根地址，生成 canonical、sitemap 与 robots 引用。
3. 在 Cloudflare 中连接仓库时设置：

| 配置 | 值 |
| --- | --- |
| 根目录 | 仓库根目录（不要填 src） |
| Build command | `npm ci && npm run check` |
| Deploy command | `npx wrangler@4.151.3 deploy --name uniport` |
| Worker name | `uniport`，与 `wrangler.jsonc` 一致 |
| Node version | `22.23.3` |

`wrangler.jsonc` 显式声明 `assets.directory = "./dist"`，防止出现之前的 “Could not detect a directory containing static files”。`not_found_handling` 设置为 `404-page`，`html_handling` 设置为 `drop-trailing-slash`。未知路径必须返回真实 404，不要回退首页 200。

生产分支为 main。Cloudflare 构建变量 `SITE_URL=https://uniport.janine-cheng22.workers.dev`，必须在构建阶段设置，不能只配置成 Worker runtime 变量。`workers_dev=true` 保证正式访问地址在后续部署中保持启用。

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
- 未公开汇率工具，无模拟报价和外部 API 请求。
- 禁用 JavaScript 检查 9 个页面的独立 title、description、H1 与工具正文；核对实际域名下 canonical、sitemap、robots、未知路径 404 和尾斜杠跳转。
- 回退使用 Cloudflare 部署历史恢复上一成功版本；代码回退走审查流程。

参考：[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Wrangler 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)。
