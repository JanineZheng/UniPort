// Only production visits belong in the UniPort GA4 property.
(() => {
  if (window.location.hostname !== "uniport.janine-cheng22.workers.dev") return;
  // Explicit QA opt-out survives same-tab navigation, never stores product inputs.
  try {
    const internal = new URLSearchParams(window.location.search).get("unitport_internal");
    if (internal === "1") sessionStorage.setItem("uniport.analytics.internal", "1");
    if (internal === "0") sessionStorage.removeItem("uniport.analytics.internal");
    if (internal === "1" || sessionStorage.getItem("uniport.analytics.internal") === "1") return;
  } catch {
    if (new URLSearchParams(window.location.search).get("unitport_internal") === "1") return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", "G-6HWESBP7VK", {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-6HWESBP7VK";
  document.head.appendChild(script);
})();

