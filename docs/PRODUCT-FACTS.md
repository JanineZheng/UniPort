# Uniport 产品事实表

核对日期：2026-11-23。依据为当前代码、公开网站与插件 manifest；以下不包含未经验证的增长或效率承诺。对外名称统一使用 **Uniport**，仓库名继续使用 `JanineZheng/UniPort`，现有偏好存储键保持不变。

| 项目 | 经核对的事实 | 主要证据 |
| --- | --- | --- |
| 定位 | 面向跨境卖家的商品规格与物流单位换算工作台 | README、App.tsx |
| 入口 | 免费网页版、Chrome 侧边栏插件；无需账号 | App.tsx、extension/manifest.json |
| 批量规格 | 每批最多 500 个非空行、200,000 字符；长宽高和重量一起转换，复制英文规格 | core/specs.ts |
| 输入格式 | 可选 SKU、长、宽、高、重量；TSV 或简单逗号分隔；不支持表头、带引号 CSV | core/specs.ts、README |
| 批量错误 | 存在错误时禁止整批复制，避免静默遗漏 | App.tsx |
| 长宽高 | 输入或手动粘贴尺寸；保留 L × W × H 顺序 | ShippingTool.tsx |
| 箱子体积 | 根据长宽高及相同尺寸箱数，输出 ft³ 与 m³（CBM） | core/shipping.ts |
| 计量 | 用精确单位关系计算，仅在输出显示时舍入 | core/convert.ts、core/units.ts |
| 汇率 | Frankfurter 最新可用的每日综合参考汇率；显示来源及日期；不是实时交易报价 | core/currency.ts |
| 时区 | 选定具体日期后处理 DST；不存在的时间无输出，重复时间需选择 | core/timezone.ts |
| 语言 | 英文优先、可切换中文；当前没有独立中文 URL 与 hreflang | pages.ts、App.tsx |
| 商品数据 | 换算输入、SKU 和输出在浏览器内处理，不上传到开发者或 GA4 | 当前实现及 privacy.html |
| 网络例外 | 网站加载 GA4；汇率工具向 Frankfurter 请求货币对；普通网络请求可能带连接信息 | analytics.js、core/currency.ts |
| 插件权限 | sidePanel；仅汇率 API 的 host permission；不读取当前商品页面 | extension/manifest.json |
| 偏好 | 浏览器保存语言、市场、单位、工具顺序等；商品数值不持久化、不跨设备同步 | core/preferences.ts |

## 可直接复用的英文简介

Uniport is a free conversion workspace for cross-border sellers. Convert product dimensions and weights, copy English product specifications, and calculate shipping box volume in cubic feet and CBM. Paste up to 500 rows of product data. No account required; conversion inputs are processed in your browser.

## 必须明确的边界

- 插件使用手动输入或粘贴；不宣称自动识别、抓取或同步 Amazon / Shopify 商品数据。
- 箱子体积不等于体积重；目前不计算运费、平台费用、尺寸分级或合规标签。
- 不将英文规格格式化表述为平台官方认证或平台数据集成。
- 不将“输入本地处理”扩大为“网站没有网络请求或没有访问统计”。
- 不承诺“节省多少时间”“提高多少转化率”，直到有可复查测量。
- 用户亲自编辑不等于已经证实是真实业务数据；effective_use 是行为代理指标，需要访谈验证。

## 本周审核

你只需要核对：定位是否准确、500 行及输入限制是否符合预期、上述边界是否完整。后续功能变化时先更新本表，再同步公开文案。
