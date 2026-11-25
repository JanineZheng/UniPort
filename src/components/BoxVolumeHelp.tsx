import { boxGuide } from "../config/guides";
export default function BoxVolumeHelp({ zh }: { zh: boolean }) {
  const t = (cn: string, en: string) => zh ? cn : en;
  return <div className="batch-help">
    <h3>{t("从装箱尺寸到总体积", "From packed carton dimensions to total volume")}</h3>
    <ol><li>{t("输入装箱后的外部长、宽、高，并选择同一尺寸单位。确认不是商品净尺寸。", "Enter the packed carton’s outer length, width and height and select their shared unit. Check that these are carton measurements rather than product dimensions.")}</li>
    <li>{t("填写相同尺寸箱子的数量，必须为正整数。不同尺寸的箱子请分组计算后相加。", "Enter a positive whole number of identical boxes. Calculate different carton sizes in separate groups, then add their volumes.")}</li>
    <li>{t("检查 ft³ 和 m³（CBM）两个总体积，再复制包含箱数与原始尺寸的结果。", "Review the total in ft³ and m³ (CBM), then copy the result with the box count and original dimensions.")}</li></ol>
    <details><summary>{t("CBM、体积重和运费有什么区别？", "How is CBM different from dimensional weight and shipping cost?")}</summary><p>{t("CBM 是立方米，属于体积。体积重与计费重量取决于承运商的规则，本工具不计算体积重或运费。箱子体积之和也不包含托盘、间隙或装载效率。", "CBM means cubic meters, a volume. Dimensional and billable weight depend on the carrier’s rules; this tool calculates neither dimensional weight nor shipping prices. Summed carton volume also excludes pallets, gaps and packing efficiency.")}</p></details>
    <p><a href={boxGuide.path}>{t("阅读箱子体积计算指南与完整示例（英文）", "Read the shipping box volume guide and worked examples")} →</a></p>
  </div>;
}
