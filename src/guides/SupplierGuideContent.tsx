export default function SupplierGuideContent() {
  return <>
      <section><h2>1. Prepare the supplier spreadsheet</h2>
        <p>Use four columns in this order: length, width, height, weight. You can add a SKU as the first column. Copy only the data rows from your spreadsheet; tabs between cells are supported. Simple comma-separated rows also work. This is a paste workflow, with no spreadsheet file upload.</p>
        <p>Keep every row in the same source units. If some products are measured in millimeters and others in centimeters, separate them into batches before converting. Confirm whether the supplier measured the product or its packaging.</p>
        <pre aria-label="Example supplier input"><code>{"SAMPLE-A,25.4,50.8,76.2,0.45359237\nSAMPLE-B,50.8,25.4,25.4,0.90718474"}</code></pre>
        <p>For this example, the first three numbers are centimeters and the final number is kilograms. The SKU is an identifier; do not paste this explanatory sentence or a header into the input.</p>
      </section>
      <section><h2>2. Select source units, target units and precision</h2>
        <p>In the <a href="/product-specs-converter#workspace">batch product specs converter</a>, set dimension units from cm to in and weight units from kg to lb. Source units describe the supplier’s measurements; target units describe the output. Check all four selectors before copying.</p>
        <p>Choose the displayed decimal places for your task. Conversion uses the original input values; display rounding does not make a measurement more accurate. Keep enough precision to avoid a small nonzero measurement displaying as zero.</p>
        <p>Conversion factors: 1 in = 2.54 cm and 1 lb = 0.45359237 kg, both exact. Divide centimeters by 2.54 and kilograms by 0.45359237. See the <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9">NIST conversion-factor reference</a>.</p>
      </section>
      <section><h2>3. Review a complete worked example</h2>
        <p>With cm/kg as the source and in/lb as the target, the two input rows above produce:</p>
        <pre aria-label="Example English output"><code>{"SAMPLE-A — Dimensions (L × W × H): 10 × 20 × 30 in; Weight: 1 lb.\nSAMPLE-B — Dimensions (L × W × H): 20 × 10 × 10 in; Weight: 2 lb."}</code></pre>
        <p>The dimension order stays length × width × height. Uniport converts units; it does not infer which side is length or rearrange supplier columns.</p>
      </section>
      <section><h2>4. Fix input errors before copying</h2>
        <ul><li>Use four numeric columns, optionally preceded by one SKU column. Remove headers, currency symbols and units inside numbers.</li><li>Use a decimal point. Remove thousands separators and quoted CSV fields. A SKU containing a comma needs tab-separated columns instead of comma-separated columns.</li><li>Enter dimensions and weight greater than zero. A missing weight cannot be guessed from dimensions.</li><li>Stay within 500 nonempty rows and 200,000 characters per batch. Split larger sheets into batches.</li><li>Correct all flagged rows. Copy all English specs is enabled only when every row is valid.</li></ul>
      </section>
      <section><h2>5. Copy the specs and check the destination</h2>
        <p>Copy the English specifications into your product-writing workflow. The output is plain text with units, not a marketplace upload template. A marketplace may ask for dimensions and weight in separate fields or require particular units.</p>
        <p>Do not substitute product net weight for packaged weight or a carrier’s billable weight. For one product without a weight column, use the <a href="/dimensions-converter">dimensions converter</a>. For the volume of shipping cartons, use the <a href="/cubic-feet-calculator">shipping box volume calculator</a>.</p>
      </section>
      <section><h2>Do I need an account, and where do my inputs go?</h2><p>No account is required. Conversion runs in your browser and the entered SKUs, measurements and results are not sent to Uniport analytics. The website collects basic usage events; see <a href="/privacy.html">Privacy & analytics</a> for details.</p></section>
  </>;
}
