import { dimensionsGuide } from "../config/guides";
export default function DimensionsHelp({ zh }: { zh: boolean }) {
  const t = (cn: string, en: string) => zh ? cn : en;
  return <div className="batch-help">
    <h3>{t("把一组商品尺寸转成英文规格", "Turn one set of product dimensions into English specs")}</h3>
    <ol><li>{t("确认原始数据是商品、包装还是外箱尺寸，并保留长 × 宽 × 高顺序。", "Confirm whether the measurements describe the product, packaging or shipping carton. Keep the length × width × height order.")}</li>
    <li>{t("粘贴 30 × 20 × 10 cm 并点击“填入尺寸”，或分别输入三边。检查原始尺寸单位，再选择结果单位与小数位。", "Paste 30 × 20 × 10 cm and press Use dimensions, or enter the three sides separately. Check Dimension unit, then select Result unit and Decimal places.")}</li>
    <li>{t("检查三边结果后，复制带 L × W × H 与单位的英文文本。", "Review all three converted sides, then copy the English text with L × W × H and the unit.")}</li></ol>
    <details><summary>{t("粘贴时没有写单位，会怎样？", "What if I paste dimensions without a unit?")}</summary><p>{t("会沿用当前原始尺寸单位。支持末尾带 cm、mm、in、ft 或 m；带单位的粘贴会更新原始单位。点击填入后请核对单位。", "The current Dimension unit stays selected. A supported trailing cm, mm, in, ft or m updates the source unit. Check the selected unit after pressing Use dimensions.")}</p></details>
    <p><a href={dimensionsGuide.path}>{t("阅读长宽高转换指南与完整示例（英文）", "Read the L × W × H conversion guide and worked example")} →</a></p>
  </div>;
}
