import { boxGuide, dimensionsGuide, guideFor, supplierGuide } from "./config/guides";
import SupplierGuideContent from "./guides/SupplierGuideContent";
import DimensionsGuideContent from "./guides/DimensionsGuideContent";
import BoxGuideContent from "./guides/BoxGuideContent";
export default function GuidePage({ path = typeof window === "undefined" ? supplierGuide.path : window.location.pathname }: { path?: string }) {
  const guide = guideFor(path) ?? supplierGuide;
  return <div className="article-page">
    <a className="skip-link" href="#guide-content">Skip to guide</a>
    <header className="topbar"><a className="brand" href="/" aria-label="Uniport home"><img className="brand-logo" src="/brand/uniport-horizontal-transparent-white.svg" alt="Uniport" width="184" height="48" /></a><a className="guide-header-link" href={guide.toolPath}>Open {guide.toolLabel.toLowerCase()} ↗</a></header>
    <main id="guide-content" className="guide-article">
      <nav aria-label="Breadcrumb"><a href="/">Uniport</a><span aria-hidden="true"> / </span><a href={guide.toolPath}>{guide.toolLabel}</a><span aria-hidden="true"> / </span><span>Guide</span></nav>
      <p className="eyebrow">{guide.eyebrow}</p>
      <h1>{guide.heading}</h1>
      <p className="guide-lead">{guide.lead}</p>
      <p className="guide-byline">By Uniport · Product workflow guide</p>
      <a className="primary guide-action" href={`${guide.toolPath}#workspace`}>{guide.action}</a>
      {guide.path === boxGuide.path ? <BoxGuideContent /> : guide.path === dimensionsGuide.path ? <DimensionsGuideContent /> : <SupplierGuideContent />}
      <aside className="guide-next"><h2>{guide.nextTitle}</h2><p>{guide.nextIntro}</p><a className="primary guide-action" href={`${guide.toolPath}#workspace`}>Open the {guide.toolLabel.toLowerCase()} →</a></aside>
    </main><footer><span>Uniport · Tools for cross-border work</span><a href="/privacy.html">Privacy & analytics</a></footer>
  </div>;
}
