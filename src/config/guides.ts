export const supplierGuide = {
  path: "/guides/convert-supplier-product-specs",
  title: "Convert Supplier Product Specs from CM/KG to IN/LB | Uniport",
  heading: "How to convert supplier product specs from cm/kg to in/lb",
  description: "Prepare supplier spreadsheet rows, convert dimensions and weight together, fix input errors and copy English product specs with a worked example.",
};
export const guides = [supplierGuide];
export function guideFor(path: string) {
  return guides.find(guide => guide.path === path.replace(/\/+$/, ""));
}
