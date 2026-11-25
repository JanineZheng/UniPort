export const supplierGuide = {
  path: "/guides/convert-supplier-product-specs",
  title: "Convert Supplier Product Specs from CM/KG to IN/LB | Uniport",
  heading: "How to convert supplier product specs from cm/kg to in/lb",
  description: "Prepare supplier spreadsheet rows, convert dimensions and weight together, fix input errors and copy English product specs with a worked example.",
  toolPath: "/product-specs-converter",
  toolLabel: "Product specs converter",
  eyebrow: "SUPPLIER SPREADSHEETS / PRODUCT LISTINGS",
  lead: "Keep each product’s length, width, height and weight on one row. Paste the rows into Uniport, select cm → in and kg → lb, then copy the English specifications after checking the results.",
  action: "Convert your product specs →",
  nextTitle: "Ready to convert your supplier rows?",
  nextIntro: "Start with a few rows and compare them with the original sheet before processing a larger batch.",
};
export const dimensionsGuide = {
  path: "/guides/convert-product-dimensions-cm-to-inches",
  title: "Convert Product Dimensions from CM to Inches: L × W × H | Uniport",
  heading: "How to convert product dimensions from cm to inches",
  description: "Convert length, width and height from centimeters to inches without changing their order. Includes a paste example, rounding guidance and product-versus-package checks.",
  toolPath: "/dimensions-converter",
  toolLabel: "Dimensions converter",
  eyebrow: "PRODUCT DIMENSIONS / LENGTH × WIDTH × HEIGHT",
  lead: "Divide each dimension in centimeters by 2.54 and keep the supplier’s length × width × height order. For example, 30 × 20 × 10 cm becomes 11.81 × 7.87 × 3.94 in when displayed to two decimal places.",
  action: "Convert your dimensions →",
  nextTitle: "Have a product’s three dimensions ready?",
  nextIntro: "Paste one set of measurements, check the source and result units, then copy the labeled English dimensions.",
};
export const boxGuide = {
  path: "/guides/calculate-shipping-box-volume",
  title: "Calculate Shipping Box Volume in Cubic Feet and CBM | Uniport",
  heading: "How to calculate shipping box volume in cubic feet and CBM",
  description: "Calculate volume from shipping carton dimensions, multiply identical boxes and compare cubic feet with CBM. Includes worked examples and mixed-size shipment guidance.",
  toolPath: "/cubic-feet-calculator",
  toolLabel: "Box volume calculator",
  eyebrow: "SHIPPING CARTONS / CUBIC FEET & CBM",
  lead: "Multiply a box’s length, width and height using the same unit. For inches, divide the product by 1,728 to get cubic feet. Two identical 24 × 18 × 12 in boxes total 6 ft³, or about 0.1699 m³ (CBM).",
  action: "Calculate your box volume →",
  nextTitle: "Have your packed carton dimensions ready?",
  nextIntro: "Enter the three sides, select their unit and set the number of identical boxes. Review both volume units before copying.",
};
export const guides = [supplierGuide, dimensionsGuide, boxGuide];
export function guideFor(path: string) {
  return guides.find(guide => guide.path === path.replace(/\/+$/, ""));
}
