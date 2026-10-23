# UnitPort

跨境卖家的单位、商品规格、箱子体积与时区换算工作台。React + TypeScript + Vite，英文优先并支持中文，无登录、无后端，不上传商品数据。市场推荐默认中国 → 美国，可选展开，不阻挡换算。

产品名为 **UnitPort**；仓库名沿用 `JanineZheng/UniPort`。

## 本地运行

需要 Node.js >= 22.18，推荐使用 `.nvmrc` 指定版本。

```sh
nvm use
npm ci
npm run dev
```

```sh
npm test                 # 核心逻辑、计量、DST、偏好和批量输入测试
npm run build            # TypeScript 检查 + 生产构建，输出 dist/
npm run check            # 核心测试 + 构建
npx playwright install chromium
npm run test:browser     # 构建后运行 Chromium 桌面 / 移动流程，桌面和手机用例
npx playwright show-report # 查看最近一次 HTML 报告
npm run preview          # 预览生产构建
```

CI 仅执行验证，不包含发布步骤。浏览器测试失败时保存截图与 trace；HTML 报告和测试产物在 GitHub Actions 中保留 14 天。

## 首版功能

- 12 个初始国家/市场，默认中国 → 美国；收藏美国、英国、日本，可自行增删。
- 自由选择长度、重量、液体容量、温度单位；支持单位交换与 2/4/6 位显示精度。
- 区分常衡盎司 `oz`、美制 `US fl oz`、英制 `Imperial fl oz`；不跨质量与容量换算。
- 商品长宽高粘贴与转换；箱子体积计算同时输出 ft³ 与 m³（CBM），支持相同尺寸箱数。
- 商品长宽高 + 重量批量换算并复制英文规格。
- 城市 + IANA 时区，按具体日期处理 DST；重复时刻要求选择，不存在时刻不输出。
- 中英文、响应式、键盘可操作、复制失败反馈。
- 国家、市场、收藏、语言、单位、城市、小数位保存至当前浏览器 localStorage。输入数值和商品数据不持久化；禁用存储时仅当前会话有效。
- 汇率使用 Frankfurter v2 最新可用的每日综合参考价（非实时行情），显示来源、数据日期、获取时间及过期/失败提示。入口 `/currency-converter`。
- 10 个可直接访问的预渲染页面，各有独立 title、description、H1、指南、示例、Open Graph 与 WebApplication JSON-LD；详情见 [布局与 SEO](docs/SEO-UPDATE.md)。

## 批量商品规格

每行格式为 `SKU（可选）, 长, 宽, 高, 重量`，支持从电子表格粘贴 TSV，或使用英文逗号分隔的简单 CSV。无需表头、不支持带引号 CSV，不要使用千位分隔符。最多 500 个非空行、200,000 字符。长宽高和重量必须大于零。

```text
SKU-001, 25.4, 50.8, 76.2, 0.45359237
```

选择 `cm → in`、`kg → lb`，输出：

```text
SKU-001 — Dimensions (L × W × H): 10 × 20 × 30 in; Weight: 1 lb.
```

逐行显示错误；全部行有效后才允许复制，避免静默遗漏商品。尺寸顺序固定为 L × W × H。复制的是所选小数位舍入后的结果；此工具不计算物流计费重量或特定平台合规标签。

## 架构

```text
src/
  config/markets.ts       国家 / 货币 / 推荐单位 / IANA 城市
  core/units.ts          计量定义，不依赖国家
  core/convert.ts        BigInt 分数精确运算，显示时舍入
  core/timezone.ts       Intl 时区解析与 DST 校验
  core/specs.ts          批量校验与英文格式
  core/shipping.ts       尺寸粘贴、精确箱子体积与箱数
  config/pages.ts        10 个页面的路径、SEO 文案与默认工具
  prerender.tsx          服务端渲染入口
  ../scripts/prerender.mjs  HTML、canonical、sitemap 与 robots 输出
  core/preferences.ts    本地存储 schema v1 与容错
  core/currency.ts       FX 数据获取、验证、过期判断及精确金额计算
  components/UnitSelect.tsx
  App.tsx                双语工作台和状态编排
```

新增市场只需添加 `markets.ts` 配置并运行测试，不需要改换算逻辑。若新增单位，只在 `units.ts` 添加精确系数；温度等仿射换算需在引擎中单独定义。

### 数值与舍入

输入使用英文小数点，支持 `.5`、`1e-8` 等科学计数法；最多 100 个字符，科学计数法指数限 -30…30。计算使用 BigInt 分子/分母保留精确关系，禁止经过显示值再次换算。显示边界使用中点远离零规则（例如 `1.005 → 1.01`），去除末尾零；极小非零值自动增加小数位以保留有效数字。长度、重量、容量不能为负；温度不能低于绝对零度。

单位参考：[NIST SI conversion factors](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9)。精确英制定义从国际英寸 0.0254 m、磅 453.59237 g、美制液体加仑 231 in³、英制加仑 4.54609 L 推导。

### 时区策略

支持 1900–2100 年日期，精度为分钟。使用浏览器 Intl / IANA 时区规则，枚举输入日期前后 48 小时内的真实偏移并逐一回转校验，不硬编码国家 UTC 偏移，也不假设 DST 只改变一小时。0 个匹配时刻表示时间不存在；2 个匹配表示重复，必须主动选择。城市包含 DST 与非 DST 样例以及半小时/45 分钟偏移支持所需通用逻辑。

历史/未来规则依赖浏览器和操作系统所带时区数据库，政府调整规则后需要更新浏览器/系统。国家列表提供常用城市，不是完整世界城市数据库。来源：[Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)。

### 隐私与浏览器

无分析脚本、外部字体或账号。汇率工具通过 HTTPS 请求 Frankfurter，仅发送货币对，不发送金额或商品数据；其他换算不联网。偏好存储在 `unitport.preferences.v1`；商品数据只在内存。清除网站数据会删除偏好，跨设备不自动同步。Clipboard API 需要 HTTPS 或 localhost 和浏览器授权；失败可选中结果手动复制。目标为当前主流浏览器，要求 BigInt、Intl timeZone 和 CSS Grid。

## 品牌 UI

网站已接入新版 Uniport SVG Logo 和浏览器图标。配色采用 Port Lime `#D9FF6B`、Ink `#0F0F0F`、Cloud `#F7F7F5`、Slate `#717571`，统一用于品牌栏、工具导航、结果卡、收藏与复制操作。

`src/styles.css` 顶部集中定义品牌颜色与界面语义变量；`public/brand/` 保存实际使用的透明矢量 Logo 和 `palette.json`。`src/components/Icon.tsx` 提供统一线条 SVG 图标。所有资源随静态站点分发，无外部字体或图标服务依赖。品牌使用规则与本次检查见 [UI 升级说明](docs/BRAND-UI.md)。

## SEO 构建

`npm run build` 生成 10 个含正文的静态页面。正式域名确定后，通过构建环境变量 `SITE_URL` 提供实际 HTTPS 域名根地址；脚本据此生成 canonical、og:url 和 sitemap.xml。不提供时省略这些域名相关字段，避免发布虚构域名。CI 使用保留域名 `https://unitport.example` 测试生成逻辑，该域名不是生产地址。

`npm run preview` 按无尾斜杠路径提供静态 HTML，未知工具页面返回带 noindex 的 404。手机端先展示工具与结果，再展示快捷入口和可选市场设置。中文保存在本地偏好中，当前没有独立中文 URL 或 hreflang。

## 设计与部署

- [PRD、信息架构与实施计划](docs/PRD.md)
- [Cloudflare 部署说明](docs/DEPLOYMENT.md)
- [验证记录](docs/VALIDATION.md)

推荐 Workers Static Assets，`wrangler.jsonc` 已显式指定 `./dist`。必须先执行构建，避免“Could not detect a directory containing static files”。也提供 Pages 的独立配置说明。

GitHub Actions 仅验证。2026-10-23 获授权后合并并启用 Cloudflare main 分支生产部署，正式地址和构建参数见部署说明。

### 汇率新鲜度与失败策略

来源：[Frankfurter](https://frankfurter.dev/)，API 为 `https://api.frankfurter.dev/v2/rates?base=CNY&quotes=USD&expand=providers`。综合参考价每日更新，不承诺日内行情或交易执行价，不计银行点差和手续费。无需密钥，保持静态部署。

- 数据更新日期采用 API 的 `date`，不将浏览器获取时间冒充报价发布时间。源站不提供精确发布时间。来源链接与可展开的底层来源代码一起显示。
- 仅进入汇率工具才请求。每 15 分钟、返回页面、恢复联网时重新获取，也可手动刷新。12 秒超时；清理请求并忽略迟到响应。
- 数据日期按 UTC 日历距今天超过 3 天，或上次成功获取满 30 分钟，视为过期。周末和假期可能沿用前一工作日日期；超过阈值仍停止输出，不能因刚刷新过而放行旧数据。
- 请求中、失败、超时、无效/未来日期、无报价时不展示旧结果，不使用 localStorage 持久化汇率，不以缓存替代成功响应。请求关闭浏览器缓存；上游服务仍可能缓存每日数据，以真实数据日期及非实时标签为准。
- 支持市场配置内的 11 种货币，自由选择和互换；同币种直接 1:1，不制造汇率日期。金额通过现有 BigInt 分数引擎计算，只在显示时舍入。
- `UNITPORT_TEST_PORT=5174 npm run test:browser` 可避开正在运行的 5173 开发服务。

### 工具排序

默认顺序：汇率 → 重量 → 长宽高转换 → 箱子体积（立方英尺 / CBM）→ 长度 → 商品规格 → 时区 → 容量 → 温度。优先定价及物流场景，通用和类目专用工具靠后。

工具导航下的「调整排序 / Customize order」支持上下移动和恢复默认，无需拖拽。导航、首页前三个快捷入口和页面底部相关工具共用顺序。排序自动保存至现有 localStorage 偏好的 `toolOrder`，跨页面和刷新保留；不跨设备同步。存储不可用时会提示只在当前页有效。旧版本偏好自动补齐默认排序；未知项和重复项被剔除，新工具按默认顺序追加，保留用户已有排序。
