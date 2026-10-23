# 验证记录

日期：2026-10-22。环境：macOS arm64、Node.js 22.23.3、Playwright 1.58.2、Chromium 145.0.7632.6。

## 已执行

- `npm run check`：28 项核心测试、TypeScript 严格检查、客户端构建及服务端预渲染通过，输出 9 个独立 HTML 页面。
- `npm run test:browser`：46 项全部通过，零重试；桌面 1440 × 1000、手机 390 × 844 各 23 项，使用构建后的静态产物而非开发服务器。
- 配置测试用 `SITE_URL=https://unitport.example` 后，SEO 专项 22 项通过，验证每页 canonical、og:url、JSON-LD URL、sitemap.xml 与 robots 引用；默认构建省略未知的生产域名。
- 覆盖四类单位换算、交换、显示精度、非法数值、绝对零度、市场/语言/收藏持久化、商品数据不写入存储、复制失败反馈、禁用和损坏存储恢复。
- 新工具：长宽高粘贴与顺序、格式校验、相同尺寸箱子总体积、正整数箱数限制；批量错误行禁止复制，合法结果验证实际剪贴板文本。
- 时区：纽约 `2026-11-01T01:30` 重复时间必须先选择一次，`2026-03-08T02:30` 不存在时禁用复制；核心测试还覆盖伦敦、洛杉矶冬夏、30 分钟 DST、半小时时差、无 DST 与跳过整日。
- 9 个页面关闭 JavaScript 后仍能读取各自 title、description、H1、计算说明、示例、Open Graph 与 WebApplication JSON-LD；启用 JavaScript 后中英文页面均无横向溢出，品牌图片加载正常，控制台无错误。
- 已检查桌面与手机首页自动截图；手机结果卡进入首屏，市场设置为可选折叠区域，时区页面默认展开。
- 本地预览验证未知工具路径返回 404 + noindex，工具路径尾斜杠 308 跳转并保留查询参数；键盘 Skip to converter 可用。
- 保留单位、市场、城市控件的双语明确标签，修复精确标签定位失败。预览显式解析静态子页面，避免默认 SPA 回退把子页 HTML 返回为首页。
- `git diff --check` 通过。未改变依赖锁文件，没有新增第三方依赖。

## 持续集成

GitHub Actions 使用 Node.js 22.23.3，在 Ubuntu 上干净安装依赖，运行核心检查、46 项完整浏览器测试和带测试域名的 22 项 SEO 专项。HTML 报告、首页截图和失败 trace 等产物保留 14 天，测试域名专项报告位于产物中的 `playwright-report/site-url/`。

原 PR #1 在 `489eb55` 的检查任务已通过；本次整合提交继续由同一 PR 验证，实际最新状态以 PR Checks 为准。

## 验证边界

- 手机为 Chromium 移动视口模拟，未测试实体手机、Firefox 或 WebKit。
- 404 与尾斜杠测试运行于本地静态预览；Cloudflare 采用 `404-page` + `drop-trailing-slash`。2026-10-23 获授权后已发布，发布验收记录单独留存。
- 生产域名为 `https://uniport.janine-cheng22.workers.dev`，在 Cloudflare 构建阶段设置 `SITE_URL`；当前中文没有独立 URL 或 hreflang。
- 未接入汇率服务，也未输出模拟报价；公开导航移除汇率预留入口。

## 仓库交付

PR #1 包含 MVP、品牌 UI、已验收布局与 SEO 文案及浏览器回归，已获授权合并 main。生产发布通过 Cloudflare Git 集成执行；GitHub Actions 无部署步骤。

## 生产发布修复（2026-10-23）

PR #1 已获授权合并 main。线上验收复现预渲染控件在 React 接管前接受输入、随后被默认值替换的问题；控件现在等待挂载完成才启用，并通过拦截 JavaScript 加载的回归用例检查。生产 Worker 名称统一为 `uniport`，显式启用 workers.dev；Cloudflare 构建时配置实际 `SITE_URL`。历史“不合并、不部署”边界已被本次用户授权更新。
