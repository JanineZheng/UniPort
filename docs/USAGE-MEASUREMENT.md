# Uniport 有效使用统计 v1

目标：观察真实需求的行为信号，比较三个主要任务；不采集商品数值、SKU、复制文本或原始输入。现有 GA4 属性为 `560754789`，网站测量 ID 为 `G-6HWESBP7VK`。

## 事件口径

| 事件 | 触发 | 去重及限制 |
| --- | --- | --- |
| conversion_start | 首次手动编辑计算输入 | 每次页面挂载最多一次；单位切换不把默认输入变成用户输入 |
| conversion_success | 手动编辑后有有效结果，稳定 800 ms，或主动复制有效结果 | 同一输入修订只记一次；不是逐键计数 |
| copy_success | Clipboard API 确认写入成功 | 同一输入修订只记一次；保留 initial / example / user 来源 |
| copy_failure | Clipboard API 失败 | 不计有效使用；可重试 |
| effective_use | user 来源、有效结果且复制成功 | 同一输入修订一次；默认、示例、错误输入和复制失败不计入 |
| example_use | 点击示例按钮 | 与手动使用分开 |
| extension_store_click | 点击商店入口 | 不是安装或活跃使用 |

事件参数只允许 `tool_id`、`ui_language`、`input_origin`、`measurement_version`。没有新增自定义用户 ID、输入哈希或跨设备身份。临时输入修订号只在内存中用于去重，不上报、不写入存储。

从手动输入切换回示例会取消有效输入来源；单位变化保留现有来源。尚未点击“填入尺寸”的粘贴文本不算成功处理。剪贴板响应期间如果输入已变化，旧响应不计入新任务。copy_success 是成功写入剪贴板，不证明用户随后粘贴或完成了平台上架。

## 报表设置与验证

1. 发布后检查 GA4 收到正确网站的事件，不能只根据本地日志宣布 GA4 已验证。
2. 按需注册事件级自定义维度：Tool ID=`tool_id`、Input origin=`input_origin`、UI language=`ui_language`。不注册高基数输入字段。
3. `effective_use` 可标记为关键事件；每周有效使用者使用该事件对应的去重总用户，不能用事件次数代替人数。
4. 建立探索：工具类别 × 来源，指标为总用户、事件数；conversion_start 与 conversion_success 使用同一事件筛选范围做诊断，不将两者比值宣称为精确任务完成率，因为计数粒度不同。
5. 7 日复访使用首次 effective_use 分组、返回条件仍为 effective_use、日粒度；只统计首日后第 1–7 日中至少一次返回的完整观察队列。初期可用 GA4 队列探索逐日查看；不能将各日返回人数相加来算累计去重率，也不能用 retention 的普通页面返回代替有效使用返回。
6. 若 GA4 界面不能直接给出上述累计去重值，先报告逐日队列及分母，累计值标记“待具备可计算数据后提供”。不为了一个初期指标立即增加 BigQuery 成本或权限。
7. 所有比较标注日期区间、属性时区、样本量、是否排除了内部操作；上线前数据没有该口径，不能回填猜测。

## 内部测试与环境

- 网站统计脚本仅在当前正式 hostname 加载；预览与 localhost 不发送 GA4 请求。
- 在正式网站使用 `?unitport_internal=1` 开始内部测试，同标签页后续导航通过 sessionStorage 排除。`?unitport_internal=0` 恢复；清除标签页会话也可结束。
- 该标记不是用户身份或商品数据。新标签页、其他浏览器要各自设置；无法追溯排除以前的开发访问。
- 插件显式禁用使用事件，继续遵守其无统计声明。
- 本地可监听 `uniport:measurement` 检查经过限制的参数，不向外发送。此日志证明客户端接线，不证明 GA4 已采集。

## 局限

无登录时用户与复访为浏览器标识近似值，受 Cookie、统计屏蔽和跨设备影响。手动编辑仍可能是试用或复制示例；看完结果未复制的人不会进入主指标。样本小时主要看具体失败和访谈，不根据几个用户的百分比扩大投入。

参考：[GA4 events](https://support.google.com/analytics/answer/9322688)、[Google AI features](https://developers.google.com/search/docs/appearance/ai-features)。
