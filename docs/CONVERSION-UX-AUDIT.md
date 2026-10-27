# Conversion UX audit — 2026-10-27

Reviewed all 10 entry pages in English and Chinese, desktop (1440 × 1000) and mobile (390 × 844).

| Tool | Finding and resolution |
| --- | --- |
| Currency | Swap was detached from the currency selectors; provenance separated input from output. Move swap between selectors, result immediately after amount, provenance below result. Add copy with existing clipboard error feedback. |
| Dimensions | No direction shortcut. Add swap between dimension and result units, keeping entered dimensions. |
| Product specs | No direction shortcut for either unit pair. Add independent dimension and weight swaps. Keep batch input and existing validation. |
| Time zones | No city-direction shortcut. Swap the two markets and selected cities together, retain entered local clock time, reset DST occurrence selection. |
| Length, weight, volume, temperature (including home) | Existing swap target was 27px on mobile. Increase to 44px, reserve space between the cards and preserve side-by-side results within the first screen. |
| Cubic feet / CBM | Already returns ft³ and CBM together directly after box inputs; no reversed selector pair is needed. |

All unit/city swaps retain the user's entered numeric or local date/time input and reinterpret it in the newly selected source, consistent with the existing basic unit converters. Currency changes still clear the former pair's result until the new quote arrives. Failed or expired FX quotes cannot be copied.

Validation: 34 core tests, production TypeScript/build/prerender, 66 desktop/mobile browser tests passed. Added regression coverage for currency swap placement, 44px target, input-to-result spacing, copied currency amount, invalid-input copy suppression, and dimension/specification/city swap behavior. Existing tests cover all pages, bilingual layouts, overflow, clipboard failure, DST ambiguity/gaps, precision, storage, routing, SEO and drag sorting. Local preview also fetched a real Frankfurter quote successfully.
