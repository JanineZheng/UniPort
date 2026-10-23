# UniPort 布局与 SEO 优化版

布局与文案来源为已验收的独立副本 `outputs/UniPort-SEO`，现整合到 `outputs/UniPort` 的 `codex/browser-regression` 分支和 PR #1。保留原分支的双语控件标签修复、HTML 报告、失败截图与 trace；原独立副本未修改。

## 依据与范围

沿用之前调研明确的「英文站、美国优先」方向。优先落地长宽高转换和箱子体积工具；不将未验证的长尾搜索量作为流量承诺。复合磅盎司、分数英寸尚未实现，未设置对应营销入口。CBM 目前与立方英尺共用一个工具，不生成仅替换关键词的重复页。

- 首页改为直接描述单位、商品尺寸和箱子体积任务，默认英文，保留中文切换及本地偏好。
- 桌面首屏保留三个任务入口；移动端先展示换算工作区，再展示其他入口和可选市场设置。
- 市场推荐改为可选折叠区域，时区页默认展开。无需先选国家才能换算。
- 新增长宽高粘贴、箱子体积/箱数计算、示例按钮、复制及输入错误反馈。
- 延续原品牌配色。手机使用可横向滑动的工具导航，长度等普通换算输入和结果并排显示。

## 可索引页面

`/`、`/cubic-feet-calculator`、`/dimensions-converter`、`/cm-to-inches`、`/kg-to-lbs`、`/ml-to-oz`、`/celsius-to-fahrenheit`、`/product-specs-converter`、`/time-zone-converter`。

每页独立 title、description、H1、实际工具、示例、计算说明、相关工具链接、WebApplication JSON-LD 和 Open Graph。构建时将 React 正文写入 HTML，不依赖搜索引擎执行 JavaScript 后才能读取。语言切换属于用户偏好，当前中文没有独立 URL，不宣称已完成多语言 hreflang SEO。

## 本地运行与构建

需要 Node >=22.18。依赖沿用原项目 lockfile，无新增第三方依赖。

```sh
npm ci
npm run dev -- --port 4178
npm run check
```

正式域名确定后设置构建环境变量，值应为该站点实际 HTTPS 域名根地址：`SITE_URL`。构建脚本据此生成每页 canonical、og:url、sitemap.xml 和 robots.txt 内的 sitemap 引用。未提供时不编造生产域名，正常输出页面和 robots.txt。未设置 SITE_URL 的构建不包含 canonical/sitemap；生产构建已配置为 https://uniport.janine-cheng22.workers.dev。

Cloudflare Workers 静态配置使用 `404-page` 和 `drop-trailing-slash`，避免未知路径返回首页 200，并统一页面路径。其他静态托管需配置等效目录索引、斜杠规范化和真实 404 状态。不要沿用 SPA 全路径回退首页的旧规则。

## 验证

- 28 项核心测试通过，包含新箱子体积的精确单位/数量计算、异常输入及尺寸粘贴解析。
- TypeScript 和生产构建通过；输出 9 个含正文的 HTML 页面。
- 浏览器实测：示例填入、长度结果复制、中文切换与刷新保留、尺寸粘贴及格式错误、箱数拒绝小数、箱子总体积复制、批量错误阻止复制及英文规格复制。
- 桌面有效视口约 1309px、手机有效视口约 354px 下未发现横向页面溢出。手机首页结果卡进入首屏。
- 整合后针对构建产物运行完整 46 项浏览器自动化：桌面 1440 × 1000、手机 390 × 844。包含原回归、新工具和 9 个页面的中英文布局、禁用 JavaScript 的 SEO 正文与元数据、品牌资源、404、尾斜杠跳转和键盘跳转；DST 重复与缺失时间界面均已通过。
- 使用 `https://unitport.example` 作为本地/CI 测试夹具，单独验证 canonical、og:url、JSON-LD url、sitemap 和 robots 引用。该保留域名不代表任何生产地址；默认构建不嵌入它。
- 本地预览显式解析目录中的静态页面，避免 Vite SPA 回退将所有子路径的 HTML 返回为首页。生产仍以 Workers Static Assets 的静态路由配置为准。
- 部署前仍需使用实际域名检查 canonical、站点地图、404 状态，接入 Search Console 后再观察美国查询数据。

参考：[Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)、[可抓取链接](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)、[Cloudflare HTML 路由](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)、[Cloudflare SSG 与 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)。
