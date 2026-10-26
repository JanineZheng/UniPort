// Only production visits belong in the UniPort GA4 property.
(() => {
  if (window.location.hostname !== "uniport.janine-cheng22.workers.dev") return;

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
