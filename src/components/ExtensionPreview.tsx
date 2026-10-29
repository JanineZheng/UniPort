export default function ExtensionPreview({ zh }: { zh: boolean }) {
  return <figure className="extension-preview">
    <div className="preview-browser" aria-hidden="true">
      <span /><span /><span />
      <b>{zh ? "商品页面 + Uniport 侧边栏" : "Your product page + Uniport side panel"}</b>
    </div>
    <div className="preview-workspace">
      <div className="preview-product">
        <span className="preview-label">{zh ? "示例商品数据" : "SAMPLE PRODUCT DATA"}</span>
        <strong>{zh ? "商品规格" : "Product details"}</strong>
        <dl>
          <div><dt>{zh ? "长 × 宽 × 高" : "L × W × H"}</dt><dd>30 × 20 × 10 cm</dd></div>
          <div><dt>{zh ? "重量" : "Weight"}</dt><dd>0.5 kg</dd></div>
        </dl>
        <div className="preview-paste">{zh ? "复制并粘贴到插件 →" : "Copy & paste into Uniport →"}</div>
        <code>SKU-001, 30, 20, 10, 0.5</code>
        <span className="preview-result-label">{zh ? "英文规格，即刻复制" : "English specs, ready to copy"}</span>
        <p>11.81 × 7.87 × 3.94 in<br />1.1 lb</p>
      </div>
      <div className="preview-panel">
        <img src={`/previews/extension-specs-${zh ? "zh" : "en"}.png`}
          alt={zh ? "Uniport 插件真实界面：将厘米和千克换算为英寸和磅，并复制英文商品规格" : "Actual Uniport interface: convert cm and kg to inches and pounds, then copy English product specs"}
          width="360" height="1011" fetchPriority="high" />
      </div>
    </div>
    <figcaption>{zh ? "示例商品数据 · 插件真实界面 · 手动粘贴，无需切换网页" : "Sample product data · Actual extension UI · Paste without switching tabs"}</figcaption>
  </figure>;
}
