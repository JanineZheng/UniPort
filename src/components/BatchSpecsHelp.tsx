import { supplierGuide } from "../config/guides";
export default function BatchSpecsHelp({ zh }: { zh: boolean }) {
  const t = (cn: string, en: string) => zh ? cn : en;
  return <div className="batch-help">
    <h3>{t("从供应商表格到英文规格", "From supplier spreadsheet to English specs")}</h3>
    <ol>
      <li>{t("按 SKU（可选）、长、宽、高、重量排列列。仅复制数据行，不带表头；每批所有行使用同一组原始单位。", "Arrange columns as optional SKU, length, width, height, weight. Copy data rows without the header; use the same source units for every row in a batch.")}</li>
      <li>{t("粘贴最多 500 行，选择原始与目标单位。cm/kg 转 in/lb 时，分别选择 cm → in 和 kg → lb。", "Paste up to 500 rows and select source and target units. For cm/kg to in/lb, choose cm → in and kg → lb.")}</li>
      <li>{t("检查结果，修正所有错误，再复制英文规格。发布前确认长宽高顺序、精度以及商品与包装的测量口径。", "Review the results, fix every error, then copy the English specs. Check dimension order, precision and whether the measurements describe the product or its packaging before publishing.")}</li>
    </ol>
    <details><summary>{t("为什么部分行无法转换？", "Why will a row not convert?")}</summary><p>{t("每行需要 4 个数值，前面可以加一列 SKU。使用制表符或简单逗号分隔；不支持表头、带引号的 CSV、数字内的单位或千位分隔符。尺寸和重量必须大于 0，且整批不超过 200,000 个字符。有错误时无法复制整批结果。", "Each row needs four numeric values, optionally preceded by a SKU. Use tabs or simple commas. Headers, quoted CSV, units inside numbers and thousands separators are not supported. Dimensions and weight must be greater than zero; the batch must stay within 200,000 characters. Copy all stays disabled until every row is valid.")}</p></details>
    <details><summary>{t("可以直接上传到电商平台吗？", "Can I upload the output to a marketplace?")}</summary><p>{t("输出为带单位的英文文本，便于写入商品文案，不是平台批量上传模板。请按目标平台要求分别填写对应字段。商品净重、包装重量与计费重量不能相互替代。", "The output is English text with units for product copy, rather than a marketplace bulk-upload template. Fill the relevant fields using your destination’s requirements. Product net weight, packaged weight and billable weight are different measurements.")}</p></details>
    <p><a href={supplierGuide.path}>{t("阅读完整操作指南与示例（英文）", "Read the supplier specs guide with a worked example")} →</a></p>
  </div>;
}
