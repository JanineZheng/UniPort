import { dimensionsGuide, supplierGuide } from "../config/guides";
export default function BoxGuideContent() {
  return <>
    <section><h2>1. Use the packed carton’s dimensions</h2>
      <p>Use the shipping carton’s outer length, width and height after packing. Confirm that your supplier’s numbers describe that carton, rather than the product alone or its retail packaging. For an irregular package, a rectangular bounding box gives a volume estimate; this tool does not model its shape.</p>
      <p>Put all three sides in the same unit. In the <a href="/cubic-feet-calculator#workspace">box volume calculator</a>, enter the three numbers and select “Dimension unit”. Unlike the dimensions tool, this form uses three separate fields and has no combined-dimensions paste field.</p>
    </section>
    <section><h2>2. Calculate one box in cubic feet or CBM</h2>
      <ul><li>Inches: cubic feet = length × width × height ÷ 1,728.</li><li>Feet: cubic feet = length × width × height.</li><li>Centimeters: CBM = length × width × height ÷ 1,000,000.</li><li>Meters: CBM = length × width × height.</li></ul>
      <p>CBM means cubic meters, written m³. A cubic foot is a volume, while a foot is a length. One foot is exactly 0.3048 m, so 1 ft³ = 0.028316846592 m³. The length conversion is listed in the <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9">NIST conversion-factor reference</a>.</p>
      <p>The calculator displays both ft³ and m³, so you do not need to convert each side into another unit first. Displayed decimal places affect rounding; they do not change the accuracy of your measurements.</p>
    </section>
    <section><h2>3. Multiply identical boxes: a worked example</h2>
      <p>Enter Length 24, Width 18 and Height 12, set Dimension unit to in, Identical boxes to 2 and Decimal places to 4.</p>
      <pre aria-label="Example box calculation"><code>{"One box: 24 × 18 × 12 ÷ 1,728 = 3 ft³\nTwo identical boxes: 3 × 2 = 6 ft³\nCBM: 6 × 0.028316846592 = 0.169901079552 m³"}</code></pre>
      <p>The displayed total is 6 ft³ and 0.1699 m³ at four decimal places. “Copy result” includes both displayed volumes, the box count and each box’s original dimensions:</p>
      <pre aria-label="Example box output"><code>6 ft³ (0.1699 m³) — 2 boxes, 24 × 18 × 12 in each</code></pre>
      <p>For another check, ten identical 60 × 40 × 30 cm cartons total 0.72 m³, approximately 25.4266 ft³ at four decimal places.</p>
    </section>
    <section><h2>4. Calculate mixed-size cartons separately</h2>
      <p>“Identical boxes” multiplies one set of dimensions. If cartons have different sizes, calculate each size group separately and add the volumes in the same unit. Do not enter the whole shipment count against the dimensions of only one carton size.</p>
      <p>For example, two 24 × 18 × 12 in boxes total 6 ft³. Three 12 × 12 × 12 in boxes total 3 ft³. Together they total 9 ft³, about 0.2549 m³ at four decimal places. Keep the original measurements or unrounded group totals when calculating a final total.</p>
      <p>The sum describes carton volume. It does not include pallet space, gaps between cartons, stacking limits or container packing efficiency.</p>
    </section>
    <section><h2>5. Check inputs before copying</h2>
      <p>Length, width and height must be positive numbers. The box count must be a positive whole number: 1, 2 or 10 works; zero, negative counts and 1.5 do not. Enter numbers without unit text in the three dimension fields, then choose the unit in the selector.</p>
      <p>If a very small volume displays as zero, use more decimal places and check the original dimensions. The available display settings are 2, 4 and 6 decimal places. Review the box count and both volume units before copying.</p>
    </section>
    <section><h2>Does box volume tell me the shipping price?</h2>
      <p>No. Cubic feet and CBM describe volume, not actual weight or billable weight. Carrier pricing can use dimensional weight as well as actual weight; see <a href="https://www.ups.com/us/en/support/shipping-support/shipping-dimensions-weight">UPS’s dimensions and weight explanation</a>. Check your carrier’s applicable service rules and quote for your shipment. Uniport does not calculate dimensional weight, shipping prices or marketplace size tiers.</p>
      <p>For a product’s three sides, use the <a href={dimensionsGuide.path}>cm-to-inches dimensions guide</a>. For a spreadsheet of products with weight, use the <a href={supplierGuide.path}>supplier specs guide</a>. Conversion inputs stay in your browser; see <a href="/privacy.html">Privacy & analytics</a> for usage statistics details.</p>
    </section>
  </>;
}
