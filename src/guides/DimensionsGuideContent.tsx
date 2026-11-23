import { supplierGuide } from "../config/guides";
export default function DimensionsGuideContent() {
  return <>
    <section><h2>1. Confirm what the three measurements describe</h2>
      <p>Start with the supplier’s labeled length, width and height. A product’s assembled dimensions, its retail packaging and its shipping carton can be different. Use the measurements that match the destination field; converting units does not change what was measured.</p>
      <p>Keep the original L × W × H order. Do not sort the sides from largest to smallest unless your destination explicitly asks for that order. Uniport converts the three positions independently.</p>
    </section>
    <section><h2>2. Paste one set of dimensions or enter three values</h2>
      <p>Open the <a href="/dimensions-converter#workspace">dimensions converter</a>. Paste the following into “Paste L × W × H (optional unit)” and press “Use dimensions”:</p>
      <pre aria-label="Example dimensions input"><code>30 × 20 × 10 cm</code></pre>
      <p>The supported separators are ×, x, *, and commas. A trailing unit can be cm, mm, in, ft, or m. For example, <code>30 x 20 x 10 cm</code> also works. Use positive decimal values with a decimal point. Labels, feet-and-inches notation and a different unit on each side are not supported in this paste field.</p>
      <p>If the pasted text has no unit, the current “Dimension unit” stays selected. If it has a supported trailing unit, that unit becomes the source. Always check it after pressing “Use dimensions”. You can also enter Length, Width and Height separately and select the source unit yourself.</p>
    </section>
    <section><h2>3. Select inches and check the rounded result</h2>
      <p>For the example above, set “Dimension unit” to cm, “Result unit” to in and “Decimal places” to 2. The result is:</p>
      <pre aria-label="Example dimensions output"><code>Dimensions (L × W × H): 11.81 × 7.87 × 3.94 in</code></pre>
      <p>Each centimeter value is divided by 2.54. One inch is exactly 2.54 centimeters; see the <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9">NIST conversion-factor reference</a>. The displayed values above are rounded, so they are not exact equivalents at two decimal places.</p>
      <p>Uniport offers 2, 4 or 6 displayed decimal places. Choose enough precision for the destination, and check very small dimensions before copying. Additional digits do not improve the accuracy of the supplier’s measurement.</p>
    </section>
    <section><h2>4. Copy labeled dimensions into your workflow</h2>
      <p>Press “Copy result” to copy the English text shown above, including the dimension order and unit. The output is plain text for your product-writing workflow. It does not fill marketplace fields automatically.</p>
      <p>For inches to centimeters, enter the original inch measurements, set “Dimension unit” to in and “Result unit” to cm. Each side is multiplied by 2.54. Unit selectors describe the current input and desired output; changing them does not replace your entered values.</p>
    </section>
    <section><h2>Why does my pasted input fail?</h2>
      <p>Use three positive numbers and a supported separator, followed by at most one supported unit. For example, <code>30 × 20 × 10 cm</code> works; <code>L: 30 cm W: 20 cm H: 10 cm</code> does not. Remove labels or enter each value in its own field. A failed paste leaves the previous dimensions in place, so resolve the error and check the fields before copying.</p>
    </section>
    <section><h2>Which tool should I use for several products or shipping boxes?</h2>
      <p>For several products with dimensions and weight, use the <a href="/product-specs-converter">batch product specs converter</a> and its <a href={supplierGuide.path}>supplier spreadsheet guide</a>. For the combined volume of identical shipping boxes, use the <a href="/cubic-feet-calculator">cubic feet and CBM calculator</a>.</p>
      <p>Product dimensions alone do not establish a carrier’s billable weight, shipping price or a marketplace size tier. Those decisions require the relevant package measurements and destination rules.</p>
    </section>
  </>;
}
